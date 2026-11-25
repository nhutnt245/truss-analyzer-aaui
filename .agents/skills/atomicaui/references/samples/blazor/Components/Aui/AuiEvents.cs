using Microsoft.AspNetCore.Components;

namespace AuiBlazor.Components.Aui;

/// <summary>One option of a select.</summary>
public record AuiOption(string Name, bool Disabled = false);

/// <summary>
/// What "aui-change" carries: the picked value of a select, or the number of the picked tab.
/// The behaviour script raises it in the browser; wwwroot/AuiBlazor.lib.module.js hands it to Blazor.
/// </summary>
public class AuiChangeEventArgs : EventArgs
{
    public string? Value { get; set; }
    public int Index { get; set; }
}

/// <summary>Lets a component write <c>@onauichange="..."</c> on an element.</summary>
[EventHandler("onauichange", typeof(AuiChangeEventArgs), enableStopPropagation: true, enablePreventDefault: false)]
public static class EventHandlers
{
}
