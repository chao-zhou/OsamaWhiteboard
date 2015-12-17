/**
 * Display that an error has occurred making the video unplayable
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.ErrorDisplay = vjs_original.Component.extend({
  init: function(player, options){
    vjs_original.Component.call(this, player, options);

    this.update();
    this.on(player, 'error', this.update);
  }
});

vjs_original.ErrorDisplay.prototype.createEl = function(){
  var el = vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-error-display'
  });

  this.contentEl_ = vjs_original.createEl('div');
  el.appendChild(this.contentEl_);

  return el;
};

vjs_original.ErrorDisplay.prototype.update = function(){
  if (this.player().error()) {
    this.contentEl_.innerHTML = this.localize(this.player().error().message);
  }
};
