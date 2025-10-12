using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using NetCord.Gateway;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Discord;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Discord;
using TriMelERM_backend.Services;

namespace TriMelERM_backend.Controllers;


[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
[Route("discord")]
public class Discord: Controller
{
    private readonly GatewayClient _client;
    private readonly MongoRepository<Server>? _serverService;
    private readonly Redis _redis;


    public Discord(GatewayClient client,  MongoRepository<Server>? serverService, Redis redis)
    {
        _client = client;
        _serverService = serverService;
        _redis = redis;

    }
    [HttpGet("servers")]
    public async Task<IActionResult> Get()
    {
        string userId = AuthHelper.UserId(User);
        List<OauthServer>? cached = await _redis.GetObject<List<OauthServer>>($"{userId}:DiscordServers");
        if (cached != null)
        {
            return Ok(cached);
            
        }
        
        string token = await AuthHelper.GetToken(HttpContext);
        
        HttpClient client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        HttpResponseMessage response = await client.GetAsync("https://discord.com/api/v10/users/@me/guilds");
        if (!response.IsSuccessStatusCode)
        {
            return StatusCode(500);;
        }
        
        List<OauthServer>? guildsResponse = await response.Content.ReadFromJsonAsync<List<OauthServer>>();
        if (guildsResponse == null)
        {
            return NotFound();
        }
        
        List<KeyValuePair<ulong, Guild>> guilds = _client.Cache.Guilds.ToList();
        
        
        List<OauthServer>? userGuilds = guildsResponse?
            .Where(gr => guilds.Any(g => g.Value.Id.ToString() == gr.Id) &&
                         ((DiscordPermission)ulong.Parse(gr.Permissions!))
                         .HasFlag(DiscordPermission.ManageGuild))
            .ToList();
        
        await _redis.SaveObject($"{userId}:DiscordServers", userGuilds);
        return Ok(userGuilds);
    }
    
}