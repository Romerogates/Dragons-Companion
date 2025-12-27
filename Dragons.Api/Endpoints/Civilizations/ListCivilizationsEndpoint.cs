// Endpoints/CivilizationEndpoints/ListCivilizationsEndpoint.cs
using System.Text.Json;
using Dragons.Api.Models;
using FastEndpoints;

namespace Dragons.Api.Endpoints.CivilizationEndpoints;

public sealed class ListCivilizationsEndpoint : EndpointWithoutRequest<IReadOnlyList<CivilizationSummary>>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public ListCivilizationsEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Civilizations");
    }

    public override void Configure()
    {
        Get("/api/civilizations");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var civilizations = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Civilization>(File.ReadAllText(f), JsonOptions)!)
            .OrderBy(c => c.Name)
            .Select(c => new CivilizationSummary
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToList();

        await Send.OkAsync(civilizations, ct);
    }
}