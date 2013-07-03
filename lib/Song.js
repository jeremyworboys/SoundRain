
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var util = require('util');
var async = require('async');
var extend = require('node.extend');
var EventEmitter = require('events').EventEmitter;


var Song = function(downloadURL, options) {

    EventEmitter.call(this);

    this.options = extend({}, Song.defaults, options);

    this.url = downloadURL;

};


Song.defaults = {

    outdir: './'

};


util.inherits(Song, EventEmitter);


Song.prototype.download = function() {

    async.series([
        this._validateURL.bind(this),
        this._getPageData.bind(this),
        this._parsePageData.bind(this),
        this._parseTrackData.bind(this),
        this._getTrack.bind(this)
    ]);

};

Song.prototype._validateURL = function(done) {

    // Ensure URL exists
    if (!this.url) {
        this.emit('error', new Error('You must provide a URL from soundcloud.com'));
        done(true);
    }

    var parts = url.parse(this.url);

    // Ensure the passed URL uses the http protocol
    parts.protocol = 'http:';

    // Ensure it's actually SoundCloud we're downloading from
    if (parts.hostname !== 'soundcloud.com') {
        this.emit('error', new Error('The URL provided must be from soundcloud.com'));
        done(true);
    }

    this.url = url.format(parts);

    done();

};

Song.prototype._getPageData = function(done) {

    http.get(this.url, function(res) {

        var pageData = [];

        res.on('data', function(chunk) {
            pageData.push(chunk);
        });

        res.on('end', function() {
            this.pageData = pageData.join('');
            done();
        }.bind(this));

    }.bind(this));

};

Song.prototype._parsePageData = function(done) {

    var trackData = this.pageData.match(/(window\.SC\.bufferTracks\.push\().+(?=\);)/gi)[0];

    var jsonStart = trackData.indexOf('{');

    if (!~jsonStart) done(true);

    try {
        this.trackData = JSON.parse(trackData.slice(jsonStart));
    }
    catch (e) {
        this.emit('error', new Error('Could not parse URL'));
        done(true);
    }

    done();

};

Song.prototype._parseTrackData = function(done) {

    // var trackPattern = /&\w+;|[^\w|\s]/g;
    // var trackArtist  = this.trackData.user.username.replace(trackPattern, '');
    // var trackTitle   = this.trackData.title.replace(trackPattern, '');

    this.trackArtist = this.trackData.user.username;
    this.trackTitle = this.trackData.title;

    done();

};

Song.prototype._getTrack = function(done) {

    var outFile = path.join(this.options.outdir, this.trackArtist + ' - ' + this.trackTitle + '.mp3');

    http.get(this.trackData.streamUrl, function(res) {

        http.get(res.headers.location, function(res) {

            var trackFile = fs.createWriteStream(outFile);

            res.on('data', function(chunk) {
                return trackFile.write(chunk);
            });

            res.on('end', function() {
                trackFile.end();
                this.emit('done', outFile);
                done();
            }.bind(this));

        }.bind(this));

    }.bind(this));

};


module.exports = Song;
