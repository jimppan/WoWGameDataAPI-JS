var crypto = require('crypto');

/**
 * The amount of time in seconds a cached value remains until it will be queried again
 * 
 * The lower the value, the more precise data from the API, but more API calls
 */
const CACHE_UPDATE_INTERVAL_REALMS = 300;  // (300 seconds) every 5 minutes by default

class DynamicCacheEntry
{
    constructor()
    {
        this.m_Data            = null;
        this.m_iLastUpdated    = -1;
        this.m_iUpdateInterval = -1;
        this.m_iQueryHash      = null;
        this.m_RawResult       = null;
    }

    NeedsUpdate()
    {
        var diff = Math.floor(Date.now() / 1000) - this.m_iLastUpdated;
        return diff >= this.m_iUpdateInterval;
    }
}

// Data that might change, direct access of this data may or may not be up to date
class DynamicCache
{
    constructor()
    {
    }

    static CacheBlizzardQuery(data, requestResult, unhashedKey, updateInterval)
    {
        var cacheEntry = new DynamicCacheEntry();

        cacheEntry.m_Data = data;
        cacheEntry.m_iLastUpdated = Math.floor(Date.now() / 1000);
        cacheEntry.m_iQueryHash = SHA1BASE64(unhashedKey);
        cacheEntry.m_iUpdateInterval = updateInterval;
        cacheEntry.m_RawResult = requestResult;
        DynamicCache.s_QueryCache.set(cacheEntry.m_iQueryHash, cacheEntry);
    }

    static GetBlizzardQuery(unhashedKey)
    {
        return DynamicCache.s_QueryCache.get(SHA1BASE64(unhashedKey));
    }

    static s_QueryCache = new Map();
}

function SHA1BASE64(value)
{
    return crypto.createHash('sha1').update(value).digest('base64')
}

module.exports =
{
    DynamicCache,
    DynamicCacheEntry,

    SHA1BASE64,

    SetRealmsCacheUpdateInterval: (value) => CACHE_UPDATE_INTERVAL_REALMS = value,
    GetRealmsCacheUpdateInterval: () => CACHE_UPDATE_INTERVAL_REALMS,
}