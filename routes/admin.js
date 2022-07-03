const router = require('express').Router()
const {authUser} = require('../functions/authorize')
const hash = require('password-hash')
const {ObjectId} = require('mongodb');

router.get('/', authUser(), (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    console.log('logging in!')
    const user = await req.findItem('users', 'all', {name: req.body.username})
    if(user) {
        if(hash.verify(req.body.password, user.password)) {
            if(user.access.includes('super') || user.access.includes('admin')) {
                const key = Math.floor(100000 + Math.random() * 900000).toString()
                const hashedKey = hash.generate(key)
                let sessId = new ObjectId()
                
                const currentSession = await req.findItem('users', 'userSessions', {name: user.name})
                if(currentSession) {
                    sessId = currentSession._id
                    await req.updateItem('users', 'userSessions', {_id: currentSession._id}, {
                        name: user.name,
                        key: hashedKey,
                        user: user._id,
                        loginDate: new Date(Date.now())
                    })
                } else {
                    await req.addItems('users', 'userSessions', [{
                        name: user.name,
                        _id: sessId,
                        key: hashedKey,
                        user: user._id,
                        loginDate: new Date(Date.now())
                    }])
                }

                req.session.user = {
                    name: user.name,
                    sessId: sessId,
                    key: key,
                    loginDate: new Date(Date.now())
                }
                res.redirect('/')
            } else {
                res.send('User permissions insufficient.')
            }
        } else {
            res.send('Credentials do not match')
        }
    } else {
        res.send('No User')
    }
})

router.post('/logout', async (req, res) => {
    await req.deleteItems('users', 'userSessions', {name: req.session.user.name})
    req.session.user = null
    console.log('User logged out.')
    res.redirect('/login')
})

module.exports = router