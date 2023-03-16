const config = require('../../../../../config')
const jwt = require('jsonwebtoken')
const { isBlacklistedJwt } = require('../../../../helpers/redis/blacklist_jwt')
const SocketIoSingleton = require('../../SocketIoSingleton')
const {FarmstayConfig} = require('../../../../models/mongo')
const {Farmstay, RentFarmstay, Customer, User} = require('../../../../models/mysql')
const subscribeMqttFarmstay = require('../../../mqtt');
const {saveSocketEventFields} = require('../../../redis/socketioCache')

async function authenticateSocket(socket, next){
    try {
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
                const {exp, sub:username} = payload;

                const user = await User.findOne({
                    where:{username},
                });
                if(!user){
                    const err = new Error("account does not exist");
                    next(err);
                }else{
                    let connectTimeout = exp-(Math.floor((Date.now()/1000)))
                    connectTimeout*=1000;
                    console.log(connectTimeout)
                    socket['timeExpiredConnect'] = connectTimeout;
                    socket['user'] = user;
                    return next();
                }
            }
        }else{
            const err = new Error("header does not exist token")
            next(err);
        }
    } catch (error) {
        next(new Error("something went wrong"));
    }
}

function setTimeOutSocketIo(io){
    return function(socket, next){
        if(socket['timeExpiredConnect']){
            setTimeout(()=>{
                io.of("/farmstay").in(socket.id).disconnectSockets();
            }, socket['timeExpiredConnect'])
        }
        next()
    }
}
async function getFarmstayOwnByUserId(socket, next){
    try {
        const {id:user_id} = socket['user'];
        const customer = await Customer.findOne({
            attributes: ['id'],
            where: {user_id}
        })
        const farmstay = await Farmstay.findOne({
            attributes: ['uuid'],
            include: [
                {
                    model: RentFarmstay,
                    as: 'rental_info',
                    attributes: [ 'is_rented'],
                    required: true
                },
            ],
            where:{
                '$rental_info.customer_id$': customer.id
            }
            
        });
        if(farmstay && farmstay['rental_info'] && farmstay['rental_info']['is_rented']){
            socket['farmstayRoom'] = farmstay['uuid']
            return next();
        }else{
            return next(new Error("forbiden"));
        }
        
    } catch (error) {
        next(new Error("something went wrong"));
    }
}

async function getEventFieldFarmstay(socket, next){
    try {
        const uuid = socket['farmstayRoom'];
        const query = FarmstayConfig.findOne({
            farmstay_id: uuid
        },{
            'equipments.equipment_fields.field_name': true,
            'equipments.equipment_fields.hardware_id': true,

            _id: false
        }
        );
        const {equipments} = await query.exec()
        let obj = {}
        Array.from(equipments).forEach(equipment=>{
            const {equipment_fields} = equipment;
            Array.from(equipment_fields).forEach(field=>{
                const {hardware_id,field_name } = field;
                obj = {...obj, [hardware_id]: field_name}
            })
        })
        await saveSocketEventFields(obj);
        socket.join(socket['farmstayRoom']);
        next();
    } catch (error) {
        console.log(error)
        next(new Error("something went wrong"));
    }
}

function farmstayRoomSocketIo(){
    const io = new SocketIoSingleton().io
    subscribeMqttFarmstay()
    const farmNsp = io.of('/farmstay')
    farmNsp.use(authenticateSocket);
    farmNsp.use(setTimeOutSocketIo(io));
    farmNsp.use(getFarmstayOwnByUserId);
    farmNsp.use(getEventFieldFarmstay);

    farmNsp.on('connection', function(socket){
        // socket.use((message, next)=>{
        //     console.log(message)
        //     return next()
        // })
        socket.on('subscribe', (uuidRoom)=>{
            try{
                console.log('[socket]','join room :',uuidRoom)
                socket.join(uuidRoom);
                socket.emit('message', uuidRoom);
            }catch(e){
                console.log('[error]','join room :',e);
                socket.emit('error','couldnt perform requested action');
            }
        })
        socket.on('unsubscribe',function(room){  
            try{
                console.log(socket.rooms instanceof Set)
                console.log('[socket]','leave room :', room);
                socket.leave(room);
                socket.emit('message', 'Cút khỏi room');
                socket.to(room).emit('message', 'Cút khỏi room');
            }catch(e){
                console.log('[error]','leave room :', e);
                socket.emit('error','couldnt perform requested action');
            }
        })
        

        socket.emit('message', 'Wellcome Namespace')
        
        
        socket.on('error', (error) => {
            socket.emit('message', "Lỗi");
        });
        // Listen for the 'disconnect' event
        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    })

    
}
module.exports = farmstayRoomSocketIo
