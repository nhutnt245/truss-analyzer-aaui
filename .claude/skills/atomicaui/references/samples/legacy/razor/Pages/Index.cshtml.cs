using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LegacyRazor.Pages;

public record Loan(int Id, string Item, string Borrower, string Due, string Status);

public class IndexModel : PageModel
{
    // The sample keeps no data of its own: the list is fixed, and a loan returned in the dialog is marked in the page only.
    private static readonly List<Loan> Loans =
    [
        new(1, "Projector P-200", "Ana Silva", "2026-11-20", "Open"),
        new(2, "Laptop L-14", "Ben Okafor", "2026-11-02", "Overdue"),
        new(3, "Camera C-3", "Chen Wei", "2026-11-25", "Open"),
        new(4, "Tripod T-9", "Ana Silva", "2026-10-28", "Returned"),
        new(5, "Microphone M-5", "Dana Roy", "2026-11-04", "Overdue"),
    ];

    [BindProperty(SupportsGet = true)]
    public string? Q { get; set; }

    [BindProperty(SupportsGet = true)]
    public string Status { get; set; } = "All statuses";

    public int Total => Loans.Count;

    public IReadOnlyList<Loan> Rows => Loans
        .Where(loan => string.IsNullOrEmpty(Q) || $"{loan.Item} {loan.Borrower}".Contains(Q, StringComparison.OrdinalIgnoreCase))
        .Where(loan => Status == "All statuses" || loan.Status == Status)
        .ToList();

    public void OnGet()
    {
    }
}
