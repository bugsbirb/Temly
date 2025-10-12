namespace TriMelERM_backend.Models.Core.Server;

using System.Collections.Generic;

public class Config
{
    public List<Features> Features { get; set; } = new();
    public List<string>? DefaultRoles { get; set; } = new();
    public Shifts Shifts { get; set; } = new();
    public ERLC ERLC { get; set; } = new();
    public Punishments Punishments { get; set; } = new();
    public DiscordConfig Discord { get; set; } = new();
}

public class DiscordConfig
{
    public string ServerId { get; set; } = default!;
}
public class ERLC
{
    public bool? Enabled { get; set; }
}
public class Shifts
{
    public List<ShiftType> Types { get; set; } = new();
    public PunishmentsDiscord? Discord { get; set; } = new();
}
public class ShiftType
{
    public string Name { get; set; } = default!;
    public List<string> AllowedRoles { get; set; } = new();
    public ShiftTypeDiscord Discord { get; set; } = new();
}

public class ShiftTypeDiscord
{
    public string ShiftRole { get; set; } = default!;
    public string BreakRole { get; set; } = default!;
    public string Channel { get; set; } = default!;
    public string PrefixNickname { get; set; } = default!;
}

public class Punishments
{
    public List<PunishmentType> Types { get; set; } = new();
    public PunishmentsDiscord? Discord { get; set; }
}

public class PunishmentsDiscord
{
    public string Channel { get; set; } = default!;
    
}

public class PunishmentType
{
    public string Name { get; set; } = default!;
    public List<string> AllowedRoles { get; set; } = new();
    public PunishmentTypeDiscord Discord { get; set; } = new();
}

public class PunishmentTypeDiscord
{
    public string Channel { get; set; } = default!;
}

public enum Features
{
    Shifts,
    Punishments
}