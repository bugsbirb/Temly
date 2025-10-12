using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Driver;
using NetCord;
using NetCord.Gateway;
using NetCord.Rest;
using NetCord;
using TriMelERM_backend.Hub;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Core.Shifts;
using TriMelERM_backend.Models.Discord;
using TriMelERM_backend.Models.DTOs;
using TriMelERM_backend.Services;
using Role = TriMelERM_backend.Models.Core.Server.Role;

namespace TriMelERM_backend.Controllers;

[ApiController]
[Route("[controller]/[action]")]
[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class ShiftController : ControllerBase
{
    private readonly ILogger<ShiftController> _logger;
    private readonly ShiftService _shiftService;
    private readonly GatewayClient _client;
    private readonly IHubContext<Modpanel> _hubContext;
    private readonly MongoRepository<Shift> _shiftsDatabase;
    private readonly MongoRepository<Server> _serverDatabase;
    private readonly MongoRepository<OauthSession> _userService;



    public ShiftController(ILogger<ShiftController> logger, ShiftService shiftService, GatewayClient client, IHubContext<Modpanel> hubContext,  MongoRepository<Shift> shiftDb,  MongoRepository<Server> server, MongoRepository<OauthSession> userService)
    {
        _logger = logger;
        _shiftService = shiftService;
        _client = client;
        _hubContext = hubContext;
        _shiftsDatabase = shiftDb;
        _serverDatabase = server;
        _userService = userService;
    }

    [HttpPost(Name = "Start")]
    public async Task<IActionResult> Start([FromBody] string serverId, string shiftType)
    {

        string userId = AuthHelper.UserId(User);
        Server? server = await _serverDatabase.GetByIdAsync(serverId);
        if (server == null)
        {
            return NotFound("Server not found");
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.ShiftAdmin) &&
            !permission.HasFlag(Permission.ShiftManage))
        {
            return Unauthorized("You don't have permission to perform this action.");
        }
        
        ShiftType? type = server.Config.Shifts.Types.FirstOrDefault(x => x.Name == shiftType);
        if (type == null)
        {
            if (shiftType != "Default")
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
                    .Any(roleId => memberRoles.Any(r => r.Id.ToString() == roleId));
                if (!hasPerms)
                {
                    return Unauthorized("You aren't allowed to use this shift type.");
                }
            }
        }

        
        var filter = Builders<Shift>.Filter.And(
            Builders<Shift>.Filter.Eq(s => s.UserId, userId),
            Builders<Shift>.Filter.Eq(s => s.ServerId, serverId),
            Builders<Shift>.Filter.Eq(s => s.EndTime, null)); 

        Shift? activeShift = await _shiftsDatabase.FindOneAsync(filter);
        if (activeShift != null)
        {
            return BadRequest("You have an active shift.");
        }
        Shift shift = new Shift
        {
            Id = ObjectId.GenerateNewId(),
            ServerId = serverId,
            UserId = userId,
            StartTime = DateTime.UtcNow,
            EndTime = null,
            ShiftType = shiftType
        };
        await _shiftsDatabase.CreateAsync(shift);
        OauthSession? user = await _userService.FindOneAsync(Builders<OauthSession>.Filter.Eq(s => s.UserId, userId));
        if (user == null)
        {
            return NotFound("User not found");
        }
        await _hubContext.Clients.Groups(serverId).SendAsync("ShiftStarted", new ShiftWithUserDto
        {
            Shift = new ShiftDto
            {
                Id = shift.Id.ToString(),
                ServerId = shift.ServerId,
                UserId = shift.UserId,
                Breaks = shift.Breaks,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                ShiftType = shift.ShiftType
            },
            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? "",
        });
        await _shiftService.StartShift(shift, server);
        return Ok(shift);
    }

    [HttpGet(Name = "ActiveShifts")]
    public async Task<IActionResult> ActiveShift(string serverId)
    {

        string userId = AuthHelper.UserId(User);
        Server? server = await _serverDatabase.GetByIdAsync(serverId);
        if (server == null)
        {
            return NotFound("Server not found");
        }
        Permission permission =  AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.ShiftAdmin) &&
            !permission.HasFlag(Permission.ShiftManage))
        {
            return Unauthorized("You don't have permission to retrieve the data..");
        }
        var filter = Builders<Shift>.Filter.And(
            Builders<Shift>.Filter.Eq(s => s.ServerId, serverId),
            Builders<Shift>.Filter.Eq(s => s.EndTime, null));
        
        IEnumerable<Shift> activeShifts = await _shiftsDatabase.FindManyAsync(filter);
        List<ShiftWithUserDto> users = new List<ShiftWithUserDto>();
        foreach (Shift shift in activeShifts)
        {
            OauthSession? author = await _userService.FindOneAsync(
                Builders<OauthSession>.Filter.Eq("UserId", shift.UserId));

            if (author == null) continue;

            users.Add(new ShiftWithUserDto
            {
                Shift = new ShiftDto
                {
                    Id = shift.Id.ToString(),
                    ServerId = shift.ServerId,
                    UserId = shift.UserId,
                    Breaks = shift.Breaks,
                    StartTime = shift.StartTime,
                    ShiftType = shift.ShiftType,
                    EndTime = shift.EndTime,
                },
                Username = author.Username,
                AvatarUrl = author.AvatarUrl ?? ""
            });
        }

        var result = users.OrderBy(x => x.Shift.StartTime).ToList();
        return Ok(result);
    }
    
    [HttpPost(Name = "StopBreak")]

    public async Task<IActionResult> StopBreak([FromBody] string serverId)
    {

        string userId = AuthHelper.UserId(User);
        Server? server = await _serverDatabase.GetByIdAsync(serverId);
        if (server == null)
        {
            return NotFound("Server not found");
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.ShiftAdmin) &&
            !permission.HasFlag(Permission.ShiftManage))
        {
            return Unauthorized("You don't have permission to perform this action.");
        }
        Shift? shift = await _shiftsDatabase.FindOneAsync(
            Builders<Shift>.Filter.And(
                Builders<Shift>.Filter.Eq(s => s.ServerId, serverId),
                Builders<Shift>.Filter.Eq(s => s.UserId, userId),
                Builders<Shift>.Filter.Eq(s => s.EndTime, null),
                Builders<Shift>.Filter.ElemMatch(s => s.Breaks, b => b.EndTime == null)
            )
        );
        if (shift == null)
        {
            return BadRequest("You don't have an active break.");
        }

        var activeBreak = shift.Breaks.FirstOrDefault(b => b.EndTime == null);
        if (activeBreak == null)
        {
            return BadRequest("No active break found.");
        }
        activeBreak.EndTime = DateTime.UtcNow;
        await _shiftsDatabase.UpdateAsync(shift.Id.ToString(), shift);
        OauthSession? user = await _userService.FindOneAsync(Builders<OauthSession>.Filter.Eq(s => s.UserId, userId));
        if (user == null)
        {
            return NotFound("User not found");
        }

        await _hubContext.Clients.Groups(serverId).SendAsync("ShiftBreakEnd", new ShiftWithUserDto
        {
            Shift = new ShiftDto
            {
                Id = shift.Id.ToString(),
                ServerId = shift.ServerId,
                UserId = shift.UserId,
                Breaks = shift.Breaks,
                StartTime = shift.StartTime,
                EndTime = shift.EndTime,
                ShiftType = shift.ShiftType
            },
            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? "",
        });
        await _shiftService.EndShiftBreak(shift, server);

        return Ok(shift);
    }
    

    [HttpPost(Name = "StartBreak")]
    public async Task<IActionResult> StartBreak([FromBody] string serverId)
    {

        string userId = AuthHelper.UserId(User);
        Server? server = await _serverDatabase.GetByIdAsync(serverId);
        if (server == null)
        {
            return NotFound("Server not found");
        }
        Permission permission =  AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.ShiftAdmin) &&
            !permission.HasFlag(Permission.ShiftManage))
        {
            return Unauthorized("You don't have permission to perform this action.");
        }
        Shift? shift = await _shiftsDatabase.FindOneAsync(
            Builders<Shift>.Filter.And(
                Builders<Shift>.Filter.Eq(s => s.ServerId, serverId),
                Builders<Shift>.Filter.Eq(s => s.UserId, userId),
                Builders<Shift>.Filter.Eq(s => s.EndTime, null)
            )
        );

        if (shift == null)
        {
            return BadRequest("You don't have an active shift.");
        }
        if (shift.Breaks.Any(b => b.EndTime == null))
        {
            return BadRequest("You have an active break.");
        }

        
        shift.Breaks.Add(new Break{StartTime = DateTime.UtcNow, EndTime = null});
        await _shiftsDatabase.UpdateAsync(shift.Id.ToString(), shift);
        OauthSession? user = await _userService.FindOneAsync(Builders<OauthSession>.Filter.Eq(s => s.UserId, userId));
        if (user == null)
        {
            return NotFound("User not found");
        }
        
        await _hubContext.Clients.Groups(serverId).SendAsync("ShiftBreakStart", new ShiftWithUserDto
        {
            Shift = new ShiftDto
            {
                Id = shift.Id.ToString(),
                ServerId = shift.ServerId,
                UserId = shift.UserId,
                Breaks = shift.Breaks,
                StartTime = shift.StartTime,
                ShiftType = shift.ShiftType,
                EndTime = shift.EndTime,
            },            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? "",
        });
        await _shiftService.StartShiftBreak(shift, server);
        return Ok(shift);
    }

    

    [HttpPost(Name = "End")]
    public async Task<IActionResult> End([FromBody] string serverId)
    {

        
        string userId = AuthHelper.UserId(User);
        Server? server = await _serverDatabase.GetByIdAsync(serverId);
        if (server == null)
        {
            return NotFound("Server not found");
        }
        Permission permission =  AuthHelper.GetPermissionAsync(server, serverId, User);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.ShiftAdmin) &&
            !permission.HasFlag(Permission.ShiftManage))
        {
            return Unauthorized("You don't have permission to perform this action.");
        }
        var filter = Builders<Shift>.Filter.And(
            Builders<Shift>.Filter.Eq(s => s.UserId, userId),
            Builders<Shift>.Filter.Eq(s => s.EndTime, null));
        
        Shift? activeShift = await _shiftsDatabase.FindOneAsync(filter);
        if (activeShift == null)
        {
            return BadRequest("You don't have an active shift.");
        }
        
        activeShift.EndTime = DateTime.UtcNow;
        await _shiftsDatabase.UpdateAsync(activeShift.Id.ToString(), activeShift);
        OauthSession? user = await _userService.FindOneAsync(Builders<OauthSession>.Filter.Eq(s => s.UserId, userId));
        if (user == null)
        {
            return NotFound("User not found");
        }
        await _hubContext.Clients.Groups(serverId).SendAsync("ShiftEnded", new ShiftWithUserDto
        {
            Shift = new ShiftDto
            {
                Id = activeShift.Id.ToString(),
                ServerId = activeShift.ServerId,
                UserId = activeShift.UserId,
                Breaks = activeShift.Breaks,
                ShiftType = activeShift.ShiftType,
                StartTime = activeShift.StartTime,
                EndTime = activeShift.EndTime,
            },
            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? "",
        });
        await _shiftService.EndShift(activeShift, server);
        return Ok(true);
    }
    
}
