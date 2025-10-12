using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SignalRSwaggerGen.Attributes;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Moderations;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Core.Shifts;
using TriMelERM_backend.Services;

namespace TriMelERM_backend.Hub;

[SignalRHub("/Modpanel")]
public class Modpanel : Microsoft.AspNetCore.SignalR.Hub
{
    private readonly IHubContext<Modpanel> _hubContext;
    private readonly MongoRepository<Server> _serverService;

    public Modpanel(IHubContext<Modpanel> hubContext, MongoRepository<Server> serverService)
    {
        _hubContext = hubContext;
        _serverService = serverService;
    }
    public async Task JoinGroup(string serverId)
    {
        ClaimsPrincipal? user = Context.User;
        if (user == null)
            throw new HubException("Unauthorized");
        Server? server = await _serverService.GetByIdAsync(serverId);
        if (server == null)
        {
            throw new HubException("Server not found");
        }
        Permission permission =  AuthHelper.GetPermissionAsync(server, serverId, user);
        if (!permission.HasFlag(Permission.Administrator) &&
            !permission.HasFlag(Permission.Moderation) &&
            permission.HasFlag(Permission.ShiftManage) &&
            !permission.HasFlag(Permission.ShiftAdmin))
        {
            throw new HubException("You are not authorized to join this server group.");
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, serverId);
    }

    public async Task LeaveGroup(string serverId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, serverId);
    }

}