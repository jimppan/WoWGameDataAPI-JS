const csv = require('csv-parser')
const { Readable } = require("stream")
const EncounterData = require('./raidcomp_encounter_data');

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
        this.m_szRole     = null;
        this.m_szName     = null;
        this.m_szSpec     = null;

        this.m_iFrostRes  = null;
        this.m_iFireRes   = null;
        this.m_iNatureRes = null;
        this.m_iShadowRes = null;
        this.m_iArcaneRes = null;
    }
}

// 1 - 5 man party
class RaidParty
{
    constructor()
    {
        this.m_Members = new Array(5);
    }

    AddMember(member)
    {

    }

    RemoveMember(member)
    {

    }
}

// 1 - 40 man raid group
class RaidGroup
{
    constructor()
    {
        this.m_Party = new Array(8);
    }
}

class RaidComposition
{
    constructor()
    {
        this.m_PlayerList = [];
    }

    LoadPlayersFromCSV(csvBuffer)
    {
        this.m_PlayerList = [];

        const readData = new Promise((resolve, reject) => 
        {
            var reader = Readable.from(csvBuffer);

            reader = reader.pipe(csv());

            // PlayerName, Class, Role, Spec, FrR, FR, NR, SR, AR
            reader.on('data', (data) => {

                var cls = new RaidCompClass;

                cls.m_szName = data['PlayerName'];

                cls.m_szName = data['Class'];
                cls.m_szRole = data['Role'];
                cls.m_szSpec = data['Spec'];

                cls.m_szSpec = data['FrR'];
                cls.m_szSpec = data['FR'];
                cls.m_szSpec = data['NR'];
                cls.m_szSpec = data['SR'];
                cls.m_szSpec = data['AR'];

                this.m_PlayerList.push(cls);
            });

            reader.on('end', () => {
                resolve();
            });
        });

        return readData;
    }
}

module.exports =
{
    RaidComposition,
};