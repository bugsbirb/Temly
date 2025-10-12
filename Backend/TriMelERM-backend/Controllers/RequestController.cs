using Microsoft.AspNetCore.Mvc;
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
public class RequestController: Controller
{
    
    private readonly GatewayClient _client;
    private readonly MongoRepository<Server> _serverService;
    private readonly MongoRepository<OauthSession> _userService;
    private readonly MongoRepository<Request> _requestService;
    private readonly Redis _redis;

    public RequestController(GatewayClient client, MongoRepository<Server> serverService, MongoRepository<OauthSession> userService, Redis redis, MongoRepository<Request> requestService)
    {
        _client = client;
        _serverService = serverService;
        _userService = userService;
        _redis = redis;
        _requestService = requestService;
    }

    
    [HttpPost("{code}")]
    public async Task<IActionResult> JoinServer(string code)
    {   string? userId = AuthHelper.UserId(User);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        Server? server = await _serverService!.FindOneAsync(Builders<Server>.Filter.Eq("ServerCode", code));
        if (server is null)
            return NotFound();
        

        if (server.Members.Contains(userId))
        {
            return BadRequest("You are already in the server.");
        }
        
        var filter = Builders<Request>.Filter.And(
            Builders<Request>.Filter.Eq(r => r.UserId, userId),
            Builders<Request>.Filter.Eq(r => r.ServerId, server.Id.ToString())
        );

        Request? check = await _requestService.FindOneAsync(filter);
        if (check != null)
        {
            return BadRequest("You already have a pending request for this server.");
            
        }
        Request request = new Request
        {
            Id = ObjectId.GenerateNewId(),
            UserId = userId,
            ServerId = server.Id.ToString(),
            Created =  DateTime.UtcNow,
            CodeUsed = code,
            Status = Status.Pending

        };
        await _requestService.CreateAsync(request);
        return Ok(request);
    }

    [HttpDelete("{id}/{requestId}/deny")]
    public async Task<IActionResult> DenyRequest(string id, string requestId)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator))
            return Forbid();
        Request? request = await _requestService.GetByIdAsync(requestId);
        if (request is null)
            return NotFound();
        request.Status =  Status.Denied;
        await _requestService.UpdateAsync(request.Id.ToString(), request);
        // TODO: Sometime of audit log thing (discord etc)
        return Ok("Delete");
    }
    
    
    [HttpPut("{id}/{requestId}/accept")]
    public async Task<IActionResult> AcceptRequest(string id, string requestId)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator))
            return Forbid();
        List<string>? defaultRoles = server.Config.DefaultRoles;
        

        Request? request = _requestService.GetByIdAsync(requestId).Result;
        if (request is null)
            return NotFound("Request not found.");
        if (request.Status.HasFlag(Status.Denied) || request.Status.HasFlag(Status.Accepted))
        {
            return BadRequest("Already been accepted or denied.");

        }
        await _requestService.DeleteAsync(request.Id.ToString());
        string userId = request.UserId;
        OauthSession? userSession = await _userService.FindOneAsync(
            Builders<OauthSession>.Filter.Eq(x => x.UserId, request.UserId)
        );
        if (userSession is null)
        {
            return NotFound("User not found");
        }
        server.Members.Add(userId);
        if (defaultRoles != null)
        {
            foreach (var role in server.Roles.Where(r => defaultRoles.Contains(r.Id.ToString())))
            {
                if (!role.Members.Contains(userId))
                {
                    role.Members.Add(userId);
                }
            }
        }
        request.Status = Status.Accepted;
        await _serverService.UpdateAsync(server.Id.ToString(), server);
        await _requestService.UpdateAsync(request.Id.ToString(), request);
        return Ok();
    }


    [HttpGet("@me")]
    public async Task<IActionResult> GetMe()
    {
        string? userId = AuthHelper.UserId(User);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        List<RequestDTO>? cached = await _redis.GetObject<List<RequestDTO>>($"{userId}:Requests");
        if (cached != null)
        {
            return Ok(cached);
        }
        IEnumerable<Request> requests = await _requestService.FindManyAsync(Builders<Request>.Filter.Eq("UserId", userId));
        
        var result = new List<Object>();
        foreach (Request request in requests)
        {
            Server? server = await _serverService!.GetByIdAsync(request.ServerId);
            if (server is null)
                continue;

            result.Add(new RequestDTO { Request = request, Server = new ServerRequestDto { Name = server.Name } });
        }
        await _redis.SaveObject($"{userId}:Requests", result);
        return Ok(result);
    }

    
    [HttpGet("{id}/all")]
    public async Task<IActionResult> Get(string id)
    {
        Server? server = await _serverService.GetByIdAsync(id);
        if (server == null)
        {
            return NotFound();
        }
        Permission permission = AuthHelper.GetPermissionAsync(server, id, User);
        if (!permission.HasFlag(Permission.Administrator))
            return Forbid();
        
        IEnumerable<Request> requests = await _requestService.FindManyAsync(Builders<Request>.Filter.Eq("ServerId", id));
        List<MemberDto2>? members = new List<MemberDto2>();
        var result = requests.Select(request =>
        {
            var userSession =  _userService.FindOneAsync(Builders<OauthSession>.Filter.Eq("UserId", request.UserId)).Result;            
            return new
            {
                Request = new
                {
                    Id = request.Id.ToString(),
                    ServerId = request.ServerId,
                    UserId = userSession!.UserId,
                    CodeUsed = request.CodeUsed,
                    Created = request.Created,
                    Status = request.Status
                },
                Member = new
                {
                    UserId = userSession!.UserId,
                    Name = userSession!.Username,
                    Avatar = userSession!.AvatarUrl,
                    
                }
            
            };
        });
        
        
        return Ok(result);

        
    }
}