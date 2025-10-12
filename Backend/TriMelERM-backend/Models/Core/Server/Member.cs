
namespace TriMelERM_backend.Models.Core.Server;

using System.Collections.Generic;

public class Member
{
    public string UserId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public List<string>? Roles { get; set; } = new();
}
