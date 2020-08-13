const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')


//  add new users
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        console.log('sending email')
        sendWelcomeEmail(user.email, user.name)
        console.log('email sent')
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }  
})


// login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        console.log(user)
        const token = await user.generateAuthToken()
        console.log(token)
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})


// logout device
router.post('/users/logout', auth,  async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send(e)
    }
})

//logout user from all devices
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


// verify user profile images, limit to 1mb and only accept .png, .jpg, .jpeg
const avatar = multer({
    limits: {
        fileSize: 1000000
    }, 
    fileFilter(req, file, cb) {
  
      if(!file.originalname.match('\.(png|jpg|jeg)$')) {
            return cb(new Error('Please upload an image (png, jpg, or jpeg) file.'))
        }

        cb(undefined, true)
    }
})


// upoload user profile images
router.post('/users/profile/me/avatar',auth, avatar.single('avatar'), async (req, res) => {
    console.log('uploading user profile')
    const buffer = await sharp(req.file.buffer).resize( {width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    console.log(req.user)
    res.send('File uploaded')
}, (error, req, res, next) => {
    // Don't send back html that exposes unnecessary information
    res.status(400).send({error: error.message})
})


//delete user avatar
router.delete('/users/profile/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(204).send()
}, (error, req, res, next) => {
    res.status(500).send({error: error.message})
})


// get user avatar
router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user|!user.avatar) {
            console.log('user or avatar not found')
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch(e) {
        res.status(400).send()
    }
})


// get user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


// get user
router.get('/users/:id', async (req, res) => {
    console.log(req.params)
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if(!user) {
            res.status(404).send('User not found')
        }
        
        res.send(user)

    } catch(e) {
        res.status(500).send(e)
    }
})


//  update user
router.patch('/users/me', auth, async (req, res) => {
    // const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidUpdate = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidUpdate) {
        res.status(400).send('Error: Invalid update parameters')
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})


// delete user
router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
    
        res.status(204).send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})


// module exports 
module.exports = router