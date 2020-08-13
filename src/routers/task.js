const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')


// add new tasks
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

// GET tasks
router.get('/tasks', auth,  async (req, res) => {
    const match = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    const sort = {}

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1: 1
    }
    console.log('sort', sort)
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send(e)
    }
})


//  get task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner:req.user._id})

        if(!task) {
            res.status(404).send('Task not found')
        }
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})


//patch task
router.patch('/tasks/:id', auth, async (req, res) => {
    console.log(req.body)
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    let isValidUpdate = updates.every((update) => {
        return allowedUpdates.includes(update)   
    })

    if(!isValidUpdate) {
        return res.status(400).send('Error: Invalid update parameters')
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task) {
            res.status(404).send('Task not found')
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)

    } catch (e) {
        res.status(500).send(e)        
    }
})


// DELETE task
router.delete('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})

        if(!task) {
            return res.status(404).send('Unable to delete task. Task not found.')
        }

        res.status(204).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

// module exports
module.exports = router