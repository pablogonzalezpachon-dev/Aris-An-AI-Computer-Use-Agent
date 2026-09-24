import { Action, AgentData } from "./views.js";

function extractAgentData(message: string): AgentData | undefined {
  let result = new AgentData();
  console.log(message);

  // Extract Evaluate
  const evaluateMatch = message.match(/<evaluate>(.*?)<\/evaluate>/s);
  if (evaluateMatch) {
    result.evaluate = evaluateMatch[1].trim();
  }

  // Extract Thought
  const thoughtMatch = message.match(/<thought>(.*?)<\/thought>/s);
  if (thoughtMatch) {
    result.thought = thoughtMatch[1].trim();
  }

  // Extract Action-Name
  const action: Action = { name: "", params: {} };
  const actionNameMatch = message.match(/<action_name>(.*?)<\/action_name>/s);
  if (actionNameMatch) {
    action.name = actionNameMatch[1].trim();
  }

  // Extract and convert Action-Input to an object
  const actionInputMatch = message.match(
    /<action_input>(.*?)<\/action_input>/s
  );
  if (actionInputMatch) {
    const actionInputStr = actionInputMatch[1].trim();
    try {
      action.params = eval(`(${actionInputStr})`);
    } catch (error) {
      action.params = JSON.parse(actionInputStr);
    }

    result.action = action;

    // Validate and return the AgentData

    // Assuming AgentData has a validation method or constructor

    // console.log(result.evaluate);
    // console.log(result.thought);
    // console.log(result.action);
    // console.log(result.observation);
    return new AgentData(
      result.evaluate,
      result.thought,
      result.action,
      result.observation
    );
  }
}
export { extractAgentData };
