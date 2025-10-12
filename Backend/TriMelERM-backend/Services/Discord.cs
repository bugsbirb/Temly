using NetCord;
using NetCord.Gateway;

namespace TriMelERM_backend.Services;

public class Discord
{
    public static async Task AddRoleIfMissingAsync(GuildUser user, Guild guild, string? roleId)
    {
        Console.Write(roleId);
        if (string.IsNullOrWhiteSpace(roleId)) return;
        if (!guild.Roles.TryGetValue(ulong.Parse(roleId), out var role)) return;

        var roles = user.GetRoles(guild);
        bool hasRole = roles.Any(r => r.Id == role.Id);
        if (hasRole) return;
        try
        {
            await user.AddRoleAsync(role.Id);
        }
        catch (Exception e)
        {
            Console.WriteLine($"error adding role: {e}");
        }
    }

    public static async Task RemoveRoleIfPresentAsync(GuildUser user, Guild guild, string? roleId)
    {
        if (string.IsNullOrWhiteSpace(roleId)) return;
        if (!guild.Roles.TryGetValue(ulong.Parse(roleId), out var role)) return;

        var roles = user.GetRoles(guild);
        bool hasRole = roles.Any(r => r.Id == role.Id);
        if (!hasRole) return;
        try
        {
            await user.RemoveRoleAsync(role.Id);
        }
        catch (Exception e)
        {
            Console.WriteLine($"error removing role {e}");
        }
    }
}