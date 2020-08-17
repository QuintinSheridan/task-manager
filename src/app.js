const express = require('express')
require('./db/mongoose')
const user_router = require('./routers/user')
const task_router = require('./routers/task')

const app = express()

app.use(express.json())
// use routes defined in routers folder
app.use(user_router)
app.use(task_router)

module.exports = app