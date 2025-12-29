# Étape 1 : Build avec le SDK .NET 9.0
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copie du csproj et restauration
COPY ["Dragons.Api.csproj", "./"]
RUN dotnet restore "Dragons.Api.csproj"

# Copie du reste du code et publication
COPY . .
RUN dotnet publish "Dragons.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Étape 2 : Runtime avec ASP.NET 9.0
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

# Variable d'environnement pour écouter sur le port 8080 (standard .NET 8/9)
ENV ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Dragons.Api.dll"]
