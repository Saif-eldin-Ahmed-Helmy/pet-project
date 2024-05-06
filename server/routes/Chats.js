const express = require('express');
const router = express.Router();
const Chat = require("../models/Chat");
const User = require("../models/User");
const { verifySession } = require('../middlewares/auth');
const { attachUserDataToRequest } = require("../middlewares/attachUserData");

router.use(verifySession);
router.use((req, res, next) => attachUserDataToRequest(req, res, next, ['chats']));

router.get('/', async (req, res) => {
    const chats = await Chat.find({ participants: req.email });
    res.json(chats);
});

router.get('/:chatId', async (req, res) => {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
        return res.status(404).json({ error: 'Chat not found.' });
    }
    res.json(chat.messages);
});

router.post('/:chatId', async (req, res) => {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
        return res.status(404).json({ error: 'Chat not found.' });
    }
    const message = {
        text: req.body.text,
        sender: req.email,
        time: new Date()
    };
    chat.messages.push(message);
    await chat.save();
    res.json(chat);
});

module.exports = router;