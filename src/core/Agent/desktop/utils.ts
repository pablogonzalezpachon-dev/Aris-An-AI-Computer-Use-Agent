import { exec } from "child_process";
import path from "path";
import { DesktopStateResponse } from "./views.js";
import { GeneralTool } from "../tools/service.js";
import { ToolResult } from "../views.js";

export const Browser = {
  CHROME: "Chrome",
  EDGE: "Edge",
  FIREFOX: "Firefox",
} as const;

export type Browser = (typeof Browser)[keyof typeof Browser];

const PROJECT_ROOT = process.cwd();

const scriptPath = path.join(PROJECT_ROOT, "DesktopState", "main.py");

const pythonPath =
  "C:/Users/pablo/Project/Aris/DesktopState/ArisDesktopState/Scripts/python.exe";

function escapeShellArg(arg: string | number | boolean): string {
  const str = String(arg);

  // On Windows
  if (process.platform === "win32") {
    // Wrap in double quotes and escape internal quotes
    return `"${str.replace(/"/g, '""')}"`;
  }

  // On Unix-like systems
  // Wrap in single quotes and handle single quotes specially
  return `'${str.replace(/'/g, "'\\''")}'`;
}

export function executeFile(
  command: string,
  args: (string | number | boolean)[] = []
): Promise<any> {
  return new Promise((resolve, reject) => {
    const escapedCommand = escapeShellArg(command);
    const escapedArgs = args.map(escapeShellArg).join(" ");

    // Use escapedArgs here instead of joining args directly
    const fullCommand =
      `"${pythonPath}" "${scriptPath}" ${escapedCommand} ${escapedArgs}`.trim();

    console.log(fullCommand);

    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Execution failed: ${error.message}\n${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        reject(new Error(`Failed to parse JSON: ${message}\n${stdout}`));
      }
    });
  });
}

export async function executeDesktopState(
  useVision = false
): Promise<DesktopStateResponse> {
  return executeFile("desktop_state", [useVision]);
}

export async function executeIsAppRunning(name: string): Promise<boolean> {
  return executeFile("is_app_running", [name]).then(
    (result: { isAppRunning: boolean }) => {
      console.log(result);
      return result.isAppRunning;
    }
  );
}

export async function switchApp(
  name: string
): Promise<{ content: string; status: number }> {
  return executeFile("switch_app", [name]).then(
    (result: { content: string; status: number }) => {
      console.log(result);
      return result;
    }
  );
}

export async function resizeApp(
  size1: number,
  size2: number,
  loc1: number,
  loc2: number
): Promise<{ content: string; status: number }> {
  return executeFile("resize_app", [size1, size2, loc1, loc2]).then(
    (result: { content: string; status: number }) => {
      console.log(result);
      return result;
    }
  );
}

export async function scrapeTool(
  url: string
): Promise<{ content: string; status: number }> {
  return executeFile("scrape_tool", [url]).then(
    (result: { content: string; status: number }) => {
      console.log(result);
      return result;
    }
  );
}

type ToolFunction = (...params: any[]) => Promise<ToolResult>;

export function registry(tools: GeneralTool[]) {
  const toolsRegistry: Record<string, ToolFunction> = {};
  for (let tool of tools) {
    toolsRegistry[tool.name] = tool.invoke.bind(tool);
    // Be careful with the "this" context!
  }
  return toolsRegistry;
}

export async function launchApp(
  name: string
): Promise<{ content: string; status: number }> {
  return executeFile("launch_app", [name]).then(
    (result: { content: string; status: number }) => {
      console.log(result);
      return result;
    }
  );
}
