// Endpoints/CharacterClassEndpoints/GetCharacterClassEndpoint.cs
using System.Text.Json;
using Dragons.Api.Models;
using FastEndpoints;

namespace Dragons.Api.Endpoints.CharacterClassEndpoints;

public sealed record GetCharacterClassRequest
{
    public Guid Id { get; init; }
}

public sealed class GetCharacterClassEndpoint : Endpoint<GetCharacterClassRequest, CharacterClass>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public GetCharacterClassEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Classes");
    }

    public override void Configure()
    {
        Get("/api/classes/{Id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetCharacterClassRequest req, CancellationToken ct)
    {
        var characterClass = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<CharacterClass>(File.ReadAllText(f), JsonOptions)!)
            .FirstOrDefault(c => c.Id == req.Id);

        if (characterClass is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(characterClass, ct);
    }
}
