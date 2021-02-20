const mongoose = require('mongoose');
const usernameRegex = /^\w+$/;

const { validateRegex, ensureUnique } = require('./helpers/validators');

const userSchema = new mongoose.Schema({
    id: mongoose.Types.ObjectId,
    username: {
        type: String,
        required: [true, 'Username is required'],
        minlength: [5, 'Username must be at least 3 characters long'],
        validate: [
            {
                validator: ensureUnique.bind(undefined, ['User', 'username']),
                message: 'This username is already taken',
            },
            {
                validator: validateRegex.bind(undefined, [usernameRegex]),
                message: 'Username should consist of English letters and digits only',
            }]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [5, 'Your password must contain at least 5 characters'],
    },
    enrolledCourses: [{ type: mongoose.Schema.ObjectId, ref: 'Product' }],
});

module.exports = mongoose.model('User', userSchema);

