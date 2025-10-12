
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TriMelERM_backend.Models.Core.Server;

using System.Collections.Generic;

public class Server
{   [BsonId] 
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string OwnerId { get; set; } = default!;
    public Config Config { get; set; } = new Config();
    public List<string> Members { get; set; } = new();
    public required string ServerCode { get; set; }

    public List<Role> Roles { get; set; } = new();
    public void AddRole(Role role) => Roles.Add(role);

    public void AssignRole(Role role, Member member)
    {
        if (!member.Roles.Contains(role.Id.ToString()))
            member.Roles.Add(role.Id.ToString());

        if (!role.Members.Contains(member.UserId))
            role.Members.Add(member.UserId);
    }

    public void RemoveRole(Role role, Member member)
    {
        member.Roles.Remove(role.Id.ToString());
        role.Members.Remove(member.UserId);
    }
}