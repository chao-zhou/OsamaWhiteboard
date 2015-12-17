/**
 * Toggle fullscreen video
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @class
 * @extends vjs_original.Button
 */
vjs_original.FullscreenToggle = vjs_original.Button.extend({
  /**
   * @constructor
   * @memberof vjs.FullscreenToggle
   * @instance
   */
  init: function(player, options){
    vjs_original.Button.call(this, player, options);
  }
});

vjs_original.FullscreenToggle.prototype.buttonText = 'Fullscreen';

vjs_original.FullscreenToggle.prototype.buildCSSClass = function(){
  return 'vjs-fullscreen-control ' + vjs_original.Button.prototype.buildCSSClass.call(this);
};

vjs_original.FullscreenToggle.prototype.onClick = function(){
  if (!this.player_.isFullscreen()) {
    this.player_.requestFullscreen();
    this.controlText_.innerHTML = this.localize('Non-Fullscreen');
  } else {
    this.player_.exitFullscreen();
    this.controlText_.innerHTML = this.localize('Fullscreen');
  }
};
