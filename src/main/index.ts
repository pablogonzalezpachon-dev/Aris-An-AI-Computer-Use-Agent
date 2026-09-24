import { app, BrowserWindow, ipcMain, Menu, screen, Tray } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Worker } from "node:worker_threads";
import ChatGoogle from "../core/llms/google.js";
import { Browser } from "../core/Agent/desktop/utils.js";
import Agent from "../core/Agent/service.js";
import { mouse } from "@nut-tree-fork/nut-js";

dotenv.config({
  quiet: true,
});

let tray: Tray | null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const worker = new Worker(path.join(__dirname, "porcupine-worker.js"));
// const executionWorker = new Worker(path.join(__dirname, "execution-worker.js"));

const apiKey = process.env.GEMINI_API_KEY;
const llm = new ChatGoogle("gemini-3-flash-preview", apiKey as string);
const agent = new Agent(llm, Browser.CHROME, undefined, undefined, false);

let listening = true;
let win: BrowserWindow | null = null;

const createWindow = (screen: Electron.Screen) => {
  let { width, height } = screen.getPrimaryDisplay().workArea;
  win = new BrowserWindow({
    resizable: false,
    hasShadow: false,
    transparent: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../preload/index.js"),
    },
    height: height,
    width: width,
    alwaysOnTop: true,
    frame: false,
  });

  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadURL("http://localhost:5173");
  win.webContents.openDevTools({ mode: "detach" });
};

app.whenReady().then(async () => {
  createWindow(screen);
  worker.postMessage("start");

  worker.on("message", async (msg) => {
    if (listening) {
      if (msg.type) {
        await agent.invoke(msg.content, win as BrowserWindow);
      } else {
        win?.webContents.send(msg);
      }
    }
  });

  ipcMain.on("set-click-through", (_, enabled) => {
    if (win) {
      win.setIgnoreMouseEvents(enabled, { forward: true });
    }
  });

  ipcMain.on("prompt", async (_, prompt) => {
    await mouse.scrollDown(700);
    await agent.invoke(prompt, win as BrowserWindow);
  });

  ipcMain.on("executing", (_) => {
    listening = false;
  });
  ipcMain.on("finish", (_) => {
    listening = true;
  });
  ipcMain.on("error", (_) => {
    listening = false;
  });

  ipcMain.on("minimize-window", (_) => {
    win?.minimize();
  });

  tray = new Tray("268098_target-icon.ico");

  const contextMenu = Menu.buildFromTemplate([
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.on("click", () => {});

  tray.setToolTip("Aris");
  tray.setContextMenu(contextMenu);
});
