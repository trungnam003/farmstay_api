const {HttpError, }             = require('../utils/error');
const {ApiError, ApiSuccess}    = require('../utils/apiResponse');
const {getAllFarmstay, 
    getFarmstayByUuid, 
    handleUserRentFarmstay}     = require('../services/controllers/farmstayService')


class FarmstayController{
    async getAllFarmstay(req, res, next){
        try {
            const farmstays = await getAllFarmstay();
            const responseAPI = new ApiSuccess({  
                data: farmstays
            })
            res.status(200).json(responseAPI)
            
        } catch (error) {
            next(error)
        }
    }

    async getFarmstayByUuid(req, res, next){
        try {
            const {uuid} = req.params
            const farmstay = await getFarmstayByUuid(uuid)
            if(farmstay){
                
                const responseAPI = new ApiSuccess({
                    data: farmstay
                })
                res.status(200).json(responseAPI)
            }else{
                const responseAPI = new ApiError({})
                return next(new HttpError({statusCode: 403, respone: responseAPI}))
            }
        } catch (error) {
            next(error)
        }
    }

    async handleUserRentFarmstayByUuid(req, res, next){
        try {
            const {customer} = req;
            const {uuid} = req.params
            try {
                const rentFarmstay = await handleUserRentFarmstay(uuid, customer);
                if(rentFarmstay){
                    const responseAPI = new ApiSuccess({})
                    res.status(200).json(responseAPI)
                }else{
                    throw new Error()
                }
            } catch (error) {
                const responseAPI = new ApiError({})
                return next(new HttpError({statusCode: 400, respone: responseAPI}))
            }
        } catch (error) {
            next(error)
        }
    }

    // async createPaymentFarmstay(req, res, next){
    //     try {
    //         const {customer} = req;
    //         const {uuid} = req.params;

    //         const rentFarmstay = await RentFarmstay.findOne({
    //             attributes: ['id', 'farm_id', 'rented_at', 'is_rented'],
    //             include: [
    //                 {
    //                     model: Farmstay,
    //                     attributes: ['rent_cost_per_day',],
    //                     as: 'farmstay',
    //                     required: true,
    //                     include: [
    //                         {
    //                             model: FarmstayEquipment,
    //                             attributes: ['equipment_id'],
    //                             as: 'list_equipment',
    //                             required: true,
                                
    //                             include: [
    //                                 {
    //                                     model: Equipment,
    //                                     attributes: ['id','rent_cost'],
    //                                     as: 'is_equipment',
                                       
                                        
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 }
    //             ],
    //             where: {
    //                 [Op.and]: {
    //                     '$farmstay.uuid$': (uuid),
    //                 }
    //             },
    //         })
            
    //         if(rentFarmstay){
                
    //             const {
    //                 farmstay:{
    //                     rent_cost_per_day,
    //                     list_equipment
    //                 },
    //                 rented_at,
    //                 id: rented_farmstay_id
    //             } = rentFarmstay
    //             // Tính tiền thuê farm từ ngày thuê đến ngày thanh toán
    //             const now = Date.now();
    //             const date_rented = new Date(rented_at).getTime();
    //             const totalDateRentFarm = Math.floor((now-date_rented)/(24*3600*1000))
    //             const totalRentFarm =totalDateRentFarm *rent_cost_per_day;

    //             // Tính tiền thuê cảm biến
    //             let totalRentEquipment = 0;
    //             if(Array.isArray(list_equipment) && totalDateRentFarm>1){
    //                 list_equipment.forEach(equipment=>{
    //                     const { is_equipment} = equipment;
    //                     totalRentEquipment += (+is_equipment.rent_cost)
    //                 })
    //             }
    //             const totalRent = totalRentFarm+totalRentEquipment

    //             let invoice = await Invoice.findOne({where: {rented_farmstay_id}})
    //             if(invoice){
    //                 if(!invoice.paid){
    //                     invoice['canceled_at'] = now;
    //                     invoice['total_rental_cost'] = totalRent;
    //                     invoice['total_equipment_rental_cost'] = totalRentEquipment;
    //                     invoice['total_farmstay_rental_cost'] = totalRentFarm;
    //                     invoice['paid'] = false;
    //                     await invoice.save();
    //                     await invoice.reload();
    //                 }
    //             }else{
    //                 invoice = await Invoice.create({
    //                     canceled_at: now,
    //                     rented_farmstay_id,
    //                     total_rental_cost: totalRent,
    //                     total_equipment_rental_cost: totalRentEquipment,
    //                     total_farmstay_rental_cost: totalRentFarm,
    //                     paid: false,
                        
    //                 })
    //             }
    //             invoice = invoice.toJSON()
    //             invoice['rented_at'] = rented_at;
    //             delete invoice['createdAt'];
    //             delete invoice['updatedAt'];
    //             const responseAPI = new ApiSuccess({
    //                 data: invoice
    //             })
    //             res.status(200).json(responseAPI)

    //         }else{
    //             const responseAPI = new ApiError({
    //                 message: 'You haven\'t rented this farmstay',
    //             })
    //             return next(new HttpError({
    //                 statusCode: 403,
    //                 respone: responseAPI
    //             }))
    //         }
            
            
    //     } catch (error){
    //         next(error)
    //     }
    // }
}

module.exports = FarmstayController