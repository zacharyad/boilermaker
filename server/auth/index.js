const router = require('express').Router()
const User = require('../db/models/user')
module.exports = router

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({where: {email: req.body.email}})
    if (!user) {
      console.log('No such user found:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else if (!user.correctPassword(req.body.password)) {
      console.log('Incorrect password for user:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else {
      req.login(user, err => (err ? next(err) : res.json(user)))
    }
  } catch (err) {
    next(err)
  }
})

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    req.login(user, err => (err ? next(err) : res.json(user)))
  } catch (err) {
    //checking to see if this already exists
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(401).send('User already exists')
    } else {
      next(err)
    }
  }
})
//post route to stop the session on the DB But i guess could be a delete route.... check workshop 8. "logout"
router.post('/logout', (req, res) => {
  req.logout()
  //extra step to logout but also forget that use ever had a session.
  req.session.destroy()
  res.redirect('/')
})

//this is the user in the seeion (logged in). This route shoes the json has a user/ the req has a user key/value
router.get('/me', (req, res) => {
  res.json(req.user)
})

router.use('/google', require('./google'))
