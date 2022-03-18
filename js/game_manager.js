var muted = true;
function GameManager(size, InputManager, Actuator, DataManager, AccManager) {
  this.size = size; // Size of the grid
  this.inputManager = new InputManager;
  this.dataManager = new DataManager;
  this.accManager = new AccManager(this.dataManager, this);
  this.actuator = new Actuator(this.accManager);

  this.ilmotext = document.querySelector(".show-ilmo")

  if (this.dataManager.get("ilmoitusLevel") < ilmolvl) {
    this.ilmotext.textContent = "Ilmoitukset 🔸";
  }

  this.startTiles = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
  this.inputManager.on("showInfo", this.showInfo.bind(this));
  this.inputManager.on("hideInfo", this.hideInfo.bind(this));
  this.inputManager.on("showIlmo", this.showIlmo.bind(this));
  this.inputManager.on("hideIlmo", this.hideIlmo.bind(this));
  this.inputManager.on("showLB", this.showLB.bind(this));
  this.inputManager.on("hideLB", this.hideLB.bind(this));
  this.inputManager.on("showMZ", this.showMZ.bind(this));
  this.inputManager.on("hideMZ", this.hideMZ.bind(this));
  this.inputManager.on("goKatko", this.goKatko.bind(this));

  let palaute = document.getElementById("palaute");
  palaute.onclick = this.palaute.bind(this);
  this.autokoeviikko = document.getElementById("autokoeviikko");
  this.melumoment = document.getElementById("melumoment");
  this.autokoeviikko.onclick = (() => document.activeElement.blur());

  let updateTheme = () => {
    if (!this.melumoment.checked) {
      var sheet = window.document.styleSheets[0];
      sheet.insertRule(`.tile.tile-16 .tile-inner {
        background: #fff url('../img/32.png');
        background-size: cover;}`, sheet.cssRules.length);
      sheet.insertRule(`.tile.tile-32 .tile-inner {
        background: #fff url('../img/16.png');
        background-size: cover;}`, sheet.cssRules.length);
    } else {
      var sheet = window.document.styleSheets[0];
      sheet.insertRule(`.tile.tile-16 .tile-inner {
        background: #fff url('../img/16.png');
        background-size: cover;}`, sheet.cssRules.length);
      sheet.insertRule(`.tile.tile-32 .tile-inner {
        background: #fff url('../img/32.png');
        background-size: cover;}`, sheet.cssRules.length);
    }
  }
  this.melumoment.onclick = (() => {
    document.activeElement.blur()
    updateTheme();
  });
  setTimeout(updateTheme, 5000); // tada bug fixed

  var un_mute = document.getElementById('un-mute');
  muted = !un_mute.checked;
  un_mute.onclick = function () {
    muted = !muted;
  };

  this.setup();
}


GameManager.prototype.palaute = function () {
  let ans = prompt("Kerro vaan:");
  if (ans) {
    var formData = new FormData();

    if (this.accManager.currentAcc) {
      formData.append("nickname", this.accManager.currentAcc.username);
    } else {
      formData.append("nickname", "anonymous");
    }
    formData.append("highscore", this.accManager.dbBestScore);
    formData.append("palaute", ans);

    var request = new XMLHttpRequest();
    request.open("POST", "/palaute", false);
    request.send(formData);
    alert("Kiitos palautteesta!");
  }
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.katkoContainer.style = "";
  this.actuator.continue();
  this.setup();
};

// Keep playing after winning
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  if (this.katkolla) {
    this.score -= (1300 + this.katkoBonus);
    this.katkolla = false;
    this.grid.katkoReissu();
    this.actuate();
    this.actuator.goKatko(100);
    this.katkoBonus += this.katkoBonusBonus;
    this.katkoBonusBonus += this.bonusaddamount;
    this.katkoja++;
    if (this.katkoja == 5) {
      this.bonusaddamount = 1000;
      this.katkoBonusBonus = 1000;
    }
    this.actuator.updateKatkoBonus(this.katkoBonus);
    this.actuator.katkoContainer.style = "";
  }
  this.actuator.continue();
};

GameManager.prototype.showInfo = function () {
  this.actuator.showInfo();
};

