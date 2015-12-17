(function() {
'use strict';

/* Text Track Display
============================================================================= */
// Global container for both subtitle and captions text. Simple div container.

/**
 * The component for displaying text track cues
 *
 * @constructor
 */
vjs_original.TextTrackDisplay = vjs_original.Component.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs_original.Component.call(this, player, options, ready);

    player.on('loadstart', vjs_original.bind(this, this.toggleDisplay));

    // This used to be called during player init, but was causing an error
    // if a track should show by default and the display hadn't loaded yet.
    // Should probably be moved to an external track loader when we support
    // tracks that don't need a display.
    player.ready(vjs_original.bind(this, function() {
      if (player.tech && player.tech['featuresNativeTextTracks']) {
        this.hide();
        return;
      }

      var i, tracks, track;

      player.on('fullscreenchange', vjs_original.bind(this, this.updateDisplay));

      tracks = player.options_['tracks'] || [];
      for (i = 0; i < tracks.length; i++) {
        track = tracks[i];
        this.player_.addRemoteTextTrack(track);
      }
    }));
  }
});

vjs_original.TextTrackDisplay.prototype.toggleDisplay = function() {
  if (this.player_.tech && this.player_.tech['featuresNativeTextTracks']) {
    this.hide();
  } else {
    this.show();
  }
};

vjs_original.TextTrackDisplay.prototype.createEl = function(){
  return vjs_original.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-text-track-display'
  });
};

vjs_original.TextTrackDisplay.prototype.clearDisplay = function() {
  if (typeof window['WebVTT'] === 'function') {
    window['WebVTT']['processCues'](window, [], this.el_);
  }
};

// Add cue HTML to display
var constructColor = function(color, opacity) {
  return 'rgba(' +
    // color looks like "#f0e"
    parseInt(color[1] + color[1], 16) + ',' +
    parseInt(color[2] + color[2], 16) + ',' +
    parseInt(color[3] + color[3], 16) + ',' +
    opacity + ')';
};
var darkGray = '#222';
var lightGray = '#ccc';
var fontMap = {
  monospace:             'monospace',
  sansSerif:             'sans-serif',
  serif:                 'serif',
  monospaceSansSerif:    '"Andale Mono", "Lucida Console", monospace',
  monospaceSerif:        '"Courier New", monospace',
  proportionalSansSerif: 'sans-serif',
  proportionalSerif:     'serif',
  casual:                '"Comic Sans MS", Impact, fantasy',
  script:                '"Monotype Corsiva", cursive',
  smallcaps:             '"Andale Mono", "Lucida Console", monospace, sans-serif'
};
var tryUpdateStyle = function(el, style, rule) {
  // some style changes will throw an error, particularly in IE8. Those should be noops.
  try {
    el.style[style] = rule;
  } catch (e) {}
};

vjs_original.TextTrackDisplay.prototype.updateDisplay = function() {
  var tracks = this.player_.textTracks(),
      i = 0,
      track;

  this.clearDisplay();

  if (!tracks) {
    return;
  }

  for (; i < tracks.length; i++) {
    track = tracks[i];
    if (track['mode'] === 'showing') {
      this.updateForTrack(track);
    }
  }
};

