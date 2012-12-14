window.AudioContext = (
  window.AudioContext ||
  window.webkitAudioContext ||
  null
);

if (!AudioContext) {
  throw new Error("AudioContext not supported!");
} 

// Create a new audio context.
var ctx = new AudioContext();

// Create a AudioGainNode to control the main volume.
var mainVolume = ctx.createGainNode();
// Connect the main volume node to the context destination.
mainVolume.connect(ctx.destination);


function loadSound(soundFileName, loop, autoplay){
	// Create an object with a sound source and a volume control.
	var sound = {};
	sound.isPlaying = false;
	sound.loop = !!loop;
	var request = new XMLHttpRequest();
	request.open("GET", soundFileName, true);
	request.responseType = "arraybuffer";
	request.onload = function(e) {

		// Create a buffer from the response ArrayBuffer.
		sound.buffer = this.response;

		// Make the sound source use the buffer and start playing it.
		if (autoplay){
			sound.play(0);
		}
	};
	request.send();
	sound.play = function(x, y, z){
		sound.source = ctx.createBufferSource();
		sound.volume = ctx.createGainNode();

		// Connect the sound source to the volume control.
		sound.source.connect(sound.volume);
		// Hook up the sound volume control to the main volume.
		// sound.volume.connect(mainVolume);

		// Make the sound source loop.
		sound.source.loop = this.loop;

		// Load a sound file using an ArrayBuffer XMLHttpRequest.
		sound.panner = ctx.createPanner();
		// Instead of hooking up the volume to the main volume, hook it up to the panner.
		sound.volume.connect(sound.panner);
		// And hook up the panner to the main volume.
		sound.panner.connect(mainVolume);
		sound.panner.setPosition(x,y,z);
		this.source.buffer = ctx.createBuffer(this.buffer, false);
		this.source.noteOn(0); // this has been changed to .start() in the spec
		sound.isPlaying = true;
	}
	sound.stop = function(){
		sound.source.noteOff(0); // this has been changed to .stop() in the spec
		sound.isPlaying = false;
	}
	sound.toggle = function(){
		if (this.isPlaying){
			this.stop();
		}else{
			this.play(0, 0, 0);
		},
	}
	return sound
}


var background = loadSound('monsters/beast/breathing.wav', true, true);
var monster = loadSound('monsters/beast/wake.wav');

var blood = loadSound('player/blood_splatter.wav');
var scream = loadSound('player/scream.wav');

setTimeout(function(){
	blood.play(0, 0, 0)
}, 5000)
