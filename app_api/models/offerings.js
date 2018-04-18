var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    answer: {
        type: String,
    },
    created: {
        type: Date,
        required: true
    },
});

var bidSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    userpassword: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    accepted: {
        type: Boolean,
        default: false,
    },
    created: {
        type: Date,
        required: true
    },
});

var offeringSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true
    },
    itemYear: {
        type: Number,
    },
    signed: {
        type: Boolean
    },
    authentic: {
        type: Boolean
    },
    gameWorn: {
        type: Boolean
    },
    itemDescription: {
        type: String
    },
    altheteInfo: {
        type: String
    },
    available: {
        type: Boolean,
        defualt: false
    },
    bids: [bidSchema],
    questions: [questionSchema]
});

mongoose.model('Offering', offeringSchema);
mongoose.model('Question', questionSchema);
mongoose.model('Bid', bidSchema);