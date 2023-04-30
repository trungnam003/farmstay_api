const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId;


const conversationSchema = new Schema(
    {
        name: String,
        members: [Number],
        latest_message: {type: ObjectId, defaultValue: null}
    },
    { timestamps: true }
);

const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = Conversation;