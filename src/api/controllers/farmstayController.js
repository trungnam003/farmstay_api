require('dotenv').config();
const {HttpError, }             = require('../utils/error');
const {ApiError, ApiSuccess}    = require('../utils/apiResponse');
const {getAllFarmstay, 
    getFarmstayByUuid, 
    handleUserRentFarmstay,
    handleCreatePaymentURL,
    handleCheckPaymentDeposit
}     = require('../services/controllers/farmstayService')

const moment = require('moment')
const config = require('../../config')

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const VNP_CODE = {
    '00': 'Giao dịch thành công',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
    '99': 'Lỗi bất định'

}
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

    // async handleUserRentFarmstayByUuid(req, res, next){
    //     try {
    //         const {customer} = req;
    //         const {uuid} = req.params
    //         try {
    //             const rentFarmstay = await handleUserRentFarmstay(uuid, customer);
    //             if(rentFarmstay){
    //                 const responseAPI = new ApiSuccess({})
    //                 res.status(200).json(responseAPI)
    //             }else{
    //                 throw new Error()
    //             }
    //         } catch (error) {
    //             const responseAPI = new ApiError({})
    //             return next(new HttpError({statusCode: 400, respone: responseAPI}))
    //         }
    //     } catch (error) {
    //         next(error)
    //     }
    // }

    async createPaymentURL(req, res, next){
        try {
            const {uuid} = req.params;
            const {customer} = req;
            const {bank_code: bankCode,  language, return_url} = req.body
            const  date = new Date();
            const createDate = moment(date).format('YYYYMMDDHHmmss');

            const {vnpTxnRef, rentCost} = await handleCreatePaymentURL(uuid, customer, date);
            
            process.env.TZ = 'Asia/Ho_Chi_Minh';
            
            
            const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

            let tmnCode = config.payment_vnp.vnp_TmnCode
            let secretKey = config.payment_vnp.secret_key
            let vnpUrl = config.payment_vnp.vnp_url
            let returnUrl = return_url
            let orderId = vnpTxnRef;
            
            let locale = language
            if(locale === null || locale === ''){
                locale = 'vn';
            }
            let currCode = 'VND';
            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = rentCost * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            if(bankCode !== null && bankCode !== ''){
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            vnp_Params = sortObject(vnp_Params);

            let querystring = require('qs');
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let crypto = require("crypto");     
            let hmac = crypto.createHmac("sha512", secretKey);
            let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
            const responseAPI = new ApiSuccess({data: vnpUrl})
            res.status(200).json(responseAPI)
            

        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async checkUserPayment(req, res, next){
        try {
            let vnp_Params = req.body
            // const {uuid} = req.params;
            const {customer} = req;
            
            const secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];
            vnp_Params = sortObject(vnp_Params);
            // const tmnCode = config.payment_vnp.vnp_TmnCode;
            const secretKey = config.payment_vnp.secret_key;

            const querystring = require('qs');
            let signData = querystring.stringify(vnp_Params, { encode: false });
            let crypto = require("crypto");     
            let hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            vnp_Params['vnp_Amount'] = parseInt(vnp_Params['vnp_Amount'])/100

            if(signed === secureHash){
                const rentFarmstay = await handleCheckPaymentDeposit(customer, vnp_Params['vnp_TxnRef'],vnp_Params['vnp_Amount'], vnp_Params['vnp_ResponseCode'])
                if(rentFarmstay==null){
                    const responseAPI = new ApiError({message: VNP_CODE[vnp_Params['vnp_ResponseCode']]})
                    return next(new HttpError({statusCode: 400, respone: responseAPI}))
                }
                const responseAPI = new ApiSuccess({
                    data: rentFarmstay,
                    object: {message: VNP_CODE[vnp_Params['vnp_ResponseCode']]}
                })
                
                res.status(200).json(responseAPI)
            }else{
                const responseAPI = new ApiError({message: "Mã xác nhận không chính xác"})
                return next(new HttpError({statusCode: 400, respone: responseAPI}))
            }
        } catch (error) {
            console.log(error)
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