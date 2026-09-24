import {
  executeIsAppRunning,
  launchApp,
  resizeApp,
  scrapeTool,
  switchApp,
} from "../desktop/utils.js";
import { ToolResult } from "../views.js";
import { executeCommand, sleep } from "./utils.js";
import {
  Button,
  Key,
  keyboard,
  mouse,
  Point,
  sleep as nutSleep,
} from "@nut-tree-fork/nut-js";

keyboard.config.autoDelayMs = 50;

export abstract class GeneralTool {
  constructor(public name: string) {}
  abstract invoke(params: Record<string, any>): Promise<ToolResult>;
}

class DoneTool extends GeneralTool {
  constructor() {
    super("Done Tool");
  }
  async invoke(params: { answer: string }) {
    const { answer } = params;
    return new ToolResult(true, answer);
  }
}

class AppTool extends GeneralTool {
  constructor() {
    super("App Tool");
  }

  async invoke(params: {
    mode: "launch" | "resize" | "switch";
    name?: string;
    loc?: [number, number];
    size?: [number, number];
  }) {
    const { mode, name, loc, size } = params;
    switch (mode) {
      case "launch": {
        const { content, status } = await launchApp(name as string);
        console.log(status);
        await sleep(1250);
        if (status !== 0) {
          return new ToolResult(false, undefined, content);
        }
        let consecutive_wait = 0;
        while (consecutive_wait < 3) {
          const isAppRunning = await executeIsAppRunning(name as string);
          if (!isAppRunning) {
            await sleep(1250);
          } else {
            return new ToolResult(true, `${name} launched properly`);
          }
        }
        return new ToolResult(
          true,
          `Launching ${name} wait for it to come load`
        );
      }
      case "resize": {
        const [x, y] = loc ?? [0, 0];

        const [w, h] = size ?? [0, 0];

        const { content, status } = await resizeApp(x, y, w, h);
        if (status !== 0) {
          return new ToolResult(false, undefined, content);
        }
        return new ToolResult(true, content);
      }
      case "switch": {
        const { content, status } = await switchApp(name as string);
        if (status !== 0) {
          return new ToolResult(false, undefined, content);
        }
        return new ToolResult(true, content);
      }
    }
  }
}

class MemoryTool extends GeneralTool {
  constructor() {
    super("Memory Tool");
  }
  async invoke() {
    return new ToolResult(true);
  }
}

class ShellTool extends GeneralTool {
  constructor() {
    super("Shell Tool");
  }
  async invoke(params: { command: string }) {
    const { command } = params;
    const [response, status] = executeCommand(command);
    return new ToolResult(true, `${response}\nStatus Code: ${status}`);
  }
}

class ClickTool extends GeneralTool {
  constructor() {
    super("Click Tool");
  }
  async invoke(params: {
    loc?: [number, number];
    button: "left" | "right" | "middle";
    clicks: number;
  }) {
    const { loc, button = "left", clicks = 1 } = params;

    const [x, y] = loc ?? [0, 0];
    switch (button) {
      case "left":
        if (clicks == 2) {
          await mouse.move([new Point(x, y)]);
          await mouse.doubleClick(Button.LEFT);
        } else {
          await mouse.move([new Point(x, y)]);
          await mouse.leftClick();
        }
        break;
      case "right":
        if (clicks == 2) {
          await mouse.move([new Point(x, y)]);
          await mouse.doubleClick(Button.RIGHT);
        } else {
          await mouse.move([new Point(x, y)]);
          await mouse.rightClick();
        }
        break;
      case "middle":
        if (clicks == 2) {
          await mouse.move([new Point(x, y)]);
          await mouse.doubleClick(Button.MIDDLE);
        } else {
          await mouse.move([new Point(x, y)]);
          await mouse.click(Button.MIDDLE);
        }
        break;
    }
    const numClicks: Record<number, string> = {
      1: "Single",
      2: "Double",
      3: "Triple",
    };
    return new ToolResult(
      true,
      `${numClicks[clicks]} ${button} clicked at (${x},${y})`
    );
  }
}

