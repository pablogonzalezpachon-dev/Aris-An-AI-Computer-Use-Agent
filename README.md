# Aris: An AI Agent for Computer Use

<img width="500" height="500" alt="IMG_3725" src="https://github.com/user-attachments/assets/81904c25-54d5-4545-bc89-57a87fbc3b38" />

Aris is an AI agent that can interact with a computer by clicking, scrolling, and running terminal commands. It is designed to help complete a wide range of tasks on a personal computer.

## How it works

Aris works in a continuous observe-and-act loop:

1. **Observe:** The agent receives a screenshot of the current screen and a structured description of its interface, called the *Desktop State*.
2. **Understand:** The Desktop State includes information about visible interface elements—such as buttons, headings, and text boxes—and their screen positions. Aris gathers this information using **Microsoft UI Automation (UIA)**, the Windows accessibility framework.
3. **Act:** An AI model interprets the screenshot and Desktop State, then returns structured instructions for the next action. Aris parses those instructions and performs the corresponding action.
4. **Repeat:** Aris captures an updated screenshot and Desktop State, then continues the loop until it determines that the task is complete.

## Demo

- [Watch demo 1](https://drive.google.com/file/d/1KhgJc2w0wjgnkInm-5NSCB1msvkUrM2a/view?usp=sharing)
- [Watch demo 2](https://drive.google.com/file/d/1HzAwld5iYOBuWXkn-1GMg42nxC4qyWVu/view?usp=sharing)
- [Watch demo 3](https://drive.google.com/file/d/10U-QUdvj7q0rM8288kRI2xoU8V9x5gNl/view?usp=sharing)

![Aris running on a Windows desktop](https://github.com/user-attachments/assets/d3d5e575-0ed2-4274-820d-7314af837e8f)





