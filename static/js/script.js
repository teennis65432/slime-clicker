/*
	Slime Clicker developed by Tyler Ennis.
*/

var colors = ["red", "gold", "yellow", "green", "blue", "purple", "pink"]; //Colors of the Slime

var score = 0; //Score of the player
var username; //Username of player (only have to take once)

//Slime object template
class Slime {
	constructor(scale) {
  	if(scale != undefined){
    	this.scale = scale;
    } else {
  		this.scale = bRand(15, 30) / 10; //Scale from 1.5to 3
    }
    
    this.x = bRand(300, 900);
    this.y = 754;
    
    this.color = colors[bRand(0, 6)];
    
    //setting up the sprite
    this.spritelink = "/static/graphics/" 
    +  this.color
    + "slime.png";
    this.sprite = new Image();
    this.sprite.src = this.spritelink;
    this.sprite.crossOrigin = true;
    
    //Give a random starting velocity;
    this.dx = bRand(-10, 10); //min value negative for left
    this.dy = bRand(48, 52);
    console.log("y " + this.dy);
    
    if(this.color === "gold"){
    	this.points = 5;
    } else {
    	this.points = 1;
    }
  }
  
  //Render method to draw the slime on the canvas
  render(){
  	//get scaled width (DO IT HERE NOT DURING INIT)
    this.scaledWidth = this.sprite.width*this.scale;
    this.scaledHeight = this.sprite.height*this.scale;
    
  	ctx.drawImage(this.sprite, this.x, this.y, this.scaledWidth, this.scaledHeight);
  }
  
  //Update method to handle slime logistics
  update(){
  	this.x -= this.dx;
    this.y -= this.dy;
    
    this.dy -= 2; //Account for gravity every loop
  }
}

//Context for graphics
var ctx;

//array of all slimes
var slimes = []; 

//When document is ready
$(document).ready( function() {
  //Play the game when click the play button
	$("#play").on('click', function(){ play() });
  //Pause the game on clicking the pause button
  $("#pause").on('click', function(){ pause() });
  //Resume from the pause menu
  $("#resume").on('click', function(){ play() });
  
  //Post game data to database
  $("#aboutme").on('click', function(){
  	$.post("add",
  	{
    	user: username,
      score: score,
      pressed: 'aboutme'
  	},
  	function(){
   		alert("sent post");
    });
  });
  $("#highscores").on('click', function(){
  	$.post("add",
  	{
    	user: username,
      score: score,
      pressed: 'scores'
  	},
  	function(){
   		alert("sent post");
    });
  });
  
  //Setting up context
  ctx = $("#game").get(0).getContext('2d');
  //ctx.imageSmoothingEnabled = false;
  
  //fitting canvas to window
  //Note: has to be done in JS, CSS results in weirdness
  ctx.canvas.width = $(window).width();
  ctx.canvas.height = $(window).height();
  
  console.log(ctx.canvas.width + " x " + ctx.canvas.height);
  
  ctx.canvas.addEventListener('click', function(event){
  	let mouse = getMousePos(ctx, event);
    
    slimes.forEach(function(slime) {
    	ctx.beginPath();
    	ctx.rect(slime.x, slime.y, slime.scaledWidth, slime.scaledHeight);
      ctx.stroke();
      
      if(ctx.isPointInPath(mouse.x, mouse.y)){
        score += slime.points;
        let i = slimes.indexOf(slime);
        slimes.splice(i, 1);
      }
      
      //Clear rectangles
      ctx.clearRect(0, 0, $(window).width(), $(window).height());
    })
	});
});

var gameloop; //Variable to store interval of the game loop

//When play button clicked
function play(){
	$("#title").hide(); //Hide the logo
	$("#play").hide(); //Hide the play button
  $("#pause").show(); //Show the pause button
  $("#pausemenu").hide(); //Hide the pause menu
  
  //Get the user's name
  if(username == null){
  	username = getUser();
  }
  
  //Starts rendering the game
  gameloop = setInterval(render, 20);
}

function pause(){
	clearInterval(gameloop); 	//pause the game loop
  
  $("#pausemenu").show(); //show the pause menu
}

/* //test dummy
var man = new Slime();
slimes.push(man);
console.log("Man scale: " + man.scale);
console.log(slimes[0]); */

var spawnNum; //Random int, decides if slimes will spawn

//Function that runs to render game
function render(){
	//clear the canvas every frame so no trailing
  ctx.clearRect(0, 0, $(window).width(), $(window).height());
  
  //render all slimes in array
  slimes.forEach(function(slime){
  	slime.update();
    slime.render();
  });
  
  //Spawn slimes at a random frequency
  spawnNum = bRand(1, 100);
  if(spawnNum < 2){
  	slimes.push(new Slime());
  }
  
  //Render the score
  ctx.font = "bold 30px Verdana";
  ctx.fillStyle = "#303030";
  ctx.fillText("Score: " + score, 10, 50);
}

//Helper function, return random int between min and max (inclusive)
function bRand(min, max){
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

//Helper function to get mouse position
function getMousePos(ctx, evt) {
  var ClientRect = ctx.canvas.getBoundingClientRect();
  return { //objeto
    x: Math.round(evt.clientX - ClientRect.left),
    y: Math.round(evt.clientY - ClientRect.top)
  }
}

//Helper function, prompt for the user's name
function getUser(){
	let s = prompt("Please enter a username (No more than 25 characters)");
  
  //Make sure length is 25
  if(s == null || s.length == 0){
  	alert("Please enter a name");
    return getUser();
  } else if(s.length < 25){
  	return s;
  } else {
  	alert("Please enter something less than 25 characters");
  	return getUser();
  }
}