vjs_original.TextTrackDisplay.prototype.updateForTrack = function(track) {
  if (typeof window['WebVTT'] !== 'function' || !track['activeCues']) {
    return;
  }

  var i = 0,
      property,
      cueDiv,
      overrides = this.player_['textTrackSettings'].getValues(),
      fontSize,
      cues = [];

  for (; i < track['activeCues'].length; i++) {
    cues.push(track['activeCues'][i]);
  }

  window['WebVTT']['processCues'](window, track['activeCues'], this.el_);

  i = cues.length;
  while (i--) {
    cueDiv = cues[i].displayState;
    if (overrides.color) {
      cueDiv.firstChild.style.color = overrides.color;
    }
    if (overrides.textOpacity) {
      tryUpdateStyle(cueDiv.firstChild,
                     'color',
                     constructColor(overrides.color || '#fff',
                                    overrides.textOpacity));
    }
    if (overrides.backgroundColor) {
      cueDiv.firstChild.style.backgroundColor = overrides.backgroundColor;
    }
    if (overrides.backgroundOpacity) {
      tryUpdateStyle(cueDiv.firstChild,
                     'backgroundColor',
                     constructColor(overrides.backgroundColor || '#000',
                                    overrides.backgroundOpacity));
    }
    if (overrides.windowColor) {
      if (overrides.windowOpacity) {
        tryUpdateStyle(cueDiv,
                       'backgroundColor',
                       constructColor(overrides.windowColor, overrides.windowOpacity));
      } else {
        cueDiv.style.backgroundColor = overrides.windowColor;
      }
    }
    if (overrides.edgeStyle) {
      if (overrides.edgeStyle === 'dropshadow') {
        cueDiv.firstChild.style.textShadow = '2px 2px 3px ' + darkGray + ', 2px 2px 4px ' + darkGray + ', 2px 2px 5px ' + darkGray;
      } else if (overrides.edgeStyle === 'raised') {
        cueDiv.firstChild.style.textShadow = '1px 1px ' + darkGray + ', 2px 2px ' + darkGray + ', 3px 3px ' + darkGray;
      } else if (overrides.edgeStyle === 'depressed') {
        cueDiv.firstChild.style.textShadow = '1px 1px ' + lightGray + ', 0 1px ' + lightGray + ', -1px -1px ' + darkGray + ', 0 -1px ' + darkGray;
      } else if (overrides.edgeStyle === 'uniform') {
        cueDiv.firstChild.style.textShadow = '0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray;
      }
    }
    if (overrides.fontPercent && overrides.fontPercent !== 1) {
      fontSize = window.parseFloat(cueDiv.style.fontSize);
      cueDiv.style.fontSize = (fontSize * overrides.fontPercent) + 'px';
      cueDiv.style.height = 'auto';
      cueDiv.style.top = 'auto';
      cueDiv.style.bottom = '2px';
    }
    if (overrides.fontFamily && overrides.fontFamily !== 'default') {
      if (overrides.fontFamily === 'small-caps') {
        cueDiv.firstChild.style.fontVariant = 'small-caps';
      } else {
        cueDiv.firstChild.style.fontFamily = fontMap[overrides.fontFamily];
      }
    }
  }
};


/**
 * The specific menu item type for selecting a language within a text track kind
 *
 * @constructor
 */
vjs_original.TextTrackMenuItem = vjs_original.MenuItem.extend({
  /** @constructor */
  init: function(player, options){
    var track = this.track = options['track'],
        tracks = player.textTracks(),
        changeHandler,
        event;

    if (tracks) {
      changeHandler = vjs_original.bind(this, function() {
        var selected = this.track['mode'] === 'showing',
            track,
            i,
            l;

        if (this instanceof vjs_original.OffTextTrackMenuItem) {
          selected = true;

          i = 0,
          l = tracks.length;

          for (; i < l; i++) {
            track = tracks[i];
            if (track['kind'] === this.track['kind'] && track['mode'] === 'showing') {
              selected = false;
              break;
            }
          }
        }

        this.selected(selected);
      });
      tracks.addEventListener('change', changeHandler);
      player.on('dispose', function() {
        tracks.removeEventListener('change', changeHandler);
      });
    }

    // Modify options for parent MenuItem class's init.
    options['label'] = track['label'] || track['language'] || 'Unknown';
    options['selected'] = track['default'] || track['mode'] === 'showing';
    vjs_original.MenuItem.call(this, player, options);

    // iOS7 doesn't dispatch change events to TextTrackLists when an
    // associated track's mode changes. Without something like
    // Object.observe() (also not present on iOS7), it's not
    // possible to detect changes to the mode attribute and polyfill
    // the change event. As a poor substitute, we manually dispatch
    // change events whenever the controls modify the mode.
    if (tracks && tracks.onchange === undefined) {
      this.on(['tap', 'click'], function() {
        if (typeof window.Event !== 'object') {
          // Android 2.3 throws an Illegal Constructor error for window.Event
          try {
            event = new window.Event('change');
          } catch(err){}
        }

        if (!event) {
          event = document.createEvent('Event');
          event.initEvent('change', true, true);
        }

        tracks.dispatchEvent(event);
      });
    }
  }
});

