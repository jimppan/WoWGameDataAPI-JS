const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');

var Settings = require('../settings');

var g_Classes = new Map();
var g_Races = new Map();

class CharacterClass
{
    constructor()
    {
        this.m_szName             = null;
        this.m_iID                = null;
        this.m_bHasRelicSlot      = null;

        this.m_Specs;
    }

    GetSpec(spec)
    {
        if(typeof spec === 'string')
        {
            return this.m_Specs.get(spec.toLowerCase());
        }
        else if(typeof spec === 'number')
        {
            for (const [key, value] of this.m_Specs.entries()) {
                if(value.m_iID == spec)
                    return value;
            }
        }
        return null;
    }

    FindSpec(specName)
    {
        var count = 0;
        var latest = null;

        for (const [key, value] of this.m_Specs.entries()) 
        {
            if(key.includes(specName.toLowerCase()))
            {
                count++;
                latest = key;
            }
            else
            {
                for(var i = 0; i < value.m_Aliases.length; i++)
                {
                    if(value.m_Aliases[i].includes(specName.toLowerCase()))
                    {
                        count++;
                        latest = key;
                    }
                }
            }
        }

        // did not find unique match
        if(count != 1)
            return null;

        if(latest != null)
            return this.m_Specs.get(latest);
        
        return null;
    }
}

class CharacterRace
{
    constructor()
    {
        this.m_szName             = null;
        this.m_iID                = null;
        this.m_Aliases            = null;
    }  
}

class CharacterSpec
{
    constructor()
    {
        this.m_szName             = null;
        this.m_iID                = null;
        this.m_iClassID           = null;
        this.m_szDescription      = null;
        this.m_szRole             = null;
        this.m_Aliases            = null;
    }  
}

/**
 * Get class by Name or ID. Check https://wow.tools/dbc/?dbc=chrclasses&build=2.5.1.39170
 * 
 * @param map - Name or ID of class
 * @returns 
 */
function GetClass(cls)
{
    if(typeof cls === 'string')
    {
        return g_Classes.get(cls.toLowerCase());
    }
    else if(typeof cls === 'number')
    {
        for (const [key, value] of g_Classes.entries()) {
            if(value.m_iID == cls)
                return value;
          }
    }
    return null;
}

/**
 * Get race by Name or ID. Check https://wow.tools/dbc/?dbc=chrraces&build=2.5.1.39170
 * 
 * @param map - Name or ID of race
 * @returns 
 */
function GetRace(race)
{
    if(typeof race === 'string')
    {
        return g_Races.get(race.toLowerCase());
    }
    else if(typeof race === 'number')
    {
        for (const [key, value] of g_Races.entries()) 
        {
            if(value.m_iID == race)
                return value;
        }
    }
    return null;
}

function FindClass(clsName)
{
    var count = 0;
    var latest = null;

    for (const [key, value] of g_Classes.entries()) 
    {
        if(key.includes(clsName.toLowerCase()))
        {
            count++;
            latest = key;
        }
    }

    // did not find unique match
    if(count != 1)
        return null;

    if(latest != null)
        return g_Classes.get(latest);
    
    return null;
}

function FindRace(raceName)
{
    var count = 0;
    var latest = null;

    for (const [key, value] of g_Races.entries()) 
    {
        if(key.includes(raceName.toLowerCase()))
        {
            count++;
            latest = key;
        }
        else
        {
            for(var i = 0; i < value.m_Aliases.length; i++)
            {
                if(value.m_Aliases[i].includes(raceName.toLowerCase()))
                {
                    count++;
                    latest = key;
                }
            }
        }
    }

    // did not find unique match
    if(count != 1)
        return null;

    if(latest != null)
        return g_Races.get(latest);
    
    return null;
}

