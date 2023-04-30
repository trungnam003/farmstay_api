const {Employee, User}  = require('../../models/mysql')
const {Conversation, Message} = require('../../models/mongo');
const sequelize = require('sequelize');
const {Op, fn} = sequelize
const cloneDeep = require('lodash.clonedeep');
const {arrayToJSON, objectToJSON} = require('../../helpers/sequelize');
const {HttpError, } = require('../../utils/error');
const {ApiError, ApiSuccess} = require('../../utils/apiResponse');

const handleCreateConversation = (employee, receiverId)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                if(employee.id === receiverId){
                    const respone = new ApiError({message: 'Can not create conversation'})
                    throw new HttpError({statusCode: 400, respone})
                }
                const employeeReceiver = await Employee.findOne({
                    where: {
                        id: receiverId
                    }
                })
                if(employeeReceiver){
    
                    const conversation = await Conversation.findOne({
                        members: {
                            $all: [employee.id, employeeReceiver.id]
                        }
                    }).exec();
                    if(conversation){
                        const respone = new ApiError({message: 'The conversation already exists'})
                        throw new HttpError({statusCode: 400, respone})
                    }else{
                        const conversationCreated = await Conversation.create({
                            name: employeeReceiver.fullname,
                            members: [employee.id, employeeReceiver.id],
                            latest_message: null
                        })
                        const newConversation = conversationCreated.toJSON();
                        const {members} = newConversation;
                        const employees = await Employee.findAll({where:{id: members}});
                        let newMembers = employees.map(employee=>{
                            return employee.toJSON()
                        })
                        Object.assign(newConversation, {members: newMembers})
                        resolve(newConversation)
                    }
                    
                }else{
                    const respone = new ApiError({message: 'Employee does not exist'})
                    throw new HttpError({statusCode: 400, respone})
                }
                
            } catch (error) {
                console.log(error);
                reject(error)
            }
        })();
    })
}

const handleGetAllConversation = (employee)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const conversations = await Conversation.aggregate([
                    {
                        $match:{
                            members: {
                                $in: [employee.id]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'messages',
                            localField: 'latest_message',
                            foreignField: '_id',
                            as: 'latest_message'
                        }
                    },
                    {
                        $unwind: '$latest_message',
                    },
                    {
                        $sort: { "latest_message.createdAt": -1 },
                    },
                ]).exec()
                let conversationsResponse=[];
                if(conversations && Array.isArray(conversations)){
                    for (const conversation of conversations) {
                        const newConversation = conversation;
                        const {members} = newConversation;
                        const employees = await Employee.findAll({where:{id: members}});
                        let newMembers = employees.map(employee=>{
                            return employee.toJSON()
                        })
                        Object.assign(newConversation, {members: newMembers})
                        conversationsResponse.push(newConversation)
                    }
                }
                
                resolve(conversationsResponse)
            } catch (error) {
                reject(error)
            }
        })();
    })
}

const handleGetAllEmployeesNoConversationWithCurrentEmployee = (employee)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const conversations = await Conversation.find({
                    members: {
                        $in: [employee.id]
                    }
                }).exec();
                const idEmployees = Array.from(conversations).map(conversation=>{
                    const {members} = conversation;
                    const idEmployee = members.find(member=>member != employee.id);
                    return idEmployee
                })
                const employees = await Employee.findAll({where:{
                    id: {
                        [Op.notIn]: [...idEmployees, employee.id]
                    }
                }})
                const employeesResponse = arrayToJSON(employees)
                resolve(employeesResponse)
            } catch (error) {
                reject(error)
            }
        })();
    });
}

const handleSendMessage = (employee, conversationId, text)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId
                }).exec();
                if(conversation){
                    const message = await Message.create({
                        content: text,
                        conversation_id: conversationId,
                        sender_id: employee.id
                    })
                    const {_id} = message;
                    conversation.latest_message = _id;
                    conversation.save()
                    resolve(message)
                }else{
                    const respone = new ApiError({message: 'The conversation dose not exists'})
                    throw new HttpError({statusCode: 400, respone})
                }
            } catch (error) {
                reject(error)
            }
        })();
    })
}

const hanldeGetAllMessageOfConversation = (employee, conversationId)=>{
    return new Promise((resolve, reject)=>{
        (async()=>{
            try {
                const conversation = await Conversation.findOne({
                    $and: [
                        {_id: conversationId},
                        {members: {
                            $elemMatch: {
                                $eq: employee.id
                            }
                        }}
                    ]
    
                }).exec();
                if(conversation){
                    const messages = await Message.find({
                        conversation_id: conversationId,
                    }).sort({createdAt: 1}).exec();
                    resolve(messages)
                }else{
                    const respone = new ApiError({message: 'The conversation dose not exists'})
                    throw new HttpError({statusCode: 400, respone})
                }
                
            } catch (error) {
                reject(error)
            }
        })();
    })
}
module.exports = {
    handleCreateConversation, handleGetAllConversation, handleSendMessage, hanldeGetAllMessageOfConversation,handleGetAllEmployeesNoConversationWithCurrentEmployee
}