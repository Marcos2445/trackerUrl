const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new Schema({
    createdAt: { type: Date, required: true, default: Date.now}
})

const UserModel = mongoose.model('users', UserSchema)

module.exports = {
    UserModel,
};
