const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// should we add a field for the user's date of birth and gender?
const locationSchema = new mongoose.Schema({
    locationId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    locationSignature: { // this will be a fingerprint for the location of the user, probably gonna use longitude and latitude, when we get in a group call we can discuss this
        type: String,
        required: true,
    },
    apartmentNumber: {
        type: String,
        required: true,
    },
    floorNumber: {
        type: Number,
        required: true,
    },
    streetName: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'driver', 'admin'],
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    locations: [locationSchema],
    shoppingCart: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'CartItem',
    },
    balance: {
        type: Number,
        default: 0,
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;