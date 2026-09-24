<h1>Aris: An AI Computer Use AI Agent</h1>
<img width="400" height="400" alt="IMG_3725" src="https://github.com/user-attachments/assets/2b19f7e1-f1d7-457d-ab3f-7c22857cb17f" />
<p>Aris is an AI agent capable of clicking, scrolling and executing commands on the terminal. It is designed to handle all kind of tasks in a personal computer. </p>
<h2>How does it work?</h2>
<p>The agent runs in a loop. 

First, the agent will receive two things: 
  - A screenshot, showing the current state of the screen
  - An structured text (called Desktop State) with all of the x and y coordinates of the components of the screen (such as buttons, headings, boxes, etc). This was achieved using Microsoft UI Automation (UIA), the Windows accessibility framework that exposes information about on-screen controls—such as their names, roles, states, and actions.

With this information, the agent could then output the instructions to achieve the task. Using the API from the largest AI providers, the LLM would then output a structured response, which then was parsed in order to execute the corresponding action.

Once the action was done, a new screenshot and Desktop State is sent. This loop will continue until the LLM concludes that the task is done.
</p>
