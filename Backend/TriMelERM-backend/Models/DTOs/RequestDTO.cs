using TriMelERM_backend.Models.Core.Server;

namespace TriMelERM_backend.Models.DTOs;

public class RequestDTO
{
    public required Request Request { get; set; }
    public required ServerRequestDto Server { get; set; }
}

public class ServerRequestDto
{
    public required string Name { get; set; }
}