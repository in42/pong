var canvas = document.getElementById("game-canvas");
canvas.focus();
var context = canvas.getContext("2d");

// variables to check if the up or down keys are pressed or not
var upPressed = false;
var downPressed = false;

// object to hold all game variables
var game = {};
game.cpuScore=0;
game.playerScore=0;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.keyCode == 87) {
        upPressed = true;
    } else if (e.keyCode == 83) {
        downPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 87) {
        upPressed = false;
    } else if (e.keyCode == 83) {
        downPressed = false;
    }
}

function Pos(x, y) {
	this.x = x;
	this.y = y;
}

function Velocity(vX, vY) {
	this.x = vX;
	this.y = vY;
}

game.BALL_RADIUS = 7;
game.ballWallCollisionSound = new Audio("sounds/ball_wall_collision.wav");

function Ball(pos, vel) {
	this.pos = Object.assign({}, pos);
	this.vel = Object.assign({}, vel);

	this.move = function(dt, leftPaddle, rightPaddle) {
		var ret = true;
		var dPos = new Pos(this.vel.x * dt, this.vel.y * dt);
		if (this.pos.x + game.BALL_RADIUS < 0) {
			game.playerScore += 1;
			ret = false;
		} else if (this.pos.x - game.BALL_RADIUS >= canvas.width) {
			game.cpuScore += 1;
			ret = false;
		}

		var canMoveNormally = true;
		//if (this.pos.y + dPos.y - game.BALL_RADIUS < 0) {
		//	this.pos.y = game.BALL_RADIUS - 1;
		//	this.pos.x += dPos.x;
		//	canMoveNormally = false;
		//} 
		//if (this.pos.y + dPos.y + game.BALL_RADIUS >= canvas.height) {
		//	this.pos.y = canvas.height - game.BALL_RADIUS;
		//	this.pos.x += dPos.x;
		//	canMoveNormally = false;
		//} 
		//if (leftPaddle.pos.x < this.pos.x &&
		//	this.pos.y + dPos.y <= leftPaddle.pos.y + PADDLE_HALF_LENGTH &&
		//	this.pos.y + dPos.y >= leftPaddle.pos.y - PADDLE_HALF_LENGTH &&
		//	this.pos.x + dPos.x - game.BALL_RADIUS <= leftPaddle.pos.x + PADDLE_HALF_BREADTH) {
		//	this.pos.x = leftPaddle.pos.x + PADDLE_HALF_BREADTH + game.BALL_RADIUS;
		//	this.pos.y += dPos.y
		//	canMoveNormally = false;
		//}
		//if (rightPaddle.pos.x > this.pos.x &&
		//	this.pos.y <= rightPaddle.pos.y + PADDLE_HALF_LENGTH &&
		//	this.pos.y >= rightPaddle.pos.y - PADDLE_HALF_LENGTH &&
		//	this.pos.x + dPos.x + game.BALL_RADIUS >= rightPaddle.pos.x - PADDLE_HALF_BREADTH) {
		//	this.pos.x = rightPaddle.pos.x - PADDLE_HALF_BREADTH - game.BALL_RADIUS;
		//	this.pos.y += dPos.y
		//	canMoveNormally = false;
		//}

		if (canMoveNormally) {
			this.pos.x += dPos.x ;
			this.pos.y += dPos.y ;
		}

		return ret;
	}

	this.handleCollisionsWithWall = function () {
		if (this.pos.y <= game.BALL_RADIUS - 1 && this.vel.y < 0) {
			this.vel.y = -this.vel.y;
			game.ballWallCollisionSound.play();
		} else if (this.pos.y >= canvas.height - game.BALL_RADIUS &&
			this.vel.y > 0) {
			this.vel.y = -this.vel.y;
			game.ballWallCollisionSound.play();
		}
	}

	this.draw = function() {
		context.arc(this.pos.x, this.pos.y, game.BALL_RADIUS, 0, 2 * Math.PI);
		context.fillStyle = "white";		
		context.fill();
	}
}

game.PADDLE_HALF_BREADTH = 5;
game.PADDLE_HALF_LENGTH = 35;
game.PADDLE_VELOCITY_Y = 500;

game.paddleBallCollisionSound = new Audio("sounds/paddle_ball_collision.wav");

