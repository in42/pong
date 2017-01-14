var canvas = document.getElementById("game-canvas");
var context = canvas.getContext("2d");
var upPressed = false;
var downPressed = false;
var cpuScore=0;
var playerScore=0;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.keyCode == 38) {
        upPressed = true;
    } else if(e.keyCode == 40) {
        downPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 38) {
        upPressed = false;
    } else if(e.keyCode == 40) {
        downPressed = false;
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

var BALL_RADIUS = 5;

function Ball(pos, vel) {
	this.pos = Object.assign({}, pos);
	this.vel = Object.assign({}, vel);

	this.move = function(dt, leftPaddle, rightPaddle) {
		var dPos = new Pos(this.vel.x * dt, this.vel.y * dt);
		if (this.pos.x + dPos.x + BALL_RADIUS < 0) {
			playerScore += 1;
			return false;
		} else if (this.pos.x + dPos.x - BALL_RADIUS>= canvas.width) {
			cpuScore += 1;
			return false;
		}

		var canMoveNormally = true;
		//if (this.pos.y + dPos.y - BALL_RADIUS < 0) {
		//	this.pos.y = BALL_RADIUS - 1;
		//	this.pos.x += dPos.x;
		//	canMoveNormally = false;
		//} 
		//if (this.pos.y + dPos.y + BALL_RADIUS >= canvas.height) {
		//	this.pos.y = canvas.height - BALL_RADIUS;
		//	this.pos.x += dPos.x;
		//	canMoveNormally = false;
		//} 
		//if (leftPaddle.pos.x < this.pos.x &&
		//	this.pos.y + dPos.y <= leftPaddle.pos.y + PADDLE_HALF_LENGTH &&
		//	this.pos.y + dPos.y >= leftPaddle.pos.y - PADDLE_HALF_LENGTH &&
		//	this.pos.x + dPos.x - BALL_RADIUS <= leftPaddle.pos.x + PADDLE_HALF_BREADTH) {
		//	this.pos.x = leftPaddle.pos.x + PADDLE_HALF_BREADTH + BALL_RADIUS;
		//	this.pos.y += dPos.y
		//	canMoveNormally = false;
		//}
		//if (rightPaddle.pos.x > this.pos.x &&
		//	this.pos.y <= rightPaddle.pos.y + PADDLE_HALF_LENGTH &&
		//	this.pos.y >= rightPaddle.pos.y - PADDLE_HALF_LENGTH &&
		//	this.pos.x + dPos.x + BALL_RADIUS >= rightPaddle.pos.x - PADDLE_HALF_BREADTH) {
		//	this.pos.x = rightPaddle.pos.x - PADDLE_HALF_BREADTH - BALL_RADIUS;
		//	this.pos.y += dPos.y
		//	canMoveNormally = false;
		//}

		if (canMoveNormally) {
			this.pos.x += dPos.x ;
			this.pos.y += dPos.y ;
		}

		return true;
	}

	this.handleCollisionsWithWall = function () {
		if (this.pos.y <= BALL_RADIUS - 1 && this.vel.y < 0) {
			this.vel.y = -this.vel.y;
		} else if (this.pos.y >= canvas.height - BALL_RADIUS) {
			this.vel.y = -this.vel.y;
		}
	}

	this.draw = function() {
		context.arc(this.pos.x, this.pos.y, BALL_RADIUS, 0, 2 * Math.PI)
		context.fillStyle = "white";		;
		context.fill();
	}
}

var PADDLE_HALF_BREADTH = 4;
var PADDLE_HALF_LENGTH = 25;
var PADDLE_VELOCITY_Y = 300;

function Paddle(pos) {
	this.pos = Object.assign({}, pos);
	this.velY = PADDLE_VELOCITY_Y;

	this.moveUp = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y - PADDLE_HALF_LENGTH - dy < 0) {
			this.pos.y = PADDLE_HALF_LENGTH;
		} else {
			this.pos.y -= dy;
		}
	}

	this.moveDown = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y + PADDLE_HALF_LENGTH + dy >= canvas.height) {
			this.pos.y = canvas.height - 1 - PADDLE_HALF_LENGTH;
		} else {
			this.pos.y += dy;
		}
	}

	this.tryToHitBall = function (ball) {
		if (this.pos.x < ball.pos.x) {
			if (ball.vel.x < 0 &&
					ball.pos.y >= this.pos.y - PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + PADDLE_HALF_LENGTH &&
					ball.pos.x - BALL_RADIUS <= this.pos.x + PADDLE_HALF_BREADTH) {
				ball.vel.x = -ball.vel.x;
			}
		} else {
			if (ball.vel.x > 0 &&
					ball.pos.y >= this.pos.y - PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + PADDLE_HALF_LENGTH &&
					ball.pos.x + BALL_RADIUS >= this.pos.x - PADDLE_HALF_BREADTH) {
				ball.vel.x = -ball.vel.x;
			}
		}
	}
	this.draw = function() {
		context.fillstyle = "white";
		context.fillRect(this.pos.x - PADDLE_HALF_BREADTH,
				this.pos.y - PADDLE_HALF_LENGTH,
				2 * PADDLE_HALF_BREADTH, 2 * PADDLE_HALF_LENGTH);
	}
}

