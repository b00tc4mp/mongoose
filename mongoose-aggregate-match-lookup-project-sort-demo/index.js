const mongoose = require('mongoose')
const { Schema, Schema: { Types: { ObjectId } } } = mongoose
const assert = require('assert')

//mongoose.set('debug', true)

const person = new Schema({
    name: String,
    stories: [{ type: ObjectId, ref: 'Story' }]
})

const story = new Schema({
    author: { type: ObjectId, ref: 'Person' },
    title: String
})

const Story = mongoose.model('Story', story)
const Person = mongoose.model('Person', person)

function random() {
    return Math.floor(Math.random() * 10000) + 1
}

; (async () => {
    await mongoose.connect('mongodb://localhost/test', { useUnifiedTopology: true, useNewUrlParser: true })

    await mongoose.connection.db.dropDatabase()

    let count = 3

    while (count--) {
        const author = new Person({
            name: `Author  ${random()}`
        })

        await author.save()

        let count = 1

        while (count--) {
            const story = new Story({
                title: `Story ${random()}`,
                author: author._id
            })

            await story.save()
        }
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

    //console.log(stories)

    for (let i = 0; i < stories.length - 1; i++) {
        const { author: { name: authorName } } = stories[i]
        const { author: { name: nextAuthorName } } = stories[i + 1]

        assert(authorName < nextAuthorName, `${authorName} < ${nextAuthorName}`)
    }
})()
    .catch(console.error)
    .finally(mongoose.disconnect)

