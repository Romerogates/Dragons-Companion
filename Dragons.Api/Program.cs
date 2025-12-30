using FastEndpoints;
using FastEndpoints.Swagger;

var builder = WebApplication.CreateBuilder(args);

// Ajout des services
builder.Services.AddFastEndpoints();
builder.Services.AddHttpClient(); // <-- Ajoute ça pour Groq
builder.Services.SwaggerDocument();
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
app.UseSwaggerGen();

app.Run();