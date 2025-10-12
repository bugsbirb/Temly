using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TriMelERM_backend.Models.Core.Server;


using System;
using System.Collections.Generic;

[Flags]
public enum Permission
{
    None = 0,
    ShiftManage = 1 << 0,
    ShiftAdmin = 1 << 1,
    Moderation = 1 << 2,
    EditModeration = 1 << 3,
    EditOwnModeration = 1 << 4,
    Dashboard = 1 << 5,
    Administrator = 1 << 6,
    ErlcManage = 1 << 7,
    ErlcView = 1 << 8,
}

public class Role
{
  
    public ObjectId Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public Permission Permissions { get; set; } = Permission.None;
    public List<string> Members { get; set; } = new();
    public int Position { get; set; }
}
