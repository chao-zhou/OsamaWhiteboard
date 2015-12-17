/**
 * @fileoverview Externs for videojs.Player. Externs are functions that the
 * compiler shouldn't obfuscate.
 */

/**
 * @constructor
 * @extends {VideoJS.Component}
 */
 VideoJS.Player = function(){};

/**
 * Native HTML5 video properties
 * Most likely covered by the default closure compiler externs
 * Copied list from http://code.google.com/p/closure-compiler/source/browse/externs/html5.js?spec=svne2e531de906d9ccccf23516bd2dd6152a93f6468&r=e2e531de906d9ccccf23516bd2dd6152a93f6468
 * May not all be available on a videojs player yet
 */
VideoJS.Player.prototype.error = function(){};
VideoJS.Player.prototype.src = function(){};
VideoJS.Player.prototype.currentSrc = function(){};
VideoJS.Player.prototype.networkState = function(){};
VideoJS.Player.prototype.buffered = function(){};
VideoJS.Player.prototype.load = function(){};
VideoJS.Player.prototype.canPlayType = function(){};
VideoJS.Player.prototype.readyState = function(){};
VideoJS.Player.prototype.seeking = function(){};
VideoJS.Player.prototype.currentTime = function(){};
VideoJS.Player.prototype.remainingTime = function(){};
VideoJS.Player.prototype.startTime = function(){};
VideoJS.Player.prototype.duration = function(){};
VideoJS.Player.prototype.paused = function(){};
VideoJS.Player.prototype.defaultPlaybackRate = function(){};
VideoJS.Player.prototype.playbackRate = function(){};
VideoJS.Player.prototype.played = function(){};
VideoJS.Player.prototype.seekable = function(){};
VideoJS.Player.prototype.ended = function(){};
VideoJS.Player.prototype.autoplay = function(){};
VideoJS.Player.prototype.loop = function(){};
VideoJS.Player.prototype.play = function() {};
VideoJS.Player.prototype.pause = function() {};
VideoJS.Player.prototype.controls = function(){};
VideoJS.Player.prototype.volume = function(){};
VideoJS.Player.prototype.muted = function(){};
VideoJS.Player.prototype.width = function(){};
VideoJS.Player.prototype.height = function(){};
VideoJS.Player.prototype.videoWidth = function(){};
VideoJS.Player.prototype.videoHeight = function(){};
VideoJS.Player.prototype.poster = function(){};

/**
 * Fullscreen functionality
 */
VideoJS.Player.prototype.isFullscreen = function(){};
VideoJS.Player.prototype.isFullScreen = function(){}; /* deprecated */
VideoJS.Player.prototype.requestFullscreen = function(){};
VideoJS.Player.prototype.requestFullScreen = function(){}; /* deprecated */
VideoJS.Player.prototype.exitFullscreen = function(){};
VideoJS.Player.prototype.cancelFullScreen = function(){}; /* deprecated */

/**
 * Text tracks
 */
VideoJS.Player.prototype.textTracks = function(){};
VideoJS.Player.prototype.addTextTrack = function(){};

/**
 * Language support
 */
VideoJS.Player.prototype.language = function(){};
VideoJS.Player.prototype.languages = function(){};

/**
 * Component functions
 */
VideoJS.Player.prototype.dispose = function(){};

/**
 * Buffered percent
 */
VideoJS.Player.prototype.bufferedPercent = function(){};

/**
 * User activity functions
 */
VideoJS.Player.prototype.reportUserActivity = function(){};
VideoJS.Player.prototype.userActive = function(){};

/**
 * Native controls
 */
VideoJS.Player.prototype.usingNativeControls = function(){};

/**
 * Source selection
 */
VideoJS.Player.prototype.selectSource = function(){};
