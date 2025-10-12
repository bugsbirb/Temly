using System.Text.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using NetCord;
using NetCord.Gateway;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Server;

namespace TriMelERM_backend.Services;

public class ErlcService
{
    private readonly GatewayClient _client;
    private readonly MongoRepository<Server> _serverService;
    private readonly MongoRepository<KErlc> _keyService;
    private readonly HttpClient _httpClient;
    public readonly string Route = "https://api.policeroleplay.community/v1";

    public ErlcService(GatewayClient client,  HttpClient httpClient, MongoRepository<Server> serverService,  MongoRepository<KErlc> keyService)
    {
        _client = client;
        _httpClient = httpClient;
        _serverService = serverService;
        _keyService = keyService;
    }

    public async Task<ErlcServer?> Check(string key)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, Route + $"/server");
        Console.Write(Route + $"/server");
        request.Headers.Add("server-key", $"{key}");
        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }
        string responseBody = await response.Content.ReadAsStringAsync();

        var result = JsonSerializer.Deserialize<ErlcServer>(responseBody);

        return result ?? null;

    }
    
    public async Task<T?> Call<T>(string endpoint, string serverId)
    {
        KErlc? key = await _keyService.FindOneAsync(Builders<KErlc>.Filter.Eq("ServerId", serverId));
        if (key == null)
        {
            return default;
        }
        if (string.IsNullOrEmpty(key.Key))
        {
            return default;
        }
        var request = new HttpRequestMessage(HttpMethod.Get, Route + $"{endpoint}");
        Console.Write(Route + $"/{endpoint}");
        request.Headers.Add("server-key", $"{key.Key}");

        HttpResponseMessage response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            return default;
        }
        string responseBody = await response.Content.ReadAsStringAsync();

        var result = JsonSerializer.Deserialize<T>(responseBody);
        return result;
    }
    

}

