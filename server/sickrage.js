var http = require('http');
var _ = require('underscore');
var config = require('../config/config.json');

var options = {
    host: config.api.host,
    port: config.api.port
};

var api = function (cmd, done, error) {
    var path = `/api/${config.api.key}/?cmd=${cmd}`;
    var restAPI = http.get(_.extend(options, {
        path: path
    }), function (result) {
        var body = '';
        result.setEncoding('utf8');
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

module.exports = {
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
            cmd = 'show.getposter';
        } else if (type === 'fanart') {
            cmd = 'show.getfanart';
        }
        return api(cmd + "&indexerid=" + id, done, error);
    },
    getHistory: function (limit, done, error) {
        return api("history&type=downloaded&limit=" + limit, function (buff) {
            var data = JSON.parse(buff.toString()).data;
            done(data);
        }, error);
    },
    getFuture: function (type, done, error) {
        return api("future&sort=date&paused=0&type=" + type, function (buff) {
            var data = JSON.parse(buff.toString()).data;
            done(data);
        }, error);
    }
}