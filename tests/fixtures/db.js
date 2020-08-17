const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')


const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Quintin',
    email: 'quintin@gmail.com',
    password: 'quintindigity',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Jeff',
    email: 'jeff@gmail.com',
    password: 'jeffdigity',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}


const taskOne = {
    _id: mongoose.Types.ObjectId(),
    description: 'first task',
    completed: 'false',
    owner: userOneId
}

const taskTwo = {
    _id: mongoose.Types.ObjectId(),
    description: 'second task',
    completed: 'true',
    owner: userOneId
}

const taskThree = {
    _id: mongoose.Types.ObjectId(),
    description: 'third task',
    completed: 'false',
    owner: userTwoId
}




const setUpDatabase = async () => {
     // clear users collection so new user runs
     await User.deleteMany({})
     // add a user for testing other operations
     await new User(userOne).save()
     // clear tasks collection 
     await Task.deleteMany({})
     await new Task(taskOne).save()
     await new Task(taskTwo).save()
     await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setUpDatabase
}