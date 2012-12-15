var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

var mouseX = 0, mouseY, dragX, mousedown, nwse, frame = 0;

var map = [
	
];

var sounds = {
	breathing: loadsound('breathing.wav', true, true),
	step1: loadsound('step1.wav'),
	step2: loadsound('step2.wav')
}

var keys = {
	w: false,
	a: false,
	s: false,
	d: false
}

var player = {
	x: 0,
	z: 0,
	speed: 1,
	direction: 0
}

function draw(){
	frame += 1;
	canvas.width = window.innerWidth;
  	canvas.height = window.innerHeight;
  	
  	for(nwse=-player.direction/4; nwse < -360; nwse+=360){}
  	
  	//draw minimal graphics
  	ctx.fillStyle = '#999';
  	ctx.fillRect(0, 0, canvas.width, canvas.height);
  	ctx.fillStyle = '#555';
  	ctx.font = 'bold 75px sans-serif';
  	ctx.textAlign = 'center';
  	ctx.fillText('Sound of Death', canvas.width/2, 75);
  	ctx.font = '20px sans-serif';
  	ctx.fillText('Works in chrome | Please use earphones', canvas.width/2, 100);
  	ctx.fillStyle = '#777';
  	ctx.fillRect(0, canvas.height/2, canvas.width, 10);
  	ctx.fillStyle = '#555';
  	ctx.font = '45px sans-serif';
  	nwseAdd();
  	ctx.fillText('N', (nwse/360)*(canvas.width*4), canvas.height/2+22.5);
  	nwseAdd();
  	ctx.fillText('W', (nwse/360)*(canvas.width*4), canvas.height/2+22.5);
  	nwseAdd();
  	ctx.fillText('S', (nwse/360)*(canvas.width*4), canvas.height/2+22.5);
  	nwseAdd();
  	ctx.fillText('E', (nwse/360)*(canvas.width*4), canvas.height/2+22.5);
  	
  	ctx.fillRect(player.x+canvas.width/2, player.z+ canvas.height/2, 10, 10);
  	
  	sounds.breathing.setPosition(Math.cos(player.direction/4)*(player.x/100), 0, Math.sin(player.direction/4)*(player.x/100));
  	if(playerdistancetest(0, 0, 50) === true){
  		console.log("yay");
  	}
  	
  	
  	//player functions
  	if(keys.w === true){
  		playstep();
  		player.x += Math.cos(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  		player.z += Math.sin(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  	}else if(keys.s === true){
  		playstep();
  		player.x -= Math.cos(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  		player.z -= Math.sin(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  	}
  	if(keys.a === true){
  		player.direction -= 4;
  	}else if(keys.d === true){
  		player.direction += 4;
  	}
  	
  	requestAnimationFrame(draw);
}

function playstep(){
	if(frame % 60 === 0){
		sounds.step1.volume = 0.3;
		sounds.step1.play(0, 0, 0);
	}else if(frame % 30 === 0){
		sounds.step2.play(0, 0, 0);
	}
}

function nwseAdd(){
	nwse+=90;
	if(nwse> 360){
		nwse-=360;
	}
}

function playerdistancetest(x, z, distance){
	if(player.x < x+distance && player.x > x-distance && player.z > z+distance && player.z > z-distance){
		return true;
	}else{
		return false;
	}
}

document.onmousemove = function(event){
	mouseX = event.offsetX;
	mouseY = event.offsetY;
	if(mousedown === true){
		player.direction -= dragX - event.offsetX;
		dragX = event.offsetX;
	}
}

document.onmousedown = function(event){
	dragX = event.offsetX;
	mousedown = true;
}

document.onmouseup = function(event){
	mousedown = false;
}


document.onkeydown = function(event){
	//console.log(event.keyCode);
	if(event.keyCode === 87){
		keys.w = true;
	}else if(event.keyCode === 65){
		keys.a = true;
	}else if(event.keyCode === 83){
		keys.s = true;
	}else if(event.keyCode === 68){
		keys.d = true;
	}
}

document.onkeyup = function(event){
	if(event.keyCode === 87){
		keys.w = false;
	}else if(event.keyCode === 65){
		keys.a = false;
	}else if(event.keyCode === 83){
		keys.s = false;
	}else if(event.keyCode === 68){
		keys.d = false;
	}
}

draw();