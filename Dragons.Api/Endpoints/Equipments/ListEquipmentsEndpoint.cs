// Endpoints/EquipmentEndpoints/ListEquipmentEndpoint.cs
using Dragons.Api.Models;
using FastEndpoints;
using System.Text.Json;

namespace Dragons.Api.Endpoints.EquipmentEndpoints;

public sealed class ListEquipmentEndpoint : EndpointWithoutRequest<List<EquipmentSummary>>
{
    private readonly string _dataPath;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    public ListEquipmentEndpoint(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "Data", "Equipments");
    }

    public override void Configure()
    {
        Get("/api/equipment");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!Directory.Exists(_dataPath))
        {
            await Send.OkAsync(new List<EquipmentSummary>(), cancellation: ct);
            return;
        }

        var equipmentList = Directory.GetFiles(_dataPath, "*.json")
            .Select(f => JsonSerializer.Deserialize<Equipment>(File.ReadAllText(f), JsonOptions)!)
            .Select(e => new EquipmentSummary
            {
                Id = e.Id,
                Name = e.Name,
                Type = e.Type,
                Subtype = e.Subtype,
                Cost = e.Cost
            })
            .OrderBy(e => e.Type)
            .ThenBy(e => e.Subtype)
            .ThenBy(e => e.Name)
            .ToList();

        await Send.OkAsync(equipmentList, cancellation: ct);
    }
}