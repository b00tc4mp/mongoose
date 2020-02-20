const mongoose = require('mongoose')
const Schema = mongoose.Schema

const personSchema = Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    age: Number,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
})

const storySchema = Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Person' },
    title: String,
    fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
})

const Story = mongoose.model('Story', storySchema)
const Person = mongoose.model('Person', personSchema)

function random() {
    return Math.floor(Math.random() * 1000) + 1
}

; (async () => {
    await mongoose.connect('mongodb://localhost/test', { useUnifiedTopology: true, useNewUrlParser: true })

    await mongoose.connection.db.dropDatabase()

    let count = 3

    while (count--) {
        const author = new Person({
            _id: new mongoose.Types.ObjectId(),
            name: 'Author ' + random(),
            age: 50
        })

        await author.save()

        await (async () => {
            let count = 1

            while (count--) {
                const story = new Story({
                    title: 'Story ' + random(),
                    author: author._id
                })

                await story.save()
            }
        })()
    }

    const stories = await Story
        .aggregate([
            {
                $match: {}
            },
            {
                $lookup: {
                    from: 'people',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $project: {
                    title: '$title',
                    author: {
                        $arrayElemAt: ['$author', 0]
                    }
                }
            },
            { $sort: { 'author.name': 1 } }
        ])

    console.log(stories)

    await mongoose.disconnect()
})()

