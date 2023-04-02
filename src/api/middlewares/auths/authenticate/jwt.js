
const {User, sequelize}                         = require('../../../models/mysql');
const {HttpError, }                             = require('../../../utils/error');
const {ApiError}                                = require('../../../utils/apiResponse');
const config                                    = require('../../../../config')
const jwt                                       = require('jsonwebtoken')
const { isBlacklistedJwt }                      = require('../../../helpers/redis/blacklistJwt')
const {verifyJwt}                               = require('../../../services/jwt');
const {AUTHENTICATE} = require('../../../constants/errors')

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
                return next(new HttpError({statusCode: 401, respone: new ApiError({
                    message: 'Header does not contain authenticate token',
                    error: AUTHENTICATE.HEADER_NO_TOKEN
                })}));
            }
            let checkTokenInBlackLlist;
            // Xác thực jwt
            const payload = await verifyJwt(jwtFromHeader);
            checkTokenInBlackLlist = await isBlacklistedJwt(payload.jwt_id);
            
            if(checkTokenInBlackLlist){
                return next(new HttpError({statusCode: 401, respone: new ApiError({
                    message: 'Token has been logged out',
                    error: AUTHENTICATE.TOKEN_LOGGED_OUT
                })}));
            }
            
            const username = payload.sub;
            const user = await User.findOne({
                where:{username},
            });
            if(!user){
                return next(new HttpError({statusCode: 401, respone: new ApiError({
                    message: 'Account does not exist',
                    error: AUTHENTICATE.ACCOUNT_NOT_EXIST
                    
                })}));
            }else{
                const {changed_password_at} = user;
                const {iat} = payload;
                const checkOldToken = Math.trunc(Date.parse(changed_password_at)/1000) > iat;
                if(checkOldToken){
                    return next(new HttpError({statusCode: 401, respone: new ApiError({
                        message: 'This token is old, you have changed the password',
                        error: AUTHENTICATE.TOKEN_IS_OLD
                    })}));
                }else{
                    req.user = user;
                    req.jwtPayload = payload
                    return next();
                }
            
                
            }
        } catch (error) {
            if(error instanceof jwt.TokenExpiredError){
                return next(new HttpError({statusCode: 401, respone: new ApiError({
                    message: 'Token expired',
                    error: AUTHENTICATE.TOKEN_EXPIRED
                })}));
            }else if(error){
                // Nếu có lỗi khác thì next cho các middleware xử lí lỗi của jwt
                return next(error);
            }
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