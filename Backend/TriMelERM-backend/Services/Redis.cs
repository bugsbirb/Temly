using MongoDB.Bson;
using StackExchange.Redis;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace TriMelERM_backend.Services;
using Newtonsoft.Json;

public class Redis
{
    private readonly ConnectionMultiplexer _connectionMultiplexer;
    private readonly IDatabase _database;

    public Redis(string connectingString)
    {
        _connectionMultiplexer = ConnectionMultiplexer.Connect(connectingString);
        _database = _connectionMultiplexer.GetDatabase();
    }

    public async Task<bool> SetStringAsync(string key, string value)
    {
        await _database.StringSetAsync(key, value);
        return true;
    }

    public async Task<string?> GetStringAsync(string key)
    {
        return await _database.StringGetAsync(key) ;
    }

    public async Task<bool> SaveObject<T>(string key, T obj)
    {
        var settings = new JsonSerializerSettings();
        settings.Converters.Add(new ObjectIdConverter());
        string json = JsonConvert.SerializeObject(obj, settings);
        await _database.StringSetAsync(key, json, TimeSpan.FromMinutes(3));
        return true;
    }
    public async Task<T?> GetObject<T>(string key)
    {
        RedisValue json = await _database.StringGetAsync(key);
        if (json.IsNullOrEmpty) return default;
        var settings = new JsonSerializerSettings();
        settings.Converters.Add(new ObjectIdConverter());
        return JsonConvert.DeserializeObject<T>(json!, settings);
    }

    public async Task<bool> DeleteKey(string key)
    {
        await _database.KeyDeleteAsync(key);
        return true;
    }
    public void Dispose()
    {
        _connectionMultiplexer.Dispose();
    }
}

public class ObjectIdConverter : JsonConverter<ObjectId>
{
    public override void WriteJson(JsonWriter writer, ObjectId value, JsonSerializer serializer)
    {
        writer.WriteValue(value.ToString());
    }

    public override ObjectId ReadJson(JsonReader reader, Type objectType, ObjectId existingValue, bool hasExistingValue, JsonSerializer serializer)
    {
        var value = reader.Value?.ToString();
        return string.IsNullOrEmpty(value) ? ObjectId.Empty : ObjectId.Parse(value);
    }
}