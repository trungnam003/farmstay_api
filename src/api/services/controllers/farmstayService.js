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

function transformFarmstayData(farmstay){
    const farmstayTranform = cloneDeep(farmstay);
    const {images, address_of_farmstay} = farmstayTranform;
    const imagesResponse = Array.from(images).map(image=>image.url);

    const {specific_address, embedded_link, link, ward} = address_of_farmstay;
    const {district, district: province} = ward;

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
    return new Promise(async (resolve, reject)=>{
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
    })
}

const getFarmstayByUuid = (uuid)=>{
    return new Promise(async (resolve, reject)=>{
        try {
            const farmstay = await Farmstay.findOne({
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
            const farmstayResponse = objectToJSON(farmstay);
            
            resolve(transformFarmstayData(farmstayResponse))
        } catch (error) {
            reject(error)
        }
    })
}

const handleUserRentFarmstay = (farmUuid, customer)=>{
    return new Promise(async(resolve, reject)=>{
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
    })
}

module.exports = {
    getAllFarmstay, getFarmstayByUuid, handleUserRentFarmstay
}