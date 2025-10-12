using System.Security.Claims;
using DotNetEnv;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.DTOs;

namespace TriMelERM_backend.Services;

using System.Globalization;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Newtonsoft.Json.Linq;

public static class AuthHelper
{

    public static Dictionary<string, string> Claim(ClaimsPrincipal user)
    {
        if (user == null) throw new ArgumentNullException(nameof(user));

        return user.Claims.ToDictionary(
            c => c.Type.Contains("schemas.xmlsoap.org") ? c.Type.Split('/').Last()
                : c.Type.StartsWith("urn:discord:") ? c.Type.Split(':').Last()
                : c.Type,
            c => c.Value
        );
    }

    public static string UserId(ClaimsPrincipal user)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? user.FindFirst("sub")?.Value;
        if (userId == null)
            throw new UnauthorizedAccessException("User ID claim is missing.");
        return userId;
    }
    public static Permission GetPermissionAsync(
        Server server, string serverId, ClaimsPrincipal user)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? user.FindFirst("sub")?.Value;
        if (userId == null)
            throw new UnauthorizedAccessException("User ID claim is missing.");

        List<Role> memberRoles = server.Roles
            .Where(role => role.Members.Contains(userId))
            .ToList();

        Permission permissions = memberRoles
            .Select(r => r.Permissions)
            .Aggregate(Permission.None, (acc, perm) => acc | perm);

        if (server.OwnerId == userId)
        {
            return Permission.Administrator;
        }

        return permissions;
    }
    
    public static bool ContainsAny(this Permission @this, Permission flags)
    {
        return (@this & flags) != 0;
    }

    public static bool ContainsAll(this Permission @this, Permission flags)
    {
        return (@this & flags) == flags;
    }
    public static async Task<string> GetToken(HttpContext context)
    {
        var authenticateResult = await context.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!authenticateResult.Succeeded || authenticateResult.Principal == null)
            return null;

        string? accessToken = await context.GetTokenAsync("access_token");
        string?  refreshToken = await context.GetTokenAsync("refresh_token");
        string?  expiresAtString = await context.GetTokenAsync("expires_at");

        if (!DateTime.TryParse(expiresAtString, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var expiresAt))
            expiresAt = DateTime.MinValue;

        if (DateTime.UtcNow < expiresAt.AddSeconds(-30)) 
            return accessToken;

        var client = new HttpClient();
        var parameters = new Dictionary<string, string>
        {
            { "client_id", Env.GetString("AuthClientId") },
            { "client_secret", Env.GetString("AuthClientSecret") },
            { "grant_type", "refresh_token" },
            { "refresh_token", refreshToken }
        };

        var response = await client.PostAsync("https://discord.com/api/oauth2/token", new FormUrlEncodedContent(parameters));
        if (!response.IsSuccessStatusCode)
            return null; 

        var payload = JObject.Parse(await response.Content.ReadAsStringAsync());
        var newAccessToken = payload["access_token"].ToString();
        var newRefreshToken = payload["refresh_token"].ToString();
        var expiresIn = int.Parse(payload["expires_in"].ToString());

        authenticateResult.Properties.UpdateTokenValue("access_token", newAccessToken);
        authenticateResult.Properties.UpdateTokenValue("refresh_token", newRefreshToken);
        authenticateResult.Properties.UpdateTokenValue("expires_at", DateTime.UtcNow.AddSeconds(expiresIn).ToString("o"));

        await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, authenticateResult.Principal, authenticateResult.Properties);

        return newAccessToken;
    }
}