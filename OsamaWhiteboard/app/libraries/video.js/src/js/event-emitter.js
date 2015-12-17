vjs_original.EventEmitter = function() {
};

vjs_original.EventEmitter.prototype.allowedEvents_ = {
};

vjs_original.EventEmitter.prototype.on = function(type, fn) {
  // Remove the addEventListener alias before calling vjs.on
  // so we don't get into an infinite type loop
  var ael = this.addEventListener;
  this.addEventListener = Function.prototype;
  vjs_original.on(this, type, fn);
  this.addEventListener = ael;
};
vjs_original.EventEmitter.prototype.addEventListener = vjs_original.EventEmitter.prototype.on;

vjs_original.EventEmitter.prototype.off = function(type, fn) {
  vjs_original.off(this, type, fn);
};
vjs_original.EventEmitter.prototype.removeEventListener = vjs_original.EventEmitter.prototype.off;

vjs_original.EventEmitter.prototype.one = function(type, fn) {
  vjs_original.one(this, type, fn);
};

vjs_original.EventEmitter.prototype.trigger = function(event) {
  var type = event.type || event;

  if (typeof event === 'string') {
    event = {
      type: type
    };
  }
  event = vjs_original.fixEvent(event);

  if (this.allowedEvents_[type] && this['on' + type]) {
    this['on' + type](event);
  }

  vjs_original.trigger(this, event);
};
// The standard DOM EventTarget.dispatchEvent() is aliased to trigger()
vjs_original.EventEmitter.prototype.dispatchEvent = vjs_original.EventEmitter.prototype.trigger;
