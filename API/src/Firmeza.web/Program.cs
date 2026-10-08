using System.Text;
using Firmeza.Application.Common.Interfaces;
using Firmeza.Application.Interfaces;
using Firmeza.Application.Services;
using Firmeza.Domain.Entities.Identity;
using Firmeza.Infrastructure.DbContext;
using Firmeza.Infrastructure.Repositories;
using Firmeza.Infrastructure.Services;
using Firmeza.web.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Configuración para soporte simultáneo de MVC/Razor Views y API Controllers
builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Firmeza API", Version = "v1" });
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Authorization header usando el esquema Bearer. Ejemplo: \"Bearer {token}\"",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
    });
    
    // Evitar colisión de esquemas DTOs (ej. LoginRequestDto)
    c.CustomSchemaIds(type => type.FullName);
});
builder.Services.AddOpenApi();

// Configuración de persistencia con PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// =========================================================================
// Configuración de ASP.NET Core Identity
// =========================================================================
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        // Opciones de contraseña
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;

        // Opciones de usuario
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Repositorios
builder.Services.AddScoped<IEnterpriseRepository, EnterpriseRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();

// Servicios de aplicación e infraestructura
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IEmployeeValidationService, EmployeeValidationService>();

// Configuración de autenticación JWT (Esquema por defecto para API REST Angular)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] 
    ?? "FirmezaSuperSecretKeyForJwtAuthentication2026!#*SecureTokenKey";
var issuer = jwtSettings["Issuer"] ?? "FirmezaAPI";
var audience = jwtSettings["Audience"] ?? "FirmezaApp";

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
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

// Configuración de CORS para permitir el cliente en Angular
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

// Asegurar existencia de roles en Identity
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    string[] roles = ["Enterprise", "Client", "Employee"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}


// =========================================================================
// MIDDLEWARE GLOBAL DE EXCEPCIONES (debe ser el primero del pipeline)
// =========================================================================
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Firmeza API v1");
    });
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

// =========================================================================
// MIDDLEWARE DE CONTROL DE ACCESO POR ROL (después de Authorization)
// =========================================================================
app.UseMiddleware<RoleAccessControlMiddleware>();

// Mapeo de Controladores de API (Rutas con [Route("api/...")] y [ApiController])
app.MapControllers();

// Mapeo de rutas por defecto para Controladores MVC
app.MapDefaultControllerRoute();

app.Run();