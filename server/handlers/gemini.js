const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const Chat = require("../models/Chat");
const { translateToEnglish } = require("./translate");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function getChatHistory(sessionId) {
    let history = [];
    let session = await Chat.findOne({ sessionId });

    session?.messages.forEach(message => {
        const lastMessage = history[history.length - 1];
        if (lastMessage) {
            history.push({
                role: lastMessage.role === "model" ? "user" : "model",
                parts: [{ text: "Continue" }]
            })
            return;
        }
        history.push({
            role: message?.isAI ? "model" : "user",
            parts: [{ text: message.content }]
        })
    })
    const lastMessage = history[history.length - 1];
    if (lastMessage && lastMessage.role !== "model") {
        history.push({
            role: "model",
            parts: [{text: "Continue"}]
        })
    }
    console.log(history);

    return history || [];
};

async function displayTokenCount(request) {
    const { totalTokens } = await model.countTokens(request);
    return totalTokens;
};

async function displayChatTokenCount(chat, msg) {
    const history = await chat.getHistory();
    const msgContent = { role: "user", parts: [{ text: msg }] };
    await displayTokenCount(model, { contents: [...history, msgContent] });
};

// still need to add queue to avoid rate limit and the similarity check
async function handleMessage(sessionId, message) {
    const chatHistory = await getChatHistory(sessionId);
    const chat = model.startChat({history: chatHistory});
    message = await translateToEnglish(message);

    const enchancedPrompt =
        `I am going to give you a veterinary question, Here is how I want the respond. If the question does not relate to animals or pets JUST RESPOND WITH %INVALID_INPUT%, But If the answer includes a medicine I just want from you to write at the top %MEDICINE% then I want from you to give the medication components BUT if the answer about food write at the top %FOOD% then write the food type (for example small dry food WITH A VERY SMALL DESCRIPTION like "wet food is ideal for kittens") AND list the food ingredients if there is ideal ingredients for the problem and if it is food don't be too scientific, try to simplify things. Here is the problem: ` + message;

    const result = await chat.sendMessage(enchancedPrompt);
    const response = result.response;
    const text = response.text();

    console.log(text);

    return text;
}

module.exports = {handleMessage};