namespace TriMelERM_backend.Models.DTOs;

public class CreateServerDto
{
    public string Name { get; set; } = default!;
    public string? ApiKey { get; set; }
    public string? DiscordServer{ get; set; }
}