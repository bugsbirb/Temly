namespace TriMelERM_backend.Models.Core.Discord;

using System.Collections.Generic;

public class OauthServer
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Icon { get; set; }
    public string? Banner { get; set; }
    public bool Owner { get; set; }
    public string? Permissions { get; set; }
    public List<string>? Features { get; set; }
    public int? ApproximateMemberCount { get; set; }
    public int? ApproximatePresenceCount { get; set; }
}