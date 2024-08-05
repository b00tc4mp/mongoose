const mongoose = require('mongoose')
const { Schema, Schema: { Types: { ObjectId } } } = mongoose
const assert = require('assert')

// mongoose.set('debug', true)

const polygon = new Schema({
    type: {
        type: String,
        enum: ['Polygon'],
        required: true,
        default: 'Polygon'
    },
    coordinates: {
        type: [[[Number]]], // Array of arrays of arrays of numbers
        required: true
    }
});

const city = new Schema({
    name: String,
    area: {
        type: polygon,
        required: true
    }
})

const Area = mongoose.model('Area', polygon)
const City = mongoose.model('City', city)

    ; (async () => {
        await mongoose.connect('mongodb://localhost/test', {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })

        await mongoose.connection.db.dropDatabase()
        // await City.deleteMany()

        for (let i = 0; i < 10; i++) {
            /*
                         length
            (x0, y0) · --------- · (x1, y0)
                     |           | 
                     |           | length
                     |           | 
            (x0, y1) . --------- . (x1, y1)
            */

            const length = 10
            const x0 = i * length, y0 = i * length
            const x1 = x0 + length, y1 = y0 + length

            const area = new Area({
                coordinates: [[
                    [x0, y0],
                    [x1, y0],
                    [x1, y1],
                    [x0, y1],
                    [x0, y0]
                ]]
            })

            const city = new City({ name: `city ${i}`, area })

            await city.save()
        }

        try {
            const offset = 3
            const length = 5
            const x0 = offset, y0 = offset
            const x1 = x0 + length, y1 = y0 + length

            const cities = await City.find({
                area: {
                    $geoIntersects: {
                        $geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                [x0, y0],
                                [x1, y0],
                                [x1, y1],
                                [x0, y1],
                                [x0, y0]
                            ]]
                        }
                    }
                }
            })

            // console.log(cities)

            assert.equal(cities.length, 1, `city 0`)
            assert.equal(cities[0].name, 'city 0')
        } catch (error) {
            console.error(error)
        }

        try {
            const offset = 3
            const length = 10
            const x0 = offset, y0 = offset
            const x1 = x0 + length, y1 = y0 + length

            const cities = await City.find({
                area: {
                    $geoIntersects: {
                        $geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                [x0, y0],
                                [x1, y0],
                                [x1, y1],
                                [x0, y1],
                                [x0, y0]
                            ]]
                        }
                    }
                }
            })

            // console.log(cities)

            assert.equal(cities.length, 2, `cities 0 and 1`)
            assert.equal(cities[0].name, 'city 0')
            assert.equal(cities[1].name, 'city 1')
        } catch (error) {
            console.error(error)
        }

        try {
            const offset = 3
            const length = 20
            const x0 = offset, y0 = offset
            const x1 = x0 + length, y1 = y0 + length

            const cities = await City.find({
                area: {
                    $geoIntersects: {
                        $geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                [x0, y0],
                                [x1, y0],
                                [x1, y1],
                                [x0, y1],
                                [x0, y0]
                            ]]
                        }
                    }
                }
            })

            // console.log(cities)

            assert.equal(cities.length, 3, `cities 0, 1 and 2`)
            assert.equal(cities[0].name, 'city 0')
            assert.equal(cities[1].name, 'city 1')
            assert.equal(cities[2].name, 'city 2')
        } catch (error) {
            console.error(error)
        }
    })()
        .catch(console.error)
        .finally(mongoose.disconnect)

