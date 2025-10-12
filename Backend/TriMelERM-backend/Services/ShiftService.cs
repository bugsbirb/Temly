using NetCord;
using NetCord.Gateway;
using NetCord.Rest;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Core.Shifts;
namespace TriMelERM_backend.Services;

public class ShiftService
{
    private readonly GatewayClient _client;

    public ShiftService(GatewayClient client)
    {
        _client = client;
    }

    public async Task<bool> StartShift(Shift shift, Server server)
    {
        var (guild, user, type, channel) = await DiscordInfo(server, shift);
        if (guild == null || user == null || type == null || channel == null) return false;

        await Discord.AddRoleIfMissingAsync(user, guild, type.Discord.ShiftRole);

        var embed = new EmbedProperties()
            .WithColor(new Color(87, 242, 135))
            .WithAuthor(new EmbedAuthorProperties().WithName(user.Username).WithIconUrl(user.GetAvatarUrl()?.ToString()))
            .AddFields(new EmbedFieldProperties()
                .WithName("Shift Started")
                .WithValue($"> **Staff Member:** <@{user.Id}>\n> **Shift Started:** <t:{new DateTimeOffset(shift.StartTime).ToUnixTimeSeconds()}:R>"))
            .WithFooter(new EmbedFooterProperties().WithText($"Type: {shift.ShiftType}"));

        await channel.SendMessageAsync(new MessageProperties { Embeds = new[] { embed } });
        return true;
    }

    public async Task<bool> EndShift(Shift shift, Server server)
    {
        var (guild, user, type, channel) = await DiscordInfo(server, shift);
        if (guild == null || user == null || type == null || channel == null) return false;

        await Discord.RemoveRoleIfPresentAsync(user, guild, type.Discord.BreakRole);
        await Discord.RemoveRoleIfPresentAsync(user, guild, type.Discord.ShiftRole);

        var (totalTime, totalBreakTime) = ShiftTimes(shift);
        string sTotalTime = StringHelper.TimeStretcher(totalTime);
        string sTotalBTime = StringHelper.TimeStretcher(totalBreakTime);

        var embed = new EmbedProperties()
            .WithColor(new Color(218, 134, 122))
            .WithAuthor(new EmbedAuthorProperties().WithName(user.Username).WithIconUrl(user.GetAvatarUrl()?.ToString()))
            .AddFields(new EmbedFieldProperties()
                .WithName("Shift Ended")
                .WithValue($"> **Staff Member:** <@{user.Id}>\n> **Total Time:** {sTotalTime}\n> **Total Break Time:** {sTotalBTime}"))
            .WithFooter(new EmbedFooterProperties().WithText($"Type: {shift.ShiftType}"));

        await channel.SendMessageAsync(new MessageProperties { Embeds = new[] { embed } });
        return true;
    }

    public async Task<bool> StartShiftBreak(Shift shift, Server server)
    {
        var (guild, user, type, channel) = await DiscordInfo(server, shift);
        if (guild == null || user == null || type == null || channel == null) return false;

        await Discord.AddRoleIfMissingAsync(user, guild, type.Discord.BreakRole);
        await Discord.RemoveRoleIfPresentAsync(user, guild, type.Discord.ShiftRole);

        var embed = new EmbedProperties()
            .WithColor(new Color(255, 191, 0))
            .WithAuthor(new EmbedAuthorProperties().WithName(user.Username).WithIconUrl(user.GetAvatarUrl()?.ToString()))
            .AddFields(new EmbedFieldProperties()
                .WithName("Shift Break Started")
                .WithValue($"> **Staff Member:** <@{user.Id}>\n> **Break Started:** <t:{new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds()}:R>"))
            .WithFooter(new EmbedFooterProperties().WithText($"Type: {shift.ShiftType}"));

        await channel.SendMessageAsync(new MessageProperties { Embeds = new[] { embed } });
        return true;
    }

    public async Task<bool> EndShiftBreak(Shift shift, Server server)
    {
        var (guild, user, type, channel) = await DiscordInfo(server, shift);
        if (guild == null || user == null || type == null || channel == null) return false;

        await Discord.RemoveRoleIfPresentAsync(user, guild, type.Discord.BreakRole);
        await Discord.AddRoleIfMissingAsync(user, guild, type.Discord.ShiftRole);

        var (totalTime, totalBreakTime) = ShiftTimes(shift);
        string sTotalTime = StringHelper.TimeStretcher(totalTime);
        string sTotalBTime = StringHelper.TimeStretcher(totalBreakTime);

        var embed = new EmbedProperties()
            .WithColor(new Color(218, 134, 122))
            .WithAuthor(new EmbedAuthorProperties().WithName(user.Username).WithIconUrl(user.GetAvatarUrl()?.ToString()))
            .AddFields(new EmbedFieldProperties()
                .WithName("Shift Break Ended")
                .WithValue($"> **Staff Member:** <@{user.Id}>\n> **Total Time:** {sTotalTime}\n> **Total Break Time:** {sTotalBTime}"))
            .WithFooter(new EmbedFooterProperties().WithText($"Type: {shift.ShiftType}"));

        await channel.SendMessageAsync(new MessageProperties { Embeds = new[] { embed } });
        return true;
    }

    private async Task<(Guild?, GuildUser?, ShiftType?, TextChannel?)> DiscordInfo(Server server, Shift shift)
    {
        var discord = server.Config.Shifts.Discord;
        if (discord == null)
        {
            Console.WriteLine("Discord config is null");
            return (null, null, null, null);
        }

        var guild = _client.Cache.Guilds
            .FirstOrDefault(g => g.Value.Id.ToString() == server.Config.Discord.ServerId).Value;
        if (guild == null)
        {
            Console.WriteLine("Guild not found");
            return (null, null, null, null);
        }

        ulong userId = ulong.Parse(shift.UserId);
        GuildUser? user = guild.Users.FirstOrDefault(u => u.Value.Id == userId).Value;

        if (user == null)
        {
            try
            {
                user = await _client.Rest.GetGuildUserAsync(guild.Id, userId);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return (guild, null, null, null);
            }
        }

        var type = server.Config.Shifts.Types.FirstOrDefault(x => x.Name == shift.ShiftType);
        if (type == null)
        {
            Console.WriteLine("Shift type not found");
            return (guild, user, null, null);
        }

        TextChannel? channel = null;
        if (!string.IsNullOrWhiteSpace(type.Discord.Channel))
        {
            channel = guild.Channels
                .Select(c => c.Value)
                .FirstOrDefault(c => c.Id == ulong.Parse(type.Discord.Channel)) as TextChannel;
        }

        if (channel == null)
        {
            Console.WriteLine("Channel not found");
            return (guild, user, type, null);
        }

        return (guild, user, type, channel);
    }



    private (TimeSpan totalTime, TimeSpan totalBreakTime) ShiftTimes(Shift shift)
    {
        DateTime start = shift.StartTime;
        DateTime end = shift.EndTime ?? DateTime.UtcNow;

        TimeSpan totalTime = end - start;
        TimeSpan totalBreakTime = TimeSpan.Zero;

        if (shift.Breaks.Any())
        {
            foreach (var b in shift.Breaks)
            {
                DateTime breakEnd = b.EndTime ?? DateTime.UtcNow;
                totalTime -= breakEnd - b.StartTime;
                totalBreakTime += breakEnd - b.StartTime;
            }
        }

        return (totalTime, totalBreakTime);
    }
}
