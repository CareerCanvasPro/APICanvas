export interface AgentState {
  userId: string;
  context: Record<string, any>;
  memory: Record<string, any>;
  currentStep: string;
  output: Record<string, any>;
}

export interface MCPConfig {
  modelConfig: {
    temperature: number;
    maxTokens: number;
    model: string;
  };
  chainConfig: {
    maxSteps: number;
    fallbackBehavior: string;
  };
  promptConfig: {
    systemPrompt: string;
    templateVariables: string[];
  };
}