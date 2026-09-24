const { contextBridge, ipcRenderer } = require("electron");

// cb is callback

contextBridge.exposeInMainWorld("electron", {
  onDetected: (cb: () => void) => {
    ipcRenderer.on("Wake", () => {
      cb();
    });
  },
  onError: (cb: () => void) => {
    ipcRenderer.on("error", () => {
      cb();
      ipcRenderer.send("error");
    });
  },

  onSilenceFor3Seconds: (cb: () => void) => {
    ipcRenderer.on("Silence", () => {
      cb();
    });
  },
  isExecuting: (cb: () => void) => {
    ipcRenderer.on("executing", () => {
      cb();
      ipcRenderer.send("executing");
    });
  },
  finishedExecuting: (cb: () => void) => {
    ipcRenderer.on("finish", () => {
      cb();
      ipcRenderer.send("finish");
    });
  },

  setClickThrough: (enabled: string) =>
    ipcRenderer.send("set-click-through", enabled),

  invokeAris: (prompt: string) => {
    ipcRenderer.send("prompt", prompt);
  },
  minimizeWindow: () => {
    ipcRenderer.send("minimize-window");
  },
  onDone: (cb: () => void) => {
    ipcRenderer.on("done", () => {
      cb();
    });
  },
});

// ipcRender.send() -> the renderer sends message to the main process
// ipcMain.on() -> the main process listens for messages from the renderer
// window.electron.setClickThrough(false) -> the renderer calls this function to send message to main process
