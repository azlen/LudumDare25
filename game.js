var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

var mouseX = 0, mouseY, dragX, mousedown, nwse, frame = 0;

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var scenes = [];
var currentScene = undefined;

var currentLevel = 0;
var currentObjective = 0;
var levels = [
	{name:'Escape part 1', map:[
		'W','W','W','W','W','W','W','W','W','W','W',
		'W','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','W','W',
	], maplength: 11, playerspawn: [200, 400], objectives:[[900, 400]], startText: 'Some guy who calls himself a necromancer unlocked your prison door. There is a door to the north, walk there. The sound you hear right now is your objective.'},
	{name:'Escape part 2', map:[
		'W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W',
		'W','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W',
	], maplength: 20, playerspawn: [200, 300], objectives:[[1700, 300]], startText: 'There is now a long corridor leading north. The necromancer strides ahead and uses his magics to put them into a deep sleep... Interesting.'},
	{name:'Escape part 3', map:[
		'W','W','W','W','W','W','W','W','W','W','W','W','W','W','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','_','_','_','_','W',
		'W','_','_','_','_','_','_','_','_','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','_','_','_','_','_','W',
		'W','W','W','W','W','W','W','W','W','W','W','W','W','W','W',
	], maplength: 15, playerspawn: [200, 700], objectives:[ [1200, 1200]], startText: 'There is a room up ahead with a beast sleeping. You must be careful.'},
]
var leveltext;

var step1 = loadsound('step1.wav');
var step2 = loadsound('step2.wav');
var objective = loadsound('objective.wav');
var snoring = loadsound('snoring.wav');
var beast = {
	sleeping: loadsound('beast_sleeping.wav'),
	breathing: loadsound('beast_breathing.wav'),
	roar: loadsound('beast_roar.wav'),
	run: loadsound('beast_run.wav')
}
var death = loadsound('death.wav');


var monsters = [];

createmonster = function(x, z){
	this.x = x;
	this.z = z;
	this.asleep = true;
	this.control = function(){
		if(player.x > this.x - 75 && player.x < this.x+75 && player.z > this.z - 75 && player.z < this.z+75){
			this.asleep = false;
			beast.roar.play(this.x, this.y);
		}
		if(this.asleep === true && frame%90 === 0){
			beast.sleeping.play(this.x, this.y);
		}else{
			var direction = Math.atan2(this.z - player.z, this.x - player.x);
			this.x += Math.cos(direction)*4;
			this.z += Math.sin(direction)*4;
			if(frame%20 === 0){
				beast.run.play(this.x, this.z);
			}
			if(frame%100 === 0){
				beast.breathing.play(this.x, this.z)
			}
			if(player.x > this.x - 25 && player.x < this.x+25 && player.z > this.z - 25 && player.z < this.z+25){
				death.play(player.x, player.z);
				switchScene(deathScene);
			}
		}
	}
	monsters.push(this);
}

/*createmonster.prototype.control = function(){
	if(player.x > this.x - 75 && player.x < this.x+75 && player.z > this.z - 75 && player.z < this.z+75){
		this.asleep = false;
		beast.roar.play(this.x, this.y);
	}
	if(this.asleep === true && frame%90 === 0){
		beast.sleeping.play(this.x, this.y);
	}else{
		var direction = Math.atan2(this.z - player.z, this.x - player.x);
		this.x += Math.cos(direction)*4;
		this.z += Math.sin(direction)*4;
		if(frame%20 === 0){
			beast.run.play(this.x, this.z);
		}
		if(frame%100 === 0){
			beast.breathing.play(this.x, this.z)
		}
		if(player.x > this.x - 25 && player.x < this.x+25 && player.z > this.z - 25 && player.z < this.z+25){
			death.play(player.x, player.z);
			switchScene(deathScene);
		}
	}
}*/

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

button = function(xpos, ypos, width, height, buttontext, onclick, center){
	this.center = false;
	if(center === true){
		this.center = true;
		this.modifier = xpos;
	}
	this.x = xpos;
	this.y = ypos;
	this.w = width;
	this.h = height;
	this.text = buttontext;
	this.buttoncolor = "#777";
	this.UItype = "button";
	this.click = onclick;
	this.corners = 20;
	
}

