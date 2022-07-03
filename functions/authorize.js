'use-strict'
const hash = require('password-hash');
const {ObjectId} = require('mongodb');

function authUser() {
    return async (req, res, next) => {
        let loggedUser = req.session.user
        if(loggedUser) {
            let user = await req.findItem('users', 'userSessions', {_id: ObjectId(loggedUser.sessId)})
            if(user) {
                if(hash.verify(loggedUser.key, user.key)) {
                    next()
                } else {
                    req.deleteItems('users', 'userSession', {_id: user._id})
                    console.log('Key mismatch')
                    res.redirect('/login')
                }
            } else {
                console.log('No userSession')
                res.redirect('/login')
            }
        } else {
            console.log('No user.')
            res.redirect('/login')
        } 
    } 
}

module.exports = {authUser}