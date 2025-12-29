// Endpoints/EquipmentEndpoints/GetEquipmentEndpoint.cs
using Dragons.Api.Models;
using FastEndpoints;
using System.Text.Json;

namespace Dragons.Api.Endpoints.EquipmentEndpoints;

public sealed record GetEquipmentRequest
{
    public Guid Id { get; init; }
}

public sealed class GetEquipmentEndpoint : Endpoint<GetEquipmentRequest, Equipment>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public GetEquipmentEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Equipments");
    }

    public override void Configure()
    {
        Get("/api/equipment/{Id}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetEquipmentRequest req, CancellationToken ct)
    {
        if (!Directory.Exists(_dataPath))
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var equipment = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Equipment>(File.ReadAllText(f), JsonOptions)!)
            .FirstOrDefault(e => e.Id == req.Id);

        if (equipment is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(equipment, cancellation: ct);
    }
}