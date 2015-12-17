/**
 * @fileoverview Exports for Video.js.
 * Exports are publicly available variables.
 * All other variables (including function names) will probably
 * be renamed by closure compiler.
 */

/**
 * vjs (internal only) = videojs = _V_ (external only)
 *
 * vjs is the same as the goog var in Closure Library. It holds all variables
 * used in Video.js development. Closure compiler will rename all variables,
 * including class prototype functions, except those specifically
 * exported (eports.js). Don't assume any function you can use in Video.js
 * development will be available on window.videojs for use with other js.
 *
 * For example, vjs.trim is an internal function and will be renamed by compiler
 * to something like 'a.b', or actually more likely 'a' removing it from
 * a parent object.
 *
 * videojs is a var that helps bridge between internal and external development.
 * Avoid using it over vjs when developing the Video.js core.
 *
 * _V_ is only external. It's just cute and short(er). Like jQuery === $.
 * Also because it's nice having a different var for internal (vjs) vs.
 * external (_V_) because it makes it clearer what context we're in.
 */
goog.exportSymbol('videojs', vjs_original);
goog.exportSymbol('_V_', vjs_original);

goog.exportSymbol('videojs.options', vjs_original.options);
goog.exportSymbol('videojs.players', vjs_original.players);
goog.exportSymbol('videojs.TOUCH_ENABLED', vjs_original.TOUCH_ENABLED);

// Allow external components to use global cache
goog.exportSymbol('videojs.cache', vjs_original.cache);

// goog.exportSymbol('videojs.CoreObject', vjs.CoreObject);
// goog.exportProperty(vjs.CoreObject, 'create', vjs.CoreObject.create);

goog.exportSymbol('videojs.Component', vjs_original.Component);
// already in default externs: id, name
goog.exportProperty(vjs_original.Component.prototype, 'player', vjs_original.Component.prototype.player);
goog.exportProperty(vjs_original.Component.prototype, 'options', vjs_original.Component.prototype.options);
goog.exportProperty(vjs_original.Component.prototype, 'init', vjs_original.Component.prototype.init);
goog.exportProperty(vjs_original.Component.prototype, 'dispose', vjs_original.Component.prototype.dispose);
goog.exportProperty(vjs_original.Component.prototype, 'createEl', vjs_original.Component.prototype.createEl);
goog.exportProperty(vjs_original.Component.prototype, 'contentEl', vjs_original.Component.prototype.contentEl);
goog.exportProperty(vjs_original.Component.prototype, 'el', vjs_original.Component.prototype.el);
goog.exportProperty(vjs_original.Component.prototype, 'addChild', vjs_original.Component.prototype.addChild);
goog.exportProperty(vjs_original.Component.prototype, 'getChild', vjs_original.Component.prototype.getChild);
goog.exportProperty(vjs_original.Component.prototype, 'getChildById', vjs_original.Component.prototype.getChildById);
goog.exportProperty(vjs_original.Component.prototype, 'children', vjs_original.Component.prototype.children);
goog.exportProperty(vjs_original.Component.prototype, 'initChildren', vjs_original.Component.prototype.initChildren);
goog.exportProperty(vjs_original.Component.prototype, 'removeChild', vjs_original.Component.prototype.removeChild);
goog.exportProperty(vjs_original.Component.prototype, 'on', vjs_original.Component.prototype.on);
goog.exportProperty(vjs_original.Component.prototype, 'off', vjs_original.Component.prototype.off);
goog.exportProperty(vjs_original.Component.prototype, 'one', vjs_original.Component.prototype.one);
goog.exportProperty(vjs_original.Component.prototype, 'trigger', vjs_original.Component.prototype.trigger);
goog.exportProperty(vjs_original.Component.prototype, 'triggerReady', vjs_original.Component.prototype.triggerReady);
goog.exportProperty(vjs_original.Component.prototype, 'show', vjs_original.Component.prototype.show);
goog.exportProperty(vjs_original.Component.prototype, 'hide', vjs_original.Component.prototype.hide);
goog.exportProperty(vjs_original.Component.prototype, 'width', vjs_original.Component.prototype.width);
goog.exportProperty(vjs_original.Component.prototype, 'height', vjs_original.Component.prototype.height);
goog.exportProperty(vjs_original.Component.prototype, 'dimensions', vjs_original.Component.prototype.dimensions);
goog.exportProperty(vjs_original.Component.prototype, 'ready', vjs_original.Component.prototype.ready);
goog.exportProperty(vjs_original.Component.prototype, 'addClass', vjs_original.Component.prototype.addClass);
goog.exportProperty(vjs_original.Component.prototype, 'removeClass', vjs_original.Component.prototype.removeClass);
goog.exportProperty(vjs_original.Component.prototype, 'hasClass', vjs_original.Component.prototype.hasClass);
goog.exportProperty(vjs_original.Component.prototype, 'buildCSSClass', vjs_original.Component.prototype.buildCSSClass);
goog.exportProperty(vjs_original.Component.prototype, 'localize', vjs_original.Component.prototype.localize);
goog.exportProperty(vjs_original.Component.prototype, 'setInterval', vjs_original.Component.prototype.setInterval);
goog.exportProperty(vjs_original.Component.prototype, 'setTimeout', vjs_original.Component.prototype.setTimeout);

