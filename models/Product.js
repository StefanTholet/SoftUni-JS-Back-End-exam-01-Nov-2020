const mongoose = require('mongoose');
const httpRegex = /^https?.+/;
const { validateRegex, ensureUnique } = require('./helpers/validators');


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title must be specified'],
        minlength: [4, 'The course title must be at least 4 characters'],
        validate: {
            validator: ensureUnique.bind(undefined, ['Product', 'title']),
            message: 'The course title must be unique'
        }
    },
    imageUrl: {
        type: String,
        validate: {
            validator: validateRegex.bind(undefined, [httpRegex]),
            message: 'Image link must start with http or https'
        },
        required: [true, 'Image Url is required'],
    },
    description: {
        type: String,
        minlength: [20, 'Description must be at least 20 characters long'],
        maxlength: [50, 'Description can\'t exceed 50 characters']
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    enrolledUsers: [],
    createdOn: {
        type: String,
        required: [true, 'Date of course creation is required']
    }
});

module.exports = mongoose.model('Product', productSchema);

//buddies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] array of referenced ids