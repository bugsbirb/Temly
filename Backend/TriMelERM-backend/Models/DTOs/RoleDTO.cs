namespace TriMelERM_backend.Models.DTOs;

public class RoleDTO
{
    public string Name { get; set; } = default!;
    public int Permissions { get; set; } 
    public List<string> Members { get; set; } = new();
}