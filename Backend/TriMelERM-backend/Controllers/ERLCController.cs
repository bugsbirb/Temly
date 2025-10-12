using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MongoDB.Bson;
using MongoDB.Driver;
using NetCord;
using NetCord.Gateway;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Discord;
using TriMelERM_backend.Models.DTOs;
using TriMelERM_backend.Services;

namespace TriMelERM_backend.Controllers;
[Route("[controller]")]

[ApiController]        
[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class ErlcController: Controller
{
    
    private readonly GatewayClient _client;
    private readonly MongoRepository<Server> _serverService;
    private readonly MongoRepository<OauthSession> _userService;
    private readonly MongoRepository<KErlc> _keyService;
    private readonly ErlcService _erlcService;
    private readonly ModerationService _robloxService;
    private readonly Redis _redis;


    public ErlcController(GatewayClient client, MongoRepository<Server> serverService, MongoRepository<OauthSession> userService, Redis redis, MongoRepository<KErlc> keyService, ErlcService erlcService, ModerationService robloxService)
    {
        _client = client;
        _serverService = serverService;
        _userService = userService;
        _redis = redis;
        _keyService = keyService;
        _erlcService = erlcService;
        _robloxService = robloxService;
    }
    [EnableRateLimiting("ERLCCheck")]
    [HttpPost("/check")]
    public async Task<IActionResult> Check([FromBody] string key)
    {
        ErlcServer? server = await _erlcService.Check(key);
        if (server == null)
        {
            return NotFound("Server not found.");
        }
        
        return Ok(server);
    }

    [HttpPost("{id}/setkey")]
    public async Task<IActionResult> SetKey(string id, [FromBody] string key)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        ErlcServer? erlcServer = await _erlcService.Check(key);
        if (erlcServer == null)
        {
            return NotFound("ERLC Server not found.");
        }

        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.Dashboard))
        {
            return Unauthorized("You don't have permission to set the key.");
        }
        KErlc kErlc = new KErlc
        {
            Id = ObjectId.GenerateNewId(),
            ServerId = id,
            Key = key
        };
        var filter = Builders<KErlc>.Filter.Eq(k => k.ServerId, id);
        var update = Builders<KErlc>.Update.Set(k => k.Key, kErlc.Key);
        var options = new UpdateOptions { IsUpsert = true };

        var result = await _keyService.UpsertAsync(filter, update, options);

        if (!result.IsAcknowledged || (result.MatchedCount == 0 && result.UpsertedId == null))
        {
            return BadRequest("Failed to set key.");
        }

        await _redis.DeleteKey($"erlc:{id}");
        return Ok(erlcServer);
    }
    
   
    [HttpGet("server/{id}")]
    public async Task<IActionResult> GetServer(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }

        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.ErlcView | Permission.ErlcManage))
        {
            return Unauthorized();
        }

        ErlcServer? eserver = await _redis.GetObject<ErlcServer>($"erlc:{id}");
        if (eserver != null)
        {
            return Ok(server);
        }
        ErlcServer? erlcServer = await _erlcService.Call<ErlcServer>("/server", id);
        if (erlcServer == null)
        {
            return BadRequest("ERLC server not found.");
        }
        return Ok(erlcServer);
    }

    [HttpGet("server/{id}/membercheck")]
    public async Task<IActionResult> GetMemberCheck(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);

        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.ErlcView | Permission.ErlcManage))
        {
            return Unauthorized();
        }
        List<PlayerInfo>? players = await _redis.GetObject<List<PlayerInfo>>($"erlc:players:{id}");
        if (players == null)
        {
            players = await _erlcService.Call<List<PlayerInfo>>("/server/players", id) ?? new List<PlayerInfo>();
        }
        if (string.IsNullOrEmpty(server.Config.Discord.ServerId))
        {
            return NotFound("There server doesn't have a guild linked.");
        }

        Guild guild = _client.Cache.Guilds.FirstOrDefault(u => u.Key.ToString() == server.Config.Discord.ServerId).Value;
        if (guild == null)
        {
            return NotFound("No guild linked.");
        }
        IEnumerable<GuildUser> members = guild.Users.Values.ToList();
        if (!members.Any())
        {
            return NotFound("No members in your server??");
        }
        List<PlayerInfo> checkMembers = new List<PlayerInfo>();
        foreach (PlayerInfo player in players)
        {
            string playerName = player.Player.Split(':')[0];
            if (members.Any(m => m.Username == playerName || m.Nickname == playerName))
            {
                player.InServer = true;
                checkMembers.Add(player);
            }
            else
            {
                player.InServer = false;
                checkMembers.Add(player);
            }
        }
        if (checkMembers.Capacity != 0)
        {
            RobloxAvatarBatchDto? avatars = await _robloxService.GetAvatarsAsync(
                checkMembers.Select(p => long.Parse(p.Player.Split(':')[1]))
            );
            if (avatars != null && avatars.Data != null)
            {
                foreach (PlayerInfo player in checkMembers)
                {
                    long playerId = long.Parse(player.Player.Split(':')[1]);
                    AvatarThumbnailData? avatarData = avatars.Data.FirstOrDefault(a => a.TargetId == playerId);
                    if (avatarData != null)
                    {
                        player.Avatar = avatarData.ImageUrl;
                    }
                }
            }
        }
        return Ok(checkMembers);
    }
    
    [HttpGet("server/{id}/kills")]
    public async Task<IActionResult> Kills(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }

        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.ErlcView | Permission.ErlcManage))
        {
            return Unauthorized();
        }

        List<KillLog>? redis = await _redis.GetObject<List<KillLog>>($"erlc:kills:{id}");
        if (redis != null)
        {
            return Ok(server);
        }
        List<KillLog>? data = await _erlcService.Call<List<KillLog>>("/server/killlogs", id);
        if (data == null)
        {
            return BadRequest("Data not found.");
        }
        return Ok(data);
    }

    [HttpGet("server/{id}/joins")]
    public async Task<IActionResult> Joins(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }

        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.ErlcView | Permission.ErlcManage))
        {
            return Unauthorized();
        }

        List<PlayerJoinLog>? redis = await _redis.GetObject<List<PlayerJoinLog>>($"erlc:joins:{id}");
        if (redis != null)
        {
            return Ok(server);
        }
        List<PlayerJoinLog>? data = await _erlcService.Call<List<PlayerJoinLog>>("/server/joinlogs", id);
        if (data == null)
        {
            return BadRequest("Data not found.");
        }
        return Ok(data);
    }
    
    [HttpGet("server/{id}/commands")]
    public async Task<IActionResult> Commands(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }

        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.ErlcView | Permission.ErlcManage))
        {
            return Unauthorized();
        }

        List<CommandLog>? redis = await _redis.GetObject<List<CommandLog>>($"erlc:commands:{id}");
        if (redis != null)
        {
            return Ok(server);
        }
        List<CommandLog>? data = await _erlcService.Call<List<CommandLog>>("/server/commandlogs", id);
        if (data == null)
        {
            return BadRequest("Data not found.");
        }
        return Ok(data);
    }    

    [HttpGet("server/{id}/players")]
    public async Task<IActionResult> PLayers(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }

        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.ErlcView | Permission.ErlcManage))
        {
            return Unauthorized();
        }

        List<PlayerInfo>? redis = await _redis.GetObject<List<PlayerInfo>>($"erlc:players:{id}");
        if (redis != null)
        {
            return Ok(server);
        }
        List<PlayerInfo>? data = await _erlcService.Call<List<PlayerInfo>>("/server/players", id);
        if (data == null)
        {
            return BadRequest("Data not found.");
        }

        if (data.Capacity != 0)
        {
            RobloxAvatarBatchDto? avatars = await _robloxService.GetAvatarsAsync(
                data.Select(p => long.Parse(p.Player.Split(':')[1]))
            );
            if (avatars != null && avatars.Data != null)
            {
                foreach (PlayerInfo player in data)
                {
                    long playerId = long.Parse(player.Player.Split(':')[1]);
                    AvatarThumbnailData? avatarData = avatars.Data.FirstOrDefault(a => a.TargetId == playerId);
                    if (avatarData != null)
                    {
                        player.Avatar = avatarData.ImageUrl;
                    }
                }
            }
        }


        return Ok(data);
    }
    
}