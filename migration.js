var Reload = Package.reload.Reload;

Migration = function (name) {
  this.init.apply(this, arguments);
};

Migration.prototype = {
  init: function (name) {
    var self = this;
    this.name = name || Meteor.uuid();
    self._retryFn = null;
    Reload._onMigrate(this.name, function (retry) {
      var isReady = Deps.nonreactive(_.bind(self.ready, self));
      if (isReady) {
        self._retryFn = null;
        var data = Deps.nonreactive(_.bind(self.data, self));
        self._comp && self._comp.stop();
        return [true, data];
      } else {
        self._retryFn = retry;
        return false;
      }
    });
  },

  ready: function (val) {
    if (val) {
      this._ready = val;
      this._resetComputation();
      return this;
    } else {
      return _.isFunction(this._ready) ? this._ready() : this._ready;
    }
  },

  data: function (val) {
    if (val) {
      this._data = val;
      return this;
    } else {
      return _.isFunction(this._data) ? this._data() : this._data;
    }
  },

  savedData: function () {
    return Reload._migrationData(this.name);
  },

  _resetComputation: function () {
    var self = this;

    if (this._comp)
      this._comp.stop();

    this._comp = Deps.autorun(function () {
      var isReady = self.ready();
      if (isReady && self._retryFn)
        self._retryFn();
    });
  }
};

onMigrate = function (name) {
  return new Migration(name);
};
