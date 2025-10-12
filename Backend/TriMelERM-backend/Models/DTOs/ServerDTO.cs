using System.Collections.Generic;
using TriMelERM_backend.Models.Core.Server;

namespace TriMelERM_backend.Models.DTOs;

public class MutualDto {
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string OwnerId { get; set; }
    public string? Permissions { get; set; }
    public int PermissionsValue { get; set; }
    public bool IsDashboardUser { get; set; }
    public bool IsModpanelUser { get; set; }
    public GuildDto? Guild { get; set; }
}

public class ServerDto {
    public bool IsDashboardUser { get; set; }
    public bool IsModpanelUser { get; set; }
    public Config? Config { get; set; } 
    public required string ServerCode { get; set; }
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string OwnerId { get; set; }
    public required List<MemberDto2> Members { get; set; }
    public required List<RoleDto2> Roles { get; set; }
    public GuildDto? Guild { get; set; }
}

public class MemberDto2 {
    public required string UserId { get; set; }
    public required string Name { get; set; }
    public string? Avatar { get; set; }
    public List<string>? Roles { get; set; }
}

public class RoleDto2 {
    public string? Id { get; set; }
    public string? Name { get; set; }
    public int Permissions { get; set; }
    public List<string>? Members { get; set; }
    public int Position { get; set; }
}

public class ChannelDto {
    public string? ChannelId { get; set; }
    public string? ChannelName { get; set; }
}

public class GuildRoleDto {
    public string? RoleId { get; set; }
    public string? RoleName { get; set; }
}

public class GuildAuthorDto {
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public List<GuildRoleDto>? Roles { get; set; }
}

public class GuildDto {
    public string? ServerName { get; set; }
    public string? ServerId { get; set; }
    public string? ServerIcon { get; set; }
    public List<ChannelDto>? Channels { get; set; }
    public List<GuildRoleDto>? Roles { get; set; }
    public GuildAuthorDto? Author { get; set; }
}
