const Settings = require('./settings');
const DungeonEncounters = require('./src/dungeonencounter');
const Character = require('./src/character');
const RaidData = require('./src/raiddata');
const GameMap  = require('./src/map');
const Realms = require('./src/realms');

const APIKey = require('./apikey')
/**
 * Must be called for every project to make use out of it
 * 
 * @param blizzapi - Wether or not to use blizzards api for this application, if true, use oauth2 to connect, if false, do nothing and only load local data
 * @param oauth2   - Authentication credentials for connecting to blizzards API
 * @param region   - Region to get data from (US, EU, KR, TW, CN)
 * @returns 
 */
function InitAPI(blizzapi = false, oauth2 = null, region = 'eu')
{
    var promise = new Promise(async (resolve, reject) => 
    {
        RaidData.LoadRaidData();
        await GameMap.LoadGameMaps();
        await DungeonEncounters.LoadDungeonEncounters();
        await Character.LoadCharacterClasses();
        await Character.LoadCharacterRaces();

        if(blizzapi)
        {
            APIKey.BLIZZARD_URL = APIKey.BLIZZARDAPI_URL_START + region + APIKey.BLIZZARDAPI_URL_END;
            var oauthObj = oauth2==null?APIKey.BLIZZARDAPI_AUTH:oauth2;
            oauthObj.credentials.getToken().then(async (user) =>
            {
                APIKey.BLIZZARDAPI_ACCESS_TOKEN = user['accessToken'];
                if(APIKey.BLIZZARDAPI_ACCESS_TOKEN == null)
                {
                    console.log(`${Settings.LOG_PREFIX} Could not authorize user for Blizzard API`);
                    resolve(false);
                    return promise;
                }
                console.log(`${Settings.LOG_PREFIX} Blizzard API authorization successful`);
                resolve(true);
            })
        }
        else
            resolve(true);
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
    Realms,
    
    APIKey,

    InitAPI: InitAPI,
};