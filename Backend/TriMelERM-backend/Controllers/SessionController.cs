using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TriMelERM_backend.Services;

namespace TriMelERM_backend.Controllers;

[ApiController]        
[Route("auth/session")]
[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class SessionController : ControllerBase
{
    [HttpGet("@me")]
    
    public IActionResult Me()
    {
        if (User.Identity is { IsAuthenticated: false })
        {
            return Unauthorized(new { error = "unauthorized" });
        }

        Dictionary<string, string> claims = AuthHelper.Claim(User);
        return Ok(claims);
    }
}
