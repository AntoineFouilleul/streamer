var express = require('express');
var session = require("express-session");
var bodyParser = require("body-parser");
var helmet = require('helmet');
var http = require('http');
var httpServer = require('http').Server;
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');
var _ = require('underscore');

var ripSubtitles = require('rip-subtitles');

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

var app = express();
var server = httpServer(app);
app.use(helmet());
app.use(morgan('combined')); // Active le middleware de logging
app.use(passport.initialize());
app.use('/', passport.authenticate('basic', { session: false }));
app.use('/', express.static(path.join(__dirname, 'dist')));

passport.use(new BasicStrategy(
    function(username, password, done) {
      if (username === 'worthless' && password === 'test') {
        return done(null, { username: 'worthless' });
      }
      return done(null, false, { message: 'Incorrect password.' });      
    }
));

var SickRage = (function () {
    var options = {
        host: '82.253.123.14',
        port: 81
    };

    var api = function (cmd, done, error) {
        var path = '/api/9f4a5d07334a3b2c91391d170772c99d/?cmd=' + cmd;
        var restAPI = http.get(_.extend(options, {
            path: path
        }), function (result) {
            var body = '';
            result.setEncoding('binary');
            result.on('data', function (buf) {
                body += buf;
            });
            result.on('end', function (buf) {
                //console.log(body.toString());
                //var data = JSON.parse(body.toString()).data;
                done(body);
                restAPI.end();
            });
        });
        restAPI.on('error', function (err) {
            console.error(err);
            error && error(err.toString());
        });
        return restAPI;
    };

    return {
        getAllShows: function (done, error) {
            return api("shows&sort=name", function (buff) {
                var data = JSON.parse(buff.toString()).data;
                done(data);
            }, error);
        },
        getShowDetail: function (id, done, error) {
            return api("show.seasons&indexerid=" + id, function (buff) {
                var data = JSON.parse(buff.toString()).data;
                done(data);
            }, error);
        },
        getEpisode: function (id, season, episode, done, error) {
            return api("episode&indexerid=" + id + "&season=" + season + "&episode=" + episode + "&full_path=1", function (buff) {
                var data = JSON.parse(buff.toString()).data;
                done(data);
            }, error);
        },
        getResource: function (id, type, done, error) {
            var cmd = '';
            if (type === 'banner') {
                cmd = 'show.getbanner';
            } else if (type === 'poster') {
                cmd = 'show.getposter'
            } else if (type === 'fanart') {
                cmd = 'show.getfanart'
            }
            return api(cmd + "&indexerid=" + id, done, error);
        }
    }
})();

app.get('/rest/serie/:id?', passport.authenticate('basic', { session: false }), function(req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET");

    var id = req.params.id;

    if (id) {
        SickRage.getShowDetail(id, function (data) {
            var seasons = [];
            for (var index in data) {
                if (index !== "0") {
                    var s = data[index]
                    var episodes = [];
                    for (var id in s) {
                        var e = s[id];
                        if (e.location && e.status == "Downloaded" && e.file_size) {
                            episodes.push({
                                id: id,
                                name: e.name
                            });
                        }
                    }
                    seasons.push({
                        index: index,
                        episodes: episodes
                    });
                }
            }
            res.end(JSON.stringify(seasons));
        }, function (err) {
            res.writeHead(500);
            res.end(err);
        });
    } else {
        SickRage.getAllShows(function (data) {
            res.end(JSON.stringify(data));
        }, function (err) {
            res.writeHead(500);
            res.end(err);
        });
    }
});