class TypeTool extends GeneralTool {
  constructor() {
    super("Type Tool");
  }
  async invoke(params: {
    loc?: [number, number];
    text: string;
    clear: "true" | "false";
    caretPosition?: "start" | "idle" | "end";
    pressEnter?: "true" | "false";
  }) {
    const {
      loc,
      text = "",
      clear = "false",
      caretPosition = "idle",
      pressEnter = "false",
    } = params;
    const [x, y] = loc ?? [0, 0];
    await mouse.move([new Point(x, y)]);
    await mouse.leftClick();
    if (caretPosition == "start") {
      keyboard.type(Key.Home);
    } else if (caretPosition == "end") {
      keyboard.type(Key.End);
    }

    if (clear === "true") {
      await nutSleep(500);
      await keyboard.pressKey(Key.LeftControl, Key.A);
      await keyboard.releaseKey(Key.LeftControl, Key.A);
      await keyboard.pressKey(Key.Backspace);
    }
    await keyboard.type(text);
    if (pressEnter === "true") {
      keyboard.type(Key.Enter);
    }
    return new ToolResult(true, `Typed ${text} at (${x},${y}).`);
  }
}

class ScrollTool extends GeneralTool {
  private readonly PIXELS_PER_WHEEL = 700;
  constructor() {
    super("Scroll Tool");
  }
  async invoke(params: {
    loc?: [number, number];
    type: "horizontal" | "vertical";
    direction: "up" | "down" | "left" | "right";
    wheelTimes: number;
  }) {
    const {
      loc,
      type = "vertical",
      direction = "down",
      wheelTimes = 1,
    } = params;
    if (loc) {
      const [x, y] = loc;
      await mouse.move([new Point(x, y)]);
    }
    switch (type) {
      case "vertical": {
        switch (direction) {
          case "up":
            await mouse.scrollUp(this.PIXELS_PER_WHEEL * wheelTimes);
            break;
          case "down":
            await mouse.scrollDown(this.PIXELS_PER_WHEEL * wheelTimes);
            break;
          default:
            return new ToolResult(
              false,
              undefined,
              'Invalid direction. Use "up" or "down".'
            );
        }
        break;
      }
      case "horizontal": {
        switch (direction) {
          case "left":
            await mouse.scrollLeft(this.PIXELS_PER_WHEEL * wheelTimes);
            break;
          case "right":
            await mouse.scrollRight(this.PIXELS_PER_WHEEL * wheelTimes);
            break;
          default:
            return new ToolResult(
              false,
              undefined,
              'Invalid direction. Use "left" or "right".'
            );
        }
        break;
      }
      default:
        return new ToolResult(
          false,
          undefined,
          'Invalid type. Use "horizontal" or "vertical".'
        );
    }
    return new ToolResult(
      true,
      `Scrolled ${type} ${direction} by ${wheelTimes} wheel times.`
    );
  }
}

class DragTool extends GeneralTool {
  constructor() {
    super("Drag Tool");
  }

  async invoke(params: { loc?: [number, number] }) {
    const { loc } = params;
    const [x, y] = loc ?? [0, 0];
    await nutSleep(500);
    await mouse.drag([new Point(x, y)]);
    return new ToolResult(true, `Dragged the selected element to (${x},${y}).`);
  }
}

class MoveTool extends GeneralTool {
  constructor() {
    super("Move Tool");
  }

  async invoke(params: { loc?: [number, number] }) {
    const { loc } = params;
    const [x, y] = loc ?? [0, 0];
    await mouse.move([new Point(x, y)]);
    return new ToolResult(true, `Moved the mouse pointer to (${x},${y}).`);
  }
}

class ShortcutTool extends GeneralTool {
  constructor() {
    super("Shortcut Tool");
  }

