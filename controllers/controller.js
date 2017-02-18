module.exports = function(app) {
    var request = require('request');
    var cheerio = require('cheerio');

    app.get('/', function(req, res) {
        // Making a request call for reddit's 'webdev' board. The page's HTML is saved as the callback's third argument
        request('https://www.vox.com/news', function(error, response, html) {

            // Load the HTML into cheerio and save it to a variable.
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            var $ = cheerio.load(html);

            // An empty array to save the data that we'll scrape.
            var result = [];

            // With cheerio, find each div with the 'm-block' class.
            // (i: iterator. element: the current element)
            $('.m-block').each(function(i, element) {

                var title = $(element).children('.m-block__body').children('header').children('h3').text();

                var link = $(element).children('.m-block__body').children('header').children('h3').children('a').attr('href');

                var blurb = $(element).children('.m-block__body').children('.m-block__body__blurb').text();

                var author = $(element).children('.m-block__body').children('.m-block__body__byline').children('a').text();

                var image = $(element).children('.m-block__image').children('a').children('img').data('original');

                // Save these results in an object that we'll push into the result array we defined earlier
                result.push({
                    title: title,
                    link: link,
                    blurb: blurb,
                    author: author,
                    image: image
                });

            });

            // Log the result once cheerio analyzes each of its selected elements
            res.render('index', {result: result});
        });
    });
};