const Settings = require('./settings');
const DungeonEncounters = require('./src/dungeonencounter');
const Character = require('./src/character');
const RaidComposition = require('./src/raidcomposition/raidcomposition');
const EncounterData = require('./src/raidcomposition/raidcomp_encounter_data');
const GameMap  = require('./src/map');

var bLoadedEncounters = false;
var bLoadedClasses = false;
var bLoadedRaces = false;
var gLoadedGameMaps = false;

function CheckAPI()
{
    if(bLoadedEncounters && bLoadedClasses && bLoadedRaces && gLoadedGameMaps)
    {
        g_Initialized = true;
        console.log(`${Settings.LOG_PREFIX} API Initialized.`);
        return true;
    }
    return false;
}

function InitAPI()
{
    var promise = new Promise((resolve, reject) => 
    {
        EncounterData.LoadEncounterData();
        console.log(`${Settings.LOG_PREFIX} Loaded dungeon encounter comp data.`);

        DungeonEncounters.LoadDungeonEncounters().then(() => {
            console.log(`${Settings.LOG_PREFIX} Loaded dungeon encounters.`);
            bLoadedEncounters = true;
            if(CheckAPI())
                resolve();

        })
        Character.LoadCharacterClasses().then(() => {
            console.log(`${Settings.LOG_PREFIX} Loaded character classes.`);
            bLoadedClasses = true;
            if(CheckAPI())
                resolve();
        })
        Character.LoadCharacterRaces().then(() => {
            console.log(`${Settings.LOG_PREFIX} Loaded character races.`);
            bLoadedRaces = true;
            if(CheckAPI())
                resolve();
        })
        GameMap.LoadGameMaps().then(() => {
            console.log(`${Settings.LOG_PREFIX} Loaded game maps.`);
            gLoadedGameMaps = true;
            if(CheckAPI())
                resolve();
        })
        
    });
    
    return promise;
}


const csvstuff = `Name,Role,Spec
Warrior,Tank,Prot
Druid,Tank,Feral
Hunter,Tank,Prot
Rogue,Dps,Combat
Priest,Healer,Holy
`

// TESTING
/*
InitAPI().then(() => 
{
    var cls = Character.GetClass("Druid");

    var spec = cls.GetSpec("Restoration");
    var race = Character.GetRace("Troll");

    console.log(race.m_szName);
    console.log(spec);

    var comp = new RaidComposition.RaidComposition;

    comp.LoadPlayersFromCSV(csvstuff).then(() =>
    {
        console.log(comp.m_PlayerList[0].m_szName);
        console.log(comp.m_PlayerList[1].m_szName);
        console.log(comp.m_PlayerList[2].m_szName);
        console.log(comp.m_PlayerList[3].m_szName);
        console.log(comp.m_PlayerList[4].m_szName);
    })

    
    console.log("Loaded enc data");

    var enc = EncounterData.GetEncounterData(613);


    console.log(enc.m_szName);
    console.log(enc.m_szExpansion);
    console.log(enc.m_Requirements[0].m_szName);

    var map = GameMap.GetGameMap("Auchindoun: Shadow Labyrinth");
    console.log(map.m_iExpansionID);
    console.log(map.m_iID);

    var cls = Character.FindClass("druid");

    //console.log(cls.m_Specs);

    if(cls == null)
    {
        console.log("couldn find clas");
    }
    else
    {
        console.log(cls.m_szName);

        var spec = cls.FindSpec("bear");
        console.log(spec);
    }
})
*/
module.exports =
{
    DungeonEncounters,
    Settings,
    Character,
    GameMap,

    InitAPI: InitAPI,
};