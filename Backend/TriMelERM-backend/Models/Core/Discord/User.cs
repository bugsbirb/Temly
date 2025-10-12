namespace TriMelERM_backend.Models.Discord;

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class OauthSession
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    [BsonRequired]
    public required string UserId { get; set; }     

    [BsonRequired]
    public required string Username { get; set; }

    public string? Discriminator { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Hash { get; set; }

    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUsedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}