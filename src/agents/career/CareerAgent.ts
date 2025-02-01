import { AgentExecutor, BaseAgent } from 'langgraph';
import { CareerAnalysisChain } from './chains/CareerAnalysisChain';
import { SkillGapChain } from './chains/SkillGapChain';
import { MarketAlignmentChain } from './chains/MarketAlignmentChain';
import { AgentState, MCPConfig } from '../core/types';

export class CareerAgent extends BaseAgent {
  private chains: Map<string, BaseChain>;
  private config: MCPConfig;

  constructor(config: MCPConfig) {
    super();
    this.config = config;
    this.chains = this.initializeChains();
  }

  private initializeChains(): Map<string, BaseChain> {
    const chains = new Map();
    chains.set('careerAnalysis', new CareerAnalysisChain());
    chains.set('skillGap', new SkillGapChain());
    chains.set('marketAlignment', new MarketAlignmentChain());
    return chains;
  }

  async execute(initialState: AgentState): Promise<AgentState> {
    let currentState = initialState;
    
    while (currentState.currentStep !== 'complete') {
      const currentChain = this.chains.get(currentState.currentStep);
      if (!currentChain) {
        throw new Error(`No chain found for step: ${currentState.currentStep}`);
      }
      
      currentState = await currentChain.execute(currentState);
    }

    return currentState;
  }
}