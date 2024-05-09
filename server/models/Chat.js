const mongoose = require("mongoose");

const messageLog = new mongoose.Schema({
    from: { // the first message
        type: String,
        default: ''
    },
    to: { // the message after edit/delete
        type: String,
        default: ''
    },
    action: {
        type: String,
        enum: ['create', 'edit', 'delete', 'warn'],
        default: 'create'
    },
    executor: {
        type: String,
        required: true
    },
    warn: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
})

const message = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    isAI: {
        type: Boolean
    },
    content: {
        type: String,
        required: true
    },
    log: [messageLog],
    deleted: {
        type: Boolean,
        default: false
    }
})

const chat = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'handled'],
        default: 'active'
    },
    participants: {
        type: [String],
        required: true
    },
    messages: [message],
    type: {
        type: String,
        enum: ['support', 'vet']
    },
    date: {
        type: String,
        required: true
    }
})

const Chat = mongoose.model("Chat", chat);

module.exports = Chat;