goog.exportSymbol('videojs.EventEmitter', vjs_original.EventEmitter);
goog.exportProperty(vjs_original.EventEmitter.prototype, 'on', vjs_original.EventEmitter.prototype.on);
goog.exportProperty(vjs_original.EventEmitter.prototype, 'addEventListener', vjs_original.EventEmitter.prototype.addEventListener);
goog.exportProperty(vjs_original.EventEmitter.prototype, 'off', vjs_original.EventEmitter.prototype.off);
goog.exportProperty(vjs_original.EventEmitter.prototype, 'removeEventListener', vjs_original.EventEmitter.prototype.removeEventListener);
goog.exportProperty(vjs_original.EventEmitter.prototype, 'one', vjs_original.EventEmitter.prototype.one);
goog.exportProperty(vjs_original.EventEmitter.prototype, 'trigger', vjs_original.EventEmitter.prototype.trigger);
goog.exportProperty(vjs_original.EventEmitter.prototype, 'dispatchEvent', vjs_original.EventEmitter.prototype.dispatchEvent);


// Need to export ended to ensure it's not removed by CC, since it's not used internally
goog.exportProperty(vjs_original.Player.prototype, 'ended', vjs_original.Player.prototype.ended);
goog.exportProperty(vjs_original.Player.prototype, 'enterFullWindow', vjs_original.Player.prototype.enterFullWindow);
goog.exportProperty(vjs_original.Player.prototype, 'exitFullWindow', vjs_original.Player.prototype.exitFullWindow);
goog.exportProperty(vjs_original.Player.prototype, 'preload', vjs_original.Player.prototype.preload);
goog.exportProperty(vjs_original.Player.prototype, 'remainingTime', vjs_original.Player.prototype.remainingTime);
goog.exportProperty(vjs_original.Player.prototype, 'supportsFullScreen', vjs_original.Player.prototype.supportsFullScreen);
goog.exportProperty(vjs_original.Player.prototype, 'currentType', vjs_original.Player.prototype.currentType);
goog.exportProperty(vjs_original.Player.prototype, 'requestFullScreen', vjs_original.Player.prototype.requestFullScreen);
goog.exportProperty(vjs_original.Player.prototype, 'requestFullscreen', vjs_original.Player.prototype.requestFullscreen);
goog.exportProperty(vjs_original.Player.prototype, 'cancelFullScreen', vjs_original.Player.prototype.cancelFullScreen);
goog.exportProperty(vjs_original.Player.prototype, 'exitFullscreen', vjs_original.Player.prototype.exitFullscreen);
goog.exportProperty(vjs_original.Player.prototype, 'isFullScreen', vjs_original.Player.prototype.isFullScreen);
goog.exportProperty(vjs_original.Player.prototype, 'isFullscreen', vjs_original.Player.prototype.isFullscreen);
goog.exportProperty(vjs_original.Player.prototype, 'textTracks', vjs_original.Player.prototype.textTracks);
goog.exportProperty(vjs_original.Player.prototype, 'remoteTextTracks', vjs_original.Player.prototype.remoteTextTracks);
goog.exportProperty(vjs_original.Player.prototype, 'addTextTrack', vjs_original.Player.prototype.addTextTrack);
goog.exportProperty(vjs_original.Player.prototype, 'addRemoteTextTrack', vjs_original.Player.prototype.addRemoteTextTrack);
goog.exportProperty(vjs_original.Player.prototype, 'removeRemoteTextTrack', vjs_original.Player.prototype.removeRemoteTextTrack);

