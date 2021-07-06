const csv = require('csv-parser')
const fs = require('fs')
const path = require('path');

var Settings = require('../settings');

var g_DungeonEncounters = new Map();

class DungeonEncounter
{
    constructor(name = null, 
                id = -1, 
                mapid = -1,
                difficultyid = -1,
                orderindex = -1,
                bit = -1,
                creaturedisplayid = -1,
                flags = -1,
                spelliconfileid = -1)
    {
        this.m_szName             = name;

        this.m_iID                = id;
        this.m_iMapID             = mapid;
        this.m_iDifficultyID      = difficultyid;
        this.m_iOrderIndex        = orderindex;
        this.m_iBit               = bit;
        this.m_iCreatureDisplayID = creaturedisplayid;
        this.m_iFlags             = flags;
        this.m_iSpellIconFileID   = spelliconfileid;
    }  
}

function LoadDungeonEncounters()
{
      const readData = new Promise((resolve, reject) => 
      {
        const results = [];

        var reader = null;
        reader = fs.createReadStream(path.join(Settings.DATA_FOLDER, Settings.DATA_PATCH, Settings.DATA_FILE_DUNGEONENCOUNTERS));

        reader = reader.pipe(csv(['Name','ID','MapID','DifficultyID','OrderIndex','Bit','CreatureDisplayID','Flags','SpellIconFileID']));

        reader.on('data', (data) => {
            results.push(data);

            var enc = new DungeonEncounter;
            enc.m_szName             = data['Name'];
            enc.m_iID                = data['ID'];
            enc.m_iMapID             = data['MapID'];
            enc.m_iDifficultyID      = data['DifficultyID'];
            enc.m_iOrderIndex        = data['OrderIndex'];
            enc.m_iBit               = data['Bit'];
            enc.m_iCreatureDisplayID = data['CreatureDisplayID'];
            enc.m_iFlags             = data['Flags'];
            enc.m_iSpellIconFileID   = data['SpellIconFileID'];

            g_DungeonEncounters.set(enc.m_szName, enc);
        });

        reader.on('end', () => {
            resolve(results);
        });
    });

    return readData;
}

module.exports =
{
    DungeonEncounter,

    encounters: g_DungeonEncounters,

    LoadDungeonEncounters: LoadDungeonEncounters,
};