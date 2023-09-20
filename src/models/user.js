const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

// -------------------------- User Model ---------------------------------
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true, 
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Valid email must be provided')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        // TODO: force stronger passwords
        validate(value){
            if(value.toLowerCase().includes('password') || value.length < 6 ){
                throw new Error("Passowrd length must be at least 6 charachters")
            } 
        }
    },
    steam32_id: { 
        type: String, 
        require: true
        // TODO: add validation that steam32_id exist
    },
    tokens: [{
        token: {
            type: String,
            required: true,
            ref: 'User'
        }
    }]
})

// Remove private data before sending back to the client
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, "BAxPI-dota2")
    
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Incorrect username or password')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save',async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    } 
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User