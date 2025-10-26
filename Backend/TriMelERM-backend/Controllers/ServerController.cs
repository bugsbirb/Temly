using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MongoDB.Bson;
using MongoDB.Driver;
using NetCord;
using NetCord.Gateway;
using NetCord.Services;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Discord;
using TriMelERM_backend.Models.DTOs;
using TriMelERM_backend.Services;
using Role = TriMelERM_backend.Models.Core.Server.Role;

namespace TriMelERM_backend.Controllers;

[Route("[controller]")]
[ApiController]        
[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class Servers: Controller
{
    private readonly GatewayClient _client;
    private readonly MongoRepository<Server> _serverService;
    private readonly MongoRepository<OauthSession> _userService;
    private readonly MongoRepository<KErlc> _keyService;
    private readonly Redis _redis;


    public Servers(GatewayClient client, MongoRepository<Server> serverService, MongoRepository<OauthSession> userService, Redis redis, MongoRepository<KErlc> keyService)
    {
        _client = client;
        _serverService = serverService;
        _userService = userService;
        _redis = redis;
        _keyService = keyService;
    }

    [HttpPut("{id}/role/edit")]
    public async Task<IActionResult> EditRoles(string id, [FromBody] List<Role> roles)
    {
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }

        if (roles == null! || roles.Count == 0)
            return BadRequest("Roles list cannot be empty.");

        if (roles.Any(r => string.IsNullOrWhiteSpace(r.Name)))
            return BadRequest("Role name cannot be empty.");

        if (roles.Select(r => r.Position).Distinct().Count() != roles.Count)
            return BadRequest("Duplicate role positions are not allowed.");

        if (roles.Select(r => r.Id).Distinct().Count() != roles.Count)
            return BadRequest("Duplicate role IDs are not allowed.");
        List<Role> updatedRoles = roles.Select(r => new Role
        {
            Id = ObjectId.Parse(r.Id.ToString()),
            Name = r.Name,
            Permissions = r.Permissions,
            Members = r.Members,
            Position = r.Position
        }).ToList();

        server.Roles = updatedRoles;
        await _serverService.UpdateAsync(id, server);
        await _redis.DeleteKey($"server:{userId}:{id}");
        return Ok(server.Roles);
    }

    [HttpPost("{id}/discord/{discord}/link")]
    public async Task<IActionResult> LinkServer(string id, string discord)
    {
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound("Server not found. [1]");
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized("You don't have the correct permissions for this server.");
        }
        var dServer = _client.Cache.Guilds.FirstOrDefault(s => s.Value.Id.ToString() == discord);
        if (dServer.Value == null)
        {
            return NotFound("Server not found [2]");
        }
        KeyValuePair<ulong, Guild> guild = _client.Cache.Guilds.FirstOrDefault(s =>
            s.Value.Id.ToString() == dServer.Key.ToString() && s.Value.OwnerId.ToString() == userId);
        if (guild.Value is null)
        {
            return Unauthorized("You do not have permission to use this server. ;)");
        }

        server.Config.Discord = new DiscordConfig
        {
            ServerId = dServer.Key.ToString()
        };
        await _serverService.UpdateAsync(id, server);
        await _redis.DeleteKey($"server:{userId}:{id}");
        return Ok(true);
    }


    [HttpPost("{id}/role/create")]
    public async Task<IActionResult> CreateRole(string id, [FromBody] RoleDTO request)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }
        foreach (var r in server.Roles)
        {
            r.Position++;
        }
        Role role = new Role
        {
            Id = new ObjectId(ObjectId.GenerateNewId().ToString()),
            Name = request.Name,
            Permissions = (Permission)request.Permissions,
            Members = request.Members,
            Position = 0
        };

        server.Roles.Add(role);
        await _serverService.UpdateAsync(id, server);
        return Ok(role);
    }

    [HttpDelete("{id}/role/delete")]
    public async Task<IActionResult> DeleteRole(string id, [FromBody] Role role)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }  
        server.Roles.RemoveAll(r => r.Id == role.Id);
        for (int i = 0; i < server.Roles.Count; i++)
        {
            server.Roles[i].Position = i;
        }
        await _serverService.UpdateAsync(id, server);
        return Ok(server.Roles);
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> Delete(string id, [FromBody] string name)
    {
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverService!.GetByIdAsync(id);
        if (server is null)
            return NotFound();
        if (userId != server.OwnerId)
        {
            return Unauthorized();
        }

        if (name != server.Name)
        {
            return BadRequest("This isn't the correct server name buddy move over.");
        }
        await _serverService.DeleteAsync(id);
        return Ok();
    }

    [HttpGet("{id}/code/regenerate")]
    public async Task<IActionResult> Regenerate(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }
        server.ServerCode = StringHelper.RandomString(5);
        await _serverService.UpdateAsync(id, server);
        return Ok(server.ServerCode);
    }



    [EnableRateLimiting("ServerCreation")]
    [HttpPost(template: "create")]
    public async Task<IActionResult > Create([FromBody] CreateServerDto request)
    {
        Dictionary<string, string> claims = AuthHelper.Claim(User);
        string userId =  claims["nameidentifier"];
        if (!string.IsNullOrWhiteSpace(request.DiscordServer))
        {
            KeyValuePair<ulong, Guild> guild = _client.Cache.Guilds.FirstOrDefault(s => s.Value.Id.ToString() == request.DiscordServer && s.Value.OwnerId.ToString() == userId);
            if (guild.Value is null)
            {
                return Unauthorized("You do not have permission to use this server. ;)");
            }
        }
        Server server = new Server
        {
            Name = request.Name,
            ServerCode = StringHelper.RandomString(5),
            Config = new Config
            {
                ERLC = new ERLC
                {
                    Enabled = request.ApiKey != null
                },
                Discord = new DiscordConfig()
                {
                    ServerId = request.DiscordServer ?? ""
                }
            },
            OwnerId = userId,
            Members = new List<string>() {userId},
            Roles = new List<Role> { (
                new Role
                {
                    Id = ObjectId.GenerateNewId(),
                    Name = "Owner",
                    Permissions = Permission.Administrator,
                    Members = new List<string>() {userId},
                    Position = 0
                }
               )}
        };
        if (request.ApiKey != null)
        {
            KErlc erlc = new KErlc
            {
                Id = ObjectId.GenerateNewId(),
                ServerId = server.Id.ToString(),
                Key = request.ApiKey
            };
            await _keyService.CreateAsync(erlc);

        }
        await _serverService.CreateAsync(server);
        return Ok(server);
    }
    [HttpGet(template: "mutual")]
    public async Task<IActionResult> GetList()
    {
        string userId = AuthHelper.UserId(User);
        var filter = Builders<Server>.Filter.AnyEq(s => s.Members, userId);
        IEnumerable<Server> servers = await _serverService!.FindManyAsync(filter);
        List<MutualDto?> result = new List<MutualDto?>();

        foreach (Server s in servers)
        {
            MutualDto? cachedResponse = await _redis.GetObject<MutualDto>($"mutualServer:{s.Id}:{userId}");
            if (cachedResponse != null)
            {
                result.Add(cachedResponse);
                continue;
            }
            var server = s;
            Permission permissions = AuthHelper.GetPermissionAsync(server, server.Id.ToString(), User);

            GuildDto? guildObj = null;
            if (server.Config?.Discord?.ServerId != null && ulong.TryParse(server.Config.Discord.ServerId, out ulong parsedServerId))
            {
                var guild = _client.Cache.Guilds.FirstOrDefault(u => u.Value.Id == parsedServerId);
                if (guild.Key != 0 && guild.Value != null)
                {
                    var author = guild.Value.Users
                        .Where(u => u.Value.Id.ToString() == userId.Trim())
                        .Select(u => new GuildAuthorDto
                        {
                            UserId = u.Value.Id.ToString(),
                            UserName = u.Value.Username,
                            Roles = u.Value.GetRoles(guild.Value)
                                .Select(r => new GuildRoleDto { RoleId = r.Id.ToString(), RoleName = r.Name })
                                .ToList()
                        })
                        .FirstOrDefault();

                    guildObj = new GuildDto
                    {
                        ServerName = guild.Value.Name,
                        ServerId = guild.Value.Id.ToString(),
                        ServerIcon = guild.Value.GetIconUrl()?.ToString(),
                        Channels = guild.Value.Channels
                            .Select(c => new ChannelDto { ChannelId = c.Value.Id.ToString(), ChannelName = c.Value.Name })
                            .ToList(),
                        Roles = guild.Value.Roles
                            .Select(c => new GuildRoleDto { RoleId = c.Value.Id.ToString(), RoleName = c.Value.Name })
                            .ToList(),
                        Author = author
                    };
                }
            }

            MutualDto responseObj = new MutualDto
            {
                Id = server.Id.ToString(),
                Name = server.Name,
                OwnerId = server.OwnerId,
                Permissions = permissions.ToString(),
                PermissionsValue = (int)permissions,
                IsDashboardUser = permissions.HasFlag(Permission.Dashboard) || permissions.HasFlag(Permission.Administrator),
                IsModpanelUser = permissions.HasFlag(Permission.Moderation) || permissions.HasFlag(Permission.Administrator),
                Guild = guildObj
            };

            await _redis.SaveObject($"mutualServer:{s.Id}:{userId}", responseObj);

            result.Add(responseObj);
        }

        return Ok(result);
    }

    [HttpGet("{id}/permissions")]
    public async Task<IActionResult> GetPermissions(string id)
    {
        Server? server = await _serverService!.GetByIdAsync(id);
        if (server is null)
            return NotFound();

        string userId = AuthHelper.UserId(User);

        List<Role> memberRoles = server.Roles
            .Where(role => role.Members.Contains(userId))
            .ToList();

        Permission permissions = memberRoles
            .Select(r => r.Permissions)
            .Aggregate(Permission.None, (acc, perm) => acc | perm);

        return Ok(new { permissions = permissions.ToString(), permissionsValue = (int)permissions });

    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        string userId = AuthHelper.UserId(User);
        ServerDto? cached = await _redis.GetObject<ServerDto>($"server:{userId}:{id}");
        if (cached != null)
        {
            return Ok(cached);
        }

        var server = await _serverService.GetByIdAsync(id);
        if (server is null)
            return NotFound();

        Permission permissions =  AuthHelper.GetPermissionAsync(server, id, User);
        if (!permissions.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }

        List<MemberDto2> members = new List<MemberDto2>();
        foreach (string uid in server.Members)
        {
            OauthSession? userSession = await _userService.FindOneAsync(
                Builders<OauthSession>.Filter.Eq(x => x.UserId, uid)
            );


            members.Add(new MemberDto2
            {
                UserId = userId,
                Name = userSession?.Username ?? "Unknown",
                Avatar = userSession?.AvatarUrl,
                Roles = server.Roles
                    .Where(role => role.Members.Contains(userId))
                    .Select(role => role.Name)
                    .ToList()
            });
        }

        List<RoleDto2> roles = server.Roles.Select(r => new RoleDto2
        {
            Id = r.Id.ToString(),
            Name = r.Name,
            Permissions = (int)r.Permissions,
            Members = r.Members,
            Position = r.Position
        }).ToList();

        GuildDto? guildObj = null;
        if (server.Config?.Discord?.ServerId != null &&
            ulong.TryParse(server.Config.Discord.ServerId, out ulong parsedServerId))
        {
            var guild = _client.Cache.Guilds.FirstOrDefault(u => u.Value.Id == parsedServerId);
            if (!guild.Equals(default(KeyValuePair<ulong, Guild>)))
            {
                guildObj = new GuildDto
                {
                    ServerName = guild.Value.Name,
                    ServerId = guild.Value.Id.ToString(),
                    ServerIcon = guild.Value.GetIconUrl()?.ToString(),
                    Channels = guild.Value.Channels
                        .Select(c => new ChannelDto { ChannelId = c.Value.Id.ToString(), ChannelName = c.Value.Name })
                        .ToList(),
                    Roles = guild.Value.Roles
                        .Select(c => new GuildRoleDto { RoleId = c.Value.Id.ToString(), RoleName = c.Value.Name })
                        .ToList()
                };
            }
        }

        ServerDto response = new ServerDto()
            {
                IsDashboardUser = permissions.HasFlag(Permission.Dashboard) ||
                                  permissions.HasFlag(Permission.Administrator),
                IsModpanelUser = permissions.HasFlag(Permission.Moderation) ||
                                 permissions.HasFlag(Permission.Administrator),
                Config = server.Config,
                Id = server.Id.ToString(),
                Name = server.Name,
                ServerCode=server.ServerCode,
                OwnerId = server.OwnerId,
                Members = members,
                Roles = roles,
                Guild = guildObj
            };

            await _redis.SaveObject($"server:{userId}:{id}", response);

            return Ok(response);
        }

    [HttpPut("{serverId}/config/overview")]
    public async Task<IActionResult> Overview(string serverId, [FromBody] OverviewDto overview)
    {
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverService!.GetByIdAsync(serverId);
        if (server is null)
            return NotFound();
        Permission permission = AuthHelper.GetPermissionAsync(server, serverId, User);
        Console.WriteLine(permission);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }
        
        server.Config.DefaultRoles = overview.DefaultRoles;
        server.Name = overview.ServerName;
        
        await _serverService.UpdateAsync(server.Id.ToString(), server);
        await _redis.DeleteKey($"server:{userId}:{serverId}");
        return Ok(true);
    }

    [HttpPut("{serverId}/role/{memberId}/roles")]
    public async Task<IActionResult> ManageRoles(string serverId, string memberId, [FromBody] List<string> roles)
    {
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverService!.GetByIdAsync(serverId);
        if (server is null)
            return NotFound();
        Permission permission = AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }
        server.Roles = server.Roles.Select(r => new Role
        {
            Id = r.Id,
            Name = r.Name,
            Position = r.Position,
            Members = new List<string>(r.Members ?? new List<string>())
        }).ToList();
        
        List<Role> authorRoles = server.Roles.Where(r => r.Members.Contains(userId)).ToList();
        int authorHighestPosition = authorRoles.Any() ? authorRoles.Max(r => r.Position) : -1;

        foreach (string roleId in roles)
        {
            Role? role = server.Roles.FirstOrDefault(r => r.Id.ToString() == roleId);
            if (role == null)
                continue;

            if (role.Position > authorHighestPosition && userId != server.OwnerId)
                return Unauthorized($"Insufficient permission to add {role.Name}.");

            if (!role.Members.Contains(memberId))
                role.Members.Add(memberId);
        }

        foreach (Role role in server.Roles)
        {
            if (!roles.Contains(role.Id.ToString()) && role.Members.Contains(memberId))
            {
                if (role.Position > authorHighestPosition && userId != server.OwnerId)
                    return Unauthorized($"Insufficient permission to remove {role.Name}.");

                role.Members.Remove(memberId);
            }
        }

        await _serverService.UpdateAsync(server.Id.ToString(), server);
        await _redis.DeleteKey($"server:{userId}:{serverId}");

        return Ok("Successfully updated roles.");
    }
    

    [HttpPut("{serverId}/config/shifts")]
    public async Task<IActionResult> Shifts(string serverId, [FromBody] CShifts config)
    {
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverService!.GetByIdAsync(serverId);
        if (server is null)
            return NotFound();
        Permission permission = AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }  
        server.Config.Shifts.Types = config.Types ?? [];
        await _serverService.UpdateAsync(server.Id.ToString(), server);
        await _redis.DeleteKey($"server:{userId}:{serverId}");
        return Ok(true);
    }
    
    
    [HttpPut("{serverId}/config/punishments")]
    public async Task<IActionResult> Punishments(string serverId, [FromBody] Punishments config)
    {
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverService!.GetByIdAsync(serverId);
        if (server is null)
            return NotFound();
        Permission permission = AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.ContainsAny(Permission.Administrator | Permission.Dashboard))
        {
            return Unauthorized();
        }
        server.Config.Punishments ??= new Punishments();
        server.Config.Punishments.Types = config.Types ?? [];
        server.Config.Punishments.Discord ??= new PunishmentsDiscord();
        server.Config.Punishments.Discord.Channel = config.Discord?.Channel ?? "";
        await _serverService.UpdateAsync(server.Id.ToString(), server);
        await _redis.DeleteKey($"server:{userId}:{serverId}");
        return Ok(true);
    }

    

}