function LoadCharacterClasses()
{
      const readData = new Promise((resolve, reject) => 
      {
        var reader = fs.createReadStream(path.join(Settings.DATA_FOLDER, Settings.DATA_PATCH, Settings.DATA_FILES.CHRCLASSES));

        reader = reader.pipe(csv());

        reader.on('data', (data) => {
            var cls = new CharacterClass;
            cls.m_szName             = data['Name_lang'];
            cls.m_iID                = data['ID'];
            cls.m_bHasRelicSlot      = data['HasRelicSlot'];

            cls.m_Specs = new Map();

            console.log(cls.m_szName);
            g_Classes.set(cls.m_szName.toLowerCase(), cls);
        });

        reader.on('end', () => {
            var specReader = fs.createReadStream(path.join(Settings.DATA_FOLDER, Settings.DATA_PATCH, Settings.DATA_FILES.CHRSPEC));
            specReader = specReader.pipe(csv());

            specReader.on('data', (data) => {

                var classId = data['ClassID'];
                var cls = GetClass(Number(classId));

                if(cls == null)
                    return;
                
                var spec = new CharacterSpec;
                spec.m_szName          = data['Name_lang'];
                spec.m_iClassID        = classId;
                spec.m_iID             = data['ID'];
                spec.m_szDescription   = data['Description_lang'];
                spec.m_szRole          = data['Role'];
                spec.m_Aliases         = [];

                if(cls.m_szName === "Druid")
                {
                    if(spec.m_szName === "Feral")
                    {
                        spec.m_szName = "Cat";
                    }
                    else if(spec.m_szName === "Guardian")
                    {
                        spec.m_szName = "Bear";
                        spec.m_Aliases.push("guardian");
                        spec.m_Aliases.push("tank");
                    }
                    else if(spec.m_szName === "Balance")
                    {
                        spec.m_Aliases.push("boomkin")
                        spec.m_Aliases.push("boomie");
                        spec.m_Aliases.push("moonkin");
                    }
                    else if(spec.m_szName === "Restoration")
                    {
                        spec.m_Aliases.push("tree");
                    }
                }
                else if(cls.m_szName === "Hunter")
                {
                    if(spec.m_szName === "Beast Mastery")
                    {
                        spec.m_Aliases.push("bm");
                        spec.m_Aliases.push("beastmastery");
                    }
                    else if(spec.m_szName === "Marksmanship")
                    {
                        spec.m_Aliases.push("mm");
                    }
                }
                
                if(spec.m_szName === "Protection")
                {
                    spec.m_Aliases.push("tank");
                }
                else if(spec.m_szName === "Restoration" || 
                        spec.m_szName === "Holy" || 
                        spec.m_szName === "Discipline")
                {
                    spec.m_Aliases.push("healer");
                }

                cls.m_Specs.set(spec.m_szName.toLowerCase(), spec);
            });

            specReader.on('end', () => {
                resolve();
            });
            
        });
    });

    return readData;
}

function LoadCharacterRaces()
{
      const readData = new Promise((resolve, reject) => 
      {
        var reader = fs.createReadStream(path.join(Settings.DATA_FOLDER, Settings.DATA_PATCH, Settings.DATA_FILES.CHRRACES));

        reader = reader.pipe(csv());

        reader.on('data', (data) => {
            var race = new CharacterRace;
            race.m_szName             = data['Name_lang'];
            race.m_iID                = data['ID'];
            race.m_Aliases            = [];

            if(race.m_szName.toLowerCase() === "night elf")
            {
                race.m_Aliases.push("nelf");
                race.m_Aliases.push("nightelf");
            }
            else if(race.m_szName.toLowerCase() === "blood elf")
            {
                race.m_Aliases.push("belf");
                race.m_Aliases.push("bloodelf");
            }
            else if(race.m_szName.toLowerCase() === "dwarf")
            {
                race.m_Aliases.push("dworf");
            }
            else if(race.m_szName.toLowerCase() === "tauren")
            {
                race.m_Aliases.push("cow");
            }
            else if(race.m_szName.toLowerCase() === "draenei")
            {
                race.m_Aliases.push("goat");
                race.m_Aliases.push("dranei");
                race.m_Aliases.push("drenai");
                race.m_Aliases.push("dreanei");
            }

            g_Races.set(race.m_szName.toLowerCase(), race);
        });

        reader.on('end', () => {
            resolve();
        });
    });

    return readData;
}

module.exports =
{
    CharacterClass,
    CharacterSpec,
    CharacterRace,

    GetRace,
    GetClass,

    LoadCharacterClasses,
    LoadCharacterRaces,

    FindRace,
    FindClass,

    g_Classes,
    g_Races,
};