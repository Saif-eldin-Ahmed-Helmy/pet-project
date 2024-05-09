const express = require('express');
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");
const { handleMessage } = require("../handlers/gemini");

router.use(verifySession);
router.use((req, res, next) => attachUserDataToRequest(req, res, next, ['chats']));

router.get('/vet', async (req, res) => {
    const { role } = req.user;
    const page = Number(req.query.page) || 1;
    const chatsPerPage = Number(req.query.chatsPerPage) || 10;
    const skip = (page - 1) * chatsPerPage;
    const email = req.query.email;
    const status = req.query.status || 'active';

    let query = { type: 'vet', status };
    if (email && email.length > 0) {
        query.participants = { $in: [email] };
    }

    if (role === 'doctor' || role === 'admin') {
        const chats = await Chat.find(query).skip(skip).limit(chatsPerPage);
        const totalChats = await Chat.countDocuments(query);
        res.json({ chats, maxPages: Math.ceil(totalChats / chatsPerPage) });
    } else {
        let userChat = await Chat.findOne({ participants: req.user.email, type: 'vet' });
        if (!userChat) {
            userChat = await Chat.create({
                sessionId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                participants: [req.user.email],
                type: 'vet',
                messages: [],
                date: new Date().toISOString()
            });
        }
        res.json(userChat);
    }
});

const queue = [];
router.post('/vet/send', async (req, res) => {
    const role = req.user.role;
    const {id, text, sessionId} = req.body;
    const chat = await Chat.findOne({sessionId});
    if (!chat) {
        res.status(404).json({error: 'Chat not found.'});
        return;
    }

    const message = {
        id: id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        sender: req.user.email,
        content: text,
        log: [],
        deleted: false,
        date: new Date().toISOString()
    };
    chat.messages.push(message);
    chat.status = 'active';
    try {
        for (const participant of chat.participants) {
            global.io.to(participant).emit('new-message', {sessionId, message});
        }
        global.io.to('vet').emit('new-message', {sessionId, message});

        if (role === 'user') {
            let response = await handleMessage(sessionId, text);
            if (!response.includes("%INVALID_INPUT%")) {
                response = response.replace("%INVALID_INPUT%", "")
                    .replace("%MEDICINE%", "")
                    .replace("%FOOD%", "");
                const content = `(This is an automated response it might not be accurate, A Doctor will be with you shortly):` + response;

                const message = {
                    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    sender: "AI",
                    isAI: true,
                    content,
                    log: [],
                    deleted: false,
                    date: new Date().toISOString()
                }
                chat.messages.push(message);
                try {
                    for (const participant of chat.participants) {
                        global.io.to(participant).emit('new-message', {sessionId, message});
                    }
                    global.io.to('vet').emit('new-message', {sessionId, message});
                } catch (error) {
                    console.error(error);
                    res.status(500).json({error: 'An error occurred while saving the chat.'});
                }
            }

        }
        await chat.save();

        res.json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while saving the chat.'});
    }
});

router.post('/vet/handle', async (req, res) => {
    const { sessionId } = req.body;
    const chat = await Chat.findOne({ sessionId });
    if (!chat) {
        res.status(404).json({ error: 'Chat not found.' });
        return;
    }
    chat.status = 'handled';
    try {
        await chat.save();
        res.json(chat);
        global.io.to('vet').emit('chat-handled', { sessionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while saving the chat.' });
    }
});



router.get('/support', async (req, res) => {
    const { role } = req.user;
    const page = Number(req.query.page) || 1;
    const chatsPerPage = Number(req.query.chatsPerPage) || 10;
    const skip = (page - 1) * chatsPerPage;
    const email = req.query.email;
    const status = req.query.status || 'active';

    let query = { type: 'support', status };
    if (email && email.length > 0) {
        query.participants = { $in: [email] };
    }

    if (role === 'support' || role === 'admin') {
        const chats = await Chat.find(query).skip(skip).limit(chatsPerPage);
        const totalChats = await Chat.countDocuments(query);
        res.json({ chats, maxPages: Math.ceil(totalChats / chatsPerPage) });
    } else {
        let userChat = await Chat.findOne({ participants: req.user.email, type: 'support' });
        if (!userChat) {
            userChat = await Chat.create({
                sessionId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                participants: [req.user.email],
                type: 'support',
                messages: [],
                date: new Date().toISOString()
            });
        }
        console.log(userChat);
        res.json(userChat);
    }
});

router.post('/support/send', async (req, res) => {
    const { id, text, sessionId } = req.body;
    const chat = await Chat.findOne({ sessionId });
    if (!chat) {
        res.status(404).json({ error: 'Chat not found.' });
        return;
    }
    const message = {
        id: id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        sender: req.user.email,
        content: text,
        log: [],
        deleted: false,
        date: new Date().toISOString()
    };
    chat.messages.push(message);
    chat.status = 'active';
    try {
        await chat.save();
        for (const participant of chat.participants) {
            global.io.to(participant).emit('new-message', { sessionId, message });
        }
        global.io.to('support').emit('new-message', { sessionId, message });
        res.json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while saving the chat.' });
    }
});

router.post('/support/handle', async (req, res) => {
    const { sessionId } = req.body;
    const chat = await Chat.findOne({ sessionId });
    if (!chat) {
        res.status(404).json({ error: 'Chat not found.' });
        return;
    }
    chat.status = 'handled';
    try {
        await chat.save();
        res.json(chat);
        global.io.to('support').emit('chat-handled', { sessionId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while saving the chat.' });
    }
});

module.exports = router;