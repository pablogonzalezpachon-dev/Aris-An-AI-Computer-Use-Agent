import { useEffect, useState } from "react";
import "../styles.css";
import ArisGlow from "./ArisGlow";
import AgentDropdown from "./AgentDropdown";
import LoadingSpinner from "./LoadingSpinner";
import ErrorAnimation from "./ErrorAnimation";
import TaskCompleteAnimation from "./TaskCompleteAnimation";

export interface IElectronAPI {
  setClickThrough: (enabled: boolean) => void;
  onDetected: (cb: React.Dispatch<React.SetStateAction<boolean>>) => void;
  onSilenceFor3Seconds: (
    cb: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  isExecuting: (cb: React.Dispatch<React.SetStateAction<boolean>>) => void;
  finishedExecuting: (
    cb: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  invokeAris: (prompt: string) => void;
  onError: (cb: React.Dispatch<React.SetStateAction<boolean>>) => void;
  minimizeWindow: () => void;
  onDone: (cb: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

type Props = {};

function App({}: Props) {
  const [arisGlow, setArisGlow] = useState(false);
  const [widgetShowing, setWidgetShowing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.electron.onDetected(() => setArisGlow(true));
    window.electron.onSilenceFor3Seconds(() => setArisGlow(false));
    window.electron.isExecuting(() => {
      console.log("loading");
      setWidgetShowing(false);
      setLoading(true);
      setError(false);
    });
    window.electron.finishedExecuting(() => {
      setWidgetShowing(true);
      setLoading(false);
    });
    window.electron.onError(() => {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 4000);
    });
    window.electron.onDone(() => {
      setDone(true);
      setTimeout(() => {
        setDone(false);
      }, 4000);
    });
  }, []);

  if (arisGlow) {
    return <ArisGlow />;
  } else {
    return (
      <div>
        <div
          onMouseEnter={() =>
            widgetShowing
              ? window.electron.setClickThrough(false)
              : window.electron.setClickThrough(true)
          }
          onMouseLeave={() => window.electron.setClickThrough(true)}
          className={`flex justify-center items-center w-130 mx-auto border-2 border-[rgba(109,176,233,0.7)] border-opacity-50 mt-5 p-0.5 rounded-[30px] transition-all duration-500 ease-in-out  ${
            !widgetShowing ? "opacity-0 scale-75" : "opacity-100 scale-100 "
          }`}
        >
          <div
            className="relative w-full rounded-[27px] px-1
    bg-[rgba(42,69,107,0.8)]
    border-2 border-[rgba(186,207,237,1)]
    shadow-[0_0_20px_rgba(186,207,237,1)]
    text-white"
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-2xl 
          bg-gradient-to-r from-cyan-400/30 to-blue-500/30 
          blur-xl -z-10"
            />

            {/* Header */}
            <div className="flex items-center px-4 py-2 w-full justify-between">
              <div className="flex text-lg font-semibold justify-start">
                <span>Aris</span>
              </div>

              <AgentDropdown />

              <button
                onClick={() => {
                  window.electron.minimizeWindow();
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 justify-end"
              >
                ✕
              </button>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-white/40 border rounded-xl w-125 mx-auto">
              <input
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.currentTarget.value);
                }}
                placeholder="Type, or say 'Aris'..."
                className="w-full bg-transparent outline-none 
              text-white/90 placeholder-white/50"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-4 py-3">
              <button
                disabled={prompt.trim() ? false : true}
                onClick={() => {
                  window.electron.invokeAris(prompt.trim());
                  window.electron.setClickThrough(true);
                  setWidgetShowing(false);
                }}
                className="w-10 h-10 rounded-full 
            bg-white
            border-white/20 border
            text-[rgba(42,69,107,0.8)] font-bold"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
        {error && <ErrorAnimation />}
        {loading && <LoadingSpinner />}
        {<TaskCompleteAnimation done={done} />}
      </div>
    );
  }
}

export default App;
