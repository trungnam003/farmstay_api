const config = require('../../config');
const {Farmstay, Customer, RentFarmstay, Equipment, FarmstayEquipment, Invoice, FarmstayAddress 
, District, Ward, Province}       = require('../models/mysql')
const {FarmstayConfig, FarmstayData} = require('../models/mongo');

const sequelize = require('sequelize');
const {HttpError, } = require('../utils/error');
const ResponseAPI = require('../utils/api_response');

const {Op, fn} = sequelize
const {uuidToString, uuidStringToBuffer} = require('../utils/uuid');
const {SocketIoSingleton} = require('../app/socket.io');
const openConnectSocketFarmstayUuid = require('../app/socket.io/namspaces/farmstay_uuid');
const {arrayToJSON, objectToJSON} = require('../helpers/sequelize');

class CustomerController{
    
    async getFarmstayOwn(req, res, next){
        try {
            const {id:user_id} = req.user;
            const customer = await Customer.findOne({
                attributes: ['id'],
                where: {user_id}
            })
            
            const farmstay = await Farmstay.findOne({
                attributes:  { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'slug', 'manager_id'] },
                
                include: [
                    {
                        model: FarmstayAddress,
                        attributes: {exclude: ['farm_id', 'code_ward']},
                        as:'address_of_farmstay',
                        include: [
                            {
                                model: Ward,
                                as: 'ward',
                                attributes: ['name'],

                                include: [
                                    {
                                        model: District,
                                        as: 'district',
                                        attributes: ['name'],
                                        include: [
                                            {
                                                model: Province,
                                                as: 'province',
                                                attributes: ['name'],
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
            const {id:farm_id} = farmstay;
            const farmstayEquipment = await FarmstayEquipment.findAll({
                where: {farm_id},
                include: [{
                    model: Equipment,
                    attributes: ['name', 'rent_cost'],
                    as: 'is_equipment'
                }],
                attributes: [ 'equipment_id',[sequelize.fn('count', sequelize.col('equipment_id')), 'quantity']],
                group: ['equipment_id']
            })
            let farmRes = null;
            if(farmstay){
                const farmstayObject = objectToJSON(farmstay)
                const {address_of_farmstay:{
                        ward:{
                            name:ward_name,
                            district:{name: district_name,
                                province:{
                                    name: province_name
                                }
                            }
                            
                        }
                    }
                } = farmstayObject;
                delete farmstayObject.address_of_farmstay.ward;
                Object.assign(farmstayObject.address_of_farmstay, {ward_name, district_name, province_name})
                farmRes = { ...farmstayObject,list_equipment: arrayToJSON(farmstayEquipment)};
                
            }
            const responseAPI = new ResponseAPI({
                msg: 'Successfully',
                msg_vi: 'Thành công',
                object: {
                    data: farmRes,
                    
                }
            })
            
            res.status(200).json(responseAPI)
            
        } catch (error) {
            
            next(error)
        }
    }

    async getEquipmentFarmstayOwn(req, res, next){
        try {
            const {id:user_id} = req.user;
            const customer = await Customer.findOne({
                attributes: ['id'],
                where: {user_id}
            })
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

            const query = FarmstayConfig.findOne({
                farmstay_id: (farmstay['uuid'])
            }).select('-_id -equipments.equipment_fields.mqtt_topic -equipments.equipment_fields.hardware_id -__v')
            const equipmentConfig = await query.exec()
            const responseAPI = new ResponseAPI({
                msg: 'Successfully',
                msg_vi: 'Thành công',
                object: {
                    data: equipmentConfig,
                }
            })
            res.status(200).json(responseAPI)

        } catch (error) {
            
            next(error)
        }
    }

    async openConnectSocketIo(req, res, next){
        try {
            const {id:user_id} = req.user;
            const customer = await Customer.findOne({
                attributes: ['id'],
                where: {user_id}
            })
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
            if(farmstay){
                const io = new SocketIoSingleton().io;
                let namespaceSocketFarmstay = null;
                for (const nsp of io._nsps.keys()) {
                    if(nsp === `/farmstay/${uuidToString(farmstay['uuid'])}`){
                        namespaceSocketFarmstay = nsp;
                        break;
                    }
                }
                if(namespaceSocketFarmstay){
                    const responseAPI = new ResponseAPI({
                        msg: 'Connection is open',
                        msg_vi: 'Kết nối đang được mở',
                        object: {
                            socket_url: namespaceSocketFarmstay
                        }
                    })
                    res.status(200).json(responseAPI)
                    
                }else{
                    namespaceSocketFarmstay = `farmstay/${uuidToString(farmstay['uuid'])}`
                    openConnectSocketFarmstayUuid(uuidToString(farmstay['uuid']));
                    const responseAPI = new ResponseAPI({
                        msg: 'Connection opened successfully ',
                        msg_vi: 'Kết nối đã được mở thành công',
                        object: {
                            socket_url: namespaceSocketFarmstay
                        }
                    })
                    res.status(200).json(responseAPI)
                }
            }else{
                const responseAPI = new ResponseAPI({
                    msg: 'You haven\'t rent farmstay',
                    msg_vi: 'Bạn chưa thuê farmstay',
                })
                next(new HttpError({
                    statusCode: 403,
                    respone: responseAPI
                }))
            }
            
            
        } catch (error) {
            next(error)
        }
    }
}

module.exports = CustomerController;