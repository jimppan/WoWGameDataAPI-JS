const fs = require('fs');
const path = require('path');
const Settings = require('../settings');
const DungeonEncounters = require('./dungeonencounter');

var g_EncounterMap = new Map();
var g_RaidMap      = new Map();

const EncounterMechanicTargetType = 
{
    SINGLE: "single",
    AOE:    "aoe",
    FRONT:  "front",
    BACK:   "back"
}

const EncounterMechanicType = 
{
    FEAR:       "fear",
    STUN:       "stun",
    PROJECTILE: "projectile",
    MAGIC:      "magic",
    KNOCK:      "knock",
    CHARM:      "charm"
}

const EncounterMechanicSchoolType = 
{
    PHYSICAL: "physical",
    FROST:    "frost",
    FIRE:     "fire",
    NATURE:   "nature",
    SHADOW:   "shadow",
    ARCANE:   "arcane",
    HOLY:     "holy"
}

class EncounterItem
{
    constructor()
    {
        this.m_szName = null;
        this.m_bEquipped = null;
        this.m_bCheesable = null;
        this.m_iGroupFlags = null;
    }

    static FromJSON(json)
    {
        if(json == null)
            return null;

        var encItem = new EncounterItem();

        encItem.m_szName      = json["name"];
        encItem.m_bEquipped   = json["equipped"];
        encItem.m_bCheesable  = json["cheesable"];
        encItem.m_iGroupFlags = json["group_flags"];

        return encItem;
    }
}

class EncounterMechanic
{
    constructor()
    {
        this.m_szName = null;
        this.m_szTarget = null;
        this.m_szMechanic = null;
        this.m_szSchool = null;
        this.m_bAvoidable = null;
        this.m_bCheesable = null;
        this.m_bDispellable = null;
        this.m_bTremorable = null;
        this.m_bBoppable = null;
        this.m_szDispellableType = null;
        this.m_flEstimatedInterval = null;
        this.m_flEstimatedCooldown = null;
        this.m_iEstimatedDamage = null;
        this.m_bStacks = null;
        this.m_bResistablePartially = null;
        this.m_bResistableFully = null;
        this.m_iRange = null;
        this.m_iGroupFlags = null;
    }

    static FromJSON(json)
    {
        if(json == null)
            return null;

        var encMech = new EncounterMechanic();

        encMech.m_szName               = json["name"];
        encMech.m_szTarget             = json["target"];
        encMech.m_szMechanic           = json["mechanic"];
        encMech.m_szSchool             = json["school"];
        encMech.m_bAvoidable           = json["avoidable"];
        encMech.m_bCheesable           = json["cheesable"];
        encMech.m_bDispellable         = json["dispellable"];
        encMech.m_bTremorable          = json["tremorable"];
        encMech.m_bBoppable            = json["boppable"];
        encMech.m_szDispellableType    = json["dispellable_type"];
        encMech.m_flEstimatedInterval  = json["estimated_interval"];
        encMech.m_flEstimatedCooldown  = json["estimated_cooldown"];
        encMech.m_iEstimatedDamage     = json["estimated_damage"];
        encMech.m_bStacks              = json["stacks"];
        encMech.m_bResistablePartially = json["resistable_partially"];
        encMech.m_bResistableFully     = json["resistable_fully"];
        encMech.m_iRange               = json["range"];
        encMech.m_iGroupFlags          = json["group_flags"];

        return encMech;
    }
}

class EncounterResistance
{
    constructor()
    {
        this.m_szType = null;
        this.m_iMinimum = null;
        this.m_iRecommended = null;
        this.m_bCheesable = null;
        this.m_bNukable = null;
        this.m_bNukableConWbuffed = null;
        this.m_bNukableConHeavyGeared = null;
        this.m_bNukableconTryhardComp = null;
        this.m_iGroupFlags = null;
    }

    static FromJSON(json)
    {
        var encRes = new EncounterResistance();

        encRes.m_szType                 = json["type"];
        encRes.m_iMinimum               = json["minimum"];
        encRes.m_iRecommended           = json["recommended"];
        encRes.m_bCheesable             = json["cheesable"];
        encRes.m_bNukable               = json["nukable"];
        encRes.m_bNukableConWbuffed     = json["nukable_con_wbuffed"];
        encRes.m_bNukableConHeavyGeared = json["nukable_con_heavy_geared"];
        encRes.m_bNukableconTryhardComp = json["nukable_con_tryhard_comp"];
        encRes.m_iGroupFlags            = json["group_flags"];
        
        return encRes;
    }
}

class EncounterRequirement
{
    constructor()
    {
        this.m_szName = null;
        this.m_szClasses = null;
        this.m_iMinimum = null;
        this.m_iRecommended = null;

        this.m_ResistanceData = null;
        this.m_MechanicData = null;
        this.m_ItemData = null;
    }

