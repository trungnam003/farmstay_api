const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uuid = require('uuid')

const FarmstayData =  new Schema({
    hardware_id: {type: String, index: { unique: true }, required: true },
    farmstay_id: {type: String,  required: true },

    equipments_data: [
        {
            value: {type: Number, required: true},
            timestamp: {type: Date, required: true}
        }
    ]
    
    
}, );

module.exports = mongoose.model('FarmstayData', FarmstayData);