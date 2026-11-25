// An old ASP.NET Core Razor Pages app, as the default template leaves it: one layout, a few pages, a stylesheet and a script of its own.
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();

var app = builder.Build();
app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();
app.Run();
