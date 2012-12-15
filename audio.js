window.AudioContext = (
  window.AudioContext ||
  window.webkitAudioContext ||
  null
);

if (!AudioContext) {
  throw new Error("AudioContext not supported!");
}

// Create a new audio context.
var audio = new AudioContext();

// Create a AudioGainNode to control the main volume.
var mainVolume = audio.createGainNode();
// Connect the main volume node to the context destination.
mainVolume.connect(audio.destination);


function loadsound(soundFileName, loop, autoplay){
        // Create an object with a sound source and a volume control.
        var sound = {};
        sound.isPlaying = false;
        sound.loop = !!loop;
        sound.x = 0;
        sound.y = 0;
        sound.z = 0;
        var request = new XMLHttpRequest();
        request.open("GET", soundFileName, true);
        request.responseType = "arraybuffer";
        request.onload = function(e) {

                // Create a buffer from the response ArrayBuffer.
                sound.buffer = this.response;

                // Make the sound source use the buffer and start playing it.
                if (autoplay){
                        sound.play(0,0,0);
                }
        };
        request.send();
        sound.play = function(x, y, z){
                sound.source = audio.createBufferSource();
                sound.volume = audio.createGainNode();

                // Connect the sound source to the volume control.
                sound.source.connect(sound.volume);
                // Hook up the sound volume control to the main volume.
                // sound.volume.connect(mainVolume);

                // Make the sound source loop.
                sound.source.loop = this.loop;

                // Load a sound file using an ArrayBuffer XMLHttpRequest.
                sound.panner = audio.createPanner();
                // Instead of hooking up the volume to the main volume, hook it up to the panner.
                sound.volume.connect(sound.panner);
                // And hook up the panner to the main volume.
                sound.panner.connect(mainVolume);
                sound.panner.setPosition(x,y,z);
                this.source.buffer = audio.createBuffer(this.buffer, false);
                this.source.noteOn(0); // this has been changed to .start() in the spec
                sound.isPlaying = true;
        }
        sound.stop = function(){
                sound.source.noteOff(0); // this has been changed to .stop() in the spec
                sound.isPlaying = false;
        }
        sound.setPosition = function(x, y, z){
        	this.x = x;
        	this.y = y;
        	this.z = z;
        	if(this.panner){
        		this.panner.setPosition(this.x, this.y, this.z);
        	}
        }
        sound.toggle = function(){
                if (this.isPlaying){
                        this.stop();
                }else{
                        this.play(this.x, this.y, this.z);
                }
        }
        return sound
}