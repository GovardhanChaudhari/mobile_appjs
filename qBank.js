var http = require("http");
var format = require('string-format');
var cheerio = require("cheerio");
var ent = require('ent');
var Promise = require("bluebird");

format.extend(String.prototype);
var url = "http://stackoverflow.com/questions/tagged/{}?page={}&sort=votes&pagesize=50";//.format('angularjs',1);
var tags = ['angularjs', 'javascript', 'java', 'spring', 'hibernate', 'ruby', 'groovy', 'html', 'html5'];
var mongo = require('mongoskin');
var db = mongo.db("mongodb://gvc:gvc@ds027749.mongolab.com:27749/algonode", {native_parser: true});
// Utility function that downloads a URL and invokes
// callback with the data.
db.bind('questions');
/*
 *   Mongo questions collection
 *   {
 *       tag : "javascript",
 *       cdate: datetime to cache,
 *       pages:[
 *               { page:1,
 *                 questions:[
 *                       {
 "vote": "614",
 "question": "How to generate a random alpha-numeric string?",
 "link": "/questions/41107/how-to-generate-a-random-alpha-numeric-string",
 "time": "2008-09-01 08:39:21Z"
 }, {
 "vote": "607",
 "question": "How to fix: Unsupported major.minor version 51.0 error?",
 "link": "/questions/10382929/how-to-fix-unsupported-major-minor-version-51-0-error",
 "time": "2008-09-01 08:39:21Z"
 }
 *                 ]
 *               }
 *       ]
 *
 *   }
 *
 * */


var qBank = {
    download: function (url, callback) {
        http.get(url, function (res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback(data);
            });
        }).on("error", function () {
            callback(null);
        });
    },
    pluckData: function (html) {
        if (!html) {
            return [];
        }
        var $ = cheerio.load(html);
        var $questions = $("#questions");
        var votes = $("#questions .statscontainer .votes strong");
        var questions = $("#questions .question-summary .summary>h3 a");
        var asked = $("#questions .question-summary .summary span.relativetime");
        var cnt = votes.length;
        var result = new Array(cnt);
        var i = 0;
        for (; i < cnt; i++) {
            var question = questions.get(i);
            var vote = votes.get(i);
            var ask = asked.get(i);
            var time;
            if (ask) {
                time = ask.attribs.title;
            }
            result[i] = {
                vote: $(vote).html(),
                question: ent.decode($(question).html()),
                link: question.attribs.href,
                time: time
            };

        }
        /*
         $("#mainbar .question-summary").each(function(i, e) {
         //console.log($(e).attr("src"));
         $("#questions").find(".summary>h3 a:first").attr('href')
         var data = $(e).find(".summary>h3 a").html();
         console.log( ent.decode( data));
         });
         */
        //   console.log(JSON.stringify(result));
        return result
    },
    getQuestionsByTag: function (tag, page) {
        var p = new Promise(function (resolve, reject) {
            db.findOne({tag: tag}, function (e, result) {
                if (e) {
                    // error
                    console.log(e);
                    return null;
                }
                /*
                 result.cdate
                 */
                if (result.pages >= page) {
                    // return the page
                    return result.pages[page];
                }
                // download the page and send

                var mydata = this.download(url.format(tag, 1), function (page) {
                    var result = qBank.pluckData(page);
                    if (data[tag]) {
                        data[tag].push(result)
                    } else {
                        data[tag] = result;

                    }
                    console.log('----------------------------------------------------------');
                    console.log(tag);
                    console.log(JSON.stringify(result));
                });
            });

        });

        return p;
    }

};


module.exports = qBank;