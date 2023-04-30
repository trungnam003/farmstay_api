const {HttpError, }                     = require('../utils/error');
const {ApiError, ApiSuccess}            = require('../utils/apiResponse');
const {handleCreateConversation,
    handleGetAllConversation, handleSendMessage,
    hanldeGetAllMessageOfConversation,
    handleGetAllEmployeesNoConversationWithCurrentEmployee

} = require('../services/controllers/employeeService');
const SocketIoSingleton = require('../app/socket.io/SocketIoSingleton')


class EmployeeController{

    async getAllConversation(req, res, next){
        try {
            const {employee} = req;
            const  conversations = await handleGetAllConversation(employee);
            const respone = new ApiSuccess({data: conversations})
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }
    }

    async getAllEmployeeNoConversation(req, res, next){
        try {
            const {employee} = req;
            const employees = await handleGetAllEmployeesNoConversationWithCurrentEmployee(employee)
            const respone = new ApiSuccess({data: employees})
            res.status(200).json(respone)
        } catch (error) {
            next(error)
            
        }
    }

    async createConversation(req, res, next){
        try {
            const {employee} = req;
            const {receiver_id} = req.body;
            const conversationCreated = await handleCreateConversation(employee, receiver_id)

            const room = `room_user_${receiver_id}`;
            const io = new SocketIoSingleton().io;
            const ioChat = io.of('/employee_chat');
            console.log(room);
            ioChat.to(room).emit('new_conversation', conversationCreated);

            const respone = new ApiSuccess({data: conversationCreated})
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }
    }

    async sendMessage(req, res, next){
        try {
            const {employee} = req;
            const {conversation_id, text} = req.body;
            const message = await handleSendMessage(employee, conversation_id, text)
            const respone = new ApiSuccess({data: message})
            const {conversation_id: conversationId} = message
            const io = new SocketIoSingleton().io;
            const ioChat = io.of('/employee_chat');
            ioChat.to(conversationId.toString()).emit('new_message', message);
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }
    }

    async getAllMessageOfConversation(req, res, next){
        try {
            const {employee} = req;
            const {conversation_id} = req.params;
            const messages = await hanldeGetAllMessageOfConversation(employee, conversation_id)
            const respone = new ApiSuccess({data: messages})
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = EmployeeController