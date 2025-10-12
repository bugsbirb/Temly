using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;
using NetCord;
using TriMelERM_backend.Hub;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Moderations;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Discord;
using TriMelERM_backend.Models.DTOs;
using TriMelERM_backend.Services;
using Role = TriMelERM_backend.Models.Core.Server.Role;

namespace TriMelERM_backend.Controllers;
[Route("[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class ModerationsController : Controller
{
    private readonly ModerationService _moderationService;
    private readonly MongoRepository<Moderation> _moderationServiceDb;
    private readonly MongoRepository<Server> _serverService;
    private readonly MongoRepository<OauthSession> _userService;
    private readonly IHubContext<Modpanel> _hubContext;

    public ModerationsController(ModerationService moderationService,  MongoRepository<Moderation> moderationServiceDb,  MongoRepository<Server> serverService, IHubContext<Modpanel> hubContext, MongoRepository<OauthSession> userService)
    {
        _moderationService = moderationService;
        _moderationServiceDb = moderationServiceDb;
        _serverService = serverService;
        _userService = userService;
        _hubContext = hubContext;
    }

    [HttpGet("/autocomplete/user")]
    public async Task<RobloxSearchDto?> AutocompleteUser(string query)
    {
        return await _moderationService.UserAutoComplete(query);
    }

    [HttpGet("autocomplete/moderations")]
    public async Task<IActionResult> QueryModeration(string query, string serverId)
    {
        Server? server = await _serverService.GetByIdAsync(serverId);
        if (server == null)
        {
            return NotFound();
        }
        Permission userPermission = AuthHelper.GetPermissionAsync(server, serverId, User);        
        if (!userPermission.HasFlag(Permission.Administrator) &&
            !userPermission.HasFlag(Permission.EditModeration) &&
            !userPermission.HasFlag(Permission.EditOwnModeration))
        {
            return Unauthorized("You don't have permission to do this.");
        }

        FilterDefinition<Moderation> serverFilter = Builders<Moderation>.Filter.Eq(m => m.ServerId, serverId);

        if (!string.IsNullOrWhiteSpace(query))
        {
            BsonRegularExpression regex = new BsonRegularExpression(query, "i");
            serverFilter &= Builders<Moderation>.Filter.Or(
                Builders<Moderation>.Filter.Regex(m => m.Username, regex),
                Builders<Moderation>.Filter.Regex(m => m.Reason, regex),
                Builders<Moderation>.Filter.Regex(m => m.Action, regex)
            );
        }

        List<Moderation> moderations = await _moderationServiceDb.Collection
            .Find(serverFilter)
            .Limit(25)
            .ToListAsync();

        List<string> moderatorIds = moderations.Select(m => m.By).Distinct().ToList();
        List<OauthSession> moderatorProfiles = await _userService.Collection
            .Find(Builders<OauthSession>.Filter.In(u => u.UserId, moderatorIds))
            .Project(u => new OauthSession { UserId = u.UserId, Username = u.Username, AvatarUrl = u.AvatarUrl })
            .ToListAsync();
        Dictionary<string, OauthSession> moderatorMap = moderatorProfiles.ToDictionary(p => p.UserId.ToString(), p => p);

        List<long> userIds = moderations.Select(m => m.UserId).Distinct().ToList();
        var avatarsResponse = await _moderationService.GetAvatarsAsync(userIds);
        Dictionary<long, string?>? userAvatars = avatarsResponse?.Data?.ToDictionary(a => (long)a.TargetId, a => a.ImageUrl);

        var result = moderations.Select(m => new
        {
            Id = m.Id.ToString(),
            m.ServerId,
            m.By,
            m.Action,
            m.Reason,
            m.Username,
            m.UserId,
            m.Occured,
            AvatarUrl = userAvatars != null && userAvatars.TryGetValue(m.UserId, out string? avatarUrl) ? avatarUrl : null,
            Author = moderatorMap.TryGetValue(m.By, out OauthSession? author)
                ? new { author.Username, author.AvatarUrl }
                : null
        }).ToList();

        return Ok(result);
    }

    [HttpPut("{id}/edit/{moderationId}")]
    public async Task<IActionResult> EditModeration(string id, string moderationId, [FromBody] ModerationEditDto updated)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.EditModeration) &&
            !permission.HasFlag(Permission.EditOwnModeration))
        {
            return Unauthorized("You don't have permission to perform this action.");
        }

        Moderation? moderation = await _moderationServiceDb.GetByIdAsync(moderationId);
        if (moderation == null) return NotFound("Moderation not found");

        moderation.Action = updated.Action;
        moderation.Reason = updated.Reason;
        await _moderationServiceDb.UpdateAsync(moderation.Id.ToString(), moderation);

        OauthSession? author = await _userService.Collection
            .Find(u => u.UserId == moderation.By)
            .Project(u => new OauthSession { UserId = u.UserId, Username = u.Username, AvatarUrl = u.AvatarUrl })
            .FirstOrDefaultAsync();

        string? avatarUrl = await _moderationService.GetUserAvatarAsync(moderation.UserId);

        var m = new
        {
            Id = moderation.Id.ToString(),
            moderation.ServerId,
            moderation.Action,
            moderation.Reason,
            moderation.UserId,
            moderation.Username,
            moderation.By,
            moderation.Occured,
            AvatarUrl = avatarUrl,
            Author = author != null ? new { author.Username, author.AvatarUrl } : null
        };

        await _hubContext.Clients.Groups(id).SendAsync("EditModeration", m);

        return Ok(m);
    }

    [HttpGet("{id}/{moderationId}")]
    public async Task<IActionResult> GetModeration(string id, string moderationId)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.EditModeration) &&
            !permission.HasFlag(Permission.EditOwnModeration))
        {
            return Unauthorized("You don't have permission to access this.");
        }
        Moderation? moderation = await _moderationServiceDb.GetByIdAsync(moderationId);
        if (moderation == null) return NotFound("Moderation not found");
        if (moderation.ServerId != id)
        {
            return NotFound("Moderation not found");
        }
        OauthSession? session = await _userService.FindOneAsync(Builders<OauthSession>.Filter.Eq(u=>u.UserId, moderation.By));
        if (session == null) return NotFound("Moderation not found");
        return Ok(
            new{ 
            moderation.Id,
            moderation.ServerId,
            moderation.Action,
            moderation.Reason,
            moderation.Username,
            moderation.UserId,
            moderation.Occured,
            AvatarUrl = await _moderationService.GetUserAvatarAsync(moderation.UserId),
            Author = new { AvatarUrl = session.AvatarUrl, Username = session.Username }
        });
    }

    [HttpGet("list/{id}")]
    public async Task<IActionResult> ListModerations(string id, int pageNumber = 1, int pageSize = 20)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.EditModeration) &&
            !permission.HasFlag(Permission.EditOwnModeration))
        {
            return Unauthorized("You don't have permission to access this.");
        }

        const int maxPageSize = 100;
        if (pageSize < 1) return BadRequest("Invalid page size.");
        if (pageSize > maxPageSize) pageSize = maxPageSize;
        if (pageNumber < 1) return BadRequest("Invalid page number.");

        FilterDefinition<Moderation> filter = Builders<Moderation>.Filter.Eq(m => m.ServerId, id);
        long totalItems = await _moderationServiceDb.CountAsync(filter);
        int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        List<Moderation> moderations = (await _moderationServiceDb.GetPagedAsync(filter, Builders<Moderation>.Sort.Descending(m => m.Occured), pageNumber, pageSize)).ToList();

        List<long> userIds = moderations.Select(m => m.UserId).Where(v => v > 0).Distinct().ToList();
        RobloxAvatarBatchDto? avatarsResponse = await _moderationService.GetAvatarsAsync(userIds);
        Dictionary<long, string?>? userAvatars = avatarsResponse?.Data?.ToDictionary(a => a.TargetId, a => a.ImageUrl);

        List<string> moderatorIds = moderations.Select(m => m.By).Distinct().ToList();
        List<OauthSession> moderatorProfiles = await _userService.Collection
            .Find(Builders<OauthSession>.Filter.In(u => u.UserId, moderatorIds))
            .Project(u => new OauthSession { UserId = u.UserId, Username = u.Username, AvatarUrl = u.AvatarUrl })
            .ToListAsync();
        Dictionary<string, OauthSession> moderatorMap = moderatorProfiles.ToDictionary(p => p.UserId.ToString(), p => p);

        var result = moderations.Select(m => new
        {
            m.Id,
            m.ServerId,
            m.By,
            m.Action,
            m.Reason,
            m.Username,
            m.UserId,
            m.Occured,
            AvatarUrl = userAvatars != null && userAvatars.TryGetValue(m.UserId, out string? avatarUrl) ? avatarUrl : null,
            Author = moderatorMap.TryGetValue(m.By, out OauthSession author)
                ? new { author.Username, author.AvatarUrl }
                : null
        });

        return Ok(new
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = result
        });
    }
    [HttpDelete("{id}/delete/{moderationId}")]
    public async Task<IActionResult> DeleteModeration(string id, string moderationId)
    {
        string userId = AuthHelper.UserId(User);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID is none");
        }

        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound("Server not found.");
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.EditModeration) &&
            !permission.HasFlag(Permission.EditOwnModeration))
        {
            return Unauthorized("You don't have permission to perform this action.");
        }
        Console.WriteLine(id);
        Console.WriteLine(moderationId);

        await _hubContext.Clients.Groups(id).SendAsync("DeleteModeration",  moderationId);
        var response = await _moderationServiceDb.DeleteAsync(moderationId);
        return Ok(response.IsAcknowledged);
    }

    [HttpPost("punish")]
    public async Task<IActionResult> Punish([FromBody] ModerationDto moderation)
    {
        string userId = AuthHelper.UserId(User);
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User ID is none");

        Server? server = await _serverService.GetByIdAsync(moderation.ServerId);
        if (server == null) return NotFound("Server not found.");

        Permission permission = AuthHelper.GetPermissionAsync(server, moderation.ServerId, User);
        if (!permission.HasFlag(Permission.Administrator) && !permission.HasFlag(Permission.Moderation))
            return Unauthorized("You don't have permission to perform this action.");
        PunishmentType? type = server.Config.Punishments.Types.FirstOrDefault(x => x.Name == moderation.Action);
        if (type == null)
        {
            if (moderation.Action != "Default")
                return BadRequest("Invalid shift type");
        }
        else
        {
            if (type.AllowedRoles.Count > 0)
            {
                List<Role> memberRoles = server.Roles
                    .Where(x => x.Members.Contains(userId))
                    .ToList();

                bool hasPerms = type.AllowedRoles
                    .All(roleId => memberRoles.Any(r => r.Id.ToString() == roleId));
                if (!hasPerms)
                {
                    return Unauthorized("You aren't allowed to use this punishment type.");
                }
            }
        }

        Moderation m = new Moderation
        {
            ServerId = moderation.ServerId,
            By = userId,
            Action = moderation.Action,
            Reason = moderation.Reason,
            Username = moderation.Username,
            UserId = moderation.UserId,
            Occured = DateTime.UtcNow,
            Id = default
        };
        await _moderationServiceDb.CreateAsync(m);
        await _moderationService.Punish(m, server);

        OauthSession? author = await _userService.Collection
            .Find(u => u.UserId == m.By)
            .Project(u => new OauthSession { UserId = u.UserId, Username = u.Username, AvatarUrl = u.AvatarUrl })
            .FirstOrDefaultAsync();

        string? avatarUrl = await _moderationService.GetUserAvatarAsync(m.UserId);
        var m2 = new
        {
            Id = m.Id.ToString(),
            m.ServerId,
            m.Action,
            m.Reason,
            m.UserId,
            m.Username,
            m.Occured,
            avatarUrl,
            Author = author != null ? new { author.Username, author.AvatarUrl } : null
        };
        await _hubContext.Clients.Group(moderation.ServerId)
            .SendAsync("SendModeration", m2);

        return Ok(m2);
    }
}
