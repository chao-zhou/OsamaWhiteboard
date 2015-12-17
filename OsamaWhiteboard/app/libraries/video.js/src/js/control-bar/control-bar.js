/**
 * Container of main controls
 * @param {vjs_original.Player|Object} player
 * @param {Object=} options
 * @class
 * @constructor
 * @extends vjs_original.Component
 */
vjs_original.ControlBar = vjs_original.Component.extend();

vjs_original.ControlBar.prototype.options_ = {
  loadEvent: 'play',
  children: {
    'playToggle': {},
    'currentTimeDisplay': {},
    'timeDivider': {},
    'durationDisplay': {},
    'remainingTimeDisplay': {},
    'liveDisplay': {},
    'progressControl': {},
    'fullscreenToggle': {},
    'volumeControl': {},
    'muteToggle': {},
    // 'volumeMenuButton': {},
    'playbackRateMenuButton': {},
    'subtitlesButton': {},
    'captionsButton': {},
    'chaptersButton': {}
  }
};

vjs_original.ControlBar.prototype.createEl = function(){
  return vjs_original.createEl('div', {
    className: 'vjs-control-bar'
  });
};
