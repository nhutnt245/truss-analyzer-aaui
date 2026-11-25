using AuiRazor.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AuiRazor.Pages;

public class IndexModel : PageModel
{
    private static readonly AuiOption[] States = [new("Preliminary"), new("In Review"), new("Released"), new("Superseded"), new("Obsolete", Disabled: true)];

    /// <summary>The select posts its value as an ordinary form field: the hidden input in the partial carries it.</summary>
    [BindProperty]
    public string State { get; set; } = "Released";

    public string? Saved { get; private set; }

    public AuiSelect StateSelect => new("select-1", "State", nameof(State), States, State);

    public AuiDialog PromoteDialog => new("dialog-1", "Promote", "Promote Part", "Choose the next state.", ["Comment"], ["Cancel", "Promote"]);

    public AuiTabs PartTabs => new("tabs-1", [new("BOM", "BOM content"), new("Documents", "Documents content"), new("Changes", "Changes content")], 0);

    public void OnGet()
    {
    }

    public void OnPost()
    {
        Saved = State;
    }
}
