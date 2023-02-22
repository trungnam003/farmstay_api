const Redis = require('ioredis');
const redis = new Redis();
const cron = require('node-cron');
const {nanoid} = require('nanoid')
const jwt = require('jsonwebtoken')

const config = require('../config')
const users = ["nam", "duc", "anh"]

const blacklist = 'blacklist'
const blacklistExp = 'expire_times_blacklist'

async function addJwtIdToBlacklist(jwtId, exp){
  await redis.zadd(blacklist,  parseInt(exp), jwtId);
}

async function isBlacklistedJwt(jwtId){
  const score = await redis.zscore(blacklist, jwtId);
  return score !== null;
}
async function removeJwtExpiredFromBlacklist(){
  const lst = []
  const bl = await redis.zrange(blacklist, 0, -1, 'WITHSCORES')
  
  for (let index = 0; index < bl.length; index+=2) {
    const jwtId= bl[index];
    const exp= bl[index+1];
    if(+exp < Math.floor(Date.now() / 1000)){
      lst.push(jwtId);
    }

  }
  if(lst.length){
    await redis.zrem(blacklist, ...lst)
  }
    
}
// removeJwtExpiredFromBlacklist()


// isBlacklistedJwt('kLdttCXiymBCyVGxxp0hG').then(console.log)





cron.schedule('*/30 * * * * *', () => {
	for (let index = 0; index < 10; index++) {

    const JWT = jwt.sign({
        sub: users[parseInt(Math.random()*3)],
        jwt_id: nanoid()
    }, config.secret_key.jwt , {expiresIn: config.jwt.exp, issuer: config.jwt.issuer})
    let error, payload;

    jwt.verify(JWT, config.secret_key.jwt,{ issuer: config.jwt.issuer }, (err, decode)=>{
        error = err;
        payload = decode
    })

    const {jwt_id, exp} = payload;
    addJwtIdToBlacklist(jwt_id, exp);
  }
  console.log("add jwt to redis")
}, {
  timezone: 'Asia/Ho_Chi_Minh' // Set múi giờ cho job
})

//'59 23 * * 2,4,6'
cron.schedule('*/4 * * * * *', () => { 
	removeJwtExpiredFromBlacklist();
  console.log("remove blacklist jwt to redis")
}, {
  timezone: 'Asia/Ho_Chi_Minh' // Set múi giờ cho job
})


// for (let index = 0; index < 10; index++) {
//     redis.zadd('myset', index, 'one'+index);
//     redis.hset('expire_times', 'one'+index, Date.now() + 10000);
//     console.log('add')
// }

