const {
    Farmstay, Customer, RentFarmstay, FarmstayAddress,
    Equipment, FarmstayEquipment, Invoice,
    District, Ward, Province,
} = require('../../models/mysql')
const {arrayToJSON, objectToJSON} = require('../../helpers/sequelize');
const sequelize = require('sequelize');
const {Op, fn} = sequelize
const cloneDeep = require('lodash.clonedeep');
const {HttpError, } = require('../../utils/error');
const {ApiError,} = require('../../utils/apiResponse');
const moment = require('moment')

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

const getAllFarmstay = ()=>{
    return new Promise( (resolve, reject)=>{
        (async()=>{
            try {
                let farmstays = await Farmstay.findAll({
                    attributes:  { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'slug', 'manager_id', 'id'] },
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
                        }
                    ],
                    where: {
                        '$rental_info.id$':{
                            [Op.is]: null
                        }
                    }
                    
                });
                const farmstaysResponse = []
                if(Array.isArray(farmstays)){
                    farmstays = arrayToJSON(farmstays)
                    for (const farmstay of farmstays) {
                        farmstaysResponse.push(transformFarmstayData(farmstay))
                    }
                }
                resolve(farmstaysResponse);
            } catch (error) {
                reject(error)
            }
        })();
    })
}

const getFarmstayByUuid = (uuid)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const farmstay = await Farmstay.findOne({
                    attributes:  { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'slug', 'manager_id',] },
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
                        },
                        
                    ],
                    where: {
                        [Op.and]: {
                            '$Farmstay.uuid$': uuid,
                            '$rental_info.id$':{
                                [Op.is]: null
                            }
                        }
                    }
                });
                if(!farmstay){
                    throw new HttpError({statusCode: 404, respone: new ApiError({message: 'Farmstay not found'})})
                }
                
                const {id:farm_id} = farmstay;
                let farmstayEquipments = await FarmstayEquipment.findAll({
                    where: {farm_id},
                    include: [{
                        model: Equipment,
                        attributes: ['name', 'rent_cost', 'images'],
                        as: 'is_equipment'
                    }],
                    attributes: [ 'equipment_id',[sequelize.fn('count', sequelize.col('equipment_id')), 'quantity']],
                    group: ['equipment_id']
                });
                
                const farmstayResponse = objectToJSON(farmstay);
                farmstayEquipments = arrayToJSON(farmstayEquipments);
                const farmstayEquipmentResponse = farmstayEquipments.map(equipment=>{
                    const {quantity, is_equipment:{name, rent_cost, images}} = equipment;
                    return {name, rent_cost, quantity, image:images.url}
                })
                Object.assign(farmstayResponse, {equipments: farmstayEquipmentResponse})
                resolve(transformFarmstayData(farmstayResponse))
            } catch (error) {
                reject(error)
            }
        })();
    })
}

const handleUserRentFarmstay = (farmUuid, customer)=>{
    return new Promise((resolve, reject)=>{
       (async()=>{
            try {
                const farmstay = await Farmstay.findOne({
                    attributes:  ['id','rent_cost_per_day'],
                    where: {uuid: farmUuid},
                });
                if(customer && farmstay){
                    const { id:farm_id} = farmstay;
                    const rentFarmstay = await RentFarmstay.create({
                        customer_id: customer.id, 
                        farm_id, 
                        rented_at: Date.now(),
                        is_rented: true
                    })

                    resolve(objectToJSON(rentFarmstay))
                }else{
                    throw new HttpError({statusCode: 404, respone: new ApiError({message: 'Farmstay not found'})})
                }
            } catch (error) {
                reject(error)
            }
       })();
    })
}

const handleCreatePaymentURL = (farmUuid, customer, date)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const farmstay = await Farmstay.findOne({
                    attributes:  ['id','rent_cost_per_day', 'uuid'],
                    where: {uuid: farmUuid},
                });
                if(customer && farmstay){
                    const { id:farm_id, uuid, rent_cost_per_day} = farmstay;
                    const vnpTxnRef =  `${moment(date).format('DDHHmmss')}_${uuid}`;
                    const rentFarmstay = await RentFarmstay.create({
                        customer_id: customer.id, 
                        farm_id, 
                        rented_at: Date.now(),
                        is_rented: false,
                        vnp_txnref: vnpTxnRef,
                        deposit_amount: rent_cost_per_day
                    })
                    
                    
                    if(!rentFarmstay){
                        throw new HttpError({statusCode: 403, respone: new ApiError({message: 'Farmstay error'})})
                    }
    
                    
                    const {vnp_txnref} = rentFarmstay
    
                    setTimeout(async()=>{
                        try {
                            console.log({farm_id, customer_id: customer.id})
                            const rentFarmstayExpired = await RentFarmstay.findOne({
                                where: {
                                    farm_id, customer_id: customer.id
                                }
                            })
                            
                            if(rentFarmstayExpired && !rentFarmstayExpired['is_deposit']){
                                console.log('cút')
                                rentFarmstayExpired.destroy({});
                            }
                        } catch (error) {
                            
                        }
                    }, 1000*60*15)
                    resolve({vnpTxnRef: vnp_txnref,rentCost: rent_cost_per_day})
                }else{
                    throw new HttpError({statusCode: 404, respone: new ApiError({message: 'Farmstay not found'})})
                }
            } catch (error) {
                reject(error)
            }
        })();
    })
}

const handleCheckPaymentDeposit = (customer, vnpTxnRef, amount, responeCode)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                if(customer){
                    // const { id:farm_id} = farmstay;
                    const rentFarmstay = await RentFarmstay.findOne({
                        where:{
                            customer_id: customer.id, 
                            vnp_txnref: vnpTxnRef,
                            deposit_amount: amount
                        }
                    })
                    if(responeCode === '00' && rentFarmstay){
                        if(!rentFarmstay['is_deposit']){
                            rentFarmstay['is_deposit'] = true;
                            rentFarmstay['is_rented'] = true;
                            await rentFarmstay.save();
                        }
                    }else{
                        if(rentFarmstay){
                            rentFarmstay.destroy();
                        }
                        
                        resolve(null)
                    }
                    resolve(objectToJSON(rentFarmstay))
                }else{
                    throw new HttpError({statusCode: 404, respone: new ApiError({message: 'Farmstay not found'})})
                }
            } catch (error) {
                reject(error)
            }
        })();
    })
}

module.exports = {
    getAllFarmstay, getFarmstayByUuid, handleUserRentFarmstay, handleCreatePaymentURL,handleCheckPaymentDeposit
}