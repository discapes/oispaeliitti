function HTMLActuator(accManager) {
  this.accManager = accManager;
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-num");
  this.totalContainer = document.querySelector(".kokonaismoti-num");
  this.bestContainer = document.querySelector(".best-num");
  this.messageContainer = document.querySelector(".game-message");
  this.buttonsContainer = document.querySelector(".lower-container");
  this.info = document.querySelector(".info");
  this.ilmo = document.querySelector(".ilmo");
  this.namefield = document.getElementById("fname");
  this.lb = document.querySelector(".lb");
  this.mz = document.querySelector(".mz");
  this.dogeSays = document.querySelector(".doge-says");
  this.katkoViesti = document.querySelector(".katkoviesti");
  this.katkoContainerColor = document.querySelector(".katko-container-color");
  this.katkoContainer = document.querySelector(".katko-container");
  this.keepPlayingButton = document.querySelector(".keep-playing-button");
  this.lb1 = document.getElementById("lbtable");
  this.lb2 = document.getElementById("lbtable2");

  this.score = 0;
  this.totalScore = 0;
  this.metadata = { bestScore: 0 };
  this.rankhere = 0;

  let updatelb = () => {
    if (this.lb.getAttribute('style') === "display:block;") {
      var xhttp = new XMLHttpRequest();
      let self = this;
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          self.lb1.innerHTML = this.responseText;
        }
      };
      xhttp.open("GET", "lbapi", true);
      xhttp.send();
    }
  }
  let updatelb2 = () => {
    var xhttp = new XMLHttpRequest();
    let self = this;

    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        if (self.lb2 == null) self.lb2 = document.getElementById("lbtable2");
        let namehere = self.accManager.currentAcc ? self.accManager.currentAcc.username : "you";
        self.lb2.innerHTML = this.responseText + `<tr style="border-top: 3px solid black;background-color: rgba(230,230,255, 0.5);"><td><b>${self.metadata.bestScore}</b></td><td><b>${namehere} (#${self.rankhere})</b></td></tr>`;
      }
    };
    xhttp.open("GET", "lb2api", true);
    xhttp.send();
  }
  let updateRank = () => {
    var xhttp = new XMLHttpRequest();
    let self = this;
    let formData = new FormData();
    formData.append("score", this.accManager.bestScore);
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        self.rankhere = this.responseText;
      }
    };
    xhttp.open("POST", "rankapi", true);
    xhttp.send(formData);
  }

  setInterval(updateRank, 5000);
  updateRank();
  setInterval(updatelb, 500);
  updatelb();
  setInterval(updatelb2, 500);
  updatelb2();
}

dogeSayings = ['moti menee', 'kohta on perjantai', 'mee töihi', 'L tulossa', 'jos ei jaksa ni koittakaa vaa jaksaa']

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;
  self.metadata = metadata;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateTotal(metadata.totalScore);
    self.updateBestScore(metadata.cookieBestScore);
    //self.updateKatkoBonus(metadata.katkoBonus);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
        metadata.accManager.updateScoreDB();
      } else if (metadata.katkolla) {

      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper = document.createElement("div");
  var inner = document.createElement("div");
  var position = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 4096) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);
  this.clearContainer(this.dogeSays);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (!this.metadata.katkolla) {
    if (this.score >= (1000 + this.metadata.katkoBonus)) {
      this.katkoContainerColor.setAttribute('style', 'background-color: #0c0!important');

    }
    else {
      this.katkoContainerColor.setAttribute('style', 'background-color: #c00!important');
    }
  }

  var snd;

  if (difference > 0) {

    var a = Math.floor((Math.random() * 4) + 1);
    if (a == 1) {
      snd = new Audio("audio/open1.mp3");
    }
    if (a == 2) {
      snd = new Audio("audio/open2.mp3");
    }
    if (a == 3) {
      snd = new Audio("audio/open3.mp3");
    }
    if (a == 4) {
      snd = new Audio("audio/open4.mp3");
    }

    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;
    this.scoreContainer.appendChild(addition);

    var message = dogeSayings[Math.floor(Math.random() * dogeSayings.length)];
    var messageElement = document.createElement("p");
    messageElement.textContent = message
    var left = 'left:' + Math.round(Math.random() * 20 + 30) + '%;'
    var top = 'top:' + Math.round(Math.random() * 20 + 20) + '%;'

    //var color = 'color: rgb(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ');'
    var color = 'color: white; text-shadow:0px 0px 50px #000000;}';
    var styleString = left + top + color
    messageElement.setAttribute('style', styleString);
    this.dogeSays.appendChild(messageElement);

  } else {
    var a = Math.floor((Math.random() * 3) + 1);
    if (a == 1) {
      snd = new Audio("audio/none1.mp3");
    }
    if (a == 2) {
      snd = new Audio("audio/none2.mp3");
    }
    if (a == 3) {
      snd = new Audio("audio/none3.mp3");
    }


  }

  if (!this.metadata.muted) snd.play();
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.updateTotal = function (totalScore) {
  this.totalContainer.textContent = totalScore;
};

