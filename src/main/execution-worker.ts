// import { parentPort } from "node:worker_threads";
// import Agent from "../core/Agent/service.js";
// import ChatGoogle from "../core/llms/google.js";
// import dotenv from "dotenv";
// import { Browser } from "../core/Agent/desktop/utils.js";
// import { BrowserWindow } from "electron";

// const win = new BrowserWindow();
// dotenv.config({
//   quiet: true,
// });
// const apiKey = process.env.GEMINI_API_KEY;
// const llm = new ChatGoogle("gemini-3-flash-preview", apiKey as string);
// const agent = new Agent(llm, Browser.CHROME, undefined, undefined, false);

// parentPort?.on("message", async (content: { prompt: string }) => {
//   console.log("");
//   await agent.invoke(content.prompt);
// });