button.prototype.draw = function(){
	if(this.center === true){
		this.x = canvas.width/2 - (this.w/2) - this.modifier;
	}

	ctx.fillStyle = this.buttoncolor;
	ctx.beginPath();
	ctx.moveTo(this.x + this.corners, this.y);
	ctx.lineTo(this.x + this.w - this.corners, this.y);
	ctx.quadraticCurveTo(this.x + this.w, this.y, this.x + this.w, this.y + this.corners);
	ctx.lineTo(this.x + this.w, this.y + this.h - this.corners);
	ctx.quadraticCurveTo(this.x + this.w, this.y + this.h, this.x + this.w - this.corners, this.y + this.h);
	ctx.lineTo(this.x + this.corners, this.y + this.h);
	ctx.quadraticCurveTo(this.x, this.y + this.h, this.x, this.y + this.h - this.corners);
	ctx.lineTo(this.x, this.y + this.corners);
	ctx.quadraticCurveTo(this.x, this.y, this.x + this.corners, this.y);
	ctx.closePath();
	ctx.fill();

	//ctx.fillRect(this.x, this.y, this.w, this.h);
	ctx.fillStyle = "#444";
	ctx.font = "bold " + (Math.min(this.w, this.h) - 20) + "px sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(this.text, this.x + (this.w/2), this.y + (this.h/2 + 10));
}

button.prototype.click = function(){
	if(this.click !== undefined){
		this.click();
	}
}


scene = function(){
	scenes.push(this);
}

scene.prototype.draw = function(){
	//draw gets called every frame as long as that scene is the current scene.
}

scene.prototype.init = function(){
	//this is what gets called at the very start of the game. It should only be called once.
}

function switchScene(S){
	currentScene = S;
}

function startGame(CurrScene){
	for(var i = 0; i < scenes.length; i++){
		scenes[i].init();
	}
	switchScene(CurrScene);
	draw();
}


var menu = new scene();
menu.init = function(){
	this.UI = [
		new button(0, 300, 300, 50, "Play game", function(){resetgame(); switchScene(game)}, true),
		new button(150, 375, 50, 100, "<", function(){currentLevel-=1;if(currentLevel < 0){currentLevel = levels.length-1}}, true),
		new button(-150, 375, 50, 100, ">", function(){currentLevel+=1;if(currentLevel > (levels.length - 1)){currentLevel = 0;}}, true)
	];
}
menu.draw = function(){
	ctx.textAlign = 'center';
	ctx.fillStyle = '#555';
  	ctx.font = 'bold 20px sans-serif';
  	ctx.fillText(levels[currentLevel].name, canvas.width/2, 408);
  	ctx.fillText('level ' + (currentLevel+1), canvas.width/2, 458);
}

var success = new scene();
success.init = function(){
	this.UI = [
		new button(0, 360, 300, 50, "Back to menu", function(){switchScene(menu)}, true)
	];
}
success.draw = function(){
	ctx.textAlign = 'center';
	ctx.fillStyle = '#555';
  	ctx.font = 'bold 40px sans-serif';
  	ctx.fillText('You have successfully completed : ' + levels[currentLevel].name + '!', canvas.width/2, 320);
}

var deathScene = new scene();
deathScene.init = function(){
	this.UI = [
		new button(0, 360, 300, 50, "Back to menu", function(){switchScene(menu)}, true)
	];
}
deathScene.draw = function(){
	ctx.textAlign = 'center';
	ctx.fillStyle = '#555';
  	ctx.font = 'bold 40px sans-serif';
  	ctx.fillText('You died...', canvas.width/2, 320);
}