HTMLActuator.prototype.updateKatkoBonus = function (katkoBonus) {
  this.katkoContainer.innerHTML = "Koeviikko (-" + (1000 + katkoBonus) + ")";
};

HTMLActuator.prototype.message = function (won) {
  var type = won ? "game-won" : "game-over";
  var message = won ? "Selvisit!" : "Mene puolalaan";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  this.katkoContainer.style = "pointer-events:none;";
  this.keepPlayingButton.innerHTML = "Jatka peliä";
  //this.buttonsContainer.setAttribute('style', 'display: none!important;');
};

HTMLActuator.prototype.messageForceKatko = function () {
  var type = "game-katko";
  var message = "Koeviikon aika";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  this.katkoContainer.style = "pointer-events:none;";
  this.keepPlayingButton.innerHTML = "Mene koeviikolle (-" + (this.metadata.katkoBonus + 1300) + ")";
  //this.buttonsContainer.setAttribute('style', 'display: none!important;');
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
  this.messageContainer.classList.remove("game-katko");
  this.buttonsContainer.setAttribute('style', '');
};

HTMLActuator.prototype.showInfo = function () {
  if (this.info.getAttribute('style') === "display:block;") {
    this.info.setAttribute('style', 'display:none;');
  } else {
    this.mz.setAttribute('style', 'display:none;');
    this.lb.setAttribute('style', 'display:none;');
    this.ilmo.setAttribute('style', 'display:none;');
    this.info.setAttribute('style', 'display:block;');
  }
};

HTMLActuator.prototype.showIlmo = function () {
  if (this.ilmo.getAttribute('style') === "display:block;") {
    this.ilmo.setAttribute('style', 'display:none;');
  } else {
    this.mz.setAttribute('style', 'display:none;');
    this.lb.setAttribute('style', 'display:none;');
    this.info.setAttribute('style', 'display:none;');
    this.ilmo.setAttribute('style', 'display:block;');
  }
};

HTMLActuator.prototype.showLB = function () {
  if (this.lb.getAttribute('style') === "display:block;") {
    this.lb.setAttribute('style', 'display:none;');
  } else {
    this.mz.setAttribute('style', 'display:none;');
    this.info.setAttribute('style', 'display:none;');
    this.ilmo.setAttribute('style', 'display:none;');
    this.lb.setAttribute('style', 'display:block;');
  }
};

HTMLActuator.prototype.showMZ = function () {
  if (this.mz.getAttribute('style') === "display:block;") {
    this.mz.setAttribute('style', 'display:none;');
  } else {
    this.mz.setAttribute('style', 'display:block;');
    this.info.setAttribute('style', 'display:none;');
    this.ilmo.setAttribute('style', 'display:none;');
    this.lb.setAttribute('style', 'display:none;');
  }
};

HTMLActuator.prototype.hideInfo = function () {
  this.info.setAttribute('style', 'display:none;');
};

HTMLActuator.prototype.hideIlmo = function () {
  this.ilmo.setAttribute('style', 'display:none;');
};

HTMLActuator.prototype.hideLB = function () {
  this.lb.setAttribute('style', 'display:none;');
};

HTMLActuator.prototype.hideMZ = function () {
  this.mz.setAttribute('style', 'display:none;');
};

HTMLActuator.prototype.goKatko = function (minus) {

  if (this.metadata.terminated) return;

  snd = new Audio("/audio/katkolle.mp3");
  if (!this.metadata.muted) snd.play();
  this.clearContainer(this.scoreContainer);
  this.clearContainer(this.katkoViesti);
  this.clearContainer(this.dogeSays);
  this.scoreContainer.textContent = this.score - 1000 - minus - this.metadata.katkoBonus;

  var addition = document.createElement("div");
  addition.classList.add("score-addition");
  addition.textContent = "-" + (1000 + minus + this.metadata.katkoBonus);
  this.scoreContainer.appendChild(addition);

  //var message = "KATKOLLE!";
  var messageElement = document.createElement("img");
  messageElement.setAttribute('src', "/img/katko.png");
  //messageElement.textContent = message;
  //var left = 'left: 37%;';
  //var top = 'top: 10%;';

  //var color = 'color: rgb(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ');'
  //var color = 'font-weight: bold; color: black; text-shadow:0px 0px 50px #ff0000;}';
  //var styleString = left + top;
  //messageElement.setAttribute('style', styleString);
  this.katkoViesti.appendChild(messageElement);
  return true;
}
