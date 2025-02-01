import { Chain } from 'langgraph';
import { BaseModel, BasePrompt } from './types';

export class MCPOrchestrator {
  private chains: Map<string, Chain>;
  private models: Map<string, BaseModel>;
  private prompts: Map<string, BasePrompt>;

  constructor() {
    this.chains = new Map();
    this.models = new Map();
    this.prompts = new Map();
  }

  async executeWorkflow(workflowName: string, input: any): Promise<any> {
    const chain = this.chains.get(workflowName);
    if (!chain) throw new Error(`Workflow ${workflowName} not found`);

    const result = await chain.execute({
      input,
      models: this.models,
      prompts: this.prompts
    });

    return result;
  }

  registerChain(name: string, chain: Chain): void {
    this.chains.set(name, chain);
  }

  registerModel(name: string, model: BaseModel): void {
    this.models.set(name, model);
  }

  registerPrompt(name: string, prompt: BasePrompt): void {
    this.prompts.set(name, prompt);
  }
}