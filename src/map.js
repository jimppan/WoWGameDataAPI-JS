const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');

var Settings = require('../settings');

var g_GameMaps = new Map();

const InstanceType = 
{
    WORLD: 0, // Not instanced
    PARTY: 1, // 5  man party instance
    RAID:  2, // 5+ man raid instance
    BG:    3, // 5+ man raid PVP
    ARENA: 4, // 5  man party PVP
}

const ExpansionType = 
{
    CLASSIC: 0,
    TBC:     1
}

class GameMap
{
    constructor()
    {
        this.m_szName             = null;
        this.m_iID                = null;
        this.m_iInstanceType      = null;
        this.m_iExpansionID       = null;
    }  
}

/**
 * Get map object by name or ID, check https://wow.tools/dbc/?dbc=map&build=2.5.1.39170 or https://wowpedia.fandom.com/wiki/InstanceID
 * 
 * @param map - Name or ID of map
 * @returns 
 */
function GetGameMap(map)
{
    if(typeof map === 'string')
    {
        return g_GameMaps.get(map.toLowerCase());
    }
    else if(typeof map === 'number')
    {
        for (const [key, value] of g_GameMaps.entries()) {
            if(value.m_iID == map)
                return value;
          }
    }

    return null;
}

function FindGameMap(mapName)
{
    var count = 0;
    var latest = null;

    for (const [key, value] of g_GameMaps.entries()) 
    {
        if(key.includes(mapName.toLowerCase()) || key.replace("/'/g", "").includes(mapName.toLowerCase()))
        {
            count++;
            latest = key;
        }
    }

    // did not find unique match
    if(count != 1)
        return null;

    if(latest != null)
        return g_GameMaps.get(latest);
    
    return null;
}

function LoadGameMaps()
{
      const readData = new Promise((resolve, reject) => 
      {
        var reader = fs.createReadStream(path.join(Settings.DATA_FOLDER, Settings.DATA_PATCH, Settings.DATA_FILES.MAPS));

        reader = reader.pipe(csv());

        reader.on('data', (data) => {
            var map = new GameMap;
            map.m_szName        = data['MapName_lang'];
            map.m_iID           = data['ID'];
            map.m_iInstanceType = data['InstanceType'];
            map.m_iExpansionID  = data['ExpansionID'];

            g_GameMaps.set(map.m_szName.toLowerCase(), map);
        });

        reader.on('end', () => {
            resolve();
        });
    });

    return readData;
}

module.exports =
{
    GameMap,

    GetGameMap,
    FindGameMap,
    LoadGameMaps,

    g_GameMaps,
};