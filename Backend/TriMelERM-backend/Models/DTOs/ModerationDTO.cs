namespace TriMelERM_backend.Models.DTOs;

public class ModerationDto
{
    public required string ServerId { get; set; }
    public required long UserId { get; set; }
    public required string Username { get; set; }
    public required string Reason { get; set; }
    public required string Action { get; set; }
}


public class ModerationEditDto
{
    public required string Username { get; set; }
    public required string Reason { get; set; }
    public required string Action { get; set; }
}