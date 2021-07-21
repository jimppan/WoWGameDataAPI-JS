const Settings = require('./settings');
const DungeonEncounters = require('./src/dungeonencounter');
const Character = require('./src/character');
const RaidData = require('./src/raiddata');
const GameMap  = require('./src/map');

function InitAPI()
{
    var promise = new Promise(async (resolve, reject) => 
    {
        RaidData.LoadRaidData();
        await GameMap.LoadGameMaps();
        await DungeonEncounters.LoadDungeonEncounters();
        await Character.LoadCharacterClasses();
        await Character.LoadCharacterRaces();
        resolve();
    });
    
    return promise;
}

module.exports =
{
    DungeonEncounters,
    Settings,
    Character,
    GameMap,
    RaidData,

    InitAPI: InitAPI,
};