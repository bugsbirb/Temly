using Microsoft.AspNetCore.Authorization;
using MongoDB.Bson;
using MongoDB.Driver;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Discord;
using TriMelERM_backend.Services;

namespace TriMelERM_backend.Controllers;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using DotNetEnv;
public class AccountController : Controller
{
    private readonly MongoRepository<OauthSession> _service;

    private readonly string _appUrl;


    public AccountController(MongoRepository<OauthSession> service, IHttpContextAccessor httpContextAccessor)
    {
        Env.Load();
        _service = service;
        var request = httpContextAccessor.HttpContext?.Request;
        _appUrl = $"{request?.Scheme}://{request?.Host}{request?.PathBase}/auth/redirect";
    }
    
    [HttpGet("/login")]
    public IActionResult Login(string? returnUrl = null)
    {
        returnUrl ??= _appUrl;
        Console.Write(returnUrl);
        AuthenticationProperties properties = new AuthenticationProperties { RedirectUri = returnUrl};
        return Challenge(properties, "Discord");
    }
    [HttpGet("/signout")]
    public IActionResult SignOutUser()
    {
        string callbackUrl = Url.Action("Index", "Home");
        return SignOut(new AuthenticationProperties { RedirectUri = callbackUrl }, CookieAuthenticationDefaults.AuthenticationScheme);
    }
    [HttpGet("/auth/redirect")]
    public async Task<IActionResult> AuthRedirect()
    {
        Dictionary<string, string> claims = AuthHelper.Claim(User);
        var filter = Builders<OauthSession>.Filter.Eq(x => x.UserId, claims["nameidentifier"]);
        var update = Builders<OauthSession>.Update
            .Set(x => x.LastUsedAt, DateTime.UtcNow)
            .SetOnInsert(x => x.UserId, claims["nameidentifier"])
            .SetOnInsert(x => x.Username, claims["name"])
            .SetOnInsert(x => x.AvatarUrl, claims["url"])
            .SetOnInsert(x => x.CreatedAt, DateTime.UtcNow)
            .SetOnInsert(x => x.ExpiresAt, DateTime.UtcNow.AddDays(7)); 

        await _service.UpsertAsync(
            filter,
            update,
            new UpdateOptions { IsUpsert = true }
        );
        string? accessToken = await HttpContext.GetTokenAsync("access_token");
        var frontend = Env.GetString("FrontendURL") ?? "https://temly-backend.4qoyov.easypanel.host";
        return Redirect($"{frontend.TrimEnd('/')}/api/auth?token={Uri.EscapeDataString(accessToken)}");

    }




}
