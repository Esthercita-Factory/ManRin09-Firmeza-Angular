# Imagen de ejecución optimizada ASP.NET Core 10
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

EXPOSE 5235
ENV ASPNETCORE_URLS=http://+:5235
ENV ASPNETCORE_ENVIRONMENT=Development

# Copiar binarios publicados de la solución .NET
COPY publish/ .

ENTRYPOINT ["dotnet", "Firmeza.web.dll"]
