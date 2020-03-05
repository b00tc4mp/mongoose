const mongoose = require('mongoose')
const assert = require('assert')

// mongoose.set('debug', true)

const owner = new mongoose.Schema({
    name: String
})

const kitten = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner'
    },
    color: String
})

const Owner = mongoose.model('Owner', owner)
const Kitten = mongoose.model('Kitten', kitten)

    ; (async () => {
        mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true })

        await Promise.all([Owner.deleteMany(), Kitten.deleteMany()])

        const [john, mary] = await Owner.create([
            {
                name: 'John'
            },
            {
                name: 'Mary'
            }
        ])

        await Kitten.create([
            {
                owner: john._id,
                color: 'black'
            }, {
                owner: mary._id,
                color: 'white'
            }, {
                owner: mary._id,
                color: 'black'
            }
        ])

        try {
            const kittens = await Kitten.find().populate({
                path: 'owner',
                select: 'name',
                match: { color: 'black' },
                options: { sort: { name: -1 } }
            })

            assert(!!kittens[0].owner, 'should have owner') // FAILS
            assert.equal(kittens[0].owner.name, 'Mary', 'should owner name be Mary')
        } catch (error) {
            console.log(error)
        }

        try {
            const kittens = await Kitten.find().populate('owner', 'name', null, { sort: { name: -1 } })

            assert(!!kittens[0].owner, 'should have owner')
            assert.equal(kittens[0].owner.name, 'Mary', 'should owner be Mary') // FAILS
        } catch (error) {
            console.log(error)
        }
    })()
        .catch(console.error)
        .finally(mongoose.disconnect)