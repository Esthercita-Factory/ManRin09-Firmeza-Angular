var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configuración de CORS para permitir el frontend en Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// CORS debe ir antes de redirecciones y mapeo
app.UseCors("AllowAngular");

app.UseHttpsRedirection();

app.UseAuthorization();

// Redirección en la raíz para verificar que la API está activa al abrir el navegador
app.MapGet("/", () => Results.Redirect("/api/auth/home-data"));

app.MapControllers();

app.Run();