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
var BLIZZARDAPI_NAMESPACE           = `${NamespaceCategory.DYNAMIC}-${NamespaceVersion.CLASSIC}-${BLIZZARDAPI_REGION}`
var BLIZZARDAPI_LOCALE              = "en_US"

var   BLIZZARDAPI_ACCESS_TOKEN      = null;                           // Received from oauth2 request after calling (InitAPI())
var   BLIZZARDAPI_URL_START         = 'https://';
var   BLIZZARDAPI_URL_END           = '.api.blizzard.com/';

var   BLIZZARDAPI_URL               = `https://eu.api.blizzard.com/`; // By default, is changed once InitAPI is called with region paramater

const BLIZZARDAPI_AUTH  = new ClientOAuth2({
    clientId:         'Client-ID-Here',
    clientSecret:     'Client-Secret-Here',
    accessTokenUri:   `https://eu.battle.net/oauth/token`,       // Might wanna change region of this URL aswell depending server region
    authorizationUri: `https://eu.battle.net/oauth/authorize`,  
    redirectUri:      'http://example.com/auth/github/callback'
})

/**
 * 
 * @param {String} region    - Region to get data for (EU, US, KR, TW, CN)
 * @param {String} namespace - Name space, static-classic, dynamic-classic...
 * @param {String} locale    - Language (en_US by default)
 */
function SetAPIOptions(region = BLIZZARDAPI_REGION, namespace = BLIZZARDAPI_NAMESPACE, locale = BLIZZARDAPI_LOCALE)
{
    BLIZZARDAPI_REGION = region;
    BLIZZARDAPI_NAMESPACE = namespace;
    BLIZZARDAPI_LOCALE = locale;
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
        var ret = await Axios.get(BLIZZARDAPI_URL+sub_url, 
            {
                params: 
                {...param,
                    namespace: BLIZZARDAPI_NAMESPACE
                },
                headers:
                {
                    authorization: `Bearer ${module.exports.BLIZZARDAPI_ACCESS_TOKEN}`
                }
            });
        resolve(ret);
    });
    
    return promise;
}

module.exports =
{
    BLIZZARDAPI_AUTH,
    BLIZZARDAPI_URL,
    BLIZZARDAPI_ACCESS_TOKEN,
    BLIZZARDAPI_REGION,

    BLIZZARDAPI_NAMESPACE,
    BLIZZARDAPI_LOCALE,

    BLIZZARDAPI_URL_START,
    BLIZZARDAPI_URL_END,

    Get,
    SetAPIOptions,
};