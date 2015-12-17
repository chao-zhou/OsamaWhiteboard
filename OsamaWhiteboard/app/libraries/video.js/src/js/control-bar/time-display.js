/**
 * Displays the current time
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.CurrentTimeDisplay = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);

    this.on(player, 'timeupdate', this.updateContent);
  }
});

vjs_original.CurrentTimeDisplay.prototype.createEl = function(){
  var el = vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-current-time vjs-time-controls vjs-control'
  });

  this.contentEl_ = vjs_original.createEl('div', {
    className: 'vjs-current-time-display',
    innerHTML: '<span class="vjs-control-text">Current Time </span>' + '0:00', // label the current time for screen reader users
    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
  });

  el.appendChild(this.contentEl_);
  return el;
};

vjs_original.CurrentTimeDisplay.prototype.updateContent = function(){
  // Allows for smooth scrubbing, when player can't keep up.
  var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
  this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Current Time') + '</span> ' + vjs_original.formatTime(time, this.player_.duration());
};

/**
 * Displays the duration
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.DurationDisplay = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);

    // this might need to be changed to 'durationchange' instead of 'timeupdate' eventually,
    // however the durationchange event fires before this.player_.duration() is set,
    // so the value cannot be written out using this method.
    // Once the order of durationchange and this.player_.duration() being set is figured out,
    // this can be updated.
    this.on(player, 'timeupdate', this.updateContent);
  }
});

vjs_original.DurationDisplay.prototype.createEl = function(){
  var el = vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-duration vjs-time-controls vjs-control'
  });

  this.contentEl_ = vjs_original.createEl('div', {
    className: 'vjs-duration-display',
    innerHTML: '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> ' + '0:00', // label the duration time for screen reader users
    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
  });

  el.appendChild(this.contentEl_);
  return el;
};

vjs_original.DurationDisplay.prototype.updateContent = function(){
  var duration = this.player_.duration();
  if (duration) {
      this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Duration Time') + '</span> ' + vjs_original.formatTime(duration); // label the duration time for screen reader users
  }
};

/**
 * The separator between the current time and duration
 *
 * Can be hidden if it's not needed in the design.
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.TimeDivider = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);
  }
});

vjs_original.TimeDivider.prototype.createEl = function(){
  return vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-time-divider',
    innerHTML: '<div><span>/</span></div>'
  });
};

/**
 * Displays the time left in the video
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.RemainingTimeDisplay = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);

    this.on(player, 'timeupdate', this.updateContent);
  }
});

vjs_original.RemainingTimeDisplay.prototype.createEl = function(){
  var el = vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-remaining-time vjs-time-controls vjs-control'
  });

  this.contentEl_ = vjs_original.createEl('div', {
    className: 'vjs-remaining-time-display',
    innerHTML: '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> ' + '-0:00', // label the remaining time for screen reader users
    'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
  });

  el.appendChild(this.contentEl_);
  return el;
};

vjs_original.RemainingTimeDisplay.prototype.updateContent = function(){
  if (this.player_.duration()) {
    this.contentEl_.innerHTML = '<span class="vjs-control-text">' + this.localize('Remaining Time') + '</span> ' + '-'+ vjs_original.formatTime(this.player_.remainingTime());
  }

  // Allows for smooth scrubbing, when player can't keep up.
  // var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
  // this.contentEl_.innerHTML = vjs.formatTime(time, this.player_.duration());
};
