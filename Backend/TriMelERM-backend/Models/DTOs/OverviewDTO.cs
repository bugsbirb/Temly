namespace TriMelERM_backend.Models.DTOs;

public class OverviewDto
{
    public required string ServerName { get; set; }
    public List<string>? DefaultRoles { get; set;}
    
}