  async invoke(params: { shortcut: string }) {
    try {
      const { shortcut } = params;
      const shortcutArray = shortcut.split("+");
      if (shortcutArray.length > 1) {
        const keys = shortcutArray.map((key) => this.parseKey(key.trim()));
        await keyboard.pressKey(...keys);
        await keyboard.releaseKey(...keys);
      } else {
        const key = this.parseKey(shortcutArray[0].trim());
        await keyboard.type(key);
      }
      return new ToolResult(true, `Pressed ${shortcut}`);
    } catch (e) {
      return new ToolResult(false, undefined, e as string);
    }
  }
  private parseKey(keyString: string): Key {
    // Map common key strings to nut.js Key enum
    const keyMap: { [key: string]: Key } = {
      ctrl: Key.LeftControl,
      control: Key.LeftControl,
      alt: Key.LeftAlt,
      shift: Key.LeftShift,
      win: Key.LeftWin,
      cmd: Key.LeftCmd,
      super: Key.LeftSuper,
      enter: Key.Return,
      return: Key.Return,
      escape: Key.Escape,
      esc: Key.Escape,
      tab: Key.Tab,
      delete: Key.Delete,
      backspace: Key.Backspace,
      space: Key.Space,
      up: Key.Up,
      down: Key.Down,
      left: Key.Left,
      right: Key.Right,
      home: Key.Home,
      end: Key.End,
      pageup: Key.PageUp,
      pagedown: Key.PageDown,
      f1: Key.F1,
      f2: Key.F2,
      f3: Key.F3,
      f4: Key.F4,
      f5: Key.F5,
      f6: Key.F6,
      f7: Key.F7,
      f8: Key.F8,
      f9: Key.F9,
      f10: Key.F10,
      f11: Key.F11,
      f12: Key.F12,
    };

    const lowerKey = keyString.toLowerCase();

    // Check if it's a special key
    if (keyMap[lowerKey]) {
      return keyMap[lowerKey];
    }

    // For single character keys (a-z, 0-9, etc.)
    if (keyString.length === 1) {
      const upperKey = keyString.toUpperCase();
      return Key[upperKey as keyof typeof Key];
    }

    throw new Error(`Unknown key: ${keyString}`);
  }
}

class MultiSelectTool extends GeneralTool {
  constructor() {
    super("Multi Select Tool");
  }

  async invoke(params: {
    pressCtrl: "true" | "false";
    elements: [number, number][];
  }) {
    const { pressCtrl = "true", elements = [] } = params;
    if (pressCtrl === "true") {
      await keyboard.pressKey(Key.LeftControl);
    }
    for (let element of elements) {
      const [x, y] = element;
      await mouse.move([new Point(x, y)]);
      await mouse.leftClick();
      await nutSleep(500);
    }
    await keyboard.releaseKey(Key.LeftControl);

    return new ToolResult(
      true,
      `Multi-selected elements at ${elements
        .map((element) => {
          const [x, y] = element;
          return `(${x},${y})`;
        })
        .join("\n")}.`
    );
  }
}

class MultiEditTool extends GeneralTool {
  constructor() {
    super("Multi Edit Tool");
  }

  async invoke(params: { elements: [number, number, string][] }) {
    const { elements } = params;
    for (let element of elements) {
      let [x, y, text] = element;
      const typeTool = new TypeTool();
      await typeTool.invoke({ loc: [x, y], text: text, clear: "true" });
    }
    return new ToolResult(
      true,
      `Multi-edited elements at ${elements
        .map((element) => {
          const [x, y, text] = element;
          return `(${x},${y}) text=${text}`;
        })
        .join(", ")}.`
    );
  }
}

class WaitTool extends GeneralTool {
  constructor() {
    super("Wait Tool");
  }

  async invoke(params: { duration: number }) {
    const { duration } = params;
    await sleep(duration);
    return new ToolResult(true, `Waited for ${duration} seconds.`);
  }
}

class ScrapeTool extends GeneralTool {
  constructor() {
    super("Scrape Tool");
  }

  async invoke(params: { url: string }) {
    const { url } = params;
    const { content, status } = await scrapeTool(url);

    if (status != 0) {
      return new ToolResult(false, undefined, content);
    }
    return new ToolResult(true, content);
  }
}

export {
  DoneTool,
  AppTool,
  ClickTool,
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
};
