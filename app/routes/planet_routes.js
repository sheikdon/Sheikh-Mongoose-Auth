// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for 
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
// { : { title: '', text: 'foo' } } -> { : { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

//* INDEX
//* /
router.get('/planets', (req, res, next) => {
    Planet.find()
        .populate('owner')
        .then(planets => {
            return planets.map(planet => planet)
        })
        .then(planets => {
            res.status(200).json({ planets: planets })
        })
        .catch(next)
})

//* SHOW
//* //:id
router.get('/planets/:id', (req, res, next) => {
    Planet.findById(req.params.id)
        .populate('owner')
        .then(handle404)
        .then(planet => {
            res.status(200).json({ planet: planet})
        })
        .catch(next)
})

//* CREATE
//* /
router.post('/planets', requireToken, (req, res, next) => {
    req.body.planet.owner = req.user.id

    // on the front end, I HAVE to send a  as the top level key
    Planet.create(req.body.planet)
    .then(planet => {
        res.status(201).json({ planet: planet })
    })
    .catch(next)
    // ^^^ shorthand for:
        //^ .catch(error => next(error))
})

// UPDATE
// PATCH //5a7db6c74d55bc51bdf39793
router.patch('/planets/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.planet.owner

	Planet.findById(req.params.id)
		.then(handle404)
		.then((planet) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, planet)

			// pass the result of Mongoose's `.update` to the next `.then`
			return planet.updateOne(req.body.planet)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})


//* DESTROY
router.delete('/planets/:id', requireToken, (req, res, next) => {
	Planet.findById(req.params.id)
		.then(handle404)
		.then((planet) => {
			// throw an error if current user doesn't own ``
			requireOwnership(req, planet)
			// delete the  ONLY IF the above didn't throw
			planet.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})


module.exports = router