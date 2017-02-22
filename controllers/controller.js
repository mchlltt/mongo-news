// Import dependencies.
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

// Initialize express router.
var router = express.Router();

// Import models.
var db = require('../models/');

// Pulls article data from the database and uses it to render the index.
router.get('/', function (req, res) {
    db.Article.find({}, function (err, data) {
        var resultData = [];
        data.forEach(function (article) {
            resultData.push({
                title: article.title,
                link: article.link,
                blurb: article.blurb,
                author: article.author,
                image: article.image,
                article_id: article.article_id
            });
        });
        res.render('index', {result: resultData});
    });
});

// Pulls comment data from the database and uses it to render the comment page.
router.get('/:id', function(req, res) {
    var id = req.params.id;
    db.Comment.find({article_id: id}, function(err, data) {
        var commentData = [];
        data.forEach(function (comment) {
            commentData.push({
                id: comment._id,
                author: comment.author,
                text: comment.text,
                timestamp: comment.timestamp,
                article_id: comment.article_id
            });
        });
        db.Article.find({article_id: id}, function(err, data) {
            var article_title = data[0].title;
            var link = data[0].link;
            // Add last item to the comment data array which is just the article_id, to be used in the post comment form.
            commentData.push({article_url: id, article_title: article_title, link: link});
            res.render('comment', {commentData: commentData});
        });
    });
});

// Scrapes data from vox.com/news.
router.get('/api/news', function (req, res) {
    // Making a request call for Vox's news articles page. The page's HTML is saved as the callback's third argument
    request('https://www.vox.com/news', function (error, response, html) {

        // Load the HTML into cheerio and save it to a variable.
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        // With cheerio, find each div with the 'm-block' class.
        // (i: iterator. element: the current element)
        $('.m-block').each(function (i, element) {

            var title = $(element).children('.m-block__body').children('header').children('h3').text();

            var link = $(element).children('.m-block__body').children('header').children('h3').children('a').attr('href');

            var blurb = $(element).children('.m-block__body').children('.m-block__body__blurb').text();

            var author = [];

            var authorsObject = $(element).children('.m-block__body').children('.m-block__body__byline').children('a');

            if (authorsObject.length == 1) {
                author = authorsObject.text();
            } else {
                for (var j = 0; j < authorsObject.length; j++) {
                    author.push(authorsObject[j].children[0].data);
                }
                author = author.join(' & ');
            }

            var image = $(element).children('.m-block__image').children('a').children('img').data('original');

            var article_id = $(element).children('.m-block__body').children('.m-block__body__byline').children('span').data('remote-admin-entry-id');

            // Save these results in an object that we'll save to MongoDB.
            var newArticle = {
                title: title,
                link: link,
                blurb: blurb,
                author: author,
                image: image,
                article_id: article_id
            };

            // We're going to query the Article collection for an article by this ID.
            var query = {article_id: article_id};

            // Run that query. If matched, update with 'newArticle'. If no match, create with 'newArticle.'
            db.Article.findOneAndUpdate(query, newArticle, {upsert: true}, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });

        res.redirect('/');

    });
});

// Add new comment.
router.post('/api/comment/:article', function(req, res) {
    var article_id = req.params.article;
    var text = req.body.text;
    var author = req.body.author;

    var newComment = {
        article_id: article_id,
        text: text,
        author: author
    };

    db.Comment.create(newComment, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
            res.redirect('/' + article_id);
        }
    });

});

// Delete comment.
router.get('/api/comment/:article/:comment', function(req, res) {
    var id = req.params.comment;
    var article_id = req.params.article;
    db.Comment.remove({_id: id}, function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/' + article_id);
        }
    });
});

// Default route.
router.use('*', function (req, res) {
    res.redirect('/');
});

// Clears database of articles.
// router.post('/api/delete-articles', function (req, res) {
//     db.Article.remove({}, function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect('/');
//         }
//     });
// });

// Export routes.
module.exports = router;