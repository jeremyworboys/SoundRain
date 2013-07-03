
var Song = require('./Song');
var fs = require('fs');
var path = require('path');
var util = require('util');
var extend = require('node.extend');
var EventEmitter = require('events').EventEmitter;


var SoundRain = function(url, options) {

    EventEmitter.call(this);

    this.options = extend({}, SoundRain.defaults, options);

    if (url) return this.getSong(url);

};


SoundRain.defaults = {

    outdir: __dirname

};


util.inherits(SoundRain, EventEmitter);


SoundRain.prototype.getSong = function(url) {

    if (!this._validateOptions()) return false;

    var song = new Song(url, this.options);

    song.on('error', function(err) {
        this.emit('error', err);
        return false;
    }.bind(this));

    song.download();

};

SoundRain.prototype._validateOptions = function() {

    var tmpFile = '.soundrain_' + Date.now();
    var tmpPath = path.resolve(this.options.outdir, tmpFile);
    var tmpStream;

    // Attempt to write a file to the outdir
    try {
        tmpStream = fs.createWriteStream(tmpPath);
    }
    catch (e) {
        this.emit('error', new Error('Incorrect write permissions on outdir (' + this.options.outdir + ')'));
        return false;
    }

    tmpStream.end();

    // Remove written file
    fs.unlink(tmpPath, function(err) {
        if (err) this.emit('error', err);
    }.bind(this));

    // Circumvent this test for this instance's life-cycle
    this._validateOptions = function() {
        return true;
    };

    return true;

};


module.exports = SoundRain;
