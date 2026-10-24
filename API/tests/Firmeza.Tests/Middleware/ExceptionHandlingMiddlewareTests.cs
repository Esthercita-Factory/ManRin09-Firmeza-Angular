using System.IO;
using System.Text.Json;
using Firmeza.web.Middlewares;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;

namespace Firmeza.Tests.Middleware;

public class ExceptionHandlingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_WhenInvalidOperationExceptionOccursOnApi_ReturnsProblemDetails409()
    {
        // Arrange (AC-TECH-04)
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/sale";
        context.Request.Method = "POST";

        var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        var middleware = new ExceptionHandlingMiddleware(
            next: _ => throw new InvalidOperationException("Stock insuficiente para el producto."),
            logger: NullLogger<ExceptionHandlingMiddleware>.Instance
        );

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(409, context.Response.StatusCode);
        Assert.Contains("application/problem+json", context.Response.ContentType);

        responseBody.Seek(0, SeekOrigin.Begin);
        using var doc = await JsonDocument.ParseAsync(responseBody);
        var root = doc.RootElement;

        Assert.Equal(409, root.GetProperty("status").GetInt32());
        Assert.Equal("Conflict", root.GetProperty("title").GetString());
        Assert.Equal("Stock insuficiente para el producto.", root.GetProperty("detail").GetString());
        Assert.Equal("Stock insuficiente para el producto.", root.GetProperty("message").GetString()); // Compatibilidad Angular
        Assert.Equal("/api/sale", root.GetProperty("instance").GetString());
    }

    [Fact]
    public async Task InvokeAsync_WhenArgumentNullExceptionOccursOnApi_ReturnsProblemDetails400()
    {
        // Arrange
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/products";
        context.Request.Method = "POST";

        var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        var middleware = new ExceptionHandlingMiddleware(
            next: _ => throw new ArgumentNullException("request", "La solicitud es nula."),
            logger: NullLogger<ExceptionHandlingMiddleware>.Instance
        );

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(400, context.Response.StatusCode);
        Assert.Contains("application/problem+json", context.Response.ContentType);

        responseBody.Seek(0, SeekOrigin.Begin);
        using var doc = await JsonDocument.ParseAsync(responseBody);
        var root = doc.RootElement;

        Assert.Equal(400, root.GetProperty("status").GetInt32());
        Assert.Equal("BadRequest", root.GetProperty("title").GetString());
    }
}
