(function() {
/*
 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttrack
 *
 * interface TextTrack : EventTarget {
 *   readonly attribute TextTrackKind kind;
 *   readonly attribute DOMString label;
 *   readonly attribute DOMString language;
 *
 *   readonly attribute DOMString id;
 *   readonly attribute DOMString inBandMetadataTrackDispatchType;
 *
 *   attribute TextTrackMode mode;
 *
 *   readonly attribute TextTrackCueList? cues;
 *   readonly attribute TextTrackCueList? activeCues;
 *
 *   void addCue(TextTrackCue cue);
 *   void removeCue(TextTrackCue cue);
 *
 *   attribute EventHandler oncuechange;
 * };
 */

vjs_original.TextTrack = function(options) {
  var tt, id, mode, kind, label, language, cues, activeCues, timeupdateHandler, changed, prop;

  options = options || {};

  if (!options['player']) {
    throw new Error('A player was not provided.');
  }

  tt = this;
  if (vjs_original.IS_IE8) {
    tt = document.createElement('custom');

    for (prop in vjs_original.TextTrack.prototype) {
      tt[prop] = vjs_original.TextTrack.prototype[prop];
    }
  }

  tt.player_ = options['player'];

  mode = vjs_original.TextTrackMode[options['mode']] || 'disabled';
  kind = vjs_original.TextTrackKind[options['kind']] || 'subtitles';
  label = options['label'] || '';
  language = options['language'] || options['srclang'] || '';
  id = options['id'] || 'vjs_text_track_' + vjs_original.guid++;

  if (kind === 'metadata' || kind === 'chapters') {
    mode = 'hidden';
  }

  tt.cues_ = [];
  tt.activeCues_ = [];

  cues = new vjs_original.TextTrackCueList(tt.cues_);
  activeCues = new vjs_original.TextTrackCueList(tt.activeCues_);

  changed = false;
  timeupdateHandler = vjs_original.bind(tt, function() {
    this['activeCues'];
    if (changed) {
      this['trigger']('cuechange');
      changed = false;
    }
  });
  if (mode !== 'disabled') {
    tt.player_.on('timeupdate', timeupdateHandler);
  }

  Object.defineProperty(tt, 'kind', {
    get: function() {
      return kind;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'label', {
    get: function() {
      return label;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'language', {
    get: function() {
      return language;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'id', {
    get: function() {
      return id;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'mode', {
    get: function() {
      return mode;
    },
    set: function(newMode) {
      if (!vjs_original.TextTrackMode[newMode]) {
        return;
      }
      mode = newMode;
      if (mode === 'showing') {
        this.player_.on('timeupdate', timeupdateHandler);
      }
      this.trigger('modechange');
    }
  });

  Object.defineProperty(tt, 'cues', {
    get: function() {
      if (!this.loaded_) {
        return null;
      }

      return cues;
    },
    set: Function.prototype
  });

  Object.defineProperty(tt, 'activeCues', {
    get: function() {
      var i, l, active, ct, cue;

      if (!this.loaded_) {
        return null;
      }

      if (this['cues'].length === 0) {
        return activeCues; // nothing to do
      }

      ct = this.player_.currentTime();
      i = 0;
      l = this['cues'].length;
      active = [];

      for (; i < l; i++) {
        cue = this['cues'][i];
        if (cue['startTime'] <= ct && cue['endTime'] >= ct) {
          active.push(cue);
        } else if (cue['startTime'] === cue['endTime'] && cue['startTime'] <= ct && cue['startTime'] + 0.5 >= ct) {
          active.push(cue);
        }
      }

      changed = false;

      if (active.length !== this.activeCues_.length) {
        changed = true;
      } else {
        for (i = 0; i < active.length; i++) {
          if (indexOf.call(this.activeCues_, active[i]) === -1) {
            changed = true;
          }
        }
      }

      this.activeCues_ = active;
      activeCues.setCues_(this.activeCues_);

      return activeCues;
    },
    set: Function.prototype
  });

  if (options.src) {
    loadTrack(options.src, tt);
  } else {
    tt.loaded_ = true;
  }

  if (vjs_original.IS_IE8) {
    return tt;
  }
};

vjs_original.TextTrack.prototype = vjs_original.obj.create(vjs_original.EventEmitter.prototype);
vjs_original.TextTrack.prototype.constructor = vjs_original.TextTrack;

/*
 * cuechange - One or more cues in the track have become active or stopped being active.
 */
vjs_original.TextTrack.prototype.allowedEvents_ = {
  'cuechange': 'cuechange'
};

vjs_original.TextTrack.prototype.addCue = function(cue) {
  var tracks = this.player_.textTracks(),
      i = 0;

  if (tracks) {
    for (; i < tracks.length; i++) {
      if (tracks[i] !== this) {
        tracks[i].removeCue(cue);
      }
    }
  }

  this.cues_.push(cue);
  this['cues'].setCues_(this.cues_);
};

vjs_original.TextTrack.prototype.removeCue = function(removeCue) {
  var i = 0,
      l = this.cues_.length,
      cue,
      removed = false;

  for (; i < l; i++) {
    cue = this.cues_[i];
    if (cue === removeCue) {
      this.cues_.splice(i, 1);
      removed = true;
    }
  }

  if (removed) {
    this.cues.setCues_(this.cues_);
  }
};

/*
 * Downloading stuff happens below this point
 */
var loadTrack, parseCues, indexOf;

loadTrack = function(src, track) {
  vjs_original.xhr(src, vjs_original.bind(this, function(err, response, responseBody){
    if (err) {
      return vjs_original.log.error(err);
    }


    track.loaded_ = true;
    parseCues(responseBody, track);
  }));
};

parseCues = function(srcContent, track) {
  if (typeof window['WebVTT'] !== 'function') {
    //try again a bit later
    return window.setTimeout(function() {
      parseCues(srcContent, track);
    }, 25);
  }

  var parser = new window['WebVTT']['Parser'](window, window['vttjs'], window['WebVTT']['StringDecoder']());

  parser['oncue'] = function(cue) {
    track.addCue(cue);
  };
  parser['onparsingerror'] = function(error) {
    vjs_original.log.error(error);
  };

  parser['parse'](srcContent);
  parser['flush']();
};

indexOf = function(searchElement, fromIndex) {

  var k;

  if (this == null) {
    throw new TypeError('"this" is null or not defined');
  }

  var O = Object(this);

  var len = O.length >>> 0;

  if (len === 0) {
    return -1;
  }

  var n = +fromIndex || 0;

  if (Math.abs(n) === Infinity) {
    n = 0;
  }

  if (n >= len) {
    return -1;
  }

  k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

  while (k < len) {
    if (k in O && O[k] === searchElement) {
      return k;
    }
    k++;
  }
  return -1;
};

})();
