/**
 * The component for controlling the volume level
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.VolumeControl = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);

    // hide volume controls when they're not supported by the current tech
    if (player.tech && player.tech['featuresVolumeControl'] === false) {
      this.addClass('vjs-hidden');
    }
    this.on(player, 'loadstart', function(){
      if (player.tech['featuresVolumeControl'] === false) {
        this.addClass('vjs-hidden');
      } else {
        this.removeClass('vjs-hidden');
      }
    });
  }
});

vjs_original.VolumeControl.prototype.options_ = {
  children: {
    'volumeBar': {}
  }
};

vjs_original.VolumeControl.prototype.createEl = function(){
  return vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-volume-control vjs-control'
  });
};

/**
 * The bar that contains the volume level and can be clicked on to adjust the level
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.VolumeBar = vjs_original.Slider.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Slider.call(this, player, options);
    this.on(player, 'volumechange', this.updateARIAAttributes);
    player.ready(vjs_original.bind(this, this.updateARIAAttributes));
  }
});

vjs_original.VolumeBar.prototype.updateARIAAttributes = function(){
  // Current value of volume bar as a percentage
  this.el_.setAttribute('aria-valuenow',vjs_original.round(this.player_.volume()*100, 2));
  this.el_.setAttribute('aria-valuetext',vjs_original.round(this.player_.volume()*100, 2)+'%');
};

vjs_original.VolumeBar.prototype.options_ = {
  children: {
    'volumeLevel': {},
    'volumeHandle': {}
  },
  'barName': 'volumeLevel',
  'handleName': 'volumeHandle'
};

vjs_original.VolumeBar.prototype.playerEvent = 'volumechange';

vjs_original.VolumeBar.prototype.createEl = function(){
  return vjs_original.Slider.prototype.createEl.call(this, 'div', {
    className: 'vjs-volume-bar',
    'aria-label': 'volume level'
  });
};

vjs_original.VolumeBar.prototype.onMouseMove = function(event) {
  if (this.player_.muted()) {
    this.player_.muted(false);
  }

  this.player_.volume(this.calculateDistance(event));
};

vjs_original.VolumeBar.prototype.getPercent = function(){
  if (this.player_.muted()) {
    return 0;
  } else {
    return this.player_.volume();
  }
};

vjs_original.VolumeBar.prototype.stepForward = function(){
  this.player_.volume(this.player_.volume() + 0.1);
};

vjs_original.VolumeBar.prototype.stepBack = function(){
  this.player_.volume(this.player_.volume() - 0.1);
};

/**
 * Shows volume level
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.VolumeLevel = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Component.call(this, player, options);
  }
});

vjs_original.VolumeLevel.prototype.createEl = function(){
  return vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-volume-level',
    innerHTML: '<span class="vjs-control-text"></span>'
  });
};

/**
 * The volume handle can be dragged to adjust the volume level
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
 vjs_original.VolumeHandle = vjs_original.SliderHandle.extend();

 vjs_original.VolumeHandle.prototype.defaultValue = '00:00';

 /** @inheritDoc */
 vjs_original.VolumeHandle.prototype.createEl = function(){
   return vjs_original.SliderHandle.prototype.createEl.call(this, 'div', {
     className: 'vjs-volume-handle'
   });
 };