goog.exportSymbol('videojs.MediaLoader', vjs_original.MediaLoader);
goog.exportSymbol('videojs.TextTrackDisplay', vjs_original.TextTrackDisplay);

goog.exportSymbol('videojs.ControlBar', vjs_original.ControlBar);
goog.exportSymbol('videojs.Button', vjs_original.Button);
goog.exportSymbol('videojs.PlayToggle', vjs_original.PlayToggle);
goog.exportSymbol('videojs.FullscreenToggle', vjs_original.FullscreenToggle);
goog.exportSymbol('videojs.BigPlayButton', vjs_original.BigPlayButton);
goog.exportSymbol('videojs.LoadingSpinner', vjs_original.LoadingSpinner);
goog.exportSymbol('videojs.CurrentTimeDisplay', vjs_original.CurrentTimeDisplay);
goog.exportSymbol('videojs.DurationDisplay', vjs_original.DurationDisplay);
goog.exportSymbol('videojs.TimeDivider', vjs_original.TimeDivider);
goog.exportSymbol('videojs.RemainingTimeDisplay', vjs_original.RemainingTimeDisplay);
goog.exportSymbol('videojs.LiveDisplay', vjs_original.LiveDisplay);
goog.exportSymbol('videojs.ErrorDisplay', vjs_original.ErrorDisplay);
goog.exportSymbol('videojs.Slider', vjs_original.Slider);
goog.exportSymbol('videojs.ProgressControl', vjs_original.ProgressControl);
goog.exportSymbol('videojs.SeekBar', vjs_original.SeekBar);
goog.exportSymbol('videojs.LoadProgressBar', vjs_original.LoadProgressBar);
goog.exportSymbol('videojs.PlayProgressBar', vjs_original.PlayProgressBar);
goog.exportSymbol('videojs.SeekHandle', vjs_original.SeekHandle);
goog.exportSymbol('videojs.VolumeControl', vjs_original.VolumeControl);
goog.exportSymbol('videojs.VolumeBar', vjs_original.VolumeBar);
goog.exportSymbol('videojs.VolumeLevel', vjs_original.VolumeLevel);
goog.exportSymbol('videojs.VolumeMenuButton', vjs_original.VolumeMenuButton);
goog.exportSymbol('videojs.VolumeHandle', vjs_original.VolumeHandle);
goog.exportSymbol('videojs.MuteToggle', vjs_original.MuteToggle);
goog.exportSymbol('videojs.PosterImage', vjs_original.PosterImage);
goog.exportSymbol('videojs.Menu', vjs_original.Menu);
goog.exportSymbol('videojs.MenuItem', vjs_original.MenuItem);
goog.exportSymbol('videojs.MenuButton', vjs_original.MenuButton);
goog.exportSymbol('videojs.PlaybackRateMenuButton', vjs_original.PlaybackRateMenuButton);
goog.exportSymbol('videojs.ChaptersTrackMenuItem', vjs_original.ChaptersTrackMenuItem);
goog.exportSymbol('videojs.TextTrackButton', vjs_original.TextTrackButton);
goog.exportSymbol('videojs.TextTrackMenuItem', vjs_original.TextTrackMenuItem);
goog.exportSymbol('videojs.OffTextTrackMenuItem', vjs_original.OffTextTrackMenuItem);
goog.exportSymbol('videojs.CaptionSettingsMenuItem', vjs_original.CaptionSettingsMenuItem);

goog.exportProperty(vjs_original.MenuButton.prototype, 'createItems', vjs_original.MenuButton.prototype.createItems);
goog.exportProperty(vjs_original.TextTrackButton.prototype, 'createItems', vjs_original.TextTrackButton.prototype.createItems);
goog.exportProperty(vjs_original.ChaptersButton.prototype, 'createItems', vjs_original.ChaptersButton.prototype.createItems);

goog.exportSymbol('videojs.SubtitlesButton', vjs_original.SubtitlesButton);
goog.exportSymbol('videojs.CaptionsButton', vjs_original.CaptionsButton);
goog.exportSymbol('videojs.ChaptersButton', vjs_original.ChaptersButton);

