const config = require('../../config');
const {Farmstay, Customer, RentFarmstay, Equipment, FarmstayEquipment, Invoice }       = require('../models/mysql')
const sequelize = require('sequelize');
const {HttpError, } = require('../utils/error');
const ResponseAPI = require('../utils/api_response');
const {Op, fn} = sequelize


class FarmstayController{
    async getAllFarmstay(req, res, next){
        try {
            
            const farmstays = await Farmstay.findAll({
                attributes:  { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'slug', 'manager_id', 'id'] },
                include: [
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
            
                
            const responseAPI = new ResponseAPI({
                msg: 'Successfully',
                msg_vi: 'Thành công',
                object: {
                    data: farmstays
                }
            })
            res.status(200).json(responseAPI)
            
        } catch (error) {
            next(error)
        }
    }

    async getFarmstayByUuid(req, res, next){
        try {
            const {uuid} = req.params
            const farmstay = await Farmstay.findOne({
                attributes:  { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'slug', 'manager_id', 'id'] },
                include: [
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
            
            if(farmstay){
                
                const responseAPI = new ResponseAPI({
                    msg: 'Successfully',
                    msg_vi: 'Thành công',
                    object: {
                        data: farmstay
                    }
                })
                res.status(200).json(responseAPI)
            }else{
                const responseAPI = new ResponseAPI({
                    msg: 'Unsuccessfully',
                    msg_vi: 'Không thành công',
                    object: {
                        data: null
                    }
                })
                return next(new HttpError({statusCode: 403, respone: responseAPI}))

            }
        } catch (error) {
            next(error)
        }
    }

    async handleUserRentFarmstayByUuid(req, res, next){
        try {
            const {id:user_id} = req.user;
            const {uuid} = req.params
            const [farmstay, customer] = await Promise.all([
                Farmstay.findOne({
                    attributes:  ['id','rent_cost_per_day'],
                    where: {uuid:(uuid)},
                }),
                Customer.findOne({where: {user_id}})
            ]);
            
            if(customer && farmstay){
                try {
                    const { id:farm_id} = farmstay;
                    await RentFarmstay.create({
                        customer_id: customer.id, 
                        farm_id, 
                        rented_at: Date.now(),
                        is_rented: true
                    })
                    const responseAPI = new ResponseAPI({
                        msg: 'Successfully',
                        msg_vi: 'Thành công',
                    })
                    res.status(200).json(responseAPI)
                } catch (error) {
                    const responseAPI = new ResponseAPI({
                        msg: 'Unsuccessfully',
                        msg_vi: 'Không thành công',
                    })
                    return next(new HttpError({statusCode: 400, respone: responseAPI}))
                }
            }else{
                const responseAPI = new ResponseAPI({
                    msg: 'Unsuccessfully',
                    msg_vi: 'Không thành công',
                })
                return next(new HttpError({statusCode: 400, respone: responseAPI}))
            }

            
        } catch (error) {
            next(error)
        }
    }

    async createPaymentFarmstay(req, res, next){
        try {
            const {id:user_id} = req.user;
            const {uuid} = req.params;

            const customerRentFarm = await Customer.findOne({
                attributes: ['user_id'],
                include: [
                    {
                        model: RentFarmstay,
                        attributes: ['id', 'farm_id', 'rented_at', 'is_rented'],
                        as: 'rental_info',
                        requried: true,
                        include: [
                            {
                                model: Farmstay,
                                attributes: ['rent_cost_per_day',],
                                as: 'farmstay',
                                required: true,
                                include: [
                                    {
                                        model: FarmstayEquipment,
                                        attributes: ['equipment_id'],
                                        as: 'list_equipment',
                                        required: true,
                                        
                                        include: [
                                            {
                                                model: Equipment,
                                                attributes: ['id','rent_cost'],
                                                as: 'is_equipment',
                                               
                                                
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: {
                    [Op.and]: {
                        '$Customer.user_id$': user_id,
                        '$rental_info->farmstay.uuid$': (uuid),
                    }
                },
                
            })
            
            if(customerRentFarm && customerRentFarm['rental_info']){
                
                const {rental_info:{
                    farmstay:{
                        rent_cost_per_day,
                        list_equipment
                    },
                    rented_at,
                    id: rented_farmstay_id
                }} = customerRentFarm
                // Tính tiền thuê farm từ ngày thuê đến ngày thanh toán
                const now = Date.now();
                const date_rented = new Date(rented_at).getTime();
                const totalDateRentFarm = Math.floor((now-date_rented)/(24*3600*1000))
                const totalRentFarm =totalDateRentFarm *rent_cost_per_day;

                // Tính tiền thuê cảm biến
                let totalRentEquipment = 0;
                if(Array.isArray(list_equipment) && totalDateRentFarm>1){
                    list_equipment.forEach(equipment=>{
                        const { is_equipment} = equipment;
                        totalRentEquipment += (+is_equipment.rent_cost)
                    })
                }
                const totalRent = totalRentFarm+totalRentEquipment

                let invoice = await Invoice.findOne({where: {rented_farmstay_id}})
                if(invoice){
                    if(!invoice.paid){
                        invoice['canceled_at'] = now;
                        invoice['total_rental_cost'] = totalRent;
                        invoice['total_equipment_rental_cost'] = totalRentEquipment;
                        invoice['total_farmstay_rental_cost'] = totalRentFarm;
                        invoice['paid'] = false;
                        await invoice.save();
                        await invoice.reload();
                    }
                }else{
                    invoice = await Invoice.create({
                        canceled_at: now,
                        rented_farmstay_id,
                        total_rental_cost: totalRent,
                        total_equipment_rental_cost: totalRentEquipment,
                        total_farmstay_rental_cost: totalRentFarm,
                        paid: false,
                        
                    })
                }
                invoice = invoice.toJSON()
                invoice['rented_at'] = rented_at;
                delete invoice['createdAt'];
                delete invoice['updatedAt'];
                const responseAPI = new ResponseAPI({
                    msg: 'Successfully',
                    msg_vi: 'Thành công',
                    object: {
                        data: invoice
                    }
                })
                
                res.status(200).json(responseAPI)

            }else{
                const responseAPI = new ResponseAPI({
                    msg: 'You haven\'t rented this farmstay',
                    msg_vi: 'Bạn chưa thuê farmstay này',
                })
                return next(new HttpError({
                    statusCode: 403,
                    respone: responseAPI
                }))
            }
            
            
        } catch (error) {
            next(error)
        }
    }
}

module.exports = FarmstayController