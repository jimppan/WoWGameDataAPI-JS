const csv = require('csv-parser')
const { Readable } = require("stream")
const EncounterData = require('./raiddata');
const Character = require('./character');

const RAID_PARTY_SIZE = 5;
const RAID_GROUP_SIZE = 8;

const Role = 
{
    DPS:  'Damage',
    Heal: 'Healer',
    Tank: 'Tank',
}

class RaidCompClass
{
    constructor()
    {
        this.m_szName     = null;
        this.m_szRole     = null;

        this.m_Class    = null;
        this.m_Spec     = null;
        this.m_Race     = null;

        this.m_iFrostResistance  = null;
        this.m_iFireResistance   = null;
        this.m_iNatureResistance = null;
        this.m_iShadowResistance = null;
        this.m_iArcaneResistance = null;
    }
}

// 1 - 5 man party
class RaidParty
{
    constructor()
    {
        this.m_Members = [];
    }

    AddMember(member)
    {
        if(this.IsFull())
            return false;
        
        if(this.MemberExists(member))
            return false;
        
        this.m_Members.push(member);
        return true;
    }

    RemoveMember(member)
    {
        for(var i = 0; i < this.m_Members.length; i++)
        {
            if(this.m_Members[i].m_szName === member.m_szName)
            {
                this.m_Members.splice(i, 1);
                return true;
            }
        }
        
        return false;
    }

    MemberExists(member)
    {
        for(var i = 0; i < this.m_Members.length; i++)
        {
            if(this.m_Members[i].m_szName === member.m_szName)
                return true;
        }
        return false;
    }

    IsFull()
    {
        return this.m_Members.length >= RAID_PARTY_SIZE;
    }
}

// 1 - 40 man raid group
class RaidGroup
{
    constructor(maxparty = RAID_GROUP_SIZE) // 8 by default, which means 40 players
    {
        this.m_iMaxParties = maxparty;
        this.m_Party = new Array(maxparty);

        for(var i = 0; i < maxparty; i++)
            this.m_Party[i] = new RaidParty;
    }

    AddMember(member, partyIndex = -1)
    {
        if(this.IsFull())
            return false;

        if(this.MemberExists(member))
            return false;

        if(partyIndex != -1)
        {
            var party = this.GetParty(partyIndex);
            if(party == null)
                return false;
            
            return party.AddMember(member);
        }

        var partyWithSpace = this.FindPartyWithSpace();
        return partyWithSpace.AddMember(member);
    }

    RemoveMember(member)
    {
        for(var i = 0; i < this.m_iMaxParties; i++)
        {
            if(this.m_Party[i].RemoveMember(member))
                return true;
        }
        return false;
    }

    MemberExists(member)
    {
        for(var i = 0; i < this.m_iMaxParties; i++)
        {
            if(this.m_Party[i].MemberExists(member))
                return true;
        }
        return false;
    }

    FindPartyWithSpace()
    {
        for(var i = 0; i < this.m_iMaxParties; i++)
        {
            if(!this.m_Party[i].IsFull())
                return this.m_Party[i];
        }
        return null;
    }

    GetParty(partyIndex)
    {
        if(!this.IsPartyNumberValid(partyIndex))
            return null;
        
        return this.m_Party[partyIndex];
    }

    IsPartyNumberValid(partyIndex)
    {
        return partyIndex >= 0 && partyIndex < this.m_iMaxParties;
    }

    IsFull()
    {
        for(var i = 0; i < this.m_iMaxParties; i++)
        {
            if(!this.m_Party[i].IsFull())
                return false;
        }
        return true;
    }
}

class RaidComposition
{
    constructor(maxparty = RAID_GROUP_SIZE)
    {
        this.m_UntouchedPlayerList = [];
        this.m_PlayerList = [];
        this.m_RaidGroup = new RaidGroup(maxparty);
    }

    LoadPlayersFromCSV(csvBuffer)
    {
        this.m_PlayerList = [];

        const readData = new Promise((resolve, reject) => 
        {
            var reader = Readable.from(csvBuffer);

            reader = reader.pipe(csv());

            // PlayerName, Class, Spec, Race, Role, FrR, FR, NR, SR, AR
            reader.on('data', (data) => {

                var cls = new RaidCompClass;

                cls.m_szName = data['PlayerName'];
                cls.m_szRole = data['Role'];

                cls.m_Class = Character.FindClass(data['Class']);
                cls.m_Spec = cls.m_Class.FindSpec(data['Spec']);
                cls.m_Race = Character.FindRace(data['Race']);

                cls.m_iFrostResistance = Number(data['FrR']);
                cls.m_iFireResistance = Number(data['FR']);
                cls.m_iNatureResistance = Number(data['NR']);
                cls.m_iShadowResistance = Number(data['SR']);
                cls.m_iArcaneResistance = Number(data['AR']);

                this.m_UntouchedPlayerList.push(cls);
                this.m_PlayerList.push(cls);
            });

            reader.on('end', () => {
                resolve();
            });
        });

        return readData;
    }

    /**
     * 
     * @param cls  - Class to search for, leave empty to search for any class
     * @param spec - Spec to search for, leave empty to search for any spec (required class)
     * @param role - Role to search for, leave empty to search for any role
     * @param race - Race to search for, leave empty to search for any race
     * @returns 
     */
    GetCount(cls = null, spec = null, role = null, race = null)
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

    GenerateCompositionExample()
    {
        for(var i = 0; i < this.m_PlayerList.length; i++)
        {
            this.m_RaidGroup.AddMember(this.m_PlayerList[i]);
        }
    }

    GenerateComposition(encounterData)
    {
        // Tank groups

        console.log("TANK: " + this.GetCount(null, null, "Tank", null));
        console.log("DPS: " + this.GetCount(null, null, "DPS", null));
        console.log("HEAL: " + this.GetCount(null, null, "Healer", null));

        console.log("WARR: " + this.GetCount("Warrior",  null, null, null));
        console.log("HUMAN: " + this.GetCount(null, null, null, "Human"));

        var tankCount = this.GetCount(null, null, "Tank", null);
        

    }
}

function LogRaidGroup(raidgroup)
{
    var group = 1;

    for(var i = 0; i < raidgroup.m_iMaxParties; i++)
    {
        console.log(`----- GROUP ${group++} -----`);

        for(var j = 0; j < raidgroup.m_Party[i].m_Members.length; j++)
        {
            var cls = raidgroup.m_Party[i].m_Members[j];
            console.log(`${j+1} - ${cls.m_szName} - ${cls.m_Spec.m_szName} - ${cls.m_Race.m_szName}`);
        }
        
        console.log(`\n`);
    }
}

module.exports =
{
    RaidComposition,

    LogRaidGroup
};