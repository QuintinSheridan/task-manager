const express = require('express')
require('./db/mongoose')
const user_router = require('./routers/user')
const task_router = require('./routers/task')
const multer = require('multer')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
// use routes defined in routers folder
app.use(user_router)
app.use(task_router)

app.listen(port, () => {
    console.log("app is up and running on port " + port)
})
