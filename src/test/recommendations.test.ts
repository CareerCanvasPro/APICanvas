import { MCPOrchestrator } from '../agents/core/MCPOrchestrator';
import { CareerAgent } from '../agents/career/CareerAgent';
import { testConfig } from './setup';

describe('Career Recommendations', () => {
  let orchestrator: MCPOrchestrator;
  let careerAgent: CareerAgent;

  beforeEach(() => {
    orchestrator = new MCPOrchestrator();
    careerAgent = new CareerAgent({
      ...mcpConfig,
      modelConfig: {
        ...mcpConfig.modelConfig,
        temperature: 0.1 // More deterministic for testing
      }
    });
    orchestrator.registerAgent('career', careerAgent);
  });

  test('should generate career recommendations', async () => {
    const result = await orchestrator.executeWorkflow('career-guidance', {
      userId: 'test-user',
      currentStep: 'careerAnalysis',
      context: {
        timestamp: new Date().toISOString(),
        source: 'test'
      },
      memory: {},
      output: {}
    });

    expect(result).toHaveProperty('output.careerAnalysis');
    expect(result.currentStep).toBe('complete');
  });
});