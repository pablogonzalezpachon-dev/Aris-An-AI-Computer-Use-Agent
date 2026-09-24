import { execSync } from "child_process";
import DesktopState from "./views.js";
import { executeDesktopState, registry } from "./utils.js";
import sharp from "sharp";
import { ToolResult } from "../views.js";
import {
  AppTool,
  ClickTool,
  DoneTool,
  DragTool,
  MemoryTool,
  MoveTool,
  MultiEditTool,
  MultiSelectTool,
  ScrapeTool,
  ScrollTool,
  ShellTool,
  ShortcutTool,
  TypeTool,
  WaitTool,
} from "../tools/service.js";

export default class Desktop {
  constructor(public screenshot?: sharp.Sharp) {}

  async getState(useVision: boolean): Promise<DesktopState> {
    const response = await executeDesktopState(useVision);
    if (useVision) {
      this.screenshot = sharp("screenshot.png");
    }

    return new DesktopState(
      response.activeApp,
      response.apps,
      response.interactiveElements,
      response.scrollableElements
    );
  }

  getDefaultLanguage() {
    const command =
      'powershell -Command "Get-Culture | Select-Object Name,DisplayName | ConvertTo-Csv -NoTypeInformation"';

    const output = execSync(command, { encoding: "utf8" });
    const lines = output.split(/\r?\n/);
    const values = lines[1].split('","').map((v) => v.replace(/"/g, ""));

    return values[1]; // DisplayName
  }

  getUserAccountType() {
    const command = "(Get-LocalUser -Name $env:USERNAME).PrincipalSource";
    const output = execSync(command, { encoding: "utf8" });
    return output;
  }

  async executeTool(
    toolName: string,
    params: Record<string, any>
  ): Promise<ToolResult> {
    const toolsRegistry = registry([
      new DoneTool(),
      new AppTool(),
      new ClickTool(),
      new DragTool(),
      new MemoryTool(),
      new MoveTool(),
      new MultiEditTool(),
      new MultiSelectTool(),
      new ScrapeTool(),
      new ScrollTool(),
      new ShellTool(),
      new ShortcutTool(),
      new TypeTool(),
      new WaitTool(),
    ]);

    const response = await toolsRegistry[toolName](params);
    return response;
  }
}
