/*
*
*  Project:    Snake
*  Author:     David Kolinek
*  E-mail:     david.kolinek@gmail.com
*
*/

window.requestAnimFrame = (function(){
  return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    function(callback, element){
      return window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelRequestAnimFrame = ( function() {
  return window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    clearTimeout
})();

// Variables
var reqID, canvas, ctx, keystates, frames, score, tw, th;

// Constants
var ROWS = 30,
    COLS = 30;

// IDs
var EMPTY = 0,
    SNAKE = 1,
    FRUIT = 2;

// Directions
var LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3;

// Key codes
var KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40;

// Game grid
// 
var grid = {
  width: null,
  height: null,
  _grid: null,

  init: function (d, c, r) {
    this.width = c;
    this.height = r;
    this._grid = [];

    tw = canvas.width/grid.width;
    th = canvas.height/grid.height;

    for(var x = 0; x<c; x++) {
      this._grid.push([]);

      for (var y = 0; y<r; y++) {
        this._grid[x].push(d);
      };
    }
  },

  set: function (value, x, y) {
    this._grid[x][y] = value;
  },

  get: function (x, y) {
    return this._grid[x][y];
  }
}

// Snake
// 
var snake = {
  direction: null,
  head: null,
  _queue: null,

  init: function (d, x, y) {
    this.direction = d;
    this._queue = [];

    this.insert(x, y+2);
    this.insert(x, y+1);
    this.insert(x, y);
  },

  insert: function (x, y) {
    this._queue.unshift({x:x, y:y});
    this.head = this._queue[0];

    // Paint new head
    ctx.fillStyle = "#0FF";
    ctx.fillRect(x*tw, y*th, tw, th);
  },

  remove: function (argument) {
    var item = this._queue.pop();
    // Clear tail
    ctx.clearRect(item.x*tw, item.y*th, tw, th);
    return item;
  }
}

function setFood () {
  var empty = [];

  for(var x = 0; x<grid.width; x++) {
    for (var y = 0; y<grid.height; y++) {
      if(grid.get(x, y) === EMPTY) {
        empty.push({x:x, y:y});
      }
    };
  }

  var randpos = empty[Math.floor(Math.random() * empty.length)];
  grid.set(FRUIT, randpos.x, randpos.y);

  // Paint new fruit
  ctx.fillStyle = "#F00";
  ctx.fillRect(randpos.x*tw, randpos.y*th, tw, th);
}

function main () {
  canvas = document.getElementById("snakeCanvas");
  canvas.width = COLS*20;
  canvas.height = ROWS*20;
  ctx = canvas.getContext("2d");

  frames = 0;
  keystates = {};

  document.addEventListener("keydown", function (e) {
    keystates[e.keyCode] = true;
  });

  document.addEventListener("keyup", function (e) {
    delete keystates[e.keyCode];
  });

  init();
  loop();
}

function init () {
  grid.init(EMPTY, COLS, ROWS);

  var startingPoint = {x: Math.floor(COLS/2), y: ROWS-5};
  snake.init(UP, startingPoint.x, startingPoint.y);
  grid.set(SNAKE, startingPoint.x, startingPoint.y);
  grid.set(SNAKE, startingPoint.x, startingPoint.y+1);
  grid.set(SNAKE, startingPoint.x, startingPoint.y+2);

  setFood();
  score = 0;
}

function loop () {
  reqID = window.requestAnimationFrame(loop, canvas);

  update();
  //draw();
}

function gameOver () {
  window.cancelAnimationFrame(reqID);
  console.log('gameOver');
}

function update () {
  frames++;
  _changeDirection();

  if(frames%4 === 0) {
    var nx = snake.head.x,
        ny = snake.head.y;

    switch(snake.direction) {
      case LEFT:
        nx--;
        break;
      case UP:
        ny--;
        break;
      case RIGHT:
        nx++;
        break;
      case DOWN:
        ny++;
        break;
    }

    if (0 > nx) {
      nx = grid.width-1;
    } else if (nx > grid.width-1) {
      nx = 0;
    } else if (0 > ny) {
      ny = grid.height-1;
    } else if (ny > grid.height-1) {
      ny = 0;
    }

    if (grid.get(nx, ny) === SNAKE) {
      gameOver();
    }

    var newHead = {x:nx, y:ny};
    if(grid.get(nx, ny) === FRUIT) {
      score++;
      setFood();
    } else {
      tail = snake.remove();
      grid.set(EMPTY, tail.x, tail.y);
    }

    grid.set(SNAKE, newHead.x, newHead.y);
    snake.insert(newHead.x, newHead.y);
  }
}

function draw () {
  var tw = canvas.width/grid.width,
      th = canvas.height/grid.height;

  for(var x = 0; x<grid.width; x++) {
    for (var y = 0; y<grid.height; y++) {
      switch(grid.get(x, y)) {
        case EMPTY:
          ctx.fillStyle = "#FFF";
          break;
        case SNAKE:
          ctx.fillStyle = "#0FF";
          break;
        case FRUIT:
          ctx.fillStyle = "#F00";
          break;
      }

      ctx.fillRect(x*tw, y*th, tw, th);
    };
  }

  ctx.fillStyle = "#000";
  ctx.fillText("SCORE: " + score, 10, canvas.height-10);
}

main();


function _changeDirection () {
  if(keystates[KEY_LEFT] && snake.direction !== RIGHT)
    snake.direction = LEFT;
  if(keystates[KEY_UP] && snake.direction !== DOWN)
    snake.direction = UP;
  if(keystates[KEY_RIGHT] && snake.direction !== LEFT)
    snake.direction = RIGHT;
  if(keystates[KEY_DOWN] && snake.direction !== UP)
    snake.direction = DOWN;
}