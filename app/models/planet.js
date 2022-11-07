const mongoose = require('mongoose')

const moonSchema = require('./moon')

const planetSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
        age: {
            type: Number,
            required: true
        },
        livable: {
            type: Boolean,
            required: true
        },
        moons: [moonSchema],
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
	},
	{
		timestamps: true,
        // we're going to add virtuals to our model, and we need to tell our schema to use those virtuals when converting from BSON to JSON or an object
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
	}
)

// virtuals
// these are virtual properties, that are added to the model when returning from the database, but they aren't saved in the database. These are javascript functions that process upon resource retrieval
// virtuals basically add a new key value pair to our resource
planetSchema.virtual('fullTitle').get(function () {
    // inside our virtual functions, we can do any JS we want to return a value for the new key.
    return `${this.name} the ${this.type}`
})

planetSchema.virtual('isNew').get(function () {
    if (this.age < 5) {
        return "yeah, this is a new planet"
    } else if (this.age >= 5 && this.age < 10) {
        return "not really a new planet, but still new"
    } else {
        return "a good, old, planet"
    }
})

module.exports = mongoose.model('Planet', planetSchema)