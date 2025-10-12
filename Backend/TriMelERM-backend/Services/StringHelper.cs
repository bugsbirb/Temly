using System.Text.Json;
using System.Text.Json.Serialization;
using MongoDB.Bson;

namespace TriMelERM_backend.Services;

using System;
using System.Linq;
public class StringHelper
{
    public static string RandomString(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();

        return new string(
            Enumerable.Range(1, length)
                .Select(_ => chars[random.Next(chars.Length)])
                .ToArray()
            );
    }

    public static string TimeStretcher(TimeSpan totalTime)
    {
        int weeks = totalTime.Days / 7;
        int days = totalTime.Days % 7;
        int hours = totalTime.Hours;
        int minutes = totalTime.Minutes;
        int seconds = totalTime.Seconds;

        var parts = new List<string>();

        if (weeks > 0) parts.Add($"{weeks} week{(weeks > 1 ? "s" : "")}");
        if (days > 0) parts.Add($"{days} day{(days > 1 ? "s" : "")}");
        if (hours > 0) parts.Add($"{hours} hour{(hours != 1 ? "s" : "")}");
        if (minutes > 0) parts.Add($"{minutes} minute{(minutes != 1 ? "s" : "")}");
        if (seconds > 0) parts.Add($"{seconds} second{(seconds != 1 ? "s" : "")}");
        if (!parts.Any()) parts.Add("0 seconds");

        return string.Join(", ", parts);
    }
    
}

public class ObjectIdJsonConverter : JsonConverter<ObjectId>
{
    public override ObjectId Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return ObjectId.Parse(reader.GetString()!);
    }

    public override void Write(Utf8JsonWriter writer, ObjectId value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}

