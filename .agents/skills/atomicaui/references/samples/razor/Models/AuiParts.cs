namespace AuiRazor.Models;

// What each partial view in Pages/Shared is given. The partials hold the markup and the class lists; these hold the data.

public record AuiOption(string Name, bool Disabled = false);

/// <summary>A select. <c>Name</c> is the form field the picked value is posted as.</summary>
public record AuiSelect(string Id, string Label, string Name, IReadOnlyList<AuiOption> Options, string? Value);

/// <summary>A dialog with text fields and footer buttons. The last button is the main action.</summary>
public record AuiDialog(string Id, string Opener, string Title, string Description, IReadOnlyList<string> Fields, IReadOnlyList<string> Actions);

public record AuiTab(string Name, string Content);

public record AuiTabs(string Id, IReadOnlyList<AuiTab> Tabs, int Selected);
