// Endpoints/SpeciesEndpoints/ListSpeciesEndpoint.cs
using System.Text.Json;
using Dragons.Api.Models;
using FastEndpoints;

namespace Dragons.Api.Endpoints.SpeciesEndpoints;

public sealed class ListSpeciesEndpoint : EndpointWithoutRequest<IReadOnlyList<SpeciesSummary>>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public ListSpeciesEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Species");
    }

    public override void Configure()
    {
        Get("/api/species");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var species = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Species>(File.ReadAllText(f), JsonOptions)!)
            .OrderBy(s => s.Name)
            .Select(s => new SpeciesSummary
            {
                Id = s.Id,
                Name = s.Name,
                BaseStats = s.BaseStats
            })
            .ToList();

        await Send.OkAsync(species, ct);
    }
}