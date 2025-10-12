using TriMelERM_backend.Models.Core.Shifts;

namespace TriMelERM_backend.Models.DTOs;

public class ShiftWithUserDto
{
    public ShiftDto Shift { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string AvatarUrl { get; set; } = null!;
}
public class ShiftDto
{
    public string Id { get; set; } = "";
    public string ServerId { get; set; } = "";
    public string UserId { get; set; } = "";
    public required string ShiftType { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public List<Break> Breaks { get; set; } = new();
}
