using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TriMelERM_backend.Models.Core.Server;

public class Request
{
    public required ObjectId Id { get; set; }
    public required string UserId { get; set; }
    public required string ServerId { get; set; }
    public required string CodeUsed { get; set; }
    public required DateTime Created { get; set; }
    public required Status Status { get; set; }
}

public enum Status
{
    Pending,
    Denied,
    Accepted
}