vjs_original.TextTrackMenuItem.prototype.onClick = function(){
  var kind = this.track['kind'],
      tracks = this.player_.textTracks(),
      mode,
      track,
      i = 0;

  vjs_original.MenuItem.prototype.onClick.call(this);

  if (!tracks) {
    return;
  }

  for (; i < tracks.length; i++) {
    track = tracks[i];

    if (track['kind'] !== kind) {
      continue;
    }

    if (track === this.track) {
      track['mode'] = 'showing';
    } else {
      track['mode'] = 'disabled';
    }
  }
};

/**
 * A special menu item for turning of a specific type of text track
 *
 * @constructor
 */
vjs_original.OffTextTrackMenuItem = vjs_original.TextTrackMenuItem.extend({
  /** @constructor */
  init: function(player, options){
    // Create pseudo track info
    // Requires options['kind']
    options['track'] = {
      'kind': options['kind'],
      'player': player,
      'label': options['kind'] + ' off',
      'default': false,
      'mode': 'disabled'
    };
    vjs_original.TextTrackMenuItem.call(this, player, options);
    this.selected(true);
  }
});

vjs_original.CaptionSettingsMenuItem = vjs_original.TextTrackMenuItem.extend({
  init: function(player, options) {
    options['track'] = {
      'kind': options['kind'],
      'player': player,
      'label': options['kind'] + ' settings',
      'default': false,
      mode: 'disabled'
    };

    vjs_original.TextTrackMenuItem.call(this, player, options);
    this.addClass('vjs-texttrack-settings');
  }
});

vjs_original.CaptionSettingsMenuItem.prototype.onClick = function() {
  this.player().getChild('textTrackSettings').show();
};

/**
 * The base class for buttons that toggle specific text track types (e.g. subtitles)
 *
 * @constructor
 */
vjs_original.TextTrackButton = vjs_original.MenuButton.extend({
  /** @constructor */
  init: function(player, options){
    var tracks, updateHandler;

    vjs_original.MenuButton.call(this, player, options);

    tracks = this.player_.textTracks();

    if (this.items.length <= 1) {
      this.hide();
    }

    if (!tracks) {
      return;
    }

    updateHandler = vjs_original.bind(this, this.update);
    tracks.addEventListener('removetrack', updateHandler);
    tracks.addEventListener('addtrack', updateHandler);

    this.player_.on('dispose', function() {
      tracks.removeEventListener('removetrack', updateHandler);
      tracks.removeEventListener('addtrack', updateHandler);
    });
  }
});

// Create a menu item for each text track
vjs_original.TextTrackButton.prototype.createItems = function(){
  var items = [], track, tracks;

  if (this instanceof vjs_original.CaptionsButton && !(this.player().tech && this.player().tech['featuresNativeTextTracks'])) {
    items.push(new vjs_original.CaptionSettingsMenuItem(this.player_, { 'kind': this.kind_ }));
  }

  // Add an OFF menu item to turn all tracks off
  items.push(new vjs_original.OffTextTrackMenuItem(this.player_, { 'kind': this.kind_ }));

  tracks = this.player_.textTracks();

  if (!tracks) {
    return items;
  }

  for (var i = 0; i < tracks.length; i++) {
    track = tracks[i];

    // only add tracks that are of the appropriate kind and have a label
    if (track['kind'] === this.kind_) {
      items.push(new vjs_original.TextTrackMenuItem(this.player_, {
        'track': track
      }));
    }
  }

  return items;
};

/**
 * The button component for toggling and selecting captions
 *
 * @constructor
 */
vjs_original.CaptionsButton = vjs_original.TextTrackButton.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs_original.TextTrackButton.call(this, player, options, ready);
    this.el_.setAttribute('aria-label','Captions Menu');
  }
});
vjs_original.CaptionsButton.prototype.kind_ = 'captions';
vjs_original.CaptionsButton.prototype.buttonText = 'Captions';
vjs_original.CaptionsButton.prototype.className = 'vjs-captions-button';

vjs_original.CaptionsButton.prototype.update = function() {
  var threshold = 2;
  vjs_original.TextTrackButton.prototype.update.call(this);

  // if native, then threshold is 1 because no settings button
  if (this.player().tech && this.player().tech['featuresNativeTextTracks']) {
    threshold = 1;
  }

  if (this.items && this.items.length > threshold) {
    this.show();
  } else {
    this.hide();
  }
};

/**
 * The button component for toggling and selecting subtitles
 *
 * @constructor
 */
