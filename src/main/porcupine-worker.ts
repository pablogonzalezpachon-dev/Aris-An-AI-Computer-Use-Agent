import { Porcupine, BuiltinKeyword } from "@picovoice/porcupine-node";
import { PvRecorder } from "@picovoice/pvrecorder-node";
import dotenv from "dotenv";
import { parentPort } from "node:worker_threads";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  TranscriptResultStream,
} from "@aws-sdk/client-transcribe-streaming";

dotenv.config({
  quiet: true,
});

export function int16ToBufferLE(ints: Int16Array<ArrayBufferLike>) {
  const buf = Buffer.allocUnsafe(ints.length * 2);
  for (let i = 0; i < ints.length; i++) {
    buf.writeInt16LE(ints[i], i * 2);
  }
  return buf;
}

const porcupine = new Porcupine(
  process.env.PORCUPINE_ACCESS_KEY as string,
  [BuiltinKeyword.JARVIS],
  [0.5]
);

const REGION = process.env.AWS_REGION || "us-east-1";

const DEVICE_INDEX = Number(process.env.PV_DEVICE_INDEX ?? -1);
const recorder = new PvRecorder(porcupine.frameLength, DEVICE_INDEX);
const client = new TranscribeStreamingClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    // sessionToken: process.env.AWS_SESSION_TOKEN, // only if you're using temp creds
  },
});

async function worker() {
  try {
    console.log(
      "Starting mic on:",
      recorder.getSelectedDevice?.() ?? "default"
    );
    recorder.start();
    let prompt = "";
    let listening = false;
    let silenceTimer: NodeJS.Timeout;

    const kickSilenceTimer = () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      silenceTimer = setTimeout(async () => {
        parentPort?.postMessage("Silence");
        listening = false;
        if (prompt) {
          parentPort?.postMessage({ type: "Execute", content: prompt });
          prompt = "";
        }
      }, 3000);
    };

    // async generator that feeds AWS
    async function* micSource() {
      while (true) {
        try {
          const pcm = await recorder.read(); // Int16Array 16 kHz
          const porcupineResult = porcupine.process(pcm);

          const audioLevel = Math.sqrt(
            pcm.reduce((sum, val) => sum + val * val, 0) / pcm.length
          );

          if (audioLevel > 200) {
            kickSilenceTimer();
          }

          if (porcupineResult !== -1) {
            console.log("\nWake word detected!");
            listening = true;
            if (parentPort) {
              parentPort.postMessage("Wake");
            }
          }

          if (!listening) {
            // yield {
            //   AudioEvent: {
            //     AudioChunk: Buffer.alloc(pcm.length * 2),
            //   },
            // };
            continue;
          }

          yield {
            AudioEvent: {
              AudioChunk: int16ToBufferLE(pcm),
            },
          };
        } catch (error) {
          console.error("Error processing the audio frame: ", error);
        }
      }
    }

    // build command
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: "en-US", // or "es-ES"
      MediaSampleRateHertz: 16000,
      MediaEncoding: "pcm",
      AudioStream: micSource(),
    });

    console.log("Connecting to Amazon Transcribe…");

    const response = await client.send(command);
    // read results
    for await (const event of response?.TranscriptResultStream as AsyncIterable<TranscriptResultStream>) {
      // event can be different types, we only care about TranscriptEvent
      const transcriptEvent = event.TranscriptEvent;
      if (!transcriptEvent) continue;

      const results = transcriptEvent.Transcript?.Results;
      if (!results || results.length === 0) continue;

      for (const result of results) {
        // result.IsPartial === true → interim
        const alt = result.Alternatives?.[0];
        if (!alt) continue;

        const text = alt.Transcript;
        if (!text) continue;

        if (!result.IsPartial && listening) {
          prompt += " " + text;
          process.stdout.write(`\r ${text}\n`);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

parentPort?.on("message", async (message) => {
  if (message === "start") {
    await worker();
  }
});
process.on("unhandledRejection", (err) => console.error("UNHANDLED:", err));
process.on("uncaughtException", (err) => console.error("UNCAUGHT:", err));
