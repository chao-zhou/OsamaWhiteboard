/* Poster Image
================================================================================ */
/**
 * The component that handles showing the poster image.
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.PosterImage = vjs_original.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Button.call(this, player, options);

    this.update();
    player.on('posterchange', vjs_original.bind(this, this.update));
  }
});

/**
 * Clean up the poster image
 */
vjs_original.PosterImage.prototype.dispose = function(){
  this.player().off('posterchange', this.update);
  vjs_original.Button.prototype.dispose.call(this);
};

/**
 * Create the poster image element
 * @return {Element}
 */
vjs_original.PosterImage.prototype.createEl = function(){
  var el = vjs_original.createEl('div', {
    className: 'vjs-poster',

    // Don't want poster to be tabbable.
    tabIndex: -1
  });

  // To ensure the poster image resizes while maintaining its original aspect
  // ratio, use a div with `background-size` when available. For browsers that
  // do not support `background-size` (e.g. IE8), fall back on using a regular
  // img element.
  if (!vjs_original.BACKGROUND_SIZE_SUPPORTED) {
    this.fallbackImg_ = vjs_original.createEl('img');
    el.appendChild(this.fallbackImg_);
  }

  return el;
};

/**
 * Event handler for updates to the player's poster source
 */
vjs_original.PosterImage.prototype.update = function(){
  var url = this.player().poster();

  this.setSrc(url);

  // If there's no poster source we should display:none on this component
  // so it's not still clickable or right-clickable
  if (url) {
    this.show();
  } else {
    this.hide();
  }
};

/**
 * Set the poster source depending on the display method
 */
vjs_original.PosterImage.prototype.setSrc = function(url){
  var backgroundImage;

  if (this.fallbackImg_) {
    this.fallbackImg_.src = url;
  } else {
    backgroundImage = '';
    // Any falsey values should stay as an empty string, otherwise
    // this will throw an extra error
    if (url) {
      backgroundImage = 'url("' + url + '")';
    }

    this.el_.style.backgroundImage = backgroundImage;
  }
};

/**
 * Event handler for clicks on the poster image
 */
vjs_original.PosterImage.prototype.onClick = function(){
  // We don't want a click to trigger playback when controls are disabled
  // but CSS should be hiding the poster to prevent that from happening
  this.player_.play();
};