var game = new scene();
game.init = function(){
	this.UI = [
		
	];
}
game.draw = function(){
  	for(nwse=-player.direction/4; nwse < -360; nwse+=360){player.direction = nwse}
  	
  	ctx.textAlign = 'center';
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
  	
  	ctx.fillRect(player.x, player.z, 10, 10);
  	
  	ctx.font = '20px sans-serif';
  	ctx.fillText(leveltext, canvas.width/2, canvas.height/2+75);
  	
  	audio.listener.setPosition(player.x/100, 0, player.z/100);
  	audio.listener.setOrientation(Math.cos((player.direction-90)/4/(180/Math.PI)), 0, Math.sin(player.direction/4/(180/Math.PI)), 0, 1, 0);
  	
  	if(player.x > objective.x - 50 && player.x < objective.x+50 && player.z > objective.z - 50 && player.z < objective.z+50){
  		switchScene(success);
  	}
  	
  	if(frame%120 === 0){
  		objective.setPosition(levels[currentLevel].objectives[currentObjective][0], levels[currentLevel].objectives[currentObjective][1])
  		objective.play();
  	}
  	
  	if(levels[currentLevel].name === 'Escape part 2'){
  		if(frame % 90 === 0){
  			snoring.play(1000, -300);
  		}
  		if(frame % 150 === 0){
  			snoring.play(300, 800);
  		}
  	}
  	
  	for(i = 0; i < monsters.length; i++){
  		monsters[i].control();
  	}
  	
  	
  	//player functions
  	if(keys.w === true){
  		var nextX = player.x + Math.cos(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  		var nextZ = player.z + Math.sin(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  		
  		moveplayer(nextX, nextZ);
  	}else if(keys.s === true){
  		var nextX = player.x - Math.cos(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  		var nextZ = player.z - Math.sin(player.direction/(180 / Math.PI)/4 - (45/(180 / Math.PI)))*player.speed;
  		moveplayer(nextX, nextZ);
  	}
  	if(keys.a === true){
  		player.direction -= 4;
  	}else if(keys.d === true){
  		player.direction += 4;
  	}
  	
}

function moveplayer(nextX, nextZ){
	var maplength = levels[currentLevel].maplength;
	var mapheight = levels[currentLevel].map.length/levels[currentLevel].maplength;
	
	console.log(Math.round(nextX/100)+Math.round(nextZ/100)*maplength);
	if(levels[currentLevel].map[Math.round(nextX/100)+Math.round(nextZ/100)*maplength] != 'W'){
		player.x = nextX;
		player.z = nextZ;
		playstep();
	}else{
		console.log('I hit a wall sir!');
	}
}


function draw(){
	frame += 1;
	canvas.width = window.innerWidth;
  	canvas.height = window.innerHeight;
  	
  	//draw minimal graphics
  	ctx.fillStyle = '#999';
  	ctx.fillRect(0, 0, canvas.width, canvas.height);
  	ctx.fillStyle = '#555';
  	ctx.font = 'bold 75px sans-serif';
  	ctx.textAlign = 'center';
  	ctx.fillText('Necrominously', canvas.width/2, 75);
  	ctx.font = 'bold 140px sans-serif';
  	ctx.fillText('~ Evil ~', canvas.width/2, 230);
  	ctx.font = '20px sans-serif';
  	ctx.fillText('Revenge                                                       is okay...', canvas.width/2, 170);
  	ctx.fillText('For it is your future', canvas.width/2, 260);
  	ctx.fillText('Works in chrome | Please use earphones', canvas.width/2, 110);
  	
  	for(var i = 0; i < currentScene.UI.length; i++){
		currentScene.UI[i].draw();
	}
  	
  	currentScene.draw();
  	
  	requestAnimationFrame(draw);
}

function resetgame(){
	player.x = levels[currentLevel].playerspawn[0];
	player.z = levels[currentLevel].playerspawn[1];
	player.direction = 180;
	leveltext = levels[currentLevel].startText;
	monsters = [];
	if(levels[currentLevel].name === 'Escape part 3'){
  		createmonster(1400, 700);
  	}
}

function playstep(){
	if(frame % 60 === 0){
		step1.setPosition(player.x, player.z);
		step1.play();
	}else if(frame % 30 === 0){
		step2.setPosition(player.x, player.z);
		step2.play();
	}
}

function nwseAdd(){
	nwse+=90;
	if(nwse> 360){
		nwse-=360;
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

document.onclick = function(event){
	for(i = 0; i < currentScene.UI.length; i++){
		if(mouseX > currentScene.UI[i].x && mouseX < (currentScene.UI[i].x + currentScene.UI[i].w) && mouseY > currentScene.UI[i].y && mouseY < (currentScene.UI[i].y + currentScene.UI[i].h)){
			currentScene.UI[i].click();
		}
	}
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

startGame(menu);