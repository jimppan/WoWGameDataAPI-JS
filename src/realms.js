var APIKey = require('../apikey');

class Realm
{
    constructor()
    {
        this.m_iID = null;
        this.m_szName = null;
        this.m_bOnline = null;
        this.m_bIsTournament = null;
        this.m_szTimeZone = null;
        this.m_szRegion = null;
        this.m_szCategory = null;
        this.m_szType = null;
        this.m_bHasQueue = null;
        this.m_szPopulation = null;
    }
}

/**
 * Get currently connected realms
 * 
 * @param {String} status     - Status type, 'UP' or 'DOWN', empty for both (Online or offline)
 * @param {String} timezone   - Time zone, leave empty for all
 * @param {String} orderby    - What field to order by, population.type to order them by population
 * @returns 
 */
function GetRealms(status = '', timezone = '', orderby = '')
{
    const promise = new Promise((resolve, reject) => 
    {
        APIKey.Get('data/wow/search/connected-realm', 
        {
            'status.type':status,
            'realms.timezone':timezone,
            'orderby':orderby,
        }
        ).then((result) => 
        {
            if(result.data == null)
            {
                resolve(null);
                return promise;
            }

            if(result.data.errors != null)
            {
                console.log(result.data.errors);
                resolve(null);
                return promise;
            }

            if(result.data.results == null)
            {
                console.log('Could not get results in GetRealm()');
                resolve(null);
                return promise;
            }

            var realmList = [];
            for(var i = 0; i < result.data.results.length; i++)
            {
                var realmStatus = result.data.results[i].data;
                var realmData = realmStatus.realms[0];
    
                var newRealm = new Realm();

                newRealm.m_iID = realmData.id;
                newRealm.m_szName = realmData.name[APIKey.BLIZZARDAPI_LOCALE];
                newRealm.m_bIsTournament = realmData.is_tournament;
                newRealm.m_szTimeZone = realmData.timezone;
                newRealm.m_szRegion = realmData.region.name[APIKey.BLIZZARDAPI_LOCALE];
                newRealm.m_szCategory = realmData.category[APIKey.BLIZZARDAPI_LOCALE];
                newRealm.m_szType = realmData.type.type;

                newRealm.m_bOnline = realmStatus.status.type;
                newRealm.m_bHasQueue = realmStatus.has_queue;
                newRealm.m_szPopulation = realmStatus.population.type;

                realmList.push(newRealm);
            }
            resolve(realmList);
        });
    })

    return promise;
}

module.exports =
{
    Realm,
    
    GetRealms,
}