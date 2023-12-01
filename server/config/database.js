const mongoose = require('mongoose');
const User = require('../models/User');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}