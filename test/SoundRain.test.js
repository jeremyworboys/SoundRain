/* global describe, it, should */

var SoundRain = require('../');


describe('SoundRain', function() {

    it('should export a constructor function', function() {

        SoundRain.should.be.a('function');

        (new SoundRain()).should.be.ok;

    });

    it('should inherit from EventEmitter', function(done) {

        SoundRain.should.be.a('function');

        var soundrain = new SoundRain();

        should.exist(soundrain.on);
        soundrain.on.should.be.a('function');

        soundrain.on('__event', done);
        soundrain.emit('__event');

    });

});
