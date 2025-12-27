// Models/Civilization.cs
namespace Dragons.Api.Models;

public sealed record Civilization
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required RandomizationInfo Randomization { get; init; }
    public required DemographicsInfo Demographics { get; init; }
    public required LinguisticsInfo Linguistics { get; init; }
    public required LoreInfo Lore { get; init; }
}

public sealed record CivilizationSummary
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
}

public sealed record RandomizationInfo
{
    public required int DiceMin { get; init; }
    public required int DiceMax { get; init; }
}

public sealed record DemographicsInfo
{
    public required IReadOnlyList<string> PrimarySpecies { get; init; }
    public required IReadOnlyList<string> SecondarySpecies { get; init; }
    public required bool IsCosmopolitan { get; init; }
}

public sealed record LinguisticsInfo
{
    public required IReadOnlyList<string> OfficialLanguages { get; init; }
    public required IReadOnlyList<string> WritingSystems { get; init; }
}

public sealed record LoreInfo
{
    public required string Summary { get; init; }
    public required IReadOnlyList<string> Keywords { get; init; }
}