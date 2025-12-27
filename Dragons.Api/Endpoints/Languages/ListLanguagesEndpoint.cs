// Endpoints/LanguageEndpoints/ListLanguagesEndpoint.cs
using System.Text.Json;
using Dragons.Api.Models;
using FastEndpoints;

namespace Dragons.Api.Endpoints.LanguageEndpoints;

public sealed class ListLanguagesEndpoint : EndpointWithoutRequest<IReadOnlyList<LanguageSummary>>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public ListLanguagesEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Languages");
    }

    public override void Configure()
    {
        Get("/api/languages");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var languages = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Language>(File.ReadAllText(f), JsonOptions)!)
            .OrderBy(l => l.Category)
            .ThenBy(l => l.Name)
            .Select(l => new LanguageSummary
            {
                Id = l.Id,
                Name = l.Name,
                Category = l.Category
            })
            .ToList();

        await Send.OkAsync(languages, ct);
    }
}