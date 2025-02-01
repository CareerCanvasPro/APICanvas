public class RecommendationService : IRecommendationService
{
    private readonly IJobRepository _jobRepository;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IMLModelService _mlService;

    public RecommendationService(
        IJobRepository jobRepository,
        IUserProfileRepository profileRepository,
        IMLModelService mlService)
    {
        _jobRepository = jobRepository;
        _profileRepository = profileRepository;
        _mlService = mlService;
    }

    public async Task<IEnumerable<JobRecommendation>> GetPersonalizedRecommendations(string userId)
    {
        var userProfile = await _profileRepository.GetByUserId(userId);
        var userSkills = userProfile.Skills.Select(s => s.Name).ToList();
        var userExperience = userProfile.Experience.Select(e => e.Description).ToList();

        var recommendations = await _mlService.PredictJobMatches(
            new JobMatchingInput
            {
                Skills = userSkills,
                Experience = userExperience,
                PreferredIndustries = userProfile.PreferredIndustries,
                PreferredLocations = userProfile.PreferredLocations
            });

        return recommendations;
    }

    public async Task<IEnumerable<SkillRecommendation>> GetSkillRecommendations(string userId)
    {
        var userProfile = await _profileRepository.GetByUserId(userId);
        var industryTrends = await _mlService.AnalyzeIndustryTrends(userProfile.PreferredIndustries);
        
        return await _mlService.PredictSkillGaps(
            userProfile.Skills,
            industryTrends,
            userProfile.CareerGoals
        );
    }
}