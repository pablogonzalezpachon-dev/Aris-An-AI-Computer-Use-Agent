import {
  GoogleGenAI,
  HttpOptions,
  Content,
  GenerateContentConfig,
  Modality,
} from "@google/genai";
import {
  BaseMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
  ImageMessage,
} from "../messages/service.js";

type LLMUsage = {
  promptTokens: number | undefined;
  completionTokens: number | undefined;
  totalTokens: number | undefined;
};

export default class ChatGoogle {
  model: string;
  apiKey: string;
  temperature: number;
  _client: GoogleGenAI | null;
  httpOptions?: HttpOptions;

  constructor(
    model: string,
    apiKey: string,
    temperature: number = 0.7,
    httpOptions?: HttpOptions
  ) {
    this.model = model;
    this.apiKey = apiKey;
    this.temperature = temperature;
    this._client = null;
    this.httpOptions = httpOptions;
  }

  get client(): GoogleGenAI {
    if (!this._client) {
      this._client = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: this.httpOptions,
      });
    }
    return this._client;
  }

  async serializeMessages(messages: BaseMessage[]) {
    const serialized: Content[] = [];
    let systemInstruction: string | null = null;

    for (let message of messages) {
      if (message instanceof SystemMessage) {
        systemInstruction = message.content;
      } else if (message instanceof HumanMessage) {
        serialized.push({
          role: "user",
          parts: [{ text: message.content }],
        });
      } else if (message instanceof AIMessage) {
        serialized.push({
          role: "model",
          parts: [{ text: message.content }],
        });
      } else if (message instanceof ImageMessage) {
        await message.scaleImage(0.7);
        const data = await message.imageToBytes();
        console.log(data);

        serialized.push({
          role: "user",
          parts: [
            { text: message.content },
            {
              inlineData: {
                data: data?.toString("base64"),
                mimeType: message.mimeType,
              },
            },
          ],
        });
      } else {
        throw new Error(
          `Unsupported message type: ${message.constructor.name}`
        );
      }
    }
    return { systemInstruction, serialized };
  }

  async invoke(messages: BaseMessage[]): Promise<{
    content: string;
    usage: LLMUsage;
  }> {
    let { systemInstruction, serialized: contents } =
      await this.serializeMessages(messages);

    const config: GenerateContentConfig = {
      temperature: this.temperature,
      systemInstruction: systemInstruction as string,
      responseMimeType: "text/plain",
      responseModalities: [Modality.TEXT],
    };

    const completion = await this.client.models.generateContent({
      model: this.model,
      contents: contents,
      config: config,
    });
    console.log("completion", completion);
    const textParts: (string | undefined)[] = [];
    if (completion.candidates && completion.candidates[0]?.content?.parts)
      for (let part of completion.candidates[0].content.parts) {
        textParts.push(part.text);
      }
    const content = textParts.join("");
    const usage: LLMUsage = {
      promptTokens: completion.usageMetadata?.promptTokenCount,
      completionTokens: completion.usageMetadata?.candidatesTokenCount,
      totalTokens: completion.usageMetadata?.totalTokenCount,
    };

    return { content: content, usage: usage };

    // Maybe this could all be simplified by using completion.text
  }
}
