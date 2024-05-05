const mongoose = require('mongoose');

async function connect() {
    await mongoose.connect(process.env.MONGODB_URI);
}

function getClient() {
    return mongoose.connection.getClient();
}

module.exports = [connect, getClient];