app.get('/rest/stream/:id/:season/:episode', passport.authenticate('basic', { session: false }), function (req, res) {
    var id = req.params.id;
    var season = req.params.season;
    var episode = req.params.episode;

    var range = typeof req.headers.range === "string" ? req.headers.range : undefined;

    SickRage.getEpisode(id, season, episode, function (data) {
        if (data.location) {
            fs.stat(data.location, function (err, stats) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // 404 Error if file not found
                        console.error(data.location);
                        return res.sendStatus(404);
                    }
                    return res.end(err);
                }

                if (!stats.isFile()) {
                    return res.sendStatus(401);
                }

                var start = 0;
                var end = stats.size - 1;
                var rangeRequest = false;
                
                console.log(" ");
                console.log("New request with range header : " + range);

                if (range !== undefined && (range = range.match(/bytes=(.+)-(.+)?/)) !== null) {
                    // Check range contains numbers and they fit in the file.
                    // Make sure start & end are numbers (not strings) or stream.pipe errors out if start > 0.
                    start = isNumber(range[1]) && range[1] >= 0 && range[1] < end ? range[1] - 0 : start;
                    end = isNumber(range[2]) && range[2] > start && range[2] <= end ? range[2] - 0 : end;
                    rangeRequest = true;
                    console.log("Range parsed : start[" + start + "] / end[" + end + "]");
                }

                var contentType = mime.contentType(path.extname(data.location)) || 'application/octet-stream';
                var filename = data.location.substring(data.location.lastIndexOf('/') + 1);

                // Standards headers
                var headers = {
                    'Content-Type': contentType,
                    'Connection': 'keep-alive',
                    'Content-Length': stats.size,
                    'Content-Disposition': 'inline; filename="' + filename + '";',
                    'Content-Transfer-Encoding': 'binary',
                };

                if (rangeRequest) {
                    var chunksize = (end - start) + 1;
                    //var maxChunk = 1024 * 1024 * 10; // 10MB at a time
                    //if (chunksize > maxChunk) {
                    //    console.log("Max chunk size requested ! Trunk it to 10MB");
                    //    end = start + maxChunk - 1;
                    //    chunksize = maxChunk;
                    //}

                    headers.Status = '206 Partial Content';
                    headers['Accept-Ranges'] = 'bytes';
                    headers['Content-Length'] = chunksize;
                    headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stats.size;

                    console.log("Sending status code 206");
                    res.writeHead(206, headers);
                } else {
                    console.log("Sending status code 200");
                    res.writeHead(200, headers);
                }

                //probe(data.location, function(err, probeData) {
                //    for (var i in probeData.streams) {
                //        console.log(' - Codec: ' + probeData.streams[i].codec_name);
                //    }
                //    console.log(' - Format: ' + probeData.format.format_name);
                //});

                var stream = fs.createReadStream(data.location, {
                    flags: 'r',
                    start: start,
                    end: end
                });
                console.log("Streaming content ...");
                stream.on('error', function (err) {
                    console.error(err);
                    res.end(err.toString());
                });
                stream.on('close', function(){
                    console.log("Close of streaming content.");
                });
                stream.on('end', function(){
                    console.log("End of streaming content.");
                });
                stream.on('finish', function(){
                    console.log("Finish of streaming content.");
                });
                stream.pipe(res, {
                    end: true
                });
            });
        }

    }, function (err) {
        res.writeHead(500);
        res.end(err);
    });
});

app.get('/rest/subtitle/:id/:season/:episode', passport.authenticate('basic', { session: false }), function (req, res) {
    var id = req.params.id;
    var season = req.params.season;
    var episode = req.params.episode;

    var range = typeof req.headers.range === "string" ? req.headers.range : undefined;

    SickRage.getEpisode(id, season, episode, function (data) {

        if (data.location) {
            // Define path of french subtitle
            var subPath = data.location.substring(0, data.location.lastIndexOf('.')) + '.fr.srt';

            fs.stat(subPath, function (err, stats) {
                if (err) {
                    if (err.code === 'ENOENT') {

                        // Try to get subtitle from video
                        // ripSubtitles(data.location, { lang: 'fre', format: 'webvtt' }, function (err, subtitles) {
                        //     if (subtitles) {
                        //         res.writeHead(200, {
                        //             'Content-Type': 'text/plain; charset=UTF-8',
                        //             'Connection': 'keep-alive',
                        //             'Content-Length': subtitles.toString().length
                        //         });

                        //         return res.end(subtitles);
                        //     }
                        // });

                        // 404 Error if file not found
                        console.error(err);
                        return res.sendStatus(404);
                    } else {
                        return res.end(err);
                    }
                } else {

                    fs.readFile(subPath, function (err, fileBuffer) {
                        if (err) {
                            // 401 Error if file not found
                            console.error(err);
                            return res.sendStatus(401);
                        }

                        var output = 'WEBVTT FILE\r\n\r\n' + fileBuffer.toString()
                            .replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2') + '\r\n\r\n';

                        res.writeHead(200, {
                            'Content-Type': 'text/plain; charset=UTF-8',
                            'Connection': 'keep-alive',
                            'Content-Length': output.length
                        });

                        res.end(output);
                    });
                }
            });
        }

    }, function (err) {
        res.writeHead(500);
        res.end(err);
    });
});

app.get('/rest/resource/:id/:type', passport.authenticate('basic', { session: false }), function (req, res) {
    var id = req.params.id;
    var type = req.params.type;

    if (type !== 'banner' && type !== 'poster' && type !== 'fanart') {
        res.writeHead(401);
        return res.end();
    }

    SickRage.getResource(id, type, function (data) {

        res.writeHead(200, {
            'Content-Type': 'image/jpeg'
        });

        res.end(data, 'binary');

    }, function (err) {
        res.writeHead(500);
        res.end(err);
    });
});

// development error handler
// will print stacktrace
app.use(function(err, req, res) {
    err = err || {};
    var msg = err.message || err.msg || 'Internal Server Error';
    if (err.message || err.msg) {
        console.error(msg);
    }
    if (!err.hideStack && !err.statusCode) {
        console.error(error.stack);
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

// Redirect other page
app.use(function(req, res) {
    console.error('Router error: Unknow route (' + req.url + ')');
    return res.sendStatus(404);
});

var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    var bind = 'Port 80';
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
    }
}
  
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

/*
 * Start server
 */
server.listen(80, '0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);