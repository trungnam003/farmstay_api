
const {User, sequelize}       = require('../../../models/mysql');
const {HttpError, } = require('../../../utils/error');
const ResponseAPI = require('../../../utils/api_response');
const config = require('../../../../config')
const jwt = require('jsonwebtoken')
const { isBlacklistedJwt } = require('../../../helpers/redis/blacklist_jwt')
function getJwtFromHeader(req, headerName){
    let token = null;
    if(req && req.headers){
        token = req.headers[headerName];   
    }
    return token;
}

const verifyJwtFromHeader = function({isRequired=true}={}){
    
    return async function(req, res, next){
        
        try {
            const jwtFromHeader = getJwtFromHeader(req, config.jwt.jwt_header);
            
            if(!jwtFromHeader){
                if(!isRequired){
                    return next();
                }
                return next(new HttpError({statusCode: 401, respone: new ResponseAPI({
                    msg: 'Header does not contain authenticate token',
                    msg_vi: 'Tiêu đề không chứa mã thông báo xác thực',
                    object: {
                        status_verify_jwt: false
                    }
                })}));
            }
            let error, payload, checkTokenInBlackLlist;
            // Xác thực jwt
            jwt.verify(jwtFromHeader, config.secret_key.jwt,{ issuer: config.jwt.issuer }, (err, decode)=>{
                error = err;
                payload = decode
            })
            if(!error){
                checkTokenInBlackLlist = await isBlacklistedJwt(payload.jwt_id);
            }
            
            if(error instanceof jwt.TokenExpiredError){
                return next(new HttpError({statusCode: 401, respone: new ResponseAPI({
                    msg: 'Token expired',
                    msg_vi: 'Token hết hạn',
                    object: {
                        status_verify_jwt: false
                    }
                })}));
            }else if(error){
                // Nếu có lỗi khác thì next cho các middleware xử lí lỗi của jwt
                return next(error);
            }else if(checkTokenInBlackLlist){
                return next(new HttpError({statusCode: 401, respone: new ResponseAPI({
                    msg: 'Token has been logged out',
                    msg_vi: 'Token đã được đăng xuất',
                    object: {
                        status_verify_jwt: false
                    }
                })}));
            }
            
            const username = payload.sub;
            const user = await User.findOne({
                where:{username},
            });
            if(!user){
                return next(new HttpError({statusCode: 401, respone: new ResponseAPI({
                    msg: 'Account does not exist',
                    msg_vi: 'Tài khoản không tồn tại',
                    object: {
                        status_verify_jwt: false
                    }
                })}));
            }else{
                req.user = user;
                req.jwt_payload = payload
                return next();
            }
        } catch (error) {
            return next(error);
        }
        
    }
}
// const refeshJWT = async function(req, res, next){
//     try {
//         if(req.refesh === true){
//             delete req.refesh;
            
//             const jwtRefeshFromHeader = getJwtFromHeader(req, config.jwt.jwt_refesh_header);
//             if(jwtRefeshFromHeader === null){
//                 return next(new HttpError({statusCode: 401}))
//             }
            
//             let err_rf, payload_rf;
//             // Xác thực jwt refesh
//             jwt.verify(jwtRefeshFromHeader, config.secret_key.jwt_refesh,{ issuer: config.jwt.issuer}, (err, decode)=>{
//                 err_rf = err;
//                 payload_rf = decode
//             });

//             if(err_rf){
//                 // Nếu có lỗi thì yêu cầu đăng nhập lại
//                 return next(new HttpError({statusCode: 401}))
//             }else{
                
//                 // Lấy user từ payload của jwt refesh
//                 const {sub} = payload_rf
//                 const username = sub;
                
//                 const user = await User.findOne({
//                     where:{username},
//                 });
//                 // kiểm tra user có lưu refesh token giống với token trên cookie không
//                 if(user.refesh_token == jwtRefeshFromHeader){
//                     // Nếu hợp lệ tạo jwt mới và tiếp tục đăng nhập
//                     req.user = user;
//                     const JWT = jwt.sign({
//                         sub: user.username,
//                     }, config.secret_key.jwt , {expiresIn: config.jwt.exp, issuer:config.jwt.issuer})
//                     res.header(config.jwt.jwt_header, JWT);
//                     return next();
//                 }else{
//                     return next(new HttpError({statusCode: 401}))
//                 }
//             }
//         }else{
//             next();
//         }
//     } catch (error) {
//         return next(error);
//     }
// }

module.exports.authenticateJWT = verifyJwtFromHeader