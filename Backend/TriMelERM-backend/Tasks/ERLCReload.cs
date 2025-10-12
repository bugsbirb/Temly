using Microsoft.AspNetCore.SignalR;
using TriMelERM_backend.Hub;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Services;

namespace TriMelERM_backend.Tasks;

public class ErlcReload: BackgroundService
{
    private readonly IHubContext<Modpanel>  _hubContext;
    private readonly MongoRepository<Server> _serverService;
    private readonly Redis _redis;

    public ErlcReload(IHubContext<Modpanel> hubContext,  MongoRepository<Server> serverService, Redis rediscli)
    {
        _hubContext = hubContext;
        _serverService = serverService;
        _redis = rediscli;
    }
    
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        
        return Task.CompletedTask;
        
    }
}