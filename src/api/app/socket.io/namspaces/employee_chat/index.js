const config = require('../../../../../config')
const jwt = require('jsonwebtoken')
const { isBlacklistedJwt } = require('../../../../helpers/redis/blacklistJwt')
const SocketIoSingleton = require('../../SocketIoSingleton')

const {Employee, User} = require('../../../../models/mysql')
const {Conversation, Message} = require('../../../../models/mongo');

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
                io.of("/employee_chat").in(socket.id).disconnectSockets();
            }, socket['timeExpiredConnect'])
        }
        next()
    }
}
async function checkEmployeeUser(socket, next){
    try {
        if(socket['user']){
            const {user_type, id:user_id} = socket['user'];
            if(user_type === config.user.employee){
                const employee = await Employee.findOne({where: {user_id}})
                socket['employee'] = employee;
                next()
            
            }else{
                next(new Error("must be employee user"));
            }
        }
    } catch (error) {
        next(new Error("something went wrong"));
    }
}

async function getAllConversation(socket, next){
    try {
        if(socket['employee']){
            const {employee:{id}} = socket;
            const conversations = await Conversation.find({
                members: {
                    $in: [id]
                }
            })
            .select('-createdAt -updatedAt -__v')
            .exec();
            socket['conversations'] = conversations
            next();
        }else{
            next(new Error("must be employee user"));
        }
    } catch (error) {
        next(new Error("something went wrong"));
    }
}

const employeeChatRoomSocketIo = ()=>{
    const io = new SocketIoSingleton().io;
    const chatIO = io.of('/employee_chat');
    chatIO.use(authenticateSocket);
    chatIO.use(setTimeOutSocketIo(io));
    chatIO.use(checkEmployeeUser);
    chatIO.use(getAllConversation);

    // chatIO.use((socket, next)=>{
    //     try {
    //         if(socket['conversations'] && Array.isArray(socket['conversations'])){
    //             const conversations = socket['conversations'];
    //             conversations.forEach(conversation=>{
    //                 const {_id} = conversation;
    //                 socket.join(_id);
    //                 socket.emit('message', 'join '+_id);
    //             })
    //             next();
    //         }
    //         next();
    //     } catch (error) {
    //         console.log(error)
    //         next(new Error("something went wrong"));
    //     }
    // })

    chatIO.on('connection', function(socket){
        if(socket['conversations'] && Array.isArray(socket['conversations'])){
            const conversations = socket['conversations'];
            conversations.forEach(conversation=>{
                const {_id} = conversation;
                socket.join(_id.toString());
                // socket.emit('message', 'join '+_id.toString());
                // chatIO.to(_id.toString()).emit('message', 'ok')
            })
        }
        const {id} = socket['employee'];
        if(id){
            const room = `room_user_${id}`;
            socket.join(room);
            // chatIO.to(room).emit('new_conversation', room)
        }

        socket.on('join_conversation', ({conversation_id})=>{
            console.log(socket.rooms);
            socket.join(conversation_id);
        });
        console.log(socket.rooms)

        socket.emit('ping', 'pong')

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}

module.exports = employeeChatRoomSocketIo;