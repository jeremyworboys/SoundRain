/* global describe, it, should */

var should = require('should');
var Song = require('../');


describe('Song', function() {

    it('should export a constructor function', function() {

        Song.should.be.a('function');

        (new Song()).should.be.ok;

    });

    it('should inherit from EventEmitter', function(done) {

        Song.should.be.a('function');

        var soundrain = new Song();

        should.exist(soundrain.on);
        soundrain.on.should.be.a('function');

        soundrain.on('__event', done);
        soundrain.emit('__event');

    });

});
