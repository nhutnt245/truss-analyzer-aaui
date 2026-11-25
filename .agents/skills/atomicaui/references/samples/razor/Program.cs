// AtomicAUI with ASP.NET Core Razor Pages and no React: the smallest app that shows a select, a dialog and tabs.
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();

var app = builder.Build();
// wwwroot/aui/ is the folder `node scripts/standard-copy.mjs wwwroot` writes: stylesheet, page setup, theme, behaviour, fonts.
app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();
app.Run();
