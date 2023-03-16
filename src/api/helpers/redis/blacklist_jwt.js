const {redis} = require('../../../config/redis')
const config = require('../../../config')

async function addJwtIdToBlacklist(jwtId, exp){
    await redis.zadd(config.redis.blacklist_jwt,  parseInt(exp), jwtId);
}
async function isBlacklistedJwt(jwtId){
    const score = await redis.zscore(config.redis.blacklist_jwt, jwtId);
    return score !== null;
}
async function removeJwtExpiredFromBlacklist(){
    const lst = []
    const bl = await redis.zrange(config.redis.blacklist_jwt, 0, -1, 'WITHSCORES')

    for (let index = 0; index < bl.length; index+=2) {
        const jwtId= bl[index];
        const exp= bl[index+1];
        if(+exp < Math.floor(Date.now() / 1000)){
        lst.push(jwtId);
        }

    }
    if(lst.length){
        await redis.zrem(config.redis.blacklist_jwt, ...lst)
    }
    
}

module.exports = {
    addJwtIdToBlacklist, removeJwtExpiredFromBlacklist, isBlacklistedJwt
}