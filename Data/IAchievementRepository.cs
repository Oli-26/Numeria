using MathVoyager.Models;

namespace MathVoyager.Data;

public interface IAchievementRepository
{
    Task<List<Achievement>> GetAchievementsAsync();
}
