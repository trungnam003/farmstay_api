const {
    Farmstay, Customer, RentFarmstay, 
    Equipment, FarmstayEquipment,Invoice, 
    FarmstayAddress, District, Ward, Province}  = require('../../models/mysql')
const {FarmstayConfig, FarmstayData} = require('../../models/mongo');
const sequelize = require('sequelize');
const {Op, fn} = sequelize
const cloneDeep = require('lodash.clonedeep');
const {arrayToJSON, objectToJSON} = require('../../helpers/sequelize');
const {HttpError, } = require('../../utils/error');
const {ApiError, ApiSuccess} = require('../../utils/apiResponse');

function transformFarmstayData(farmstay){
    const farmstayTranform = cloneDeep(farmstay);
    const {images, address_of_farmstay} = farmstayTranform;
    const imagesResponse = Array.from(images).map(image=>image.url);

    const {specific_address, embedded_link, link, ward} = address_of_farmstay;
    const {district, district: {province}} = ward;
    const addressResponse = {
        specific_address, embedded_link, link,
        ward: {
            code: ward.code, name: ward.name, full_name: ward.full_name
        },
        district: {
            code: district.code, name: district.name, full_name: district.full_name
        },
        province: {
            code: province.code, name: province.name, full_name: province.full_name
        }
    }
    delete farmstayTranform.images;
    delete farmstayTranform.address_of_farmstay;
    Object.assign(farmstayTranform, {
        images:imagesResponse,
        address: addressResponse,
    })

    return farmstayTranform;
}

const getFarmstayCustomerOwn = (customer)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const farmstay = await Farmstay.findOne({
                    attributes:  { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'slug', 'manager_id'] },
                    include: [
                        {
                            model: FarmstayAddress,
                            attributes: {exclude: ['farm_id', 'code_ward', 'latitude', 'longitude']},
                            as:'address_of_farmstay',
                            include: [
                                {
                                    model: Ward,
                                    as: 'ward',
                                    attributes: ['full_name', 'name', 'code'],
            
                                    include: [
                                        {
                                            model: District,
                                            as: 'district',
                                            attributes: ['full_name', 'name', 'code'],
                                            include: [
                                                {
                                                    model: Province,
                                                    as: 'province',
                                                    attributes: ['full_name', 'name', 'code'],
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: RentFarmstay,
                            as: 'rental_info',
                            attributes: ['rented_at',],
                            where:{
                                'customer_id': customer.id
                            }
                        },
                    ],
                    
                });
                if(!farmstay){
                    throw new HttpError({statusCode: 403, respone: new ApiError({message: 'The account does not have a farmstay rental'})})
                }
                const {id:farm_id} = farmstay;
                let farmstayEquipments = await FarmstayEquipment.findAll({
                    where: {farm_id},
                    include: [{
                        model: Equipment,
                        attributes: ['name', 'rent_cost'],
                        as: 'is_equipment'
                    }],
                    attributes: [ 'equipment_id',[sequelize.fn('count', sequelize.col('equipment_id')), 'quantity']],
                    group: ['equipment_id']
                });
                const farmstayResponse = transformFarmstayData(objectToJSON(farmstay));
                farmstayEquipments = arrayToJSON(farmstayEquipments);
                const farmstayEquipmentResponse = farmstayEquipments.map(equipment=>{
                    const {quantity, is_equipment:{name, rent_cost}} = equipment;
                    return {name, rent_cost, quantity}
                })
                Object.assign(farmstayResponse, {equipments: farmstayEquipmentResponse})
                resolve(farmstayResponse)
            } catch (error) {
                reject(error)
            }
        })();
    })
}

const getConfigFarmstayCustomerOwn = (customer)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const farmstay = await Farmstay.findOne({
                    attributes:  ['id', 'uuid'],
                    include: [
                        {
                            model: RentFarmstay,
                            as: 'rental_info',
                            attributes: [],
                            required: true    
                        },
                    ],
                    where: {
                        '$rental_info.customer_id$': customer.id 
                    }
                });
                if(!farmstay){
                    throw new HttpError({statusCode: 403, respone: new ApiError({message: 'The account does not have a farmstay rental'})})
                }
                const query = FarmstayConfig.findOne({
                    farmstay_id: (farmstay['uuid'])
                }).select('-_id -equipments.equipment_fields.mqtt_topic -__v') //-equipments.equipment_fields.hardware_id
                const equipmentConfig = await query.exec()
                if(!equipmentConfig){
                    throw new HttpError({statusCode: 400, respone: new ApiError({message: 'Farmstay config not found'})})
                }
                resolve(equipmentConfig)
            } catch (error) {
                reject(error)
            }
        })();
    })
}