GameManager.prototype.hideInfo = function () {
  this.actuator.hideInfo();
};

GameManager.prototype.showIlmo = function () {
  this.dataManager.set("ilmoitusLevel", ilmolvl);
  this.ilmotext.textContent = "Ilmoitukset";
  this.actuator.showIlmo();
};

GameManager.prototype.hideIlmo = function () {
  this.actuator.hideIlmo();
};

GameManager.prototype.showLB = function () {
  this.actuator.showLB();
};

GameManager.prototype.hideLB = function () {
  this.actuator.hideLB();
};

GameManager.prototype.showMZ = function () {
  this.actuator.showMZ();
};

GameManager.prototype.hideMZ = function () {
  this.actuator.hideMZ();
};

GameManager.prototype.goKatko = function () {
  if (this.score >= (1000 + this.katkoBonus)) {
    this.score -= (1000 + this.katkoBonus);
    this.grid.katkoReissu();
    this.actuate();
    this.actuator.goKatko(0);
    this.katkoBonus += this.katkoBonusBonus;
    this.katkoBonusBonus += this.bonusaddamount;
    this.katkoja++;
    if (this.katkoja == 5) {
      this.bonusaddamount = 1000;
      this.katkoBonusBonus = 1000;
    }
    this.actuator.updateKatkoBonus(this.katkoBonus);

  }
  else {
    //ei tarpeeksi kÃ¤nnissÃ¤ katkolle!
    // alert("Liian pieni moti :(");
    snd = new Audio("audio/buzz.mp3");
    if (!muted) snd.play();
  }


};

GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying) || this.katkolla) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
GameManager.prototype.setup = function () {



  this.grid = new Grid(this.size);

  this.score = 0;
  this.totalScore = 0;
  this.katkoBonus = 0;
  this.katkoBonusBonus = 100;
  this.katkoja = 0;
  this.bonusaddamount = 100;
  this.over = false;
  this.won = false;
  this.keepPlaying = false;
  this.katkolla = false;
  this.wonThisGame = false;

  //preload
  snd = [];
  snd[0] = new Audio("audio/none1.mp3");
  snd[1] = new Audio("audio/none2.mp3");
  snd[2] = new Audio("audio/none3.mp3");

  // Add the initial tiles
  this.addStartTiles();

  // Update the actuator
  this.actuator.updateKatkoBonus(0);
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

var timerActive = false;
// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.accManager.bestScore < this.totalScore) {
    this.accManager.bestScore = this.totalScore;
  }
  if (this.accManager.cookieBestScore < this.totalScore) {
    this.accManager.cookieBestScore = this.totalScore;
  }
  if (this.accManager.bestScore > this.accManager.dbBestScore) {
    if (!timerActive) {
      timerActive = true;
      setTimeout(() => {
        timerActive = false;
        this.accManager.updateScoreDB();
      }, 500);
    }
  }

  this.actuator.actuate(this.grid, {
    score: this.score,
    totalScore: this.totalScore,
    katkoBonus: this.katkoBonus,
    over: this.over,
    won: this.won,
    katkolla: this.katkolla,
    bestScore: this.accManager.bestScore,
    cookieBestScore: this.accManager.cookieBestScore,
    terminated: this.isGameTerminated(),
    accManager: this.accManager,
    muted: muted,
  });

};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;
          self.totalScore += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) {
            if (!self.wonThisGame) {
              self.keepPlaying = false;
              self.won = true;
              self.wonThisGame = true;
            }
          }

          // debugging
          // if (merged.value === 16) {
          //    self.over = true; }

        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      if (this.score >= (1300 + this.katkoBonus) && this.autokoeviikko.checked) {
        this.katkolla = true;
        this.actuator.messageForceKatko();
      } else {
        this.over = true;
      }
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0, y: -1 }, // up
    1: { x: 1, y: 0 },  // right
    2: { x: 0, y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
    this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

GameManager.prototype.failsafeKatko = function () {
  return this.grid.availableCells().length == 1/*  && !this.tileMatchesAvailable() */;
}

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell = { x: x + vector.x, y: y + vector.y };

          var other = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};