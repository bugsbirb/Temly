using MongoDB.Bson;

namespace TriMelERM_backend.Models.Core.Shifts;

public class Shift
{
    public required ObjectId Id { get; set; }
    public required string ServerId { get; set; }
    public required string UserId { get; set; }
    
    public required DateTime StartTime { get; set; }
    public required string ShiftType { get; set; }
    public DateTime? EndTime { get; set; }
    public List<Break> Breaks { get; set; } = new List<Break>();
}

public class Break
{
    public required DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}