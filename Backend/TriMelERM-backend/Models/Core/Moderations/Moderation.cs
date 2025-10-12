using MongoDB.Bson;

namespace TriMelERM_backend.Models.Core.Moderations;

public class Moderation
{
    public required ObjectId Id { get; set; }
    public required string ServerId { get; set; }
    public required long UserId { get; set; }
    public required string Username { get; set; }
    public required string By { get; set; }
    public required string Action { get; set; }
    public required string Reason { get; set; }
    public required DateTime Occured { get; set; }
}