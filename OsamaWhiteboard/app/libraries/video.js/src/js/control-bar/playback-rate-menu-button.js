/**
 * The component for controlling the playback rate
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.PlaybackRateMenuButton = vjs_original.MenuButton.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.MenuButton.call(this, player, options);

    this.updateVisibility();
    this.updateLabel();

    this.on(player, 'loadstart', this.updateVisibility);
    this.on(player, 'ratechange', this.updateLabel);
  }
});

vjs_original.PlaybackRateMenuButton.prototype.buttonText = 'Playback Rate';
vjs_original.PlaybackRateMenuButton.prototype.className = 'vjs-playback-rate';

vjs_original.PlaybackRateMenuButton.prototype.createEl = function(){
  var el = vjs_original.MenuButton.prototype.createEl.call(this);

  this.labelEl_ = vjs_original.createEl('div', {
    className: 'vjs-playback-rate-value',
    innerHTML: 1.0
  });

  el.appendChild(this.labelEl_);

  return el;
};

// Menu creation
vjs_original.PlaybackRateMenuButton.prototype.createMenu = function(){
  var menu = new vjs_original.Menu(this.player());
  var rates = this.player().options()['playbackRates'];

  if (rates) {
    for (var i = rates.length - 1; i >= 0; i--) {
      menu.addChild(
        new vjs_original.PlaybackRateMenuItem(this.player(), { 'rate': rates[i] + 'x'})
        );
    }
  }

  return menu;
};

vjs_original.PlaybackRateMenuButton.prototype.updateARIAAttributes = function(){
  // Current playback rate
  this.el().setAttribute('aria-valuenow', this.player().playbackRate());
};

vjs_original.PlaybackRateMenuButton.prototype.onClick = function(){
  // select next rate option
  var currentRate = this.player().playbackRate();
  var rates = this.player().options()['playbackRates'];
  // this will select first one if the last one currently selected
  var newRate = rates[0];
  for (var i = 0; i <rates.length ; i++) {
    if (rates[i] > currentRate) {
      newRate = rates[i];
      break;
    }
  }
  this.player().playbackRate(newRate);
};

vjs_original.PlaybackRateMenuButton.prototype.playbackRateSupported = function(){
  return this.player().tech
    && this.player().tech['featuresPlaybackRate']
    && this.player().options()['playbackRates']
    && this.player().options()['playbackRates'].length > 0
  ;
};

/**
 * Hide playback rate controls when they're no playback rate options to select
 */
vjs_original.PlaybackRateMenuButton.prototype.updateVisibility = function(){
  if (this.playbackRateSupported()) {
    this.removeClass('vjs-hidden');
  } else {
    this.addClass('vjs-hidden');
  }
};

/**
 * Update button label when rate changed
 */
vjs_original.PlaybackRateMenuButton.prototype.updateLabel = function(){
  if (this.playbackRateSupported()) {
    this.labelEl_.innerHTML = this.player().playbackRate() + 'x';
  }
};

/**
 * The specific menu item type for selecting a playback rate
 *
 * @constructor
 */
vjs_original.PlaybackRateMenuItem = vjs_original.MenuItem.extend({
  contentElType: 'button',
  /** @constructor */
  init: function(player, options){
    var label = this.label = options['rate'];
    var rate = this.rate = parseFloat(label, 10);

    // Modify options for parent MenuItem class's init.
    options['label'] = label;
    options['selected'] = rate === 1;
    vjs_original.MenuItem.call(this, player, options);

    this.on(player, 'ratechange', this.update);
  }
});

vjs_original.PlaybackRateMenuItem.prototype.onClick = function(){
  vjs_original.MenuItem.prototype.onClick.call(this);
  this.player().playbackRate(this.rate);
};

vjs_original.PlaybackRateMenuItem.prototype.update = function(){
  this.selected(this.player().playbackRate() == this.rate);
};
