// Full docs https://develop.battle.net/documentation/

var ClientOAuth2 = require('client-oauth2');
var Axios        = require('axios');

const NamespaceCategory =
{
    STATIC: 'static',
    DYNAMIC: 'dynamic'
}

const NamespaceVersion =
{
    RETAIL:  '',
    CLASSIC: 'classic',
}

var BLIZZARDAPI_REGION              = "eu";
var BLIZZARDAPI_NAMESPACE           = `${NamespaceCategory.DYNAMIC}-${NamespaceVersion.CLASSIC}`
var BLIZZARDAPI_LOCALE              = "en_US"

var   BLIZZARDAPI_ACCESS_TOKEN      = null;                           // Received from oauth2 request after calling (InitAPI())

const   BLIZZARDAPI_URL_START         = 'https://';
const   BLIZZARDAPI_URL_END           = '.api.blizzard.com/';

const BLIZZARDAPI_AUTH  = new ClientOAuth2({
    clientId:         'Client-ID-Here',
    clientSecret:     'Client-Secret-Here',
    accessTokenUri:   `https://eu.battle.net/oauth/token`,       // Might wanna change region of this URL aswell depending server region
    authorizationUri: `https://eu.battle.net/oauth/authorize`,  
    redirectUri:      'http://example.com/auth/github/callback'
})

function BuildAPIURL(sub_url)
{
    return BLIZZARDAPI_URL_START+
        BLIZZARDAPI_REGION+
        BLIZZARDAPI_URL_END+sub_url;
}

function BuildNamespace()
{
    return BLIZZARDAPI_NAMESPACE + "-" + BLIZZARDAPI_REGION;
}

/**
 * Get data from blizzard API
 * 
 * @param sub_url - SUB url to get (Example: /data/wow/connected-realm/)
 * @param params  - Parameters to set (Example: {id: 50, name: 'bob'})
 * @returns 
 */
function Get(sub_url, param)
{
    var promise = new Promise(async (resolve, reject) =>
    {
        var ret = await Axios.get(BuildAPIURL(sub_url), 
            {
                params: 
                {...param,
                    namespace: BuildNamespace()
                },
                headers:
                {
                    authorization: `Bearer ${BLIZZARDAPI_ACCESS_TOKEN}`
                }
            });
        resolve(ret);
    });
    
    return promise;
}

module.exports =
{
    BLIZZARDAPI_URL_START,
    BLIZZARDAPI_URL_END,

    GetAuth: () => BLIZZARDAPI_AUTH,

    SetAccessToken: (accessToken) => BLIZZARDAPI_ACCESS_TOKEN = accessToken,
    GetAccessToken: () => BLIZZARDAPI_ACCESS_TOKEN,

    SetNamespace: (namespace) => BLIZZARDAPI_NAMESPACE = namespace,
    GetNamespace: () => BLIZZARDAPI_NAMESPACE,

    SetLocale: (locale) => BLIZZARDAPI_LOCALE = locale,
    GetLocale: () => BLIZZARDAPI_LOCALE,

    SetRegion: (region) => 
    {
        switch(region)
        {
            case 'lan': // latin america
            case 'oce': // oceanic
            case 'sa':  // south america
            case 'na':  // north america
                region = 'us';
        }
        BLIZZARDAPI_REGION = region
    },
    GetRegion: () => BLIZZARDAPI_REGION,

    BuildNamespace,
    BuildAPIURL,
    Get,
};