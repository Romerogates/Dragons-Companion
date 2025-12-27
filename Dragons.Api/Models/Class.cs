// Models/CharacterClass.cs
using System.Text.Json;

namespace Dragons.Api.Models;

public sealed record CharacterClass
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required int HitDie { get; init; }
    public required IReadOnlyList<string> PrimaryAbility { get; init; }
    public SpellcastingInfo? Spellcasting { get; init; }
    public required ProficienciesInfo Proficiencies { get; init; }
    public required IReadOnlyList<EquipmentChoice> StartingEquipment { get; init; }
    public required IReadOnlyList<LevelProgression> ProgressionTable { get; init; }
    public required int SubclassesAvailableAtLevel { get; init; }
}

public sealed record CharacterClassSummary
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required int HitDie { get; init; }
    public required bool HasSpellcasting { get; init; }
}

public sealed record SpellcastingInfo
{
    public required string Ability { get; init; }
    public required string Type { get; init; }
}

public sealed record ProficienciesInfo
{
    public required IReadOnlyList<string> Armor { get; init; }
    public required IReadOnlyList<string> Weapons { get; init; }
    public required IReadOnlyList<string> Tools { get; init; }
    public required IReadOnlyList<string> SavingThrows { get; init; }
    public required SkillChoiceInfo Skills { get; init; }
}

public sealed record SkillChoiceInfo
{
    public required int ChooseCount { get; init; }
    public required IReadOnlyList<string> Options { get; init; }
}

public sealed record EquipmentChoice
{
    public IReadOnlyList<string>? ChoiceA { get; init; }
    public IReadOnlyList<string>? ChoiceB { get; init; }
    public IReadOnlyList<string>? ChoiceC { get; init; }
    public IReadOnlyList<string>? Fixed { get; init; }
}

public sealed record LevelProgression
{
    public required int Level { get; init; }
    public required int ProfBonus { get; init; }
    public required IReadOnlyList<string> Features { get; init; }
    public IReadOnlyList<int>? SpellSlots { get; init; }
    public Dictionary<string, JsonElement>? ClassResources { get; init; }
}