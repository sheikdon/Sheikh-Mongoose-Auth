const express = require('express')
const passport = require('passport')

// pull in Mongoose model for s
const Planet = require('../models/planet')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// POST -> anybody can give a  a 
// POST /s/<_id>
router.post('/moons/:planetId', removeBlanks, (req, res, next) => {
    // get the  from req.body
    const moon = req.body.moon
    const planetId = req.params.planetId
    // find the  by its id
    Planet.findById(planetId)
        .then(handle404)
        // add the  to the 
        .then(planet => {
            // push the  into the 's  array and return the saved 
            planet.moons.push(planet)

            return planet.save()
        })
        .then(planet => res.status(201).json({ planet: planet }))
        // pass to the next thing
        .catch(next)
})

// UPDATE a 
// PATCH -> /s/<_id>/<_id>
router.patch('/moons/:planetId/:moonId', requireToken, removeBlanks, (req, res, next) => {
    const { planetId, moonId } = req.params

    // find the 
    Planet.findById(planetId)
        .then(handle404)
        .then(planet => {
            // get the specific 
            const theMoon = planet.moons.id(moonId)

            // make sure the user owns the 
            requireOwnership(req, planet)

            // update that  with the req body
            theMoon.set(req.body.moon)

            return planet.save()
        })
        .then(planet => res.sendStatus(204))
        .catch(next)
})

// DESTROY a 
// DELETE -> /s/<_id>/<_id>
router.delete('/moons/:planetId/:moonId', requireToken, (req, res, next) => {
    const { planetId, moonId } = req.params

    // find the 
    Planet.findById(planetId)
        .then(handle404)
        .then(planet => {
            // get the specific 
            const theMoon = planet.moons.id(moonId)

            // make sure the user owns the 
            requireOwnership(req, planet)

            // update that  with the req body
            theMoon.remove()

            return planet.save()
        })
        .then(planet => res.sendStatus(204))
        .catch(next)
})

// export router
module.exports = router