vjs_original.SubtitlesButton = vjs_original.TextTrackButton.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs_original.TextTrackButton.call(this, player, options, ready);
    this.el_.setAttribute('aria-label','Subtitles Menu');
  }
});
vjs_original.SubtitlesButton.prototype.kind_ = 'subtitles';
vjs_original.SubtitlesButton.prototype.buttonText = 'Subtitles';
vjs_original.SubtitlesButton.prototype.className = 'vjs-subtitles-button';

// Chapters act much differently than other text tracks
// Cues are navigation vs. other tracks of alternative languages
/**
 * The button component for toggling and selecting chapters
 *
 * @constructor
 */
vjs_original.ChaptersButton = vjs_original.TextTrackButton.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs_original.TextTrackButton.call(this, player, options, ready);
    this.el_.setAttribute('aria-label','Chapters Menu');
  }
});
vjs_original.ChaptersButton.prototype.kind_ = 'chapters';
vjs_original.ChaptersButton.prototype.buttonText = 'Chapters';
vjs_original.ChaptersButton.prototype.className = 'vjs-chapters-button';

// Create a menu item for each text track
vjs_original.ChaptersButton.prototype.createItems = function(){
  var items = [], track, tracks;

  tracks = this.player_.textTracks();

  if (!tracks) {
    return items;
  }

  for (var i = 0; i < tracks.length; i++) {
    track = tracks[i];
    if (track['kind'] === this.kind_) {
      items.push(new vjs_original.TextTrackMenuItem(this.player_, {
        'track': track
      }));
    }
  }

  return items;
};

vjs_original.ChaptersButton.prototype.createMenu = function(){
  var tracks = this.player_.textTracks() || [],
      i = 0,
      l = tracks.length,
      track, chaptersTrack,
      items = this.items = [];

  for (; i < l; i++) {
    track = tracks[i];
    if (track['kind'] == this.kind_) {
      if (!track.cues) {
        track['mode'] = 'hidden';
        /* jshint loopfunc:true */
        // TODO see if we can figure out a better way of doing this https://github.com/videojs/video.js/issues/1864
        window.setTimeout(vjs_original.bind(this, function() {
          this.createMenu();
        }), 100);
        /* jshint loopfunc:false */
      } else {
        chaptersTrack = track;
        break;
      }
    }
  }

  var menu = this.menu;
  if (menu === undefined) {
    menu = new vjs_original.Menu(this.player_);
    menu.contentEl().appendChild(vjs_original.createEl('li', {
      className: 'vjs-menu-title',
      innerHTML: vjs_original.capitalize(this.kind_),
      tabindex: -1
    }));
  }

  if (chaptersTrack) {
    var cues = chaptersTrack['cues'], cue, mi;
    i = 0;
    l = cues.length;

    for (; i < l; i++) {
      cue = cues[i];

      mi = new vjs_original.ChaptersTrackMenuItem(this.player_, {
        'track': chaptersTrack,
        'cue': cue
      });

      items.push(mi);

      menu.addChild(mi);
    }
    this.addChild(menu);
  }

  if (this.items.length > 0) {
    this.show();
  }

  return menu;
};


/**
 * @constructor
 */
vjs_original.ChaptersTrackMenuItem = vjs_original.MenuItem.extend({
  /** @constructor */
  init: function(player, options){
    var track = this.track = options['track'],
        cue = this.cue = options['cue'],
        currentTime = player.currentTime();

    // Modify options for parent MenuItem class's init.
    options['label'] = cue.text;
    options['selected'] = (cue['startTime'] <= currentTime && currentTime < cue['endTime']);
    vjs_original.MenuItem.call(this, player, options);

    track.addEventListener('cuechange', vjs_original.bind(this, this.update));
  }
});

vjs_original.ChaptersTrackMenuItem.prototype.onClick = function(){
  vjs_original.MenuItem.prototype.onClick.call(this);
  this.player_.currentTime(this.cue.startTime);
  this.update(this.cue.startTime);
};

vjs_original.ChaptersTrackMenuItem.prototype.update = function(){
  var cue = this.cue,
      currentTime = this.player_.currentTime();

  // vjs.log(currentTime, cue.startTime);
  this.selected(cue['startTime'] <= currentTime && currentTime < cue['endTime']);
};
})();
