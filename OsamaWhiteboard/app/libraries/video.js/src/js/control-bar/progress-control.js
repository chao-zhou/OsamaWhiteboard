/**
 * The Progress Control component contains the seek bar, load progress,
 * and play progress
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.ProgressControl = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);
  }
});

vjs_original.ProgressControl.prototype.options_ = {
  children: {
    'seekBar': {}
  }
};

vjs_original.ProgressControl.prototype.createEl = function(){
  return vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-progress-control vjs-control'
  });
};

/**
 * Seek Bar and holder for the progress bars
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.SeekBar = vjs_original.Slider.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Slider.call(this, player, options);
    this.on(player, 'timeupdate', this.updateARIAAttributes);
    player.ready(vjs_original.bind(this, this.updateARIAAttributes));
  }
});

vjs_original.SeekBar.prototype.options_ = {
  children: {
    'loadProgressBar': {},
    'playProgressBar': {},
    'seekHandle': {}
  },
  'barName': 'playProgressBar',
  'handleName': 'seekHandle'
};

vjs_original.SeekBar.prototype.playerEvent = 'timeupdate';

vjs_original.SeekBar.prototype.createEl = function(){
  return vjs_original.Slider.prototype.createEl.call(this, 'div', {
    className: 'vjs-progress-holder',
    'aria-label': 'video progress bar'
  });
};

vjs_original.SeekBar.prototype.updateARIAAttributes = function(){
    // Allows for smooth scrubbing, when player can't keep up.
    var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
    this.el_.setAttribute('aria-valuenow',vjs_original.round(this.getPercent()*100, 2)); // machine readable value of progress bar (percentage complete)
    this.el_.setAttribute('aria-valuetext',vjs_original.formatTime(time, this.player_.duration())); // human readable value of progress bar (time complete)
};

vjs_original.SeekBar.prototype.getPercent = function(){
  return this.player_.currentTime() / this.player_.duration();
};

vjs_original.SeekBar.prototype.onMouseDown = function(event){
  vjs_original.Slider.prototype.onMouseDown.call(this, event);

  this.player_.scrubbing = true;
  this.player_.addClass('vjs-scrubbing');

  this.videoWasPlaying = !this.player_.paused();
  this.player_.pause();
};

vjs_original.SeekBar.prototype.onMouseMove = function(event){
  var newTime = this.calculateDistance(event) * this.player_.duration();

  // Don't let video end while scrubbing.
  if (newTime == this.player_.duration()) { newTime = newTime - 0.1; }

  // Set new time (tell player to seek to new time)
  this.player_.currentTime(newTime);
};

vjs_original.SeekBar.prototype.onMouseUp = function(event){
  vjs_original.Slider.prototype.onMouseUp.call(this, event);

  this.player_.scrubbing = false;
  this.player_.removeClass('vjs-scrubbing');
  if (this.videoWasPlaying) {
    this.player_.play();
  }
};

vjs_original.SeekBar.prototype.stepForward = function(){
  this.player_.currentTime(this.player_.currentTime() + 5); // more quickly fast forward for keyboard-only users
};

vjs_original.SeekBar.prototype.stepBack = function(){
  this.player_.currentTime(this.player_.currentTime() - 5); // more quickly rewind for keyboard-only users
};

/**
 * Shows load progress
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.LoadProgressBar = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);
    this.on(player, 'progress', this.update);
  }
});

vjs_original.LoadProgressBar.prototype.createEl = function(){
  return vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-load-progress',
    innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Loaded') + '</span>: 0%</span>'
  });
};

vjs_original.LoadProgressBar.prototype.update = function(){
  var i, start, end, part,
      buffered = this.player_.buffered(),
      duration = this.player_.duration(),
      bufferedEnd = this.player_.bufferedEnd(),
      children = this.el_.children,
      // get the percent width of a time compared to the total end
      percentify = function (time, end){
        var percent = (time / end) || 0; // no NaN
        return (percent * 100) + '%';
      };

  // update the width of the progress bar
  this.el_.style.width = percentify(bufferedEnd, duration);

  // add child elements to represent the individual buffered time ranges
  for (i = 0; i < buffered.length; i++) {
    start = buffered.start(i),
    end = buffered.end(i),
    part = children[i];

    if (!part) {
      part = this.el_.appendChild(vjs_original.createEl());
    }

    // set the percent based on the width of the progress bar (bufferedEnd)
    part.style.left = percentify(start, bufferedEnd);
    part.style.width = percentify(end - start, bufferedEnd);
  }

  // remove unused buffered range elements
  for (i = children.length; i > buffered.length; i--) {
    this.el_.removeChild(children[i-1]);
  }
};

/**
 * Shows play progress
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.PlayProgressBar = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);
  }
});

vjs_original.PlayProgressBar.prototype.createEl = function(){
  return vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-play-progress',
    innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Progress') + '</span>: 0%</span>'
  });
};

/**
 * The Seek Handle shows the current position of the playhead during playback,
 * and can be dragged to adjust the playhead.
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.SeekHandle = vjs_original.SliderHandle.extend({
  init: function(player, options) {
    vjs_original.SliderHandle.call(this, player, options);
    this.on(player, 'timeupdate', this.updateContent);
  }
});

/**
 * The default value for the handle content, which may be read by screen readers
 *
 * @type {String}
 * @private
 */
vjs_original.SeekHandle.prototype.defaultValue = '00:00';

/** @inheritDoc */
vjs_original.SeekHandle.prototype.createEl = function() {
  return vjs_original.SliderHandle.prototype.createEl.call(this, 'div', {
    className: 'vjs-seek-handle',
    'aria-live': 'off'
  });
};

vjs_original.SeekHandle.prototype.updateContent = function() {
  var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
  this.el_.innerHTML = '<span class="vjs-control-text">' + vjs_original.formatTime(time, this.player_.duration()) + '</span>';
};
