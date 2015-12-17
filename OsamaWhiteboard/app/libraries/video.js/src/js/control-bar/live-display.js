/**
 * Displays the live indicator
 * TODO - Future make it click to snap to live
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.LiveDisplay = vjs_original.Component.extend({
  init: function(player, options){
    vjs_original.Component.call(this, player, options);
  }
});

vjs_original.LiveDisplay.prototype.createEl = function(){
  var el = vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-live-controls vjs-control'
  });

  this.contentEl_ = vjs_original.createEl('div', {
    className: 'vjs-live-display',
    innerHTML: '<span class="vjs-control-text">' + this.localize('Stream Type') + '</span>' + this.localize('LIVE'),
    'aria-live': 'off'
  });

  el.appendChild(this.contentEl_);

  return el;
};
