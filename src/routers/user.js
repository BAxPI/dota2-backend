const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const router = new express.Router()


// ------------- Test endpoit ----------
router.post('/test', async (req, res) => {
    res.send("You got me")
    console.log(req.body)
    console.log('From the front')
})

// ------------- Users endpoints -------------
// Create a new user.
router.post('/users', async (req, res) => {
    console.log(req.body)
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})
// Login to an existing user.
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.emailOrUsername, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

// Logout from website
router.post('/users/logout', auth ,async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Logout from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Get profile data
router.get('/users/me',auth , async (req, res) => {
    res.send(req.user)
})

// Update profile data
router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates.'})
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Delete account
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.deleteOne({_id: req.user._id})
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router