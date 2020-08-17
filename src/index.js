const app = require('./app')

const port = process.env.PORT || 3000

app.listen(port, () => {
    // console.log("app is up and running on port " + port)
})


// // console.log('Mongo URL: ', process.env.MONGODB_URL)