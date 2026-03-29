const mongoose = require("mongoose");

const touristSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {                     
        type: String,
        required: true,
        unique: true
    },
    password: {                  
        type: String,
        required: true
    },
    passport: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: String,
        required: true
    },
    digitalID: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        latitude: Number,
        longitude: Number
    },
    riskStatus: {
        type: String,
        default: "Safe"
    },
    safetyScore: {
    type: Number,
    default: 100
},
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default:Date.now
    },
    isInactive: {
        type: Boolean,
        default: false
    },
    lastMovementTime: {
        type: Date,
        default: Date.now
    },
    isSafeConfirmed: {
        type: Boolean,
        default: false
    }
    isEmergency: {
        type: Boolean,
        default: false
    },
},
{
    collection: "tourists"   // ⭐⭐⭐ ADD THIS LINE
});

module.exports = mongoose.model("Tourist", touristSchema);
