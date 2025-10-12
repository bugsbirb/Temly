using System.Globalization;
using System.Net;
using System.Threading.RateLimiting;
using AspNet.Security.OAuth.Discord;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using NetCord.Gateway;
using NetCord.Hosting.Gateway;
using NetCord.Hosting.Services;
using TriMelERM_backend.Hub;
using TriMelERM_backend.Models;
using TriMelERM_backend.Models.Core.Moderations;
using TriMelERM_backend.Models.Core.Server;
using TriMelERM_backend.Models.Core.Shifts;
using TriMelERM_backend.Models.Discord;
using TriMelERM_backend.Services;
using Server = TriMelERM_backend.Models.Core.Server.Server;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

// -- Discord Bot --
builder.Services
    .AddDiscordGateway(options =>
    {
        options.Token = Env.GetString("BotToken");
        options.Intents =
            GatewayIntents.Guilds |
            GatewayIntents.GuildMessages |
            GatewayIntents.GuildUsers |
            GatewayIntents.MessageContent;

    });


// - Give me Head --
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});


// -- Database --

builder.Services.Configure<DatabaseSettings>(options =>
{
    options.DatabaseName = Env.GetString("DatabaseName");
    
});
builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(Env.GetString("MongoURI")));

builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var dbName = Env.GetString("DatabaseName");
    return client.GetDatabase(dbName);
});

builder.Services.AddSingleton<MongoRepository<Server>>(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return new MongoRepository<Server>(db, "Servers");
});

builder.Services.AddSingleton<MongoRepository<OauthSession>>(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return new MongoRepository<OauthSession>(db, "Users");
});

builder.Services.AddSingleton<MongoRepository<Request>>(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return new MongoRepository<Request>(db, "Requests");
});

builder.Services.AddSingleton<MongoRepository<Moderation>>(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return new MongoRepository<Moderation>(db, "Moderations");
});

builder.Services.AddSingleton<MongoRepository<Shift>>(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return new MongoRepository<Shift>(db, "Shifts");
});
builder.Services.AddSingleton<MongoRepository<KErlc>>(sp =>
{
    var db = sp.GetRequiredService<IMongoDatabase>();
    return new MongoRepository<KErlc>(db, "Keys");
});


// - websocket
builder.Services.AddSignalR();

// - normal singletons :-------------------------------------)

builder.Services.AddSingleton<ShiftService>();
builder.Services.AddSingleton<ModerationService>();
builder.Services.AddHttpClient<ModerationService>();
builder.Services.AddSingleton<ErlcService>();
builder.Services.AddHttpClient<ErlcService>();
builder.Services.AddSingleton<Modpanel>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<Redis>(sp =>
{
    var redisUrl = Env.GetString("RedisURL");
    return new Redis(redisUrl);
});


// -- Ratelimiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(policyName: "ServerCreation", configureOptions: limiterOptions =>
    {
        limiterOptions.PermitLimit = 1;
        limiterOptions.Window = TimeSpan.FromMinutes(3);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(policyName: "ERLCCheck", configureOptions: limiterOptions =>
    {
        limiterOptions.PermitLimit = 2;
        limiterOptions.Window = TimeSpan.FromSeconds(2);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Configuration.AddUserSecrets<Program>();

// --- AUTH --- :_)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = "Discord";
})
.AddCookie(options =>
{
    options.Cookie.Name = "DiscordAuth";
    options.Cookie.Domain = builder.Environment.IsDevelopment() ? null : ".bugze.me";
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.Path = "/"; 

    options.LoginPath = "/login";
    options.LogoutPath = "/logout";
    options.ExpireTimeSpan = TimeSpan.FromDays(7);

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync("{\"error\":\"unauthorized\"}");
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync("{\"error\":\"forbidden\"}");
    };
})
.AddDiscord(options =>
{
    options.ClientId = Env.GetString("AuthClientId");
    options.ClientSecret = Env.GetString("AuthClientSecret");
    options.CallbackPath = "/login/complete";

    options.SaveTokens = true;

    options.CorrelationCookie.SameSite = SameSiteMode.None;
    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;

    options.ClaimActions.MapCustomJson("urn:discord:avatar:url", user =>
        string.Format(
            CultureInfo.InvariantCulture,
            "https://cdn.discordapp.com/avatars/{0}/{1}.{2}",
            user.GetString("id"),
            user.GetString("avatar"),
            user.GetString("avatar")!.StartsWith("a_") ? "gif" : "png"));

    options.Scope.Add("identify");
    options.Scope.Add("guilds");
});

// -- Key Mount
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo("/app/DataProtection-Keys"));

// --- CORS ---
string myAllowSpecificOrigins = "_myAllowSpecificOrigins";
string frontend = Env.GetString("FrontendURL");
builder.Services.AddCors(options =>
{
    options.AddPolicy(myAllowSpecificOrigins, policy =>
    {
        policy.WithOrigins(frontend ?? "https://main-temly-frontend.4qoyov.easypanel.host")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// --- sentry ---
builder.WebHost.UseSentry(options =>
{
    options.Dsn = Env.GetString("SentryDSN");
    options.Debug = builder.Environment.IsDevelopment();
    options.TracesSampleRate = 1.0;
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Backend"});
    options.AddSignalRSwaggerGen();
});
builder.Services.AddControllers().AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.Converters.Add(new ObjectIdJsonConverter());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.Use((context, next) =>
    {
        context.Request.Scheme = "https";
        return next();
    });

}
// --- Middleware ---

app.UseForwardedHeaders();
app.UseHttpsRedirection();
app.UseCors(myAllowSpecificOrigins);
app.UseAuthentication();
app.UseAuthorization();

app.AddModules(typeof(Program).Assembly);
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapHub<Modpanel>("/hub");

app.Run();