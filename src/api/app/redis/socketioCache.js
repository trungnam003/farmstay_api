const {redis} = require('../../../config/redis')
const config = require('../../../config')

const HASHES_NAME = 'hardware_field'

async function saveSocketEventFields(object={}){
    return redis.hmset(HASHES_NAME, object);
}

async function getFieldNameEventById(id){
    return redis.hget(HASHES_NAME, id);
}

module.exports = {
    saveSocketEventFields, getFieldNameEventById
}