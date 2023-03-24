const {HttpError, }                     = require('../utils/error');
const {ApiError, ApiSuccess}            = require('../utils/apiResponse');
const { getFarmstayCustomerOwn, 
        getConfigFarmstayCustomerOwn}   =require('../services/controllers/customerService')

class CustomerController{
    
    async getFarmstayOwn(req, res, next){
        try {
            const {customer} = req;
            const farmstay = await getFarmstayCustomerOwn(customer)
            const responseAPI = new ApiSuccess({
                data: farmstay,
            })
            res.status(200).json(responseAPI)
        } catch (error) {
            next(error)
        }
    }

    async getEquipmentFarmstayOwn(req, res, next){
        try {
            const {customer} = req;
            const equipmentConfig = await getConfigFarmstayCustomerOwn(customer)
            const responseAPI = new ApiSuccess({
                data: equipmentConfig,
            })
            res.status(200).json(responseAPI)

        } catch (error) {
            next(error)
        }
    }

    
}

module.exports = CustomerController;