function drawBoard() {
	context.beginPath();
	context.strokeStyle = "white";
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height - 1);
	context.moveTo(canvas.width / 2 - 1, canvas.height - 1);
	context.lineTo(canvas.width / 2 - 1, 0);
	context.stroke();
	context.closePath();
}

var PADDLE_DIST_FROM_END = 9;
// We are maintaing the centre of the ball in {pos}
var BALL_START_POS = new Pos(canvas.width / 2, BALL_RADIUS);
// We are maintaining the centre of the rectangle in { pos}
var CPU_PADDLE_START_POS = new Pos(PADDLE_DIST_FROM_END, canvas.height / 2); 
var PLAYER_PADDLE_START_POS = new Pos(canvas.width - 1 - PADDLE_DIST_FROM_END,
	canvas.height / 2);
var ballStartVel = new Velocity(300, 300);

var ball, cpuPaddle, playerPaddle;

function initBoard() {
	ball = new Ball(BALL_START_POS, ballStartVel);
	cpuPaddle = new Paddle(CPU_PADDLE_START_POS);
	playerPaddle = new Paddle(PLAYER_PADDLE_START_POS);
	cpuPaddle.move = function(nSecsPassed, ball) {
		if (cpuPaddle.pos.x < ball.pos.x && ball.vel.x < 0 ||
				cpuPaddle.pos.x > ball.pos.x && ball.vel.x > 0) {
			if (ball.pos.y > cpuPaddle.pos.y) {
				cpuPaddle.moveDown(nSecsPassed);
			} else if (ball.pos.y < cpuPaddle.pos.y) {
				cpuPaddle.moveUp(nSecsPassed);
			}
		}
	}
}

initBoard();

function collisionLeft(ball,paddle){
	if( ball.pos.x - BALL_RADIUS < (9 + 2* PADDLE_HALF_BREADTH ) &&  (ball.pos.y < paddle.pos.y + PADDLE_HALF_LENGTH ) && ( ball.pos.y >  paddle.pos.y - PADDLE_HALF_LENGTH )) 
		ball.vel.x=-ball.vel.x;
	
}

function collisionRight(ball,paddle){
	if( ball.pos.x + BALL_RADIUS >(canvas.width-9 - 2* PADDLE_HALF_BREADTH ) &&  (ball.pos.y < paddle.pos.y + PADDLE_HALF_LENGTH ) && ( ball.pos.y >  paddle.pos.y - PADDLE_HALF_LENGTH )) 
		ball.vel.x=-ball.vel.x;
	
}

function drawScore() {
    context.font = "bolder 30px Arial";
    context.fillStyle = "white";
	
	context.fillText(cpuScore, canvas.width/4+0, 50)
	context.fillText(playerScore, canvas.width*3/4, 50)
}

function intelligentPlay(ball,cpuPaddle){
	if (ball.vel.y > 0) {
		cpuPaddle.velY =Math.abs(cpuPaddle.velY);
	} else {
		cpuPaddle.velY = -1 * Math.abs(cpuPaddle.velY);
	}
}

function updateGameState() {
	ball.handleCollisionsWithWall();
	playerPaddle.tryToHitBall(ball);
	cpuPaddle.tryToHitBall(ball);

	var now = new Date().getTime();
	var nSecsPassed = (now - lastDrawnTime) / 1000;
	// var nSecsPassed = 1 / 60;

	if (!(upPressed && downPressed)) {
		if (upPressed) {
			playerPaddle.moveUp(nSecsPassed);
		} else if (downPressed) {
			playerPaddle.moveDown(nSecsPassed);
		}
	}
	cpuPaddle.move(nSecsPassed, ball);

	var ret = ball.move(nSecsPassed, cpuPaddle, playerPaddle);

	if (ret) {
		return true;
	} else {
		return false;
	}
}

function drawGameState() {
	drawBoard();
	drawScore();
	ball.draw();
	playerPaddle.draw();
	cpuPaddle.draw();
	
	lastDrawnTime = new Date().getTime();
}

drawGameState();
var lastDrawnTime = new Date().getTime();

window.main = function() {
	window.requestAnimationFrame(main);

	if (updateGameState()) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawGameState();
	} else {
		ballStartVel.x = -ballStartVel.x
		ball = new Ball(BALL_START_POS, ballStartVel);
	}
}

main();
