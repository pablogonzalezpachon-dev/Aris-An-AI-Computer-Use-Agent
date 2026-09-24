import ChatGoogle from "../llms/google.js";
import {
  AIMessage,
  HumanMessage,
  ImageMessage,
  SystemMessage,
} from "../messages/service.js";
import Desktop from "./desktop/service.js";
import { Browser } from "./desktop/utils.js";

import Prompt from "./prompt/service.js";
import { AgentData, AgentResult, ToolResult } from "./views.js";
import { extractAgentData } from "./utils.js";
import { BrowserWindow } from "electron";
import EventEmitter from "node:events";

export const agentEventEmitter = new EventEmitter();

export default class Agent {
  llm: ChatGoogle;
  browser: Browser;
  maxConsecutiveFailures: number;
  maxSteps: number;
  useVision: boolean;
  desktop: Desktop;

  constructor(
    llm: ChatGoogle,
    browser: Browser = Browser.CHROME,
    maxConsecutiveFailures: number = 3,
    maxSteps: number = 25,
    useVision: boolean = false
  ) {
    this.llm = llm;
    this.browser = browser;
    this.maxConsecutiveFailures = maxConsecutiveFailures;
    this.maxSteps = maxSteps;
    this.useVision = useVision;

    this.desktop = new Desktop();
  }

  stop() {
    throw new Error("stopped by user");
  }

  async invoke(query: string, win: BrowserWindow): Promise<AgentResult> {
    win.webContents.send("executing");
    if (query.trim() === "") {
      return new AgentResult(
        false,
        undefined,
        "Query is empty. Please provide a valid query"
      );
    }
    try {
      let agentStep = 0;
      let agentData: AgentData | undefined = new AgentData();
      let actionResponse: ToolResult;
      let answer: string;
      let desktopState = await this.desktop.getState(this.useVision);
      console.log("desktopState: ", desktopState);

      const language = this.desktop.getDefaultLanguage();

      let observation = "The desktop is ready to operate.";

      const systemPrompt = await Prompt.systemPrompt(
        this.browser,
        language,
        this.maxSteps as number
      );
      let humanPrompt = await Prompt.observationPrompt(
        query,
        agentStep,
        this.maxSteps as number,
        new ToolResult(true, observation),
        desktopState
      );
      const messages: [SystemMessage, HumanMessage | ImageMessage | AIMessage] =
        [
          new SystemMessage(systemPrompt),
          this.useVision && this.desktop.screenshot
            ? new ImageMessage(humanPrompt, this.desktop.screenshot)
            : new HumanMessage(humanPrompt),
        ];

      while (true) {
        if (agentStep > this.maxSteps) {
          win.webContents.send("error");
          win.webContents.send("finish");
          return new AgentResult(false, undefined, "Max steps reached");
        }
        let failure = 0;
        while (failure < this.maxConsecutiveFailures) {
          try {
            console.log("invoking messages");
            const { content } = await this.llm.invoke(messages);
            console.log("messages invoked");
            if (!content) {
              throw new Error("LLM did not generate text");
            }
            agentData = extractAgentData(content);
            break;
          } catch (e) {
            failure++;
            console.log(`[LLM]: ${e}. Retrying attempt ${failure}... `);
            if (failure === this.maxConsecutiveFailures) {
              win.webContents.send("finish");
              return new AgentResult(false, undefined, e as string);
            }
          }
        }
        console.log(agentData);
        console.log(`[Agent] 🎯 Step: ${agentStep}`);
        console.log(`[Agent] 🎯 Evaluate: ${agentData?.evaluate}`);
        console.log(`[Agent] 🎯 Thought: ${agentData?.thought}`);

        messages.pop(); // Remove previous Desktop State Human Message
        humanPrompt = Prompt.previousObservationPrompt(
          agentStep,
          this.maxSteps,
          observation
        );
        // Useless this prompt?
        let humanMessage = new HumanMessage(humanPrompt);
        messages.push(humanMessage);

        let aiPrompt = Prompt.actionPrompt(agentData as AgentData);
        let aiMessage = new AIMessage(aiPrompt);
        messages.push(aiMessage);

        let action = agentData?.action;
        let actionName = action?.name;
        let params = action?.params;
        // console.log(actionName);
        // console.log(params);

        if (actionName?.startsWith("Done")) {
          actionResponse = await this.desktop.executeTool(
            actionName,
            params as Record<string, any>
          );
          answer = actionResponse.content as string;
          console.log(`[Agent] 📜 Final-Answer: ${answer}\n`);
          (agentData as AgentData).observation = answer;
          humanPrompt = await Prompt.answerPrompt(
            agentData as AgentData,
            actionResponse
          );
          win.webContents.send("finish");
          win.webContents.send("done");
          break;
        } else {
          console.log(
            `[Tool] 🔧 Action: ${actionName} ${JSON.stringify(params, null, 2)}`
          );
          actionResponse = await this.desktop.executeTool(
            actionName as string,
            params as Record<string, any>
          );
          observation = actionResponse.isSuccess
            ? (actionResponse.content as string)
            : (actionResponse.error as string);
          console.log(`[Tool] 📝 Observation: ${observation}`);
          (agentData as AgentData).observation = observation;
          // Maybe this is useless
          desktopState = await this.desktop.getState(this.useVision);
          humanPrompt = await Prompt.observationPrompt(
            query,
            agentStep,
            this.maxSteps,
            actionResponse,
            desktopState
          );
          humanMessage =
            this.useVision && this.desktop.screenshot
              ? new ImageMessage(humanPrompt, this.desktop.screenshot)
              : new HumanMessage(humanPrompt);
          messages.push(humanMessage);
        }
        agentStep++;
      }
      agentStep = 0;
      return new AgentResult(true, answer);
    } catch (e) {
      console.log(`An error happened: ${e} `);
      win.webContents.send("error");
      win.webContents.send("finish");
      return new AgentResult(false, undefined, e as string);
    }
  }
  async printResponse(query: string, win: BrowserWindow) {
    const response = await this.invoke(query, win);
    console.log(response.isDone ? response.content : response.error);
  }
}
