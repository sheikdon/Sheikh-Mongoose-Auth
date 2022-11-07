// import dependencies
const mongoose = require('mongoose')

// moon is a subdoc NOT a model
// moon will be added in an array on s
// one moon belongs to ONE  -> NO SHARING!

const moonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isHere: {
        type: Boolean,
        default: false,
        required: true
    },
    environment: {
        type: String,
        // we're going to use enum, which means only specific strings will satisfy this field
        // enum is a VALIDATOR on the type String, that says "you can only use one of these values"
        enum: ['new', 'used', 'old'],
        default: 'new'
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

moonSchema.virtual('dontAttemptToLive').get(function () {
    if (this.condition == "old") {
        return true
    } else {
        return false
    }
})

module.exports = moonSchema