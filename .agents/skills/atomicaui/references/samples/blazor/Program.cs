// AtomicAUI with Blazor (interactive server) and no React: the smallest app that shows a select, a dialog and tabs.
using AuiBlazor.Components;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorComponents().AddInteractiveServerComponents();

var app = builder.Build();
app.UseAntiforgery();
// wwwroot/aui/ is the folder `node scripts/standard-copy.mjs wwwroot` writes. Copy it before you build: the build lists the files it serves.
app.MapStaticAssets();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();
app.Run();
