module.exports = function(app) {
    var request = require('request');
    var cheerio = require('cheerio');
    var mongoose = require('mongoose');
    var Article = mongoose.model('Article', {title: String, blurb: String, link: String, author: String, image: String, article_id: String});

    app.get('/', function(req, res) {
        Article.find({}, function (err, data) {
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

    app.get('/api/delete', function() {
        Article.remove({}, function(err) {
            if (err) {
                console.log(err);
            }
        });
    });

    app.get('/api/news', function() {
        // Making a request call for Vox's news articles page. The page's HTML is saved as the callback's third argument
        request('https://www.vox.com/news', function(error, response, html) {

            // Load the HTML into cheerio and save it to a variable.
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            var $ = cheerio.load(html);

            // With cheerio, find each div with the 'm-block' class.
            // (i: iterator. element: the current element)
            $('.m-block').each(function(i, element) {

                var title = $(element).children('.m-block__body').children('header').children('h3').text();

                var link = $(element).children('.m-block__body').children('header').children('h3').children('a').attr('href');

                var blurb = $(element).children('.m-block__body').children('.m-block__body__blurb').text();

                var author = $(element).children('.m-block__body').children('.m-block__body__byline').children('a').text();

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
                Article.findOneAndUpdate(query, newArticle, {upsert: true}, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
    });
};