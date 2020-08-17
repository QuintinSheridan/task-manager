const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setUpDatabase} = require('./fixtures/db')


// runs before each test
beforeEach(setUpDatabase)

// runs after each test
afterEach(async () => {
    // // console.log('after each')
})


//  create user
test('Should sign up new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Bobman',
        email: 'bobman@gmail.com',
        password: 'Bobdigity'
    }).expect(201)

    // Assert user inserted in db
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions on response
    expect(response.body).toMatchObject({
        user: {
            name: 'Bobman',
            email: 'bobman@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('password')
})


//  user login
test('Should log in exisiting user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    // assert log in added new token
    //console.log('user ', user)
    expect(response.body.token).toBe(user.tokens[1].token)
})


test('Should not log in with bad password', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'itsnotright'
    }).expect(400)
})


test('Should not log in with bad email', async () => {
    await request(app).post('/users/login').send({
        email: 'notvalidemail@gmail.com',
        password: userOne.password
    }).expect(400)
})


// get user profile
test('Should get user profile', async () => {
    await request(app).get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})


// delete profile 
test('Should not delete user profile for unauthenticated user', async () => {
    await request(app).delete('/users/me')
    .send()
    .expect(400)
})

test('Should delete user profile for unauthenticated user', async () => {
    await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(204)

    const user = await User.findById(userOneId)
    if(user) {
        throw new Error('User not removed from db.')
    }
})


// avatar image
test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})


// update user profile
test('Should update valid user fields', async () => {
    const response = await request(app)
    .patch('/users/me')
    .send({
        name: 'BobHadABabyItzABoy'
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

    const user = await User.findById(response.body._id)
    expect(user.name).toBe('BobHadABabyItzABoy')
})


test('Should not update invalid user fields', async () => {
    const response = await request(app)
    .patch('/users/me')
    .send({
        location: 'Merica'
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(400)
})