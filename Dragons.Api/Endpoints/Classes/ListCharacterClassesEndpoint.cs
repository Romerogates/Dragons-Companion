// Endpoints/CharacterClassEndpoints/ListCharacterClassesEndpoint.cs
using System.Text.Json;
using Dragons.Api.Models;
using FastEndpoints;

namespace Dragons.Api.Endpoints.CharacterClassEndpoints;

public sealed class ListCharacterClassesEndpoint : EndpointWithoutRequest<IReadOnlyList<CharacterClassSummary>>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public ListCharacterClassesEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Classes");
    }

    public override void Configure()
    {
        Get("/api/classes");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var classes = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<CharacterClass>(File.ReadAllText(f), JsonOptions)!)
            .OrderBy(c => c.Name)
            .Select(c => new CharacterClassSummary
            {
                Id = c.Id,
                Name = c.Name,
                HitDie = c.HitDie,
                HasSpellcasting = c.Spellcasting is not null
            })
            .ToList();

        await Send.OkAsync(classes, ct);
    }
}