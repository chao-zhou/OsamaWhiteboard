/**
 * A button component for muting the audio
 *
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs_original.MuteToggle = vjs_original.Button.extend({
  /** @constructor */
  init: function(player, options){
    vjs_original.Button.call(this, player, options);

    this.on(player, 'volumechange', this.update);

    // hide mute toggle if the current tech doesn't support volume control
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

vjs_original.MuteToggle.prototype.createEl = function(){
  return vjs_original.Button.prototype.createEl.call(this, 'div', {
    className: 'vjs-mute-control vjs-control',
    innerHTML: '<div><span class="vjs-control-text">' + this.localize('Mute') + '</span></div>'
  });
};

vjs_original.MuteToggle.prototype.onClick = function(){
  this.player_.muted( this.player_.muted() ? false : true );
};

vjs_original.MuteToggle.prototype.update = function(){
  var vol = this.player_.volume(),
      level = 3;

  if (vol === 0 || this.player_.muted()) {
    level = 0;
  } else if (vol < 0.33) {
    level = 1;
  } else if (vol < 0.67) {
    level = 2;
  }

  // Don't rewrite the button text if the actual text doesn't change.
  // This causes unnecessary and confusing information for screen reader users.
  // This check is needed because this function gets called every time the volume level is changed.
  if(this.player_.muted()){
      if(this.el_.children[0].children[0].innerHTML!=this.localize('Unmute')){
          this.el_.children[0].children[0].innerHTML = this.localize('Unmute'); // change the button text to "Unmute"
      }
  } else {
      if(this.el_.children[0].children[0].innerHTML!=this.localize('Mute')){
          this.el_.children[0].children[0].innerHTML = this.localize('Mute'); // change the button text to "Mute"
      }
  }

  /* TODO improve muted icon classes */
  for (var i = 0; i < 4; i++) {
    vjs_original.removeClass(this.el_, 'vjs-vol-'+i);
  }
  vjs_original.addClass(this.el_, 'vjs-vol-'+level);
};
