const mongoose = require('mongoose')
const { Schema, Schema: { Types: { ObjectId } } } = mongoose
const assert = require('assert')

mongoose.set('debug', true)

const point = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const city = new Schema({
    name: String,
    location: {
        type: point,
        required: true
    }
})

city.index({ location: '2dsphere' })

const Location = mongoose.model('Location', point)
const City = mongoose.model('City', city)

    // City.on('index', () => console.log('index created'))

    ; (async () => {
        await mongoose.connect('mongodb://localhost/test', {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            // useCreateIndex: true // JUST necessary in case of index creation through mongoose (to avoid ensureIndex)
        })

        // await mongoose.connection.db.dropDatabase()
        await City.deleteMany()

        for (let i = 0; i < 10; i++) {
            const location = new Location({ coordinates: [i * 10, i * 10] })
            const city = new City({ name: `city ${i}`, location })

            await city.save()
        }

        // try {
        //     const cities = await City.find({
        //         location: {
        //             $near: {
        //                 $geometry: {
        //                     type: 'Point',
        //                     coordinates: [0, 0]
        //                 },
        //                 $maxDistance: 1000 * 1000 * 11 // TRY this last with 10, 9.7, 9.5, ...
        //             }
        //         }
        //     })

        //     // console.log(cities)

        //     assert.equal(cities.length, 10, `all cities`)
        // } catch (error) {
        //     console.error(error)
        // }

        // try {
        //     const cities = await City.find({
        //         location: {
        //             $near: {
        //                 $geometry: {
        //                     type: 'Point',
        //                     coordinates: [0, 0]
        //                 },
        //                 $maxDistance: 1000 * 1000 * 10
        //             }
        //         }
        //     })

        //     // console.log(cities)

        //     assert.equal(cities.length, 9, `all cities except 9`)
        // } catch (error) {
        //     console.error(error)
        // }

        // try {
        //     const cities = await City.find({
        //         location: {
        //             $near: {
        //                 $geometry: {
        //                     type: 'Point',
        //                     coordinates: [0, 0]
        //                 },
        //                 $maxDistance: 1000 * 1000 * 9.7
        //             }
        //         }
        //     })

        //     // console.log(cities)

        //     assert.equal(cities.length, 8, `all cities except 9 and 8`)
        // } catch (error) {
        //     console.error(error)
        // }

        try {
            const cities = await City.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [0, 0]
                        },
                        $maxDistance: 1000 * 1000 * 9
                    }
                }
            })

            // console.log(cities)

            assert.equal(cities.length, 7, `all cities except 9, 8 and 7`)
        } catch (error) {
            console.error(error)
        }
    })()
        .catch(console.error)
        .finally(mongoose.disconnect)

