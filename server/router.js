var express = require('express');
var mime = require('mime-types');
var passport = require('passport');
var fs = require('fs');
var path = require('path');

var SickRage = require('./sickrage');

var router = express.Router();

router.get('/serie/:id?', passport.authenticate('basic', { session: false }), function(req, res) {

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

router.get('/stream/:id/:season/:episode', passport.authenticate('basic', { session: false }), function (req, res) {
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

router.get('/subtitle/:id/:season/:episode', passport.authenticate('basic', { session: false }), function (req, res) {
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
                            'Connection': 'keep-alive'
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

router.get('/resource/:id/:type', passport.authenticate('basic', { session: false }), function (req, res) {
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

var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

module.exports = router;