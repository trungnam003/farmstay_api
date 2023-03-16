const { Buffer } = require('node:buffer');
const uuid = require('uuid');
const uuidBuffer = require('uuid-buffer');

function generateBufferUUIDV4(){
    return Buffer.from(uuid.parse(uuid.v4(), Buffer.alloc(16)), Buffer.alloc(16))
}

function uuidStringToBuffer(uuidString){
    return Buffer.from(uuid.parse(uuidString, Buffer.alloc(16)), Buffer.alloc(16))
}

function uuidToString(uuid){
    return uuidBuffer.toString(uuid)
}

module.exports = {
    generateBufferUUIDV4, uuidToString, uuidStringToBuffer
}