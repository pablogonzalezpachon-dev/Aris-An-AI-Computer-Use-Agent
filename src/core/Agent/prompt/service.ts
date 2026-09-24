import { dirname, join } from "path";
import { Browser } from "../desktop/utils.js";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync } from "fs";
import { formatTemplate } from "./utils.js";
import { homedir, userInfo } from "os";
import { AgentData, ToolResult } from "../views.js";
import DesktopState from "../desktop/views.js";
import { mouse } from "@nut-tree-fork/nut-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class Prompt {
  static async systemPrompt(
    browser: Browser,
    language: string,
    maxSteps: number
  ) {
    const width = 1920;
    const height = 1080;
    const os = "Microsoft Windows 11 Home";
    const template = readFileSync(join(__dirname, "system.md"), "utf-8");

    const datetime = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const toolsPrompt = readFileSync(
      join(__dirname, "tools_prompt.md"),
      "utf-8"
    );

    const formatted = formatTemplate(template, {
      datetime: datetime,
      tools: toolsPrompt,
      os: os,
      language: language,
      browser: browser,
      home_dir: homedir(),
      user: `${userInfo().username} Microsoft Account`, // You'll need to implement getUserAccountType
      resolution: `Primary Monitor (${width}x${height}) with DPI Scale: 1.25`,
      max_steps: maxSteps.toString(),
    });
    writeFileSync("output.txt", formatted, "utf-8");
    return formatted;
  }

  static actionPrompt(agentData: AgentData) {
    const template = readFileSync(join(__dirname, "action.md"), "utf-8");
    const formatted = formatTemplate(template, {
      evaluate: agentData.evaluate,
      thought: agentData.thought,
      action_name: agentData.action?.name,
      action_input: agentData.action?.params,
    });
    return formatted;
  }

  static previousObservationPrompt(
    agentStep: number,
    maxSteps: number,
    observation: string
  ) {
    const template = readFileSync(
      join(__dirname, "previous_observation.md"),
      "utf-8"
    );
    const formatted = formatTemplate(template, {
      steps: agentStep.toString(),
      max_steps: maxSteps.toString(),
      observation: observation,
    });
    return formatted;
  }
  static async observationPrompt(
    query: string,
    agentStep: number,
    maxSteps: number,
    toolResult: ToolResult,
    desktopState: DesktopState
  ) {
    const position = await mouse.getPosition();
    const template = readFileSync(join(__dirname, "observation.md"), "utf-8");
    const formatted = formatTemplate(template, {
      steps: agentStep.toString(),
      max_steps: maxSteps.toString(),
      observation: toolResult.isSuccess ? toolResult.content : toolResult.error,
      active_app: desktopState.activeApp,
      cursor_location: `(${position.x}, ${position.y})`,
      apps: desktopState.apps,
      interactive_elements: desktopState.interactiveElements,
      scrollable_elements: desktopState.scrollableElements,
      query: query,
    });
    return formatted;
  }

  static answerPrompt(agentData: AgentData, toolResult: ToolResult) {
    const template = readFileSync(join(__dirname, "answer.md"), "utf-8");
    const formatted = formatTemplate(template, {
      evaluate: agentData.evaluate,
      thought: agentData.thought,
      final_answer: toolResult.content,
    });
    return formatted;
  }
}

// Aris/Agent/prompt/system.md
