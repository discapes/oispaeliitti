window.fakeStorage = {
    _data: {},
  
    setItem: function (id, val) {
      return this._data[id] = String(val);
    },
  
    getItem: function (id) {
      return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
  
    removeItem: function (id) {
      return delete this._data[id];
    },
  
    clear: function () {
      return this._data = {};
    }
  };
  
  function LocalDataManager() {
    
    var supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
  }
  
  LocalDataManager.prototype.localStorageSupported = function () {
    var testKey = "test";
    var storage = window.localStorage;
  
    try {
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  LocalDataManager.prototype.get = function (key) {
    return this.storage.getItem(key) || 0;
  };
  
  LocalDataManager.prototype.set = function (key, value) {
    this.storage.setItem(key, value);
  };