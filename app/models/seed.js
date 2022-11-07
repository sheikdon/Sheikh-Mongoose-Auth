const mongoose = require('mongoose')
const Planet = require('./planet')
const db = require('../../config/db')

const startPlanets = [
    { name: 'Earth', type: 'solar planet', age: 4000000000, livable: true},
    { name: 'Mars', type: 'solar planet', age: 10000000, livable: false},
    { name: 'Venus', type: 'solar planet', age: 30000000, livable: false},
    { name: 'Jupiter', type: 'solar planet', age: 10000000, livable: false}
]

// first we need to connect to the database
mongoose.connect(db, {
    useNewUrlParser: true
})
    .then(() => {
        // first we remove all of the 
        // here we can add something to make sure we only delete  without an owner
        Planet.deleteMany({ owner: null })
            .then(deletedPlanets => {
                console.log('deletedPlanets', deletedPlanets)
                // the next step is to use our start array to create our seeded 
                Planet.create(startPlanets)
                    .then(newPlanets => {
                        console.log('the new planets', newPlanets)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })