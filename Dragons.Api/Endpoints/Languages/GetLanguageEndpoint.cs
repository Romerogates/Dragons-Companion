// Endpoints/LanguageEndpoints/GetLanguageEndpoint.cs
using System.Text.Json;
using Dragons.Api.Models;
using FastEndpoints;

namespace Dragons.Api.Endpoints.LanguageEndpoints;

public sealed record GetLanguageRequest
{
    public Guid Id { get; init; }
}

public sealed class GetLanguageEndpoint : Endpoint<GetLanguageRequest, Language>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public GetLanguageEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Languages");
    }

    public override void Configure()
    {
        Get("/api/languages/{Id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetLanguageRequest req, CancellationToken ct)
    {
        var language = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Language>(File.ReadAllText(f), JsonOptions)!)
            .FirstOrDefault(l => l.Id == req.Id);

        if (language is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(language, ct);
    }
}
