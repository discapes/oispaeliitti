function parseJSON(data) {
    try {
        return JSON.parse(data);
    } catch(e) {
        return null;
    }
}

function AccountManager(dataManager, gameManager) {
    this.loginbtn = document.getElementById("loginbtn");
    this.namefield = document.getElementById("fname");
    this.bestContainer = document.querySelector(".best-num");
    this.gameManager = gameManager;
    this.cookieBestScore = dataManager.get("CBS");

    this.namefield.addEventListener("keyup", (event) => {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          
          document.activeElement.blur();
          this.loginbtn.click();
        }
      }); 

    this.output = document.getElementById("loginoutput");
    this.dataManager = dataManager;
    this.accounts = parseJSON(dataManager.get("accounts"));

    let existingAcc = parseJSON(dataManager.get("logged"));
    if (existingAcc) {
        this.namefield.value = existingAcc.username;
        if (this.login(existingAcc.uuid, existingAcc.username)) {
            this.currentAcc = existingAcc;
            this.namefield.disabled = true;
            this.loginbtn.value = "Reset!";
        } else {
            this.dbBestScore = this.dataManager.get("bestScore");
        }
    } else {
        this.dbBestScore = this.dataManager.get("bestScore");
    }

    this.bestScore = this.dbBestScore;
    this.bestContainer.textContent = this.cookieBestScore;


    this.loginbtn.onclick = () => {
        if (this.currentAcc && (this.gameManager.score < 1000 || confirm("Ulos kirjautuminen nollaa pisteet"))) {
            this.output.style.visibility = "hidden";
            this.output.style.color = "#FF0033";
            setTimeout(() => this.output.style.visibility = "visible", 100);
            this.output.innerText = "Valitse nimi";
            this.namefield.disabled = false;
            this.loginbtn.value = "Käytä";
            this.currentAcc = null;
            dataManager.set("logged", "null");  
            this.namefield.value = "";      
            this.dbBestScore = this.dataManager.get("bestScore");
            this.bestScore = this.dbBestScore;
            this.gameManager.score = 0;
            this.gameManager.totalScore = 0;
            this.gameManager.actuator.updateScore(0);
            this.gameManager.actuator.updateTotal(0);
        } else {
            let nameval = this.namefield.value;
            if (this.accounts[nameval]) {   
                if(this.login(this.accounts[nameval], nameval)) {
                    this.currentAcc = {username: nameval, uuid: this.accounts[nameval] };
                    dataManager.set("logged", JSON.stringify(this.currentAcc));
                }
            } else {
                let newuuid = this.loginNew(nameval);
                if (newuuid) {
                    this.accounts = Object.assign({[nameval]: newuuid }, this.accounts);
                    this.currentAcc = { username: nameval, uuid: newuuid };
                    dataManager.set("accounts", JSON.stringify(this.accounts));
                    dataManager.set("logged", JSON.stringify(this.currentAcc));
                }
            } 
            if (this.currentAcc) {
                this.namefield.disabled = true;
                this.loginbtn.value = "Reset!";
            }
        }
        this.bestScore = this.dbBestScore;
        this.bestContainer.textContent = this.cookieBestScore;
    };
}

AccountManager.prototype.login = function(uuid, username) {
    var formData = new FormData();
    formData.append("uuid", uuid);
    formData.append("nickname", username);
    var request = new XMLHttpRequest();
    request.open("POST", "/accountapi", false);
    request.send(formData);
    if (request.responseText) {
        this.output.style.visibility = "hidden";
        this.output.style.color = "lime";
        setTimeout(() => this.output.style.visibility = "visible", 100);
        this.output.innerText = "Nimi " + username + " käytössä";
        this.dbBestScore = request.responseText;
        return true;
    } else {
        this.output.style.visibility = "hidden";
        this.output.style.color = "#FF0033";
        setTimeout(() => this.output.style.visibility = "visible", 100);
        this.output.innerText = "Virhe kirjautumisessa! Lähetä palautetta + mainitse nimi";
        this.dataManager.set("logged", null);
        return false;
    } 
};

AccountManager.prototype.loginNew = function(username) {
    if (username == "") {
        this.output.style.visibility = "hidden";
        this.output.style.color = "#FF0033";
        setTimeout(() => this.output.style.visibility = "visible", 100);
        this.output.innerText = "Kirjoita nimi";
        return false;
    }
    var formData = new FormData();
    formData.append("nickname", username);
    var request = new XMLHttpRequest();
    request.open("POST", "/accountapi", false);
    request.send(formData);
    if (request.responseText) {
        this.output.style.visibility = "hidden";
        this.output.style.color = "lime";
        setTimeout(() => this.output.style.visibility = "visible", 100);
        this.output.innerText = "Käyttäjänimi " + username + " luotu";
        this.dbBestScore = 0;
        return request.responseText;
    } else {
        this.output.style.visibility = "hidden";
        this.output.style.color = "#FF0033";
        setTimeout(() => this.output.style.visibility = "visible", 100);
        this.output.innerText = "Nimi " + username + " ei käytettävissä";
        return false;
    } 
};

AccountManager.prototype.updateScoreDB = function() {
    if (this.bestScore > this.dbBestScore) {
        var formData = new FormData();
        formData.append("score", this.bestScore);
        this.dbBestScore = this.bestScore;
    
        if (this.currentAcc) {
            formData.append("nickname", this.currentAcc.username);
            formData.append("uuid", this.currentAcc.uuid);
        } else {
            this.dataManager.set("bestScore", this.bestScore);
        }
    
        var request = new XMLHttpRequest();
        request.open("POST", "/accountapi");
        request.send(formData);
    };
    if (this.bestScore > this.cookieBestScore) {
        this.dataManager.set("CBS", this.bestScore);
    }
}