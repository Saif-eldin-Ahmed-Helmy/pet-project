const mongoose = require("mongoose");

const userLog = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['create', 'added', 'removed'],
        required: true
    },
    executor: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
})

const messageLog = new mongoose.Schema({
    from: {
        type: String
    },
    to: {
        type: String
    },
    action: {
        type: String,
        enum: ['create', 'edited', 'deleted', 'warned'],
        default: 'create'
    },
    executor: {
        type: String,
        required: true
    },
    warn: {
        type: String,
    },
    date: {
        type: String,
        required: true
    }
})

const message = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    messageLog: [messageLog],
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
    userLog: [userLog],
    messages: [message],
    type: {
        type: String,
        enum: ['support', 'doctor']
    }
})

const Chat = mongoose.model("Chat", chat);

module.exports = Chat;