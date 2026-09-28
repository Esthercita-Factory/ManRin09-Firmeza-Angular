using System.Text;
using Firmeza.Application.Interfaces;
using Firmeza.Application.Services;
using Firmeza.Domain.Interfaces;
using Firmeza.Infrastructure.DbContext;
using Firmeza.Infrastructure.Repositories;
using Firmeza.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configuración de persistencia con PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=postgres;Username=Manuel;Password=M104349928m*";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Repositorios
builder.Services.AddScoped<IEnterpriseRepository, EnterpriseRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();

// Servicios de aplicación e infraestructura
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Configuración de autenticación JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] 
    ?? "FirmezaSuperSecretKeyForJwtAuthentication2026!#*SecureTokenKey";
var issuer = jwtSettings["Issuer"] ?? "FirmezaAPI";
var audience = jwtSettings["Audience"] ?? "FirmezaApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

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

// CORS debe ir antes de autenticación, redirecciones y mapeo
app.UseCors("AllowAngular");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Redirección en la raíz para verificar que la API está activa al abrir el navegador
app.MapGet("/", () => Results.Redirect("/api/auth/home-data"));

app.MapControllers();

app.Run();