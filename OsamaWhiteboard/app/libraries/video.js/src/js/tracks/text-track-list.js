/*
 * https://html.spec.whatwg.org/multipage/embedded-content.html#texttracklist
 *
 * interface TextTrackList : EventTarget {
 *   readonly attribute unsigned long length;
 *   getter TextTrack (unsigned long index);
 *   TextTrack? getTrackById(DOMString id);
 * 
 *   attribute EventHandler onchange;
 *   attribute EventHandler onaddtrack;
 *   attribute EventHandler onremovetrack;
 * };
 */
vjs_original.TextTrackList = function(tracks) {
  var list = this,
      prop,
      i = 0;

  if (vjs_original.IS_IE8) {
    list = document.createElement('custom');

    for (prop in vjs_original.TextTrackList.prototype) {
      list[prop] = vjs_original.TextTrackList.prototype[prop];
    }
  }

  tracks = tracks || [];
  list.tracks_ = [];

  Object.defineProperty(list, 'length', {
    get: function() {
      return this.tracks_.length;
    }
  });

  for (; i < tracks.length; i++) {
    list.addTrack_(tracks[i]);
  }

  if (vjs_original.IS_IE8) {
    return list;
  }
};

vjs_original.TextTrackList.prototype = vjs_original.obj.create(vjs_original.EventEmitter.prototype);
vjs_original.TextTrackList.prototype.constructor = vjs_original.TextTrackList;

/*
 * change - One or more tracks in the track list have been enabled or disabled.
 * addtrack - A track has been added to the track list.
 * removetrack - A track has been removed from the track list.
*/
vjs_original.TextTrackList.prototype.allowedEvents_ = {
  'change': 'change',
  'addtrack': 'addtrack',
  'removetrack': 'removetrack'
};

// emulate attribute EventHandler support to allow for feature detection
(function() {
  var event;

  for (event in vjs_original.TextTrackList.prototype.allowedEvents_) {
    vjs_original.TextTrackList.prototype['on' + event] = null;
  }
})();

vjs_original.TextTrackList.prototype.addTrack_ = function(track) {
  var index = this.tracks_.length;
  if (!(''+index in this)) {
    Object.defineProperty(this, index, {
      get: function() {
        return this.tracks_[index];
      }
    });
  }

  track.addEventListener('modechange', vjs_original.bind(this, function() {
    this.trigger('change');
  }));
  this.tracks_.push(track);

  this.trigger({
    type: 'addtrack',
    track: track
  });
};

vjs_original.TextTrackList.prototype.removeTrack_ = function(rtrack) {
  var i = 0,
      l = this.length,
      result = null,
      track;

  for (; i < l; i++) {
    track = this[i];
    if (track === rtrack) {
      this.tracks_.splice(i, 1);
      break;
    }
  }

  this.trigger({
    type: 'removetrack',
    track: rtrack
  });
};

vjs_original.TextTrackList.prototype.getTrackById = function(id) {
  var i = 0,
      l = this.length,
      result = null,
      track;

  for (; i < l; i++) {
    track = this[i];
    if (track.id === id) {
      result = track;
      break;
    }
  }

  return result;
};
