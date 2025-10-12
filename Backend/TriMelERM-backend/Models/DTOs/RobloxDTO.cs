namespace TriMelERM_backend.Models.DTOs;

public class RobloxSearchDto
{
    public List<SearchResults>? SearchResults { get; set; }
}

public class SearchResults
{
    public string? ContentGroupType { get; set; }
    public List<Contents>? Contents { get; set; }
    public string? TopicId { get; set; }
}

public class Contents
{
    public required string Username { get; set; }
    public required string DisplayName { get; set; }
    public List<string>? PreviousUsernames { get; set; }
    public required bool HasVerifiedBadge { get; set; }
    public required string ContentType { get; set; }
    public required long ContentId { get; set; }
}


public class RobloxImageDto
{
    public List<RobloxImageData> Data { get; set; } = new();
}

public class RobloxImageData
{
    public string ImageUrl { get; set; } = string.Empty;
}


public class RobloxAvatarBatchDto
{
    public List<AvatarThumbnailData>? Data { get; set; }
}

public class AvatarThumbnailData
{
    public long TargetId { get; set; }
    public string? State { get; set; }
    public string? ImageUrl { get; set; }
}
