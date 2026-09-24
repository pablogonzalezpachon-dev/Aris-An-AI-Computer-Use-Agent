export class AgentData {
  constructor(
    public evaluate?: string,
    public thought?: string,
    public action?: Action,
    public observation?: string
  ) {}
}

export type Action = {
  name: string;
  params: Record<string, any>;
};

export class ToolResult {
  constructor(
    public isSuccess: boolean,
    public content?: string,
    public error?: string
  ) {}
}

export class AgentResult {
  constructor(
    public isDone: boolean,
    public content?: string,
    public error?: string
  ) {}
}
