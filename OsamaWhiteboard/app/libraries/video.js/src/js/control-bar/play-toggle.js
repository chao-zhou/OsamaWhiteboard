/**
 * Button to toggle between play and pause
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs_original.PlayToggle = vjs_original.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Button.call(this, player, options);

    this.on(player, 'play', this.onPlay);
    this.on(player, 'pause', this.onPause);
  }
});

vjs_original.PlayToggle.prototype.buttonText = 'Play';

vjs_original.PlayToggle.prototype.buildCSSClass = function(){
  return 'vjs-play-control ' + vjs_original.Button.prototype.buildCSSClass.call(this);
};

// OnClick - Toggle between play and pause
vjs_original.PlayToggle.prototype.onClick = function(){
  if (this.player_.paused()) {
    this.player_.play();
  } else {
    this.player_.pause();
  }
};

  // OnPlay - Add the vjs-playing class to the element so it can change appearance
vjs_original.PlayToggle.prototype.onPlay = function(){
  this.removeClass('vjs-paused');
  this.addClass('vjs-playing');
  this.el_.children[0].children[0].innerHTML = this.localize('Pause'); // change the button text to "Pause"
};

  // OnPause - Add the vjs-paused class to the element so it can change appearance
vjs_original.PlayToggle.prototype.onPause = function(){
  this.removeClass('vjs-playing');
  this.addClass('vjs-paused');
  this.el_.children[0].children[0].innerHTML = this.localize('Play'); // change the button text to "Play"
};
