const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');

var Settings = require('../settings');

var GameMaps = require('./map');

var g_DungeonEncounters = new Map();

class DungeonEncounter
{
    constructor()
    {
        this.m_szName             = null;

        this.m_iID                = null;
        this.m_iMapID             = null;
        this.m_iDifficultyID      = null;
        this.m_iOrderIndex        = null;
        this.m_iBit               = null;
        this.m_iCreatureDisplayID = null;
        this.m_iFlags             = null;
        this.m_iSpellIconFileID   = null;
    }  
}

/**
 * Get dungeon encounter by Name or ID. Check https://wow.tools/dbc/?dbc=dungeonencounter&build=2.5.1.39170 or https://wowpedia.fandom.com/wiki/DungeonEncounterID
 * 
 * @param map - Name or ID of dungeon encounter
 * @returns 
 */
function GetEncounter(enc)
{
    if(typeof enc === 'string')
    {
        return g_DungeonEncounters.get(enc.toLowerCase());
    }
    else if(typeof enc === 'number')
    {
        for (const [key, value] of g_DungeonEncounters.entries()) {
            if(value.m_iID == enc)
                return value;
          }
    }

    return null;
}

function FindEncounter(clsName)
{
    var count = 0;
    var latest = null;

    for (const [key, value] of g_DungeonEncounters.entries()) 
    {
        if(key.includes(clsName.toLowerCase()) || key.replace("/'/g", "").includes(clsName.toLowerCase()))
        {
            count++;
            latest = key;
        }
    }

    // did not find unique match
    if(count != 1)
        return null;

    if(latest != null)
        return g_DungeonEncounters.get(latest);
    
    return null;
}

function LoadDungeonEncounters()
{
      const readData = new Promise((resolve, reject) => 
      {
        var reader = fs.createReadStream(path.join(Settings.DATA_FOLDER, Settings.DATA_PATCH, Settings.DATA_FILES.DUNGEONENCOUNTERS));

        reader = reader.pipe(csv());

        reader.on('data', (data) => {
            var enc = new DungeonEncounter;
            enc.m_szName             = data['Name_lang'];
            enc.m_iID                = Number(data['ID']);
            enc.m_iMapID             = Number(data['MapID']);
            enc.m_iDifficultyID      = Number(data['DifficultyID']);
            enc.m_iOrderIndex        = Number(data['OrderIndex']);
            enc.m_iBit               = Number(data['Bit']);
            enc.m_iCreatureDisplayID = Number(data['CreatureDisplayID']);
            enc.m_iFlags             = Number(data['Flags']);
            enc.m_iSpellIconFileID   = Number(data['SpellIconFileID']);

            GameMaps.GetGameMap(enc.m_iMapID).m_Encounters.push(enc);
            g_DungeonEncounters.set(enc.m_szName.toLowerCase(), enc);
        });

        reader.on('end', () => {
            console.log(`${Settings.LOG_PREFIX} Loaded dungeon encounters.`);
            resolve();
        });
    });

    return readData;
}

module.exports =
{
    DungeonEncounter,

    GetEncounter,
    FindEncounter,
    LoadDungeonEncounters,

    g_DungeonEncounters,
};