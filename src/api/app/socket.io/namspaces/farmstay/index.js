const config = require('../../../../../config')
const jwt = require('jsonwebtoken')
const { isBlacklistedJwt } = require('../../../../helpers/redis/blacklistJwt')
const SocketIoSingleton = require('../../SocketIoSingleton')

function farmstaySocketIo(){

    const io = new SocketIoSingleton().io
    
    const farmNsp = io.of('/farmstay')

    farmNsp.use(async (socket, next) => {
        const {request:{headers}} = socket
        const headerJWT = config.jwt.jwt_header
        if(headers && headers[headerJWT]){
            const jwtFromHeader = headers[headerJWT]
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
                const err = new Error("token expired");
                next(err);
            }else if(error){
                const err = new Error("token invalid");
                next(err);
            }else if(checkTokenInBlackLlist){
                const err = new Error("token has logout");
                
                next(err);
            }else{
                const {exp} = payload;
                let connectTimeout = exp-(Math.floor((Date.now()/1000)))
                connectTimeout*=1000;
                console.log(connectTimeout)
                socket['timeExpiredConnect'] = connectTimeout;
                next();
            }

        }else{
            const err = new Error("header does not exist token")
            next(err);
        }
    });
    farmNsp.use((socket, next) => {
        if(socket['timeExpiredConnect']){
            setTimeout(()=>{
                io.of("/farmstay").in(socket.id).disconnectSockets();
            }, socket['timeExpiredConnect'])
        }
        
        next()
    });

    farmNsp.on('connection', function(socket){
        socket.emit('message', 'Wellcome Namespace')
        // Listen for the 'disconnect' event
        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
        socket.broadcast.emit("ok", "Có th lồn nào mới vô đây")
    })
    
}

module.exports = farmstaySocketIo