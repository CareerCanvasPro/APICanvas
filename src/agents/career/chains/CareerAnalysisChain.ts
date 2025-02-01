import { BaseChain } from 'langgraph';
import { AgentState } from '../../core/types';

export class CareerAnalysisChain extends BaseChain {
  async execute(state: AgentState): Promise<AgentState> {
    const { userId, context } = state;
    
    const analysis = await this.analyzeCareerPath({
      profile: context.userProfile,
      marketData: context.marketTrends,
      skills: context.userSkills
    });

    return {
      ...state,
      output: {
        ...state.output,
        careerAnalysis: analysis
      },
      currentStep: 'skillGapAnalysis'
    };
  }

  private async analyzeCareerPath(data: any) {
    const prompt = `
      Analyze career progression for:
      - Current Role: ${data.profile.currentRole}
      - Target Role: ${data.profile.targetRole}
      - Skills: ${data.skills.join(', ')}
      - Market Trends: ${JSON.stringify(data.marketData)}
    `;

    return await this.llm.predict(prompt);
  }
}