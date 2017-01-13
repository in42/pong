var canvas = document.getElementById("game-canvas");
var context = canvas.getContext("2d");
var upPressed = false;
var downPressed = false;
var score1=0;
var score2=0;
var turn=1;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
function keyDownHandler(e) {
    if(e.keyCode == 38) {
        upPressed = true;
    }
    else if(e.keyCode == 40) {
        downPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.keyCode == 38) {
        upPressed = false;
    }
    else if(e.keyCode == 40) {
        upPressed = false;
    }
}

function mouseMoveHandler(e) {
    var relativeY = e.clientY;
    if(relativeY  > 50+PADDLE_HALF_LENGTH && relativeY < canvas.height) {
        paddle2.pos.y = relativeY 
    }
}
function Pos(x, y) {
	this.x = x;
	this.y = y;
}

function Velocity(v_x, v_y) {
	this.x = v_x;
	this.y = v_y;
}

var BALL_RADIUS = 10;

function Ball(pos, vel) {
	this.pos = pos;
	this.vel = vel;

	this.draw = function() {
		
		/*context.fillRect(
				this.pos.x - BALL_RADIUS, this.pos.y - BALL_RADIUS,
				2 * BALL_RADIUS, 2 * BALL_RADIUS);*/
		context.arc(this.pos.x,this.pos.y,BALL_RADIUS,0,2*Math.PI)
		context.fillStyle = "white";		;
		context.fill();
	}

	this.move = function() {
		if (this.pos.x +this.vel.x- BALL_RADIUS <0)
				 {
			//this.vel.x=-this.vel.x;
			//this.pos.x+=this.vel.x * dt;
			score2+=1;
			return false;
		}
		else if (this.pos.x +this.vel.x + BALL_RADIUS >= canvas.width){
			score1+=1;
			return false;
			
		}

		if (this.pos.y + this.vel.y - BALL_RADIUS <50||
				this.pos.y + this.vel.y + BALL_RADIUS > canvas.height  ) {
			this.vel.y = -this.vel.y;
		}
		this.pos.x += this.vel.x ;
		this.pos.y += this.vel.y ;

		return true;
	}
}

var PADDLE_HALF_BREADTH = 4;
var PADDLE_HALF_LENGTH = 25;

function Paddle(pos) {
	this.pos = pos;
	this.vel_y = 2;
	this.move_up = function() {
		pos.y -= this.vel_y ;
	};
	this.move_down = function() {
		pos.y += this.vel_y ;
	}
	this.draw = function() {
		context.fillstyle = "white";
		context.fillRect(pos.x - PADDLE_HALF_BREADTH,
				pos.y - PADDLE_HALF_LENGTH,
				2 * PADDLE_HALF_BREADTH, 2 * PADDLE_HALF_LENGTH);
	}
	
	this.move = function(){
		if(this.pos.y + PADDLE_HALF_LENGTH + this.vel_y > canvas.height || this.pos.y -PADDLE_HALF_LENGTH + this.vel_y <50 )
			this.vel_y= -this.vel_y ;
		this.pos.y += this.vel_y;
	}
	
	this.move2=function(){
		if(upPressed && this.pos.y - PADDLE_HALF_LENGTH - this.vel_y > 50) {
			this.move_up();
    }
    else if(downPressed && this.pos.y + PADDLE_HALF_LENGTH + this.vel_y < canvas.height) {
        this.move_down();
    }
    
	}
}

function draw_board() {
	context.beginPath();
	context.strokeStyle = "white";
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height - 1);
	context.moveTo(canvas.width / 2 - 1, canvas.height - 1);
	context.lineTo(canvas.width / 2 - 1, 0);
	context.moveTo(0, 50);
	context.lineTo(canvas.width , 50)
	context.moveTo(0, 52);
	context.lineTo(canvas.width , 52)
	context.stroke();
	context.closePath();
}

var BALL_START_POS = new Pos(canvas.width / 2, BALL_RADIUS+50); //We are maintaing the centre of the balll in {pos}
var PADDLE1_START_POS = new Pos(9, canvas.height / 2); // We are maintaining the centre of the rectangle in { pos}
var PADDLE2_START_POS = new Pos(canvas.width - 1 - 9, canvas.height / 2);

var ball = new Ball(BALL_START_POS, new Velocity(5, 5));
var paddle1 = new Paddle(PADDLE1_START_POS);
var paddle2 = new Paddle(PADDLE2_START_POS);
//var lastDrawnTime = new Date().getTime();

function collisionLeft(ball,paddle){
	if( ball.pos.x - BALL_RADIUS < (9 + 2* PADDLE_HALF_BREADTH ) &&  (ball.pos.y < paddle.pos.y + PADDLE_HALF_LENGTH ) && ( ball.pos.y >  paddle.pos.y - PADDLE_HALF_LENGTH )) 
		ball.vel.x=-ball.vel.x;
	
}

function collisionRight(ball,paddle){
	if( ball.pos.x + BALL_RADIUS >(canvas.width-9 - 2* PADDLE_HALF_BREADTH ) &&  (ball.pos.y < paddle.pos.y + PADDLE_HALF_LENGTH ) && ( ball.pos.y >  paddle.pos.y - PADDLE_HALF_LENGTH )) 
		ball.vel.x=-ball.vel.x;
	
}

function drawScore() {
    context.font = "bolder 20px Arial";
    context.fillStyle = "#FFFFFF";
	
    context.fillText("Score:", 8, 30);
	context.fillText(score1, canvas.width/4+0, 30)
	context.fillText(score2, canvas.width*3/4, 30)
	
	
	
}
function drawGameState() {
	draw_board();
	drawScore();
	ball.draw();
	paddle1.move();
	paddle2.move2();
	collisionLeft(ball,paddle1);
	collisionRight(ball,paddle2);
	paddle1.draw();
	
	paddle2.draw();
	
	//lastDrawnTime = new Date().getTime();
}

window.main = function() {
	window.requestAnimationFrame(main);
	//var now = new Date().getTime();
	if (ball.move()) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawGameState();
	}
	else{
		//alert("LOST GAME OVER");
		//document.location.reload();
		ball.pos.x=canvas.width / 2;
		ball.pos.y=BALL_RADIUS+50;
		paddle1.pos.x=9;
		paddle1.pos.y=canvas.height / 2;
		paddle2.pos.x=canvas.width - 1 - 9;
		paddle2.pos.y=canvas.height / 2;
		ball.vel.x=5*turn;
		ball.vel.y=5;
		turn=-turn;
	}
	
}

main();