    static FromJSON(json)
    {
        var encReq = new EncounterRequirement();

        encReq.m_ResistanceData = [];
        encReq.m_MechanicData = [];
        encReq.m_ItemData = [];

        encReq.m_szName       = json["name"];
        encReq.m_szClasses    = json["classes"];
        encReq.m_iMinimum     = json["minimum"];
        encReq.m_iRecommended = json["recommended"];

        var resData           = json["resistance_data"];
        var mechData          = json["mechanics_data"];
        var itemData          = json["item_data"];

        if(resData != null)
        {
            resData.forEach(function(res) {
                encReq.m_ResistanceData.push(EncounterResistance.FromJSON(res));
            });
        }

        if(mechData != null)
        {
            mechData.forEach(function(mech) {
                encReq.m_MechanicData.push(EncounterMechanic.FromJSON(mech));
            });
        }

        if(itemData != null)
        {
            itemData.forEach(function(item) {
                encReq.m_ItemData.push(EncounterItem.FromJSON(item));
            });
        }

        return encReq;
    }
}

class EncounterData
{
    constructor()
    {
        this.m_szName       = null;
        this.m_szExpansion  = null;
        this.m_szMap        = null;
        this.m_Requirements = null;
    }

    static FromJSON(json)
    {
        var encData = new EncounterData();

        encData.m_Requirements = [];
        encData.m_szName       = json["name"];
        encData.m_szExpansion  = json["expansion"];
        encData.m_szMap        = json["map"];
        var reqData            = json["requirements"];

        if(reqData != null)
        {
            reqData.forEach(function(req) {
                encData.m_Requirements.push(EncounterRequirement.FromJSON(req));
            });
        }

        return encData;
    }

    GetMechanicCount(mechanic = null, target = null, school = null)
    {
        var count = 0;
        for(var i = 0; i < this.m_UntouchedPlayerList.length; i++)
        {
            count += ((cls==null?true:((cls!=null&&this.m_UntouchedPlayerList[i].m_Class.m_szName===cls)?true:false)) && 
                      (spec==null?true:(cls==null?true:(spec!=null&&this.m_UntouchedPlayerList[i].m_Spec.m_szName===spec)?true:false)) &&
                      (role==null?true:((role!=null&&this.m_UntouchedPlayerList[i].m_szRole===role)?true:false)) && 
                      (race==null?true:((race!=null&&this.m_UntouchedPlayerList[i].m_Race.m_szName===race)?true:false)));
        }
        
        return count;
    }
}

class RaidData
{
    constructor()
    {
        this.m_szName      = null;
        this.m_bAttunement = null;
        this.m_bFrostRes   = null;
        this.m_bFireRes    = null;
        this.m_bNatureRes  = null;
        this.m_bShadowRes  = null;
        this.m_bArcaneRes  = null;
    }

    static FromJSON(json)
    {
        var raidData = new RaidData();

        raidData.m_szName      = json["name"];
        raidData.m_bAttunement = json["attunement"];
        raidData.m_bFrostRes   = json["frost_res"];
        raidData.m_bFireRes    = json["fire_res"];
        raidData.m_bNatureRes  = json["nature_res"];
        raidData.m_bShadowRes  = json["shadow_res"];
        raidData.m_bArcaneRes  = json["arcane_res"];

        return raidData;
    }
}

function LoadRaidData()
{
    var rawdata = fs.readFileSync(path.join(Settings.DATA_FOLDER, Settings.DATA_FILES.RAIDDATA));
    var raidDataJSON = JSON.parse(rawdata);

    var encounters = raidDataJSON["encounters"];
    var raids      = raidDataJSON["raids"];
    if(encounters != null)
    {
        encounters.forEach(function(enc) {
            var encData = EncounterData.FromJSON(enc);
            g_EncounterMap.set(encData.m_szName.toLowerCase(), encData);
        });
    }
    if(raids != null)
    {
        raids.forEach(function(raid) {
            var raidData = RaidData.FromJSON(raid);
            g_RaidMap.set(raidData.m_szName.toLowerCase(), raidData);
        });
    }

    console.log(`${Settings.LOG_PREFIX} Loaded dungeon encounter comp data.`);
}

/**
 * Get encounter data
 * 
 * @param enc - Name of an encounter or ID of an encounter, check https://wowpedia.fandom.com/wiki/DungeonEncounterID for encounter IDs (example: "Firemaw" or 613). Not case sensitive
 * @returns EncounterData
 */
function GetEncounterData(enc)
{
    if(typeof enc === 'string')
    {
        return g_EncounterMap.get(enc.toLowerCase());
    }
    else if(typeof enc === 'number')
    {
        var dungEnc = DungeonEncounters.GetEncounter(enc);
        for (const [key, value] of g_EncounterMap.entries()) {
            if(dungEnc.m_iID == enc)
                return g_EncounterMap.get(dungEnc.m_szName.toLowerCase());
          }
    }

    return null;
}

/**
 * Get raid data
 * 
 * @param raid - Name of a raid/map
 * @returns RaidData
 */
function GetRaidData(raid)
{
    return g_RaidMap.get(raid.toLowerCase());
}

module.exports =
{
    EncounterItem,
    EncounterMechanic,
    EncounterResistance,
    EncounterRequirement,
    EncounterData,

    RaidData,

    LoadRaidData,
    GetEncounterData,
    GetRaidData,

    EncounterMechanicTargetType,
    EncounterMechanicType,
    EncounterMechanicSchoolType
};