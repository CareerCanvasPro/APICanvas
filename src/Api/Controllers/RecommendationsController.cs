[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;
    private readonly ISkillAnalysisService _skillAnalysisService;
    private readonly ICareerPathPredictionService _careerPathService;
    private readonly ILogger<RecommendationsController> _logger;

    public RecommendationsController(
        IRecommendationService recommendationService,
        ISkillAnalysisService skillAnalysisService,
        ICareerPathPredictionService careerPathService,
        ILogger<RecommendationsController> logger)
    {
        _recommendationService = recommendationService;
        _skillAnalysisService = skillAnalysisService;
        _careerPathService = careerPathService;
        _logger = logger;
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<IEnumerable<JobRecommendation>>> GetJobRecommendations()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var recommendations = await _recommendationService.GetPersonalizedRecommendations(userId);
        return Ok(recommendations);
    }

    [HttpGet("skills")]
    public async Task<ActionResult<IEnumerable<SkillRecommendation>>> GetSkillRecommendations()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var recommendations = await _recommendationService.GetSkillRecommendations(userId);
        return Ok(recommendations);
    }

    [HttpGet("skill-gap")]
    public async Task<ActionResult<SkillGapAnalysis>> GetSkillGapAnalysis()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var analysis = await _skillAnalysisService.AnalyzeSkillGap(userId);
        return Ok(analysis);
    }

    [HttpGet("skill-trends")]
    public async Task<ActionResult<IEnumerable<SkillTrend>>> GetSkillTrends(
        [FromQuery] string industry,
        [FromQuery] int months = 12)
    {
        var trends = await _skillAnalysisService.GetIndustrySkillTrends(industry, months);
        return Ok(trends);
    }

    [HttpGet("career-path")]
    public async Task<ActionResult<CareerPathPrediction>> GetCareerPathPrediction()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var prediction = await _careerPathService.PredictCareerPath(userId);
        return Ok(prediction);
    }

    [HttpPost("skill-demand")]
    public async Task<ActionResult<SkillDemandPrediction>> PredictSkillDemand(
        [FromBody] SkillDemandRequest request)
    {
        var prediction = await _skillAnalysisService.PredictSkillDemand(request);
        return Ok(prediction);
    }
}