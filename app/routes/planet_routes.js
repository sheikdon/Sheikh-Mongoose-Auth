// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Planet = require('../models/planet')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
const planet = require('../models/planet')
const planet = require('../models/planet')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

//Index
// /planets
router.get('/planets', requireToken, (req, res, next) => {
    Planet.find()
    .then(planets => {
        return planets.map(planet => planet)
    })
    .then(planets =>  {
        res.status(200).json({ planets: planets })
    })
    .catch(next)
})
//show
// /planets/:id
router.get('/planets/:id', requireToken, (req, res, next) => {
    Planet.findById(req.params.id)
    .then(handle404)
    .then(planet => {
        res.status(200).json({ planet: planet})
    })
    .catch(next)
})

//create
//planet
router.post('/planets', requireToken, (req, res, next) => {
    req.body.planet.owner = req.user.id

    // one the front end I HAVE TO SEND a planet as the top level key
    // planet: {name: '', type: ''}
    Planet.create(req.body.planet)
    .then(planet => {
        res.status(201).json({ planet: planet })
    })
    .catch(next)
    // .catch(error => next(error))

})
//update
// /planets/:id
router.patch('/planets/:id', requireToken, (req, res, next) =>{
    delete req.body.planet.owner

    Planet.findById(req.params.id)
    .then(handle404)
    .then(planet => {
        requireOwnership(req, planet)

        return planet.updateOne(req.body.planet)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
//Delete
// /planets/:id
router.delete('/planets/:id', requireToken, (req, res, next) => {
	Planet.findById(req.params.id)
		.then(handle404)
		.then((planet) => {
			// throw an error if current user doesn't own `example`
			requireOwnership(req, planet)
			// delete the example ONLY IF the above didn't throw
			planet.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})





module.exports = router
