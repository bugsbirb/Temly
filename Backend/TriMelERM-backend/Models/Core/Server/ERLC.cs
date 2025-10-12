using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TriMelERM_backend.Models.Core.Server;

public class KErlc
{
    [BsonId] 
    [BsonRepresentation(BsonType.ObjectId)]
    public required ObjectId Id { get; set; } = default!;
    public required string ServerId { get; set; }
    
    [BsonElement("Key")]
    public string? Key { get; set; }
}

public class ErlcServer
{
    public required string Name { get; set; }
    public required long OwnerId { get; set; }
    public List<long>? CoOwnerIds { get; set; }
    public int CurrentPlayers { get; set; }
    public int MaxPlayers { get; set; }
    public required string JoinKey { get; set; }
    public required string AccVerifiedReq { get; set; }
    public bool TeamBalance { get; set; }
}


public class CommandLog
{
    public required string Player { get; set; }
    public required long Timestamp { get; set; }
    public required string Command { get; set; }
}

public class PlayerInfo
{
    public required string Player { get; set; }
    public required string Permission { get; set; } 
    public string? Callsign { get; set; }
    public string? Avatar { get; set; } = null;
    public bool? InServer { get; set; } = null;
    public required string Team { get; set; } 
}



public class KillLog
{
    public required string Killed { get; set; }
    public required long Timestamp { get; set; }
    public required string Killer { get; set; }
}


public class PlayerJoinLog
{
    public required bool Join { get; set; }
    public required long Timestamp { get; set; }
    public required string Player { get; set; }
}

public class JoinLogs
{
    public List<PlayerJoinLog>? Logs { get; set; }
}


