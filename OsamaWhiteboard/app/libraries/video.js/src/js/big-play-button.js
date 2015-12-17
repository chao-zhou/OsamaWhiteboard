/* Big Play Button
================================================================================ */
/**
 * Initial play button. Shows before the video has played. The hiding of the
 * big play button is done via CSS and player states.
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 */
vjs_original.BigPlayButton = vjs_original.Button.extend();

vjs_original.BigPlayButton.prototype.createEl = function(){
  return vjs_original.Button.prototype.createEl.call(this, 'div', {
    className: 'vjs-big-play-button',
    innerHTML: '<span aria-hidden="true"></span>',
    'aria-label': 'play video'
  });
};

vjs_original.BigPlayButton.prototype.onClick = function(){
  this.player_.play();
};
