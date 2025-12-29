// Models/Equipment.cs
using System.Text.Json;

namespace Dragons.Api.Models;

public sealed class Equipment
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Type { get; init; }  // Weapon, Armor, Gear
    public required string Subtype { get; init; }
    public required CostInfo Cost { get; init; }
    public required double WeightKg { get; init; }
    public JsonElement? Data { get; init; }  // Flexible pour les différents types
}

public sealed class EquipmentSummary
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Type { get; init; }
    public required string Subtype { get; init; }
    public required CostInfo Cost { get; init; }
}

public sealed class CostInfo
{
    public required int Value { get; init; }
    public required string Unit { get; init; }  // po, pa, pc
}

// DTOs pour les données spécifiques (optionnel, pour typage fort si besoin)
public sealed class WeaponData
{
    public required string DamageDice { get; init; }
    public required string DamageType { get; init; }
    public List<string> Properties { get; init; } = [];
}

public sealed class ArmorData
{
    public int? AcBase { get; init; }
    public int? AcBonus { get; init; }  // Pour les boucliers
    public bool? AddDexMod { get; init; }
    public int? MaxDexBonus { get; init; }
    public int? StrRequirement { get; init; }
    public bool? StealthDisadvantage { get; init; }
}

public sealed class GearData
{
    public required string Description { get; init; }
}