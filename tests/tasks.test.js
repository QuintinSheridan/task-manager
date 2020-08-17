const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOne, userOneId, userTwo, 
    userTwoId,taskOne,taskTwo,taskThree, setUpDatabase} = require('./fixtures/db')

beforeEach(setUpDatabase)

// post task
test('Should post task', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Finish these tests'
        })
        .expect(200)

        const task = await Task.findById(response.body._id)
        expect(task).not.toBeNull()
        expect(task.completed).toBe(false)
}) 


// get all tasks
test('Should get all tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)

    // userOne has two tasks while userTwo has one
    expect(response.body.length).toBe(2)
    console.log(response.body)
})

// get task
test('Should get task', async() => {
    const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200)
})

test('Should not get other users task', async() => {
    const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .expect(400)
})


// patch task
test('Should patch task', async () => {
    const response = request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "Do a little dance"
        })
        .expect(200)
})

test('Should not patch other users task', async () => {
    const response = request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: "Do a little dance"
        })
        .expect(400)
})



// delete task
// Try to delete userOne task as user Two
test('Should not delete task', async () => {
    const response = request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(400)
})

test('Should delete task', async () => {
    const response = request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
})