function Paddle(pos) {
	this.pos = Object.assign({}, pos);
	this.velY = game.PADDLE_VELOCITY_Y;

	// max angle the ball will bounce when hitting the paddle
	this.MAX_BALL_BOUNCE_ANGLE = Math.PI / 3;

	this.moveUp = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y - game.PADDLE_HALF_LENGTH - dy < 0) {
			this.pos.y = game.PADDLE_HALF_LENGTH;
		} else {
			this.pos.y -= dy;
		}
	}

	this.moveDown = function(dt) {
		var dy = this.velY * dt;
		if (this.pos.y + game.PADDLE_HALF_LENGTH + dy >= canvas.height) {
			this.pos.y = canvas.height - 1 - game.PADDLE_HALF_LENGTH;
		} else {
			this.pos.y += dy;
		}
	}

	this.tryToHitBall = function (ball) {
		if (this.pos.x < ball.pos.x) {
			if (ball.vel.x < 0 &&
					ball.pos.y >= this.pos.y - game.PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + game.PADDLE_HALF_LENGTH &&
					ball.pos.x - game.BALL_RADIUS <= this.pos.x +
						game.PADDLE_HALF_BREADTH) {
				this.handleCollision(ball);
			}
		} else {
			if (ball.vel.x > 0 &&
					ball.pos.y >= this.pos.y - game.PADDLE_HALF_LENGTH &&
					ball.pos.y <= this.pos.y + game.PADDLE_HALF_LENGTH &&
					ball.pos.x + game.BALL_RADIUS >= this.pos.x -
						game.PADDLE_HALF_BREADTH) {
				this.handleCollision(ball);
			}
		}
	}
	this.draw = function () {
		context.fillstyle = "white";
		context.fillRect(this.pos.x - game.PADDLE_HALF_BREADTH,
				this.pos.y - game.PADDLE_HALF_LENGTH,
				2 * game.PADDLE_HALF_BREADTH, 2 * game.PADDLE_HALF_LENGTH);
	}

	this.calculateBounceAngle = function (ball) {
		var relativeIntersectionY = this.pos.y - ball.pos.y;
		var normalizedRelativeIntersectionY =
			relativeIntersectionY / (game.PADDLE_HALF_LENGTH);
		var bounceAngle = this.MAX_BALL_BOUNCE_ANGLE *
			normalizedRelativeIntersectionY;
		return bounceAngle;
	}

	this.handleCollision = function (ball) {
		var angle = this.calculateBounceAngle(ball);
		var ballSpeed =
			Math.sqrt(ball.vel.x * ball.vel.x +
					ball.vel.y * ball.vel.y);
		ball.vel.x = -Math.sign(ball.vel.x) * ballSpeed *
			Math.cos(angle);
		ball.vel.y = -ballSpeed * Math.sin(angle);
		// ball.vel.x = -ball.vel.x;
		game.paddleBallCollisionSound.play();
	}
}

game.PADDLE_DIST_FROM_END = 40;
// We are maintaing the centre of the ball in {pos}
game.BALL_START_POS = new Pos(canvas.width / 2, game.BALL_RADIUS);
// We are maintaining the centre of the rectangle in { pos}
game.CPU_PADDLE_START_POS = new Pos(canvas.width - 1 - game.PADDLE_DIST_FROM_END,
	canvas.height / 2); 
game.PLAYER_PADDLE_START_POS =
	new Pos(game.PADDLE_DIST_FROM_END, canvas.height / 2);
game.ballStartVel = new Velocity(-500, 500);

game.ball = null;
game.cpuPaddle = null;
game.playerPaddle = null;

game.initBoard = function () {
	this.ball = new Ball(this.BALL_START_POS, this.ballStartVel);
	this.cpuPaddle = new Paddle(this.CPU_PADDLE_START_POS);
	this.playerPaddle = new Paddle(this.PLAYER_PADDLE_START_POS);
	this.cpuPaddle.move = function(nSecsPassed, ball) {
		if (this.pos.x < ball.pos.x && ball.vel.x < 0 ||
				this.pos.x > ball.pos.x && ball.vel.x > 0) {
			if (ball.pos.y > this.pos.y) {
				this.moveDown(nSecsPassed);
			} else if (ball.pos.y < this.pos.y) {
				this.moveUp(nSecsPassed);
			}
		}
	}
}

game.initBoard();

game.drawBoard = function () {
	context.beginPath();
	context.strokeStyle = "white";
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height - 1);
	context.moveTo(canvas.width / 2 - 1, canvas.height - 1);
	context.lineTo(canvas.width / 2 - 1, 0);
	context.stroke();
	context.closePath();
}

game.drawScore = function () {
    context.font = "bolder 50px Arial";
    context.fillStyle = "white";
	
	context.fillText(game.cpuScore, canvas.width / 4 + 0, 100)
	context.fillText(game.playerScore, canvas.width * 3 / 4, 100)
}

game.updateGameState = function () {
	this.ball.handleCollisionsWithWall();
	this.playerPaddle.tryToHitBall(this.ball);
	this.cpuPaddle.tryToHitBall(this.ball);

	var now = new Date().getTime();
	var nSecsPassed = (now - this.lastDrawnTime) / 1000;
	// var nSecsPassed = 1 / 60;

	if (!(upPressed && downPressed)) {
		if (upPressed) {
			this.playerPaddle.moveUp(nSecsPassed);
		} else if (downPressed) {
			this.playerPaddle.moveDown(nSecsPassed);
		}
	}
	this.cpuPaddle.move(nSecsPassed, this.ball);

	var ret = this.ball.move(nSecsPassed, this.cpuPaddle, this.playerPaddle);

	if (ret) {
		return true;
	} else {
		return false;
	}
}

game.lastDrawnTime = null;

game.drawGameState = function () {
	context.clearRect(0, 0, canvas.width, canvas.height);
	this.drawBoard();
	this.drawScore();
	this.ball.draw();
	this.playerPaddle.draw();
	this.cpuPaddle.draw();

	this.lastDrawnTime = new Date().getTime();
}

game.drawGameState();
game.turn = 1;

game.start = function () {
	console.log("hello");
	this.ballStartVel.x *= this.turn;
	this.ball = new Ball(this.BALL_START_POS, this.ballStartVel);
	this.turn *= -1;
	this.running = true;
	game.drawGameState();
}

game.running = true;

window.main = function () {
	window.requestAnimationFrame(main);
	if (game.running) {
		var ret = game.updateGameState();
		game.drawGameState();
		if (!ret) {
			game.running = false;
			game.ball.vel = new Velocity(0, 0);
			setTimeout(function() {
				window.game.start();
			}, 500);
		}
	}

}

main();
