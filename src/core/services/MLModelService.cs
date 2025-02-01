public class MLModelService : IMLModelService
{
    private readonly HttpClient _client;
    private readonly IConfiguration _configuration;

    public MLModelService(HttpClient client, IConfiguration configuration)
    {
        _client = client;
        _configuration = configuration;
    }

    public async Task<IEnumerable<JobRecommendation>> PredictJobMatches(JobMatchingInput input)
    {
        var response = await _client.PostAsJsonAsync(
            _configuration["ML:Endpoints:JobMatching"],
            input
        );

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IEnumerable<JobRecommendation>>();
    }

    public async Task<IEnumerable<SkillRecommendation>> PredictSkillGaps(
        IEnumerable<Skill> currentSkills,
        IndustryTrends trends,
        CareerGoals goals)
    {
        var input = new SkillGapInput
        {
            CurrentSkills = currentSkills,
            IndustryTrends = trends,
            CareerGoals = goals
        };

        var response = await _client.PostAsJsonAsync(
            _configuration["ML:Endpoints:SkillGap"],
            input
        );

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IEnumerable<SkillRecommendation>>();
    }
}