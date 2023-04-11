const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const uuid = require('uuid')
// const {customAlphabet} = require('nanoid')
// const nanoid = customAlphabet('1234567890qwertyuiopasdfghjkllzxcvbnm')


const FarmstayConfig =  new Schema({
    farmstay_id: {type: String, index: { unique: true } },
    farmstay_name:  {type: String, required: true },
    equipments: [
        new Schema({
            name: {type: String, required: true,},
            alias_name: {type: String, required: true,},
            type: {type: String, required: true,},
            area: {type: String, required: true,},
            equipment_fields: [
                {
                    hardware_id: {type: String, required: true},
                    field_name: {type: String, required: true},
                    alias_field_name: {type: String, required: true},
                    mqtt_topic: {type: String, required: true},
                    role: {type: String, enum: ['control', 'view'], required: true, default: 'view'},
                    visualization: {type: String, enum: ['button', 'chart'], required: true, default: 'chart'},
                    chart_type: {type: String, enum: ['bar', 'progress', 'line', 'pie'], required: true, default: 'line'},
                    min: {type: Number, required: true, default:0},
                    max: {type: Number, required: true, default:100},
                    danger_min: {type: Number, required: true, default:0},
                    danger_max: {type: Number, required: true, default:100},
                    unit_symbol: {type: String},
                }
            ]
        }, {_id: false})
    ],
    
});

module.exports = mongoose.model('FarmstayConfig', FarmstayConfig);