const getFieldEquipmentFarmstay = (customer)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const farmstay = await Farmstay.findOne({
                    attributes:  ['id', 'uuid'],
                    include: [
                        {
                            model: RentFarmstay,
                            as: 'rental_info',
                            attributes: [],
                            required: true    
                        },
                    ],
                    where: {
                        '$rental_info.customer_id$': customer.id 
                    }
                });
                if(!farmstay){
                    throw new HttpError({statusCode: 403, respone: new ApiError({message: 'The account does not have a farmstay rental'})})
                }
                const query = FarmstayConfig.findOne({
                    farmstay_id: (farmstay['uuid'])
                }).select('-_id -equipments.equipment_fields.mqtt_topic -__v')
                const equipmentConfig = await query.exec()
                
                if(!equipmentConfig){
                    throw new HttpError({statusCode: 400, respone: new ApiError({message: 'Farmstay config not found'})})
                }
                const {equipments} = equipmentConfig;
                const fields = Array.from(equipments).reduce((prev, curr)=>{
                    const {equipment_fields} = curr;
                    const fields = [];
                    for (let field of equipment_fields) {
                        fields.push({...field.toJSON(), farmstay_id: (farmstay['uuid'])})
                    }
                    
                    return [...prev, ...fields]
                }, [])
                // console.log(fields)
                resolve(fields)
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })();
    })
}

const handleGetLatestDataInField = (customer, fieldName)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const farmstay = await Farmstay.findOne({
                    attributes:  ['id', 'uuid'],
                    include: [
                        {
                            model: RentFarmstay,
                            as: 'rental_info',
                            attributes: [],
                            required: true    
                        },
                    ],
                    where: {
                        '$rental_info.customer_id$': customer.id 
                    }
                });
                if(!farmstay){
                    throw new HttpError({statusCode: 403, respone: new ApiError({message: 'The account does not have a farmstay rental'})})
                }
                const query = FarmstayConfig.findOne({
                    farmstay_id: (farmstay['uuid'])
                }).select('-_id -equipments.equipment_fields.mqtt_topic -__v')
                const equipmentConfig = await query.exec()
                
                if(!equipmentConfig){
                    throw new HttpError({statusCode: 400, respone: new ApiError({message: 'Farmstay config not found'})})
                }
                const {equipments} = equipmentConfig;
                let hardwareId = null;
                for (const equipment of equipments) {
                    const {equipment_fields} = equipment;
                    const fieldMatch = Array.from(equipment_fields).find((field)=>{
                        const {field_name} = field;
                        return field_name === fieldName;
                    })
                    if(fieldMatch){
                        hardwareId = fieldMatch.hardware_id;
                        break;
                    }
                }
                if(hardwareId){
                    const datas = await FarmstayData.aggregate([
                        { $match: { farmstay_id: farmstay['uuid'], hardware_id: hardwareId+''} }, 
                        { $unwind: `$equipments_data` }, 
                        { $sort: { [`equipments_data.timestamp`]: -1 } }, 
                        { $limit: 30 },
                        { $group: { _id: null, [`data`]: { $push: `$equipments_data` } } } 
                    ]).exec()
    
                    // format data
                    if(datas[0] && Array.isArray(datas[0].data)){
                        const dataRes = datas[0].data.map((data)=>{
                            const {value, timestamp} = data;
                            
                            return {
                                value, 
                                timestamp: new Date(timestamp).getTime()
                            }
    
                        })
                        resolve(dataRes.reverse())
                    }else{
                        resolve([])
                        
                    }
                    
                }else{
                    throw new HttpError({statusCode: 404,})
                }
                
            } catch (error) {
                reject(error)
            }
        })();
    })
}
module.exports = {
    getFarmstayCustomerOwn, getConfigFarmstayCustomerOwn, getFieldEquipmentFarmstay, handleGetLatestDataInField
}