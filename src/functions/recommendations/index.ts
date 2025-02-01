import { APIGatewayProxyHandler } from 'aws-lambda';
import { RecommendationService } from '../../services/RecommendationService';
import { SkillAnalysisService } from '../../services/SkillAnalysisService';
import { CareerPathService } from '../../services/CareerPathService';
import { createLogger } from '../../utils/logger';
import { MCPOrchestrator } from '../../agents/core/MCPOrchestrator';
import { CareerAgent } from '../../agents/career/CareerAgent';

const logger = createLogger('recommendations');
const recommendationService = new RecommendationService();
const skillAnalysisService = new SkillAnalysisService();
const careerPathService = new CareerPathService();

const orchestrator = new MCPOrchestrator();
const mcpConfig = {
  modelConfig: {
    temperature: 0.7,
    maxTokens: 2000,
    model: 'gpt-4'
  },
  chainConfig: {
    maxSteps: 5,
    fallbackBehavior: 'retry'
  },
  promptConfig: {
    systemPrompt: 'You are an expert career guidance AI...',
    templateVariables: ['profile', 'skills', 'market']
  }
};

const careerAgent = new CareerAgent(mcpConfig);
orchestrator.registerAgent('career', careerAgent);

export const getCareerRecommendations: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    
    const result = await orchestrator.executeWorkflow('career-guidance', {
      userId,
      currentStep: 'careerAnalysis',
      context: {
        timestamp: new Date().toISOString(),
        source: 'api-gateway'
      },
      memory: {},
      output: {}
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    logger.error('Error in career recommendations:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

// Similar handlers for other endpoints...