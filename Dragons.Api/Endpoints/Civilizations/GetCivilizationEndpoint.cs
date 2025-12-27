// Features/Civilizations/GetCivilizationEndpoint.cs
using Dragons.Api.Models;
using FastEndpoints;
using System.Text.Json;

namespace Dragons.Api.Endpoints.Civilizations;

public sealed record GetCivilizationRequest
{
    public Guid Id { get; init; }
}

public sealed class GetCivilizationEndpoint : Endpoint<GetCivilizationRequest, Civilization>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public GetCivilizationEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Civilizations");
    }

    public override void Configure()
    {
        Get("/api/civilizations/{Id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetCivilizationRequest req, CancellationToken ct)
    {
        var civilization = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Civilization>(File.ReadAllText(f), JsonOptions)!)
            .FirstOrDefault(c => c.Id == req.Id);

        if (civilization is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(civilization, ct);
    }
}