// Endpoints/SpeciesEndpoints/GetSpeciesEndpoint.cs
using System.Text.Json;
using Dragons.Api.Models;
using FastEndpoints;

namespace Dragons.Api.Endpoints.SpeciesEndpoints;

public sealed record GetSpeciesRequest
{
    public Guid Id { get; init; }
}

public sealed class GetSpeciesEndpoint : Endpoint<GetSpeciesRequest, Species>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public GetSpeciesEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Species");
    }

    public override void Configure()
    {
        Get("/api/species/{Id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetSpeciesRequest req, CancellationToken ct)
    {
        var species = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Species>(File.ReadAllText(f), JsonOptions)!)
            .FirstOrDefault(s => s.Id == req.Id);

        if (species is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(species, ct);
    }
}