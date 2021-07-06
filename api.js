const Settings = require('./settings');
const DungeonEncounters = require('./src/dungeonencounter');

function InitAPI()
{
    var promise = new Promise((resolve, reject) => 
    {
        DungeonEncounters.LoadDungeonEncounters().then(() => {
            console.log(`${Settings.LOG_PREFIX} Loaded dungeon encounters.`);
            resolve();
        })
    });
    
    return promise;
}

module.exports =
{
    DungeonEncounters: DungeonEncounters,
    Settings: Settings,

    InitAPI: InitAPI,
};