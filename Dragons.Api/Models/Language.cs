// Models/Language.cs
namespace Dragons.Api.Models;

public sealed record Language
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Category { get; init; }
    public required IReadOnlyList<string> Scripts { get; init; }
    public required IReadOnlyList<string> TypicalSpeakers { get; init; }
    public required string Lore { get; init; }
}

public sealed record LanguageSummary
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Category { get; init; }
}