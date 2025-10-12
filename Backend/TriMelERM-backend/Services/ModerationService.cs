using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using NetCord;
using NetCord.Gateway;
using NetCord.Rest;
using TriMelERM_backend.Models.Core.Moderations;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.DTOs;

namespace TriMelERM_backend.Services;

public class ModerationService
{
    private readonly GatewayClient _client;
    private readonly HttpClient _httpClient;

    public ModerationService(GatewayClient client,  HttpClient httpClient)
    {
        _client = client;
        _httpClient = httpClient;
    }

    public async Task<RobloxSearchDto?> UserAutoComplete(string query)
    {
        HttpResponseMessage response = await _httpClient.GetAsync(
            $"https://apis.roblox.com/search-api/omni-search?verticalType=user&searchQuery={query}&pageToken=&globalSessionId=69&sessionId=IAmASausageRollSwimmingUnderTheSeaE)");
        
        response.EnsureSuccessStatusCode();

        string json = await response.Content.ReadAsStringAsync();
        JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        RobloxSearchDto? result = JsonSerializer.Deserialize<RobloxSearchDto>(json, options);
        return result;
    }
    
    public async Task<RobloxAvatarBatchDto?> GetAvatarsAsync(IEnumerable<long> userIds, string size = "420x420", bool isCircular = false)
    {
        var enumerable = userIds.ToList();
        if (!enumerable.Any())
            return null;

        var ids = string.Join(",", enumerable);
        var url = $"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={ids}&size={size}&format=Png&isCircular={isCircular}";
        HttpResponseMessage response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        string json = await response.Content.ReadAsStringAsync();

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var result = JsonSerializer.Deserialize<RobloxAvatarBatchDto>(json, options);
        return result;
    }
    
    public async Task<string?> GetUserAvatarAsync(long userId)
    {
        HttpResponseMessage response = await _httpClient.GetAsync(
            $"https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds={userId}&size=420x420&format=Png&isCircular=false");
    
        response.EnsureSuccessStatusCode();

        string json = await response.Content.ReadAsStringAsync();
        JsonSerializerOptions options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        RobloxImageDto? result = JsonSerializer.Deserialize<RobloxImageDto>(json, options);
        return result?.Data?.FirstOrDefault()?.ImageUrl;
    }

    public async Task<bool> Punish(Moderation moderation, Server server)
    {
        var discord = server.Config.Punishments.Discord;
        if (discord == null)
        {
            Console.WriteLine("Discord config is null");
            return false;
        }
        var guild = _client.Cache.Guilds
            .FirstOrDefault(u => u.Value.Id.ToString() == server.Config.Discord.ServerId).Value;
        if (guild == null)
        {
            return false;
        }
        if (!ulong.TryParse(moderation.By, out ulong authorId))
        {
            Console.WriteLine("Invalid moderator ID");
            return false;
        }
        GuildUser? author = null;
        try
        {
            author = guild.Users.FirstOrDefault(u => u.Value.Id == authorId).Value;
            if (author == null)
            {
                author = await _client.Rest.GetGuildUserAsync(guild.Id, authorId);
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return false;
        }
        
        PunishmentType? type = server.Config.Punishments.Types.FirstOrDefault(x => x.Name == moderation.Action);
        TextChannel? channel = null;
        if (type != null && string.IsNullOrEmpty(type.Discord.Channel) != true)
        {
            channel = guild.Channels
                .Select(c => c.Value)
                .FirstOrDefault(c => c.Id == ulong.Parse(type.Discord.Channel)) as TextChannel;
        }
        else
        {
            if (!ulong.TryParse(discord.Channel, out ulong channelId))
            {
                Console.WriteLine("Invalid channel ID");
                return false;
            } 
            channel = guild.Channels
                .FirstOrDefault(c => c.Value.Id == channelId)
                .Value as TextChannel;
        }
        if (channel == null)
        {
            Console.WriteLine("Channel not found");
            return false;
        }    
        var thumbnail = await GetUserAvatarAsync(moderation.UserId);

        var embed = new EmbedProperties()
            .WithThumbnail(thumbnail)
            .AddFields(
                new EmbedFieldProperties().WithName("Punishment").WithValue(
                    $"> **Moderator:** <@{author.Id}>\n> **User:** [{moderation.Username} ({moderation.UserId})](https://roblox.com/users/{moderation.UserId})\n> **Action:** {moderation.Action}\n> **Reason:** {moderation.Reason}")
            )
            .WithAuthor(new EmbedAuthorProperties().WithName($"{author.Username}")
                .WithIconUrl(author.GetAvatarUrl()?.ToString()))
            .WithFooter(new EmbedFooterProperties().WithIconUrl(guild.GetIconUrl()?.ToString())
                .WithText($"Moderation ID: {moderation.Id}"));

        var messageProps = new MessageProperties
        {
            Embeds = new[] { embed }
        };

        await channel.SendMessageAsync(messageProps);

        return true;
    }

}