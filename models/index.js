var mongoose = require('mongoose');

module.exports = {
    // Article schema.
    Article: mongoose.model('Article', {
        title: String,
        blurb: String,
        link: String,
        author: String,
        image: String,
        article_id: String
    }),
    // Comment schema.
    Comment: Comment = mongoose.model('Comment', {
        author: String,
        text: String,
        timestamp: {type: Date, default: Date.now},
        article_id: String
    })
};