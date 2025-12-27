// Models/Species.cs
namespace Dragons.Api.Models;

public sealed record Species
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required BaseStatsInfo BaseStats { get; init; }
    public required IReadOnlyList<TraitInfo> Traits { get; init; }
    public required IReadOnlyList<string> Languages { get; init; }
    public required IReadOnlyList<Subspecies> Subspecies { get; init; }
}

public sealed record SpeciesSummary
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required BaseStatsInfo BaseStats { get; init; }
}

public sealed record BaseStatsInfo
{
    public required Dictionary<string, int> AbilityBonuses { get; init; }
    public required double SpeedMeters { get; init; }
    public required string SizeCategory { get; init; }
    public required bool HasDarkvision { get; init; }
    public required double DarkvisionRadiusMeters { get; init; }
}

public sealed record AdditionalStatsInfo
{
    public required Dictionary<string, int> AbilityBonuses { get; init; }
}

public sealed record TraitInfo
{
    public required string Name { get; init; }
    public required string Description { get; init; }
}

public sealed record Subspecies
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required AdditionalStatsInfo AdditionalStats { get; init; }
    public required IReadOnlyList<TraitInfo> AdditionalTraits { get; init; }
}