// set up database connection
const {MongoClient, ObjectID, Db} = require('mongodb')

// set up connection string from environment variables
// env variables must be set using eg. 'heroku config:set MONGODB_URL=<connection string> 
// prior to deploying to heroku
const connectionURL = process.env.MONGODB_URL
const databaseName = 'task-manager'

const id = new ObjectID()
console.log(id)
console.log(id.getTimestamp())

MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if(error) {
        return console.log('Unable to connect to database')
    } 

    const db = client.db(databaseName)
})
