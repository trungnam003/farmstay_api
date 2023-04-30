const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId;


const messageSchema  = new Schema(
    {
        conversation_id: {
            type: ObjectId,
            require: true
        },
        content: {
            type: String,
            require: true,
        },
        sender_id: {
            type: Number,
            require: true
        },
        
    },
    { timestamps: true }
);

const Message = mongoose.model('message', messageSchema);

module.exports = Message;