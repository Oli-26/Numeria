using MathVoyager.Models;

namespace MathVoyager.Data;

public interface IArtifactRepository
{
    Task<List<Artifact>> GetArtifactsAsync();
    Task<Artifact?> GetArtifactAsync(string id);
}
