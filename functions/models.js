const {ObjectId} = require('mongodb')

class Story {
    constructor(fields) {
        this.title = fields.title
        this.content = fields.content
        this.preview = fields.preview
        this.image = fields.image
        this.url = fields.url
        this.date = new Date(Date.now())
        this.published = fields.published
    }
    addId(id) {
        id ? this._id = new ObjectId(id) : this._id = new ObjectId()
        return this
    }
}

module.exports = {Story}