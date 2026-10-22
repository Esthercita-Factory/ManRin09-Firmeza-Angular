using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Firmeza.Application.Common.Converters;

/// <summary>
/// Normalizador de cadenas numéricas provenientes de hojas de cálculo (Excel / CSV).
/// Resuelve símbolos monetarios ($, COP, USD), espacios y la ambigüedad entre
/// separadores de miles y decimales en formato latino (25.000,50) y anglosajón (25,000.50).
/// </summary>
public static class NumberNormalizer
{
    /// <summary>
    /// Intenta convertir una cadena con formato libre a decimal.
    /// Ejemplos: "$ 25.000" -> 25000 | "$25,000.50" -> 25000.50 | "18.500,25" -> 18500.25 | "25.5" -> 25.5
    /// </summary>
    public static bool TryParseDecimal(string? raw, out decimal result)
    {
        result = 0m;
        if (string.IsNullOrWhiteSpace(raw))
        {
            return false;
        }

        // 1. Conservar únicamente dígitos, separadores y signo negativo (elimina $, COP, espacios, etc.)
        var chars = raw.Where(c => char.IsDigit(c) || c == '.' || c == ',' || c == '-').ToArray();
        var str = new string(chars);

        if (str.Length == 0 || !str.Any(char.IsDigit))
        {
            return false;
        }

        var lastDot = str.LastIndexOf('.');
        var lastComma = str.LastIndexOf(',');

        if (lastDot >= 0 && lastComma >= 0)
        {
            // 2a. Ambos separadores: el que aparece de último es el decimal
            str = lastDot > lastComma
                ? str.Replace(",", string.Empty)                          // 25,000.50
                : str.Replace(".", string.Empty).Replace(',', '.');       // 25.000,50
        }
        else if (lastComma >= 0)
        {
            // 2b. Solo comas: "1500,5" / "1500,50" es decimal; "25,000" o "1,000,000" son miles
            str = IsDecimalSeparator(str, ',')
                ? str.Replace(',', '.')
                : str.Replace(",", string.Empty);
        }
        else if (lastDot >= 0)
        {
            // 2c. Solo puntos: "25.5" / "25.50" es decimal; "25.000" o "1.000.000" son miles (formato COP)
            if (!IsDecimalSeparator(str, '.'))
            {
                str = str.Replace(".", string.Empty);
            }
        }

        return decimal.TryParse(str, NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint,
            CultureInfo.InvariantCulture, out result);
    }

    /// <summary>
    /// Intenta convertir una cadena a entero (cantidades). Acepta "1.000", "1,000", "150.0" o "150".
    /// Rechaza valores con parte decimal real (ej. "10.5").
    /// </summary>
    public static bool TryParseInt(string? raw, out int result)
    {
        result = 0;
        if (!TryParseDecimal(raw, out var dec) || dec != decimal.Truncate(dec))
        {
            return false;
        }

        if (dec < int.MinValue || dec > int.MaxValue)
        {
            return false;
        }

        result = (int)dec;
        return true;
    }

    /// <summary>
    /// Un separador único se considera decimal si aparece una sola vez y le siguen 1 o 2 dígitos.
    /// Con 3 dígitos detrás (ej. 25.000) o con múltiples apariciones se interpreta como separador de miles.
    /// </summary>
    private static bool IsDecimalSeparator(string str, char separator)
    {
        var occurrences = str.Count(c => c == separator);
        if (occurrences != 1)
        {
            return false;
        }

        var digitsAfter = str.Length - str.IndexOf(separator) - 1;
        return digitsAfter is >= 1 and <= 2;
    }
}

/// <summary>
/// Convertidor JSON para decimales que acepta números nativos o cadenas con formato monetario.
/// Si la cadena no es interpretable, lanza JsonException para que el ModelState devuelva 400
/// (en lugar de guardar silenciosamente un 0 en el inventario).
/// </summary>
public class SmartDecimalConverter : JsonConverter<decimal>
{
    public override decimal Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetDecimal();
        }

        if (reader.TokenType == JsonTokenType.String && NumberNormalizer.TryParseDecimal(reader.GetString(), out var value))
        {
            return value;
        }

        throw new JsonException("El valor monetario no tiene un formato numérico válido.");
    }

    public override void Write(Utf8JsonWriter writer, decimal value, JsonSerializerOptions options)
        => writer.WriteNumberValue(value);
}

/// <summary>
/// Convertidor JSON para enteros que acepta números nativos (incluido 150.0) o cadenas ("1.000", "150").
/// </summary>
public class SmartIntConverter : JsonConverter<int>
{
    public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            if (reader.TryGetInt32(out var intValue))
            {
                return intValue;
            }

            var dec = reader.GetDecimal();
            if (dec == decimal.Truncate(dec) && dec is >= int.MinValue and <= int.MaxValue)
            {
                return (int)dec;
            }
        }
        else if (reader.TokenType == JsonTokenType.String && NumberNormalizer.TryParseInt(reader.GetString(), out var parsed))
        {
            return parsed;
        }

        throw new JsonException("La cantidad debe ser un número entero válido.");
    }

    public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
        => writer.WriteNumberValue(value);
}
