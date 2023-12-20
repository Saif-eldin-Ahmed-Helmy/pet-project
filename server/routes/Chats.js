const express = require("express");
const router = express.Router();

const Chat = require("../models/Chat");
const User = require("../models/User");

const { verifySession } = require("../middlewares/auth");
const { attachUserDataToRequest } = require("../middlewares/attachUserData");
const { getMilliSeconds } = require("../utils/timeUtils.js")
const { newId } = require("../utils/numberUtils");
const { handleBadRequest } = require("../handlers/error.js");

router.use(verifySession);
router.use((req, res, next) => attachUserDataToRequest(req, res, next, ['chats']));

router.get("/", async(req, res) => {
    const { sessionId, type } = req.query;

    if(sessionId) {
        const hasChat = req.user.chats.find(chat => chat.sessionId == sessionId);
        if(hasChat || req.user.role != 'admin') {
            const chat = await Chat.findOne({ sessionId });

            return res.json({ chat });
        } else         
            return handleBadRequest(res, `no chat session with the id ${sessionId}`);
    }

    const chats = await Chat.find({ 
        type: type || { $exists: true }
    });

    res.json({ chats });
});

router.post("/", async(req, res) => {

})