goog.exportSymbol('videojs.MediaTechController', vjs_original.MediaTechController);
goog.exportProperty(vjs_original.MediaTechController, 'withSourceHandlers', vjs_original.MediaTechController.withSourceHandlers);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'featuresVolumeControl', vjs_original.MediaTechController.prototype.featuresVolumeControl);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'featuresFullscreenResize', vjs_original.MediaTechController.prototype.featuresFullscreenResize);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'featuresPlaybackRate', vjs_original.MediaTechController.prototype.featuresPlaybackRate);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'featuresProgressEvents', vjs_original.MediaTechController.prototype.featuresProgressEvents);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'featuresTimeupdateEvents', vjs_original.MediaTechController.prototype.featuresTimeupdateEvents);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'setPoster', vjs_original.MediaTechController.prototype.setPoster);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'textTracks', vjs_original.MediaTechController.prototype.textTracks);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'remoteTextTracks', vjs_original.MediaTechController.prototype.remoteTextTracks);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'addTextTrack', vjs_original.MediaTechController.prototype.addTextTrack);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'addRemoteTextTrack', vjs_original.MediaTechController.prototype.addRemoteTextTrack);
goog.exportProperty(vjs_original.MediaTechController.prototype, 'removeRemoteTextTrack', vjs_original.MediaTechController.prototype.removeRemoteTextTrack);

goog.exportSymbol('videojs.Html5', vjs_original.Html5);
goog.exportProperty(vjs_original.Html5, 'Events', vjs_original.Html5.Events);
goog.exportProperty(vjs_original.Html5, 'isSupported', vjs_original.Html5.isSupported);
goog.exportProperty(vjs_original.Html5, 'canPlaySource', vjs_original.Html5.canPlaySource);
goog.exportProperty(vjs_original.Html5, 'patchCanPlayType', vjs_original.Html5.patchCanPlayType);
goog.exportProperty(vjs_original.Html5, 'unpatchCanPlayType', vjs_original.Html5.unpatchCanPlayType);

// Export non-standard HTML5 video API methods.
// Standard method names already protected by default externs.
goog.exportProperty(vjs_original.Html5.prototype, 'setCurrentTime', vjs_original.Html5.prototype.setCurrentTime);
goog.exportProperty(vjs_original.Html5.prototype, 'setVolume', vjs_original.Html5.prototype.setVolume);
goog.exportProperty(vjs_original.Html5.prototype, 'setMuted', vjs_original.Html5.prototype.setMuted);
goog.exportProperty(vjs_original.Html5.prototype, 'setPreload', vjs_original.Html5.prototype.setPreload);
goog.exportProperty(vjs_original.Html5.prototype, 'setAutoplay', vjs_original.Html5.prototype.setAutoplay);
goog.exportProperty(vjs_original.Html5.prototype, 'setLoop', vjs_original.Html5.prototype.setLoop);
goog.exportProperty(vjs_original.Html5.prototype, 'enterFullScreen', vjs_original.Html5.prototype.enterFullScreen);
goog.exportProperty(vjs_original.Html5.prototype, 'exitFullScreen', vjs_original.Html5.prototype.exitFullScreen);
goog.exportProperty(vjs_original.Html5.prototype, 'playbackRate', vjs_original.Html5.prototype.playbackRate);
goog.exportProperty(vjs_original.Html5.prototype, 'setPlaybackRate', vjs_original.Html5.prototype.setPlaybackRate);
// Source Handler Functions
goog.exportProperty(vjs_original.Html5, 'registerSourceHandler', vjs_original.Html5.registerSourceHandler);
goog.exportProperty(vjs_original.Html5, 'selectSourceHandler', vjs_original.Html5.selectSourceHandler);
goog.exportProperty(vjs_original.Html5.prototype, 'setSource', vjs_original.Html5.prototype.setSource);
goog.exportProperty(vjs_original.Html5.prototype, 'disposeSourceHandler', vjs_original.Html5.prototype.disposeSourceHandler);
goog.exportProperty(vjs_original.Html5.prototype, 'textTracks', vjs_original.Html5.prototype.textTracks);
goog.exportProperty(vjs_original.Html5.prototype, 'remoteTextTracks', vjs_original.Html5.prototype.remoteTextTracks);
goog.exportProperty(vjs_original.Html5.prototype, 'addTextTrack', vjs_original.Html5.prototype.addTextTrack);
goog.exportProperty(vjs_original.Html5.prototype, 'addRemoteTextTrack', vjs_original.Html5.prototype.addRemoteTextTrack);
goog.exportProperty(vjs_original.Html5.prototype, 'removeRemoteTextTrack', vjs_original.Html5.prototype.removeRemoteTextTrack);

goog.exportSymbol('videojs.Flash', vjs_original.Flash);
goog.exportProperty(vjs_original.Flash, 'isSupported', vjs_original.Flash.isSupported);
goog.exportProperty(vjs_original.Flash, 'canPlaySource', vjs_original.Flash.canPlaySource);
goog.exportProperty(vjs_original.Flash, 'onReady', vjs_original.Flash['onReady']);
goog.exportProperty(vjs_original.Flash, 'embed', vjs_original.Flash.embed);
goog.exportProperty(vjs_original.Flash, 'version', vjs_original.Flash.version);
goog.exportProperty(vjs_original.Flash.prototype, 'setSource', vjs_original.Flash.prototype.setSource);
// Source Handler Functions
goog.exportProperty(vjs_original.Flash, 'registerSourceHandler', vjs_original.Flash.registerSourceHandler);
goog.exportProperty(vjs_original.Flash, 'selectSourceHandler', vjs_original.Flash.selectSourceHandler);
goog.exportProperty(vjs_original.Flash.prototype, 'setSource', vjs_original.Flash.prototype.setSource);
goog.exportProperty(vjs_original.Flash.prototype, 'disposeSourceHandler', vjs_original.Flash.prototype.disposeSourceHandler);

goog.exportSymbol('videojs.TextTrack', vjs_original.TextTrack);
goog.exportSymbol('videojs.TextTrackList', vjs_original.TextTrackList);
goog.exportSymbol('videojs.TextTrackCueList', vjs_original.TextTrackCueList);
goog.exportSymbol('videojs.TextTrackSettings', vjs_original.TextTrackSettings);
goog.exportProperty(vjs_original.TextTrack.prototype, 'id', vjs_original.TextTrack.prototype.id);
goog.exportProperty(vjs_original.TextTrack.prototype, 'label', vjs_original.TextTrack.prototype.label);
goog.exportProperty(vjs_original.TextTrack.prototype, 'kind', vjs_original.TextTrack.prototype.kind);
goog.exportProperty(vjs_original.TextTrack.prototype, 'mode', vjs_original.TextTrack.prototype.mode);
goog.exportProperty(vjs_original.TextTrack.prototype, 'cues', vjs_original.TextTrack.prototype.cues);
goog.exportProperty(vjs_original.TextTrack.prototype, 'activeCues', vjs_original.TextTrack.prototype.activeCues);
goog.exportProperty(vjs_original.TextTrack.prototype, 'addCue', vjs_original.TextTrack.prototype.addCue);
goog.exportProperty(vjs_original.TextTrack.prototype, 'removeCue', vjs_original.TextTrack.prototype.removeCue);
goog.exportProperty(vjs_original.TextTrackList.prototype, 'getTrackById', vjs_original.TextTrackList.prototype.getTrackById);
goog.exportProperty(vjs_original.TextTrackCueList.prototype, 'getCueById', vjs_original.TextTrackList.prototype.getCueById);

goog.exportSymbol('videojs.CaptionsTrack', vjs_original.CaptionsTrack);
goog.exportSymbol('videojs.SubtitlesTrack', vjs_original.SubtitlesTrack);
goog.exportSymbol('videojs.ChaptersTrack', vjs_original.ChaptersTrack);

goog.exportSymbol('videojs.autoSetup', vjs_original.autoSetup);

goog.exportSymbol('videojs.plugin', vjs_original.plugin);

goog.exportSymbol('videojs.createTimeRange', vjs_original.createTimeRange);

goog.exportSymbol('videojs.util', vjs_original.util);
goog.exportProperty(vjs_original.util, 'mergeOptions', vjs_original.util.mergeOptions);
goog.exportProperty(vjs_original, 'addLanguage', vjs_original.addLanguage);
