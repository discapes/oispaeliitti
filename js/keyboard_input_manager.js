function KeyboardInputManager() {
    this.events = {};
  
    this.listen();
  }
  
  KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  };
  
  KeyboardInputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  };
  
  KeyboardInputManager.prototype.listen = function () {
    var namefield = document.getElementById("fname");
    var self = this;
    var map = {
      38: 0, // Up
      39: 1, // Right
      40: 2, // Down
      37: 3, // Left
      75: 0, // vim keybindings
      76: 1,
      74: 2,
      72: 3,
      87: 0, // W
      68: 1, // D
      83: 2, // S
      65: 3  // A
    };
  
    document.addEventListener("keydown", function (event) {
      var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                      event.shiftKey;
      var mapped    = map[event.which];
  
      if (!modifiers && namefield !== document.activeElement) {
        if (mapped !== undefined) {
          event.preventDefault();
          self.emit("move", mapped);
        }
  
         if (event.which === 82) {
          self.emit("restart");
         } 
         if (event.which === 173) self.emit("goKatko");
      }
    });
  
    var retry = document.querySelector(".retry-button");
    retry.addEventListener("click", this.restart.bind(this));
    retry.addEventListener("touchend", this.restart.bind(this));
  
    var keepPlaying = document.querySelector(".keep-playing-button");
    keepPlaying.addEventListener("click", this.keepPlaying.bind(this));
    keepPlaying.addEventListener("touchend", this.keepPlaying.bind(this));
    
    var showInfo = document.querySelector(".info-container");
    showInfo.addEventListener("click", this.showInfo.bind(this));
    showInfo.addEventListener("touchend", this.showInfo.bind(this));

    var showIlmo = document.querySelector(".ilmo-container");
    showIlmo.addEventListener("click", this.showIlmo.bind(this));
    showIlmo.addEventListener("touchend", this.showIlmo.bind(this));

    var showLB = document.querySelector(".lb-container");
    showLB.addEventListener("click", this.showLB.bind(this));
    showLB.addEventListener("touchend", this.showLB.bind(this));

    var showMZ = document.querySelector(".mz-container");
    showMZ.addEventListener("click", this.showMZ.bind(this));
    showMZ.addEventListener("touchend", this.showMZ.bind(this));
    
    var goKatko = document.querySelector(".katko-container");
    goKatko.addEventListener("click", this.goKatko.bind(this));
    goKatko.addEventListener("touchend", this.goKatko.bind(this));
    
    // var hideInfo = document.querySelector(".hide-info");
    // hideInfo.addEventListener("click", this.hideInfo.bind(this));
    // hideInfo.addEventListener("touchend", this.hideInfo.bind(this));
    
    
    // Listen to swipe events
    var touchStartClientX, touchStartClientY;
    var gameContainer = document.getElementsByClassName("game-container")[0];
  
    gameContainer.addEventListener("touchstart", function (event) {
      if (event.touches.length > 1) return;
  
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
      event.preventDefault();
    });
  
    gameContainer.addEventListener("touchmove", function (event) {
      event.preventDefault();
    });
  
    gameContainer.addEventListener("touchend", function (event) {
      if (event.touches.length > 0) return;
  
      var dx = event.changedTouches[0].clientX - touchStartClientX;
      var absDx = Math.abs(dx);
  
      var dy = event.changedTouches[0].clientY - touchStartClientY;
      var absDy = Math.abs(dy);
  
      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
      }
    });
  };
  
  KeyboardInputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit("restart");
  };
  
  KeyboardInputManager.prototype.keepPlaying = function (event) {
    event.preventDefault();
    this.emit("keepPlaying");
  };
  
  KeyboardInputManager.prototype.showInfo = function (event) {
    event.preventDefault();
    this.emit("showInfo");
  };
  
  KeyboardInputManager.prototype.hideInfo = function (event) {
    event.preventDefault();
    this.emit("hideInfo");
  };

  KeyboardInputManager.prototype.showIlmo = function (event) {
    event.preventDefault();
    this.emit("showIlmo");
  };
  
  KeyboardInputManager.prototype.hideIlmo = function (event) {
    event.preventDefault();
    this.emit("hideIlmo");
  };


  KeyboardInputManager.prototype.showLB = function (event) {
    event.preventDefault();
    this.emit("showLB");
  };
  
  KeyboardInputManager.prototype.hideLB = function (event) {
    event.preventDefault();
    this.emit("hideLB");
  };

  KeyboardInputManager.prototype.showMZ = function (event) {
    event.preventDefault();
    this.emit("showMZ");
  };
  
  KeyboardInputManager.prototype.hideMZ = function (event) {
    event.preventDefault();
    this.emit("hideMZ");
  };
  
  KeyboardInputManager.prototype.goKatko = function (event) {
    event.preventDefault();
    this.emit("goKatko");
  };

  