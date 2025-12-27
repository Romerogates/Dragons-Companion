using FastEndpoints;
using FastEndpoints.Swagger;

var builder = WebApplication.CreateBuilder(args);

// Ajout des services
builder.Services.AddFastEndpoints();
builder.Services.SwaggerDocument(); // Active la documentation Swagger

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Activation des middlewares
app.UseCors("AllowAngular");
app.UseFastEndpoints();
app.UseSwaggerGen(); // Indispensable pour voir l'interface de test

app.Run();