'use strict';

/**
 * Created by cody on 6/8/15.
 */

/**
 * @param player
 * @param {TabeebGalleryService} galleryService
 * @param {TabeebUserManager} userMgr
 * @param {jQuery} $audioService
 * @param {jQuery} $videoService
 * @constructor
 */
function TabeebPresenterManager (player, galleryService, userMgr, $audioService, $videoService) {

	//<editor-fold name="Variables">

	var self = this;

	var $player = $(player);
	/**@type {TabeebAudioService}*/
	var audioService = $audioService[0];
	/**@type {TabeebVideoService}*/
	var videoService = $videoService[0];
	/**@type {TabeebCanvasService}*/
	var canvasService = player.canvasService;
	/**@type {TabeebPresenterMode}*/
	var presenterMode = TabeebPresenterMode.None;

	var presenterId = "";

	var hotspotManager = canvasService.hotspotManager;

	/**@type {TabeebAnnotationManager}*/
	var annotationMgr = player.annotationMgr;

	/**@type {TabeebCanvasHotspotManager}*/
	// Used to keep track of binded events
	var events = [];
	var that = this;

	/**@type {TabeebConnect}*/
	var connectService;

	this.mutedAudioUserIds = [];

	//</editor-fold>

	function resetVideoAndAudio () {
		videoService.setCurrentTime(0);
		videoService.pause();
	}

	//<editor-fold name="Jitsi Meet Integration">

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getVideoElementByUserId (userId) {
		var $video = null;

		if (userId == presenterId)
		{
			if (getLargeVideoContainer().is(":visible")) {
				console.log("Returning large video");
				return getLargeVideoContainer().find("video, object");
			}
			$video = player.$pluginContainer.find(".tabeebPresenterUserContainer").find("video, object");
		}
		else
			$video = getVideoElementContainerByUserId(userId).find("video");

		console.log("Finding video", userId, $video);

		return $video;
	}

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getVideoElementContainerByUserId (userId) {
		if (userId == presenterId)
		{
			var $largeVideoContainer = getLargeVideoContainer();
			if ($largeVideoContainer.is(":visible"))
				return $largeVideoContainer;

			return player.$pluginContainer.find(".tabeebPresenterUserContainer");
		}

		return player.$pluginContainer.find(".tabeebUserContainer[data-id='" + userId + "']")
	}

	this.reattachVideos = function () {
		if (connectService)
		{
			setTimeout(function() {
				connectService.reattachVideos();
			}, 5000);
		}
	};

	this.reattachVideo = function (userId) {
		if (connectService)
		{
			setTimeout(function() {
				connectService.reattachVideoForUser(userId);
			}, 1000);
		}
	};

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getAudioElementByUserId (userId) {
		var currentUser = userMgr.getThisUser();
		if (userId == currentUser.id)
		{
			console.log("No audio for self");
			return $("");
		}
		return player.$pluginContainer.find(".tabeebUserContainer[data-id='" + userId + "']").find("audio");
	}

	function getLargeVideoContainer () {
		return player.$pluginContainer.find(".tabeebLargeVideoContainer");
	}

	function onVideoStreamSwitched () {
		console.error("Video stream switched", arguments);
	}

	function setLargeVideoVisible (flag) {
		console.log("Setting Large Video", flag);
		var isCurrentVisible = getLargeVideoContainer().is(":visible");

		if (isCurrentVisible && flag === true)
		{
			return;
		}
		if (isCurrentVisible === false && flag === false)
		{
			return;
		}

		var isThisUserPresenter = (userMgr.getThisUser().id == presenterId);
		var $largeVideoContainer = player.$pluginContainer.find(".tabeebLargeVideoContainer");
		var $mediaContainer = player.$pluginContainer.find(".tabeebMediaContainer");
		if (flag) {
			$mediaContainer.hide();
			$largeVideoContainer.show();
		}
		else
		{
			$mediaContainer.show();
			$largeVideoContainer.hide();
		}

		if (connectService)
			connectService.reattachVideos();

		if (isThisUserPresenter)
		{
			$player.trigger($.Event(TabeebSpectatorEvent.largeVideoToggled, {active: flag}));
			$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { isScreenSharing: flag } }));
		}

		$(that).trigger($.Event(TabeebPresenterManager.Events.largeVideoToggled, {active: flag}));
	}

	this.setUserMuted = function (userId, isMuted) {
		connectService.setUserMute(userId, isMuted);
		if (isMuted && this.mutedAudioUserIds.indexOf(userId) < 0)
			this.mutedAudioUserIds.push(userId);
		else if (this.mutedAudioUserIds.indexOf(userId) >= 0)
			this.mutedAudioUserIds.splice(this.mutedAudioUserIds.indexOf(userId), 1);
		$player.trigger($.Event(TabeebSpectatorEvent.userAudioMutedChanged, {userId: userId, isMuted: isMuted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedAudioUserIds: this.mutedAudioUserIds } }));
	};

	this.toggleThisUsersAudio = function () {
		connectService.toggleAudio();
	};

	this.toggleThisUsersVideo = function () {
		connectService.toggleVideo();
	};

	this.getPresenterId = function () {
		return presenterId;
	};

	this.isVideoMuted = function (userId) {
		if (!userId) {
			userId = userMgr.getThisUser().id;
		}

		return connectService ? connectService.isVideoMuted(userId) : true;
	};

	this.isAudioMuted = function (userId) {
		if (!userId) {
			userId = userMgr.getThisUser().id;
		}

		return connectService ? connectService.isAudioMuted(userId) : true;
	};

	function onVideoMuted (userId, isMuted) {
		if (userId == presenterId && player.$pluginContainer.find(".tabeebLargeVideoContainer").is(":visible"))
		{
			isMuted = true;
		}

		var user = userMgr.find(userId);
		console.log("Setting " + user.displayName + "'s video to " + !isMuted);

		$(that).trigger($.Event(TabeebPresenterManager.Events.participantVideoMuteChange, {userId: userId, videoOn: !isMuted}));
	}

	function onAudioMuted (userId, isMuted) {
		$(that).trigger($.Event(TabeebPresenterManager.Events.participantAudioMuteChange, {userId: userId, audioOn: !isMuted}));
	}

	function onUserJoined (userId) {
		console.log("User joined", userId);
	}

	this.setUserOnlineStatus = setUserOnlineStatus;

	function setUserOnlineStatus (userId, isConnected) {
		if (that.mutedAudioUserIds.indexOf(userId) >= 0)
		{
			that.mutedAudioUserIds.splice(that.mutedAudioUserIds.indexOf(userId), 1);
			$(that).trigger($.Event(TabeebPresenterManager.Events.userAudioMutedChanged, {userId: userId, isMuted: false}));
		}

		console.info("Setting online status", userId, isConnected);
		$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		that.reattachVideos();
		//if (!isConnected)
		//{
		//	//var $container = getVideoElementContainerByUserId(userId);
		//	$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		//}
		//else
		//{
		//	$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		//}
	}

	function onAudioLevelChange (userId, audioLevel) {
		var isLocal = userId === "local";
		if (isLocal)
			userId = userMgr.getThisUser().id;

		var user = userMgr.find(userId);

		if (isLocal && connectService.isAudioMuted())
			audioLevel = 0;

		if ((audioLevel <= 0.005 && !isLocal) || (audioLevel <= 0.008 && isLocal)) {
			$(self).trigger($.Event(TabeebPresenterManager.Events.participantEndedSpeaking, {userId: user.id}));
		}
		else
		{
			$(self).trigger($.Event(TabeebPresenterManager.Events.participantStartedSpeaking, {userId: user.id}));
		}
	}

	function onUserLeft (userId) {
		setUserOnlineStatus(userId, false);
		console.log("User left", userId);
	}

	this.setAudioMuted = function (isMuted) {
		if (!isMuted) {
			isMuted = !connectService.isAudioMuted();
		}

		if (isMuted)
			connectService.muteAudio();
		else
			connectService.unmuteAudio();
	};

	this.toggleScreenShare = function () {
		connectService.shareScreen();
	};

	this.setVideoMuted = function (isMuted) {
		if (!isMuted) {
			isMuted = !connectService.isVideoMuted();
		}

		if (isMuted)
			connectService.muteVideo();
		else
			connectService.unmuteVideo();
	};

	this.setPresenter = function (presId) {
		setLargeVideoVisible(false);
		if (connectService && connectService.isScreenSharing())
			connectService.shareScreen();

		var oldPresenterId = presenterId;

		presenterId = presId;
		$(that).trigger($.Event(TabeebPresenterManager.Events.presenterChanged, {presenterId: presenterId, presenterVideoOn: connectService ? connectService.isVideoMuted(presId) : false }));

		if (presenterId == userMgr.getThisUser().id) {
			console.info("You are now the presenter.");
			this.setPresenterMode(true);
		}
		else
		{
			console.info("You are now a spectator");
			this.setSpectatorMode(true);
		}

		if (connectService && presId && presId.length > 0)
		{
			if (oldPresenterId && oldPresenterId.length > 0)
			{
			}
			//
			//connectService.reattachVideoForUser(presenterId);
		}

		if (connectService)
			connectService.reattachVideos();
	};

	this.changePresenter = function (userId) {
		player.$element.trigger($.Event(TabeebEvent.requestPresenterChange, {userId: userId}));
	};

	this.connect = function (presId) {

		console.log("Setting presenter id", presId, userMgr.getThisUser().id);

		if (userMgr.getThisUser().id == presenterId)
			this.setPresentationMode(TabeebPresenterMode.Presenter);
		else
			this.setPresentationMode(TabeebPresenterMode.Spectator);

		this.setPresenter(presId);
		var connectOptions = {
			boshUrl: 'https://webrtcdev.collaborate.center/http-bind',
			chromeExtensionId: 'adegdgcakdkmpacfffmjbjhagnkoncpj',
			domain: 'webrtcdev.collaborate.center',
			getVideoElementForUser: getVideoElementByUserId,
			getVideoElementContainerForUser: getVideoElementContainerByUserId,
			getAudioElementForUser: getAudioElementByUserId,
			userId: userMgr.getThisUser().id,
			conferenceId: player.contentName,
			onStreamAttached: function(stream, $element) {
				var user = userMgr.find(stream.userId);


				var container = player.$pluginContainer.find(".tabeebSidebarTab");
				var obj = container.find("object");
				obj.each(function (index, element) {
					this.width = 480;
					this.height = 480 * (9/16);
					//$(element).css('min-height', $(this).width()*3/4);
				});

				var $userContainer = getVideoElementContainerByUserId(stream.userId);

				var videoIsOn = !connectService.isVideoMuted(stream.userId);
				console.log("Stream Attached For", user.displayName, videoIsOn);

				$(that).trigger($.Event(TabeebPresenterManager.Events.participantVideoMuteChange, {userId: stream.userId, videoOn: videoIsOn}));

				$userContainer.addClass("video").addClass("audio");

				if (videoIsOn === false)
				{
					$userContainer.removeClass("video");
				}

				if ($userContainer.hasClass("offline"))
					setUserOnlineStatus(stream.userId, true);
			},
			onReady: function () {
			},
			onVideoStreamSwitched: onVideoStreamSwitched,
			setLargeVideoVisible: setLargeVideoVisible,
			getLargeVideoContainer: getLargeVideoContainer,
			isPresenter: function (userId) { return presenterId == userId; },
			onVideoMuted: onVideoMuted,
			onAudioMuted: onAudioMuted,
			onUserJoined: onUserJoined,
			onUserLeft: onUserLeft,
			onAudioLevelChange: onAudioLevelChange
		};

		if (TabeebConnect.clientCanConnect())
		{
			connectService = new TabeebConnect(connectOptions);
			connectService.connect();
		}
		else
		{
		}
	};

	this.disconnect = function () {
		if (connectService)
		{
			connectService.disconnect();
		}

		this.setPresentationMode(TabeebPresenterMode.None);
	};

	//</editor-fold>

	// <editor-fold desc="Presenter">
	/**
	 * @param isNewPresenter
	 * @returns {TabeebPresenterState}
	 */
	this.getPresenterState = function (isNewPresenter) {
		var state = {
			audioName: audioService.getCurrentAudio() ? audioService.getCurrentAudio().annotationId : null,
			audioPaused: audioService.getCurrentAudio() ? audioService.getCurrentAudio().paused : null,
			currentTime: canvasService.inVideoMode() ? videoService.getCurrentPlaybackTime() : audioService.getCurrentTime(),
			videoPaused: canvasService.inVideoMode() ? !videoService.isPlaying() : null,
			mutedUserIds: canvasService.getMutedUserIds(),
			slideIndex: player.currentSlideIndex,
			isScreenSharing: connectService ? connectService.isScreenSharing() : false,
			hotspotDialogAnnotationId: hotspotManager.getCurrentHotspot() ? hotspotManager.getCurrentHotspot().id : null,
			mutedAudioUserIds: this.mutedAudioUserIds
		};

		/*
		 Due to VideoJS timing issues, we have to tell if the presenter is being changed. That way we can set the video paused to true since there is a delay in telling VideoJS to pause
		 Ex:
		 videoPlayer.pause();
		 videoPlayer.paused(); // returns false
		 */
		if (isNewPresenter)
			state.videoPaused = true;

		return state;
	};

	this.setPresentationMode = function (mode) {
		if (mode == presenterMode)
			return;

		if (mode == TabeebPresenterMode.None) {
			if (presenterMode == TabeebPresenterMode.Presenter)
				that.setPresenterMode(false);
			else if (presenterMode == TabeebPresenterMode.Spectator)
				that.setSpectatorMode(false);

			$(that).trigger($.Event(TabeebPresenterManager.Events.presentationEnded, {}));
		}
		else if (mode == TabeebPresenterMode.Spectator)
		{
			if (presenterMode == TabeebPresenterMode.Presenter)
				that.setPresenterMode(false);
			else if (presenterMode == TabeebPresenterMode.Spectator)
				that.setSpectatorMode(false);

			that.setSpectatorMode(true);
		}
		else if (mode == TabeebPresenterMode.Presenter)
		{
			that.setPresenterMode(true);
		}

		if (presenterMode == TabeebPresenterMode.None && mode != TabeebPresenterMode.None)
		{
			$(that).trigger($.Event(TabeebPresenterManager.Events.presentationStarted, {isPresenter: mode == TabeebPresenterMode.Presenter}));
		}

		presenterMode = mode;
		$(that).trigger($.Event(TabeebPresenterManager.Events.presenterModeChanged, { presenterMode: mode }));
		player.handleResize();
	};

	this.currentlyInPresentation = function () {
		return presenterMode != TabeebPresenterMode.None;
	};

	this.getPresentationMode = function () {
		return presenterMode;
	};

	this.isCurrentUserPresenter = function () {
		return presenterId == userMgr.getThisUser().id;
	};

	this.setPresenterMode = function (flag) {
		unbindSpectatorEvents();
		resetVideoAndAudio();
		if (flag)
		{
			bindPresenterEvents();
			player.hudService.setScreenMode(player.options.defaultScreenModeType);
			galleryService.setDisabled(false);
			player.$element.addClass("presenting");
			player.$element.removeClass("spectating");
		}
		else
		{
			unbindPresenterEvents();
			player.$element.removeClass("presenting");
		}

		this.isPresenter = flag;
	};

	// Presenter events

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioSeeked (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioSeeked, {currentTime: event.currentTime}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { currentTime: event.currentTime } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterVolumeChanged (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.volumeChanged, {volume: event.volume}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { volume: event.volume } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterHotspotDialogOpened (event) {
		var hotspotAnnotation = event.hotspotAnnotation;
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogOpened, {annotationId: hotspotAnnotation.id}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { hotspotDialogAnnotationId: hotspotAnnotation.id } }));
	}

	function onPresenterHotspotDialogClosed () {
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogClosed, {}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { hotspotDialogAnnotationId: "" } }));
	}

	function onPresenterHotspotCommentClicked (event) {
		var annotationId = event.annotationId;
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogCommentClicked, {annotationId: annotationId}));
	}

	function onPresenterLaserPointerMoved (event) {
		console.log(event.x, event.y);
		$player.trigger($.Event(TabeebSpectatorEvent.laserPointerMoved, {
			x: event.x,
			y: event.y
		}));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterHotspotAudioEvent (event) {
		var audioEvent = event.audioEvent;
		var audioAnnotation = event.audioAnnotation;

		$player.trigger($.Event(TabeebSpectatorEvent.hotspotAudioEvent, {
			audioEvent: audioEvent,
			annotationId: audioAnnotation.id,
			currentTime: event.currentTime,
			volume: event.volume,
			muted: event.muted
		}));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterParticipantUpdated (event) {
		console.info("Participant Updated Event", event);
		if (event.isPropagationStopped())
			return;

		var participantId = event.id;
		var muted = event.muted;
		$player.trigger($.Event(TabeebSpectatorEvent.muteChanged, {id: participantId, muted: muted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedUserIds: canvasService.getMutedUserIds() } }));
		event.stopPropagation();
	}

	function onPresenterUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var isMuted = event.isMuted;
		$player.trigger($.Event(TabeebSpectatorEvent.muteChanged, {id: user.id, muted: isMuted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedUserIds: canvasService.getMutedUserIds() } }));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioStarted (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioStart, {
			audioName: event.audio.annotationId,
			playTime: event.audio.currentTime,
			resuming: event.resuming
		}));

		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { audioName: event.audio.annotationId, currentTime: event.audio.currentTime, audioPaused: false } }));

		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioPaused (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioPaused, {
			audioName: event.audio.annotationId,
			playTime: event.audio.currentTime
		}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { audioPaused: true, currentTime: event.audio.currentTime } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 * @param {Number} index
	 */
	function onPresenterSetMedia (event, index) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: index}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: index, inGallery: false } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterNextMedia (event) {
		// We get here
		//$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: player.currentSlideIndex + 1}));
		//$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: player.currentSlideIndex + 1, inGallery: false } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterPreviousMedia (event) {
		//$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: player.currentSlideIndex - 1}));
		//$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: player.currentSlideIndex - 1 }, inGallery: false }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 * @param {Number} index
	 */
	function onPresenterGalleryRequested (event, index) {
		$player.trigger($.Event(TabeebSpectatorEvent.galleryPressed, {index: index}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { inGallery: true } }));
		event.stopPropagation();
	}

	function onPresenterVideoPaused (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoPaused, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { videoPaused: true, currentTime: time.time } }));
		event.stopPropagation();
	}

	function onPresenterVideoPlayed (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoStart, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { videoPaused: false, currentTime: time.time } }));
		event.stopPropagation();
	}

	function onPresenterVideoTimeSeeked (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoSeeked, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { currentTime: time.time} }));
		event.stopPropagation();
	}

	function bindEvent ($target, eventType, func) {
		var bindedEvent = {
			target: $target,
			type: eventType,
			func: func
		};
		$target.off(eventType, func).on(eventType, func);

		events.push(bindedEvent);
	}

	function bindPresenterEvents () {
		// Trigger events so the pagePluginController can broadcast them to other users

		// Audio events
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioStarted, onPresenterAudioStarted);
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioPaused, onPresenterAudioPaused);
		bindEvent($audioService, TabeebAudioService.AudioEvent.volumeChanged, onPresenterVolumeChanged);
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioSeeked, onPresenterAudioSeeked);

		// Navigation events
		bindEvent(player.$element, TabeebEvent.galleryRequested, onPresenterGalleryRequested);
		bindEvent(player.$element, TabeebSpectatorEvent.setMediaIndex, onPresenterSetMedia);
		bindEvent(player.$element, TabeebEvent.nextMedia, onPresenterNextMedia);
		bindEvent(player.$element, TabeebEvent.previousMedia, onPresenterPreviousMedia);
		bindEvent(player.$element, TabeebEvent.setMedia, onPresenterSetMedia);

		// Video events
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoPaused, onPresenterVideoPaused);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoPlayed, onPresenterVideoPlayed);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoTimeSeeked, onPresenterVideoTimeSeeked);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.volumeChanged, onPresenterVolumeChanged);

		var $hotspotManager = canvasService.hotspotManager.getTriggerElement();

		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.audioEvent, onPresenterHotspotAudioEvent);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.dialogOpened, onPresenterHotspotDialogOpened);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.dialogClosed, onPresenterHotspotDialogClosed);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.commentFocused, onPresenterHotspotCommentClicked);

		bindEvent($player, TabeebEvent.participantUpdated, onPresenterParticipantUpdated);
		bindEvent($(canvasService), TabeebCanvasService.CanvasServiceEventType.laserPointerMoved, onPresenterLaserPointerMoved);

		bindEvent($(userMgr), TabeebUserManager.Events.userMuteChanged, onPresenterUserMuteChanged);
	}

	function unbindPresenterEvents () {
		for (var i = 0; i < events.length; i++)
		{
			var bindedEvent = events[i];
			bindedEvent.target.off(bindedEvent.type, bindedEvent.func);
		}
	}

	// </editor-fold>

	// <editor-fold desc="Spectator">
	this.setSpectatorMode = function (flag) {
		resetVideoAndAudio();
		unbindSpectatorEvents();
		if (flag)
		{
			unbindPresenterEvents();
			bindSpectatorEvents();
			player.hudService.setScreenMode(TabeebScreenModeType.Spectator);
			player.$element.addClass("spectating").removeClass("presenting");
			galleryService.setDisabled(true);
		}
		else
		{
			player.$element.removeClass("spectating");
			player.hudService.setScreenMode(player.options.defaultScreenModeType);
			galleryService.setDisabled(false);
		}
	};

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioStarted (event) {
		if (event.isPropagationStopped())
			return;

		audioService.onready(event.audioName, function () {
			if (event.resuming)
				audioService.resumeAudioElement();
			else
				audioService.playAudioWithElement(event.audioName);
			event.stopPropagation();
		});
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioPaused (event) {
		if (event.isPropagationStopped())
			return;

		audioService.pause(event.audioName);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioSeeked (event) {
		if (event.isPropagationStopped())
			return;

		audioService.setCurrentTime(event.currentTime);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoPaused (event) {
		if (event.isPropagationStopped())
			return;

		videoService.pause();
		videoService.setCurrentTime(event.currentTime);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoStart (event) {
		if (event.isPropagationStopped())
			return;

		videoService.onready(function () {
			videoService.setCurrentTime(event.currentTime);
			videoService.resume();
			event.stopPropagation();
		});

	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoSeeked (event) {
		if (event.isPropagationStopped())
			return;

		videoService.onready(function () {
			videoService.setCurrentTime(event.currentTime);
			event.stopPropagation();
		});
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorSetMediaIndex (event) {
		if (event.isPropagationStopped())
			return;

		player.$element.trigger(TabeebEvent.setMedia, event.index);
		event.stopPropagation();
	}

	/**
	 * @param {TabeebPresenterState} state
	 */
	this.setPresenterState = function (state) {
		//console.info("Received spectator presenter state", state);
		if (player.currentSlideIndex != state.slideIndex)
		{
			player.$element.trigger(TabeebEvent.setMedia, state.slideIndex);
			player.ready = false;
			player.onReady(function() { self.setPresenterState(state); });
			return;
		}

		if (state.isScreenSharing === true)
		{
			setLargeVideoVisible(true);
		}

		resetVideoAndAudio();

		if (state.mutedUserIds)
		{
			userMgr.users.forEach(function (user) {
				userMgr.setMuted(user.id, false);
			});
			state.mutedUserIds.forEach(function (userId) {
				userMgr.setMuted(userId, true);
			});
		}

		if (state.mutedAudioUserIds)
		{
			state.mutedAudioUserIds.forEach(function (userId) {
				console.log(userId, "is muted");
				onSpectatorUserAudioMuteChanged({userId: userId, isMuted: true});
			});
			canvasService.mutedUserIds = state.mutedUserIds;
		}
		// Check to see what audio the presenter is playing
		if (state.audioName && state.audioName.length > 0)
		{
			audioService.onready(state.audioName,
				function () {
					audioService.playAudioWithElement(state.audioName, state.currentTime);
					if (state.audioPaused === true)
						audioService.pause();

					if (state.volume)
						audioService.setVolume(state.volume);
				}
			);
		}

		if (state.hotspotDialogAnnotationId)
		{
			player.onReady(function () {
				var offset = canvasService.getOffsetOfAnnotation(state.hotspotDialogAnnotationId);
				var offsetEvent = {
					pageX: offset.left + offset.width,
					pageY: offset.top + offset.height
				};
				hotspotManager.show(annotationMgr.find(state.hotspotDialogAnnotationId), $.Event("Test", offsetEvent));
			});
		}

		// Recover video time and play status from presenter
		videoService.onready(function () {
			if (presenterMode != TabeebPresenterMode.Spectator)
				return;

			var millisecondsElapsed = (new Date()) - (new Date(state.timeStamp));
			if (state.videoPaused) {
				millisecondsElapsed = 0;
			}
			videoService.setCurrentTime(state.currentTime + (millisecondsElapsed/1000));

			if (state.volume)
				videoService.setVolume(volume);

			if (state.videoPaused === true || state.videoPaused == null)
				videoService.pause();
			else if (state.videoPaused === false)
			{
				millisecondsElapsed = (new Date()) - (new Date(state.timeStamp));
				videoService.play();
				videoService.setCurrentTime(state.currentTime + (millisecondsElapsed/1000));
			}
		});
	};

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorPresenterState (event) {
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorGalleryPressed (event) {
		if (event.isPropagationStopped())
			return;

		player.hudService.setScreenMode(TabeebScreenModeType.Gallery);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorMuteChanged (event) {
		if (event.isPropagationStopped())
			return;

		var id = event.id;
		var muted = event.muted;
		var participant = {
			id: id,
			showStrokes: !muted
		};

		userMgr.setMuted(id, muted);

		player.updateParticipant(participant);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVolumeChanged (event) {
		if (event.isPropagationStopped())
			return;

		var volume = event.volume;
		videoService.setVolume(volume);
		audioService.setVolume(volume);
		event.stopPropagation();
	}

	function onSpectatorHotspotAudioEvent (event) {
		console.log("Hotspot Audio Event From Presenter", event);
		var audioEvent = event.audioEvent;
		var annotationId = event.annotationId;
		var type = audioEvent.type;
		var hotspotManager = canvasService.hotspotManager;

		hotspotManager.onAnnotationsReady(function () {
			/**@type {Audio}*/
			var audioElement = hotspotManager.getAudioElement(annotationId);
			audioElement.volume = audioEvent.volume;
			//audioElement.currentTime = audioEvent.currentTime;
			audioElement.muted = audioEvent.muted;

			if (type == "play")
			{
				hotspotManager.playAudioAnnotation(annotationId, audioEvent.currentTime);
			}
			else if (type == "pause")
			{
				audioElement.pause();
			}
			else if (type == "seeked")
			{
				audioElement.currentTime = audioEvent.currentTime;
			}
		});
		hotspotManager.focusOnComment(annotationId);
	}

	function onSpectatorHotspotDialogOpened (event) {
		player.onReady(function () {
			setTimeout(function() {
				var offset = canvasService.getOffsetOfAnnotation(event.annotationId);
				var offsetEvent = {
					pageX: offset.left + offset.width,
					pageY: offset.top + offset.height
				};
				hotspotManager.show(annotationMgr.find(event.annotationId), $.Event("Test", offsetEvent));
			}, 500);
		});
	}

	function onSpectatorHotspotDialogClosed () {
		hotspotManager.hide();
	}

	function onSpectatorHotspotDialogCommentClicked (event) {
		var annotationId = event.annotationId;
		hotspotManager.focusOnComment(annotationId);
	}

	function onSpectatorLaserPointerMoved (event) {
		var x = canvasService.imageToCanvasCoordX(event.x);
		var y = canvasService.imageToCanvasCoordX(event.y);
		canvasService.setLaserPointerPosition(x, y);
	}

	function onSpectatorLargeVideoToggled (event) {
		var isVisible = event.active;
		console.log("Received large video state from presenter", isVisible);
		setLargeVideoVisible(isVisible);
	}

	function onSpectatorUserAudioMuteChanged (event) {
		var userId = event.userId;
		var isMuted = event.isMuted;
		console.log("Presenter muted spectator", userId, isMuted);

		if (isMuted && that.mutedAudioUserIds.indexOf(userId) < 0)
			that.mutedAudioUserIds.push(userId);
		else if (that.mutedAudioUserIds.indexOf(userId) >= 0)
			that.mutedAudioUserIds.splice(that.mutedAudioUserIds.indexOf(userId), 1);

		$(that).trigger($.Event(TabeebPresenterManager.Events.userAudioMutedChanged, {userId: userId, isMuted: isMuted}));
	}

	function unbindSpectatorEvents () {
		for (var eventName in TabeebSpectatorEvent)
		{
			if (TabeebSpectatorEvent.hasOwnProperty(eventName))
				$player.off(eventName);
		}
	}

	function bindSpectatorEvents () {
		// Incoming events

		// Audio Events
		$player.unbind(TabeebSpectatorEvent.audioStart).on(TabeebSpectatorEvent.audioStart, onSpectatorAudioStarted);
		$player.unbind(TabeebSpectatorEvent.audioPaused).on(TabeebSpectatorEvent.audioPaused, onSpectatorAudioPaused);
		$player.unbind(TabeebSpectatorEvent.audioSeeked).on(TabeebSpectatorEvent.audioSeeked, onSpectatorAudioSeeked);

		// Video Events
		$player.unbind(TabeebSpectatorEvent.videoPaused).on(TabeebSpectatorEvent.videoPaused, onSpectatorVideoPaused);
		$player.unbind(TabeebSpectatorEvent.videoStart).on(TabeebSpectatorEvent.videoStart, onSpectatorVideoStart);
		$player.unbind(TabeebSpectatorEvent.videoSeeked).on(TabeebSpectatorEvent.videoSeeked, onSpectatorVideoSeeked);

		// Navigation Events
		$player.unbind(TabeebSpectatorEvent.setMediaIndex).on(TabeebSpectatorEvent.setMediaIndex, onSpectatorSetMediaIndex);
		$player.unbind(TabeebSpectatorEvent.presenterState).on(TabeebSpectatorEvent.presenterState, onSpectatorPresenterState);
		$player.unbind(TabeebSpectatorEvent.galleryPressed).on(TabeebSpectatorEvent.galleryPressed, onSpectatorGalleryPressed);

		$player.unbind(TabeebSpectatorEvent.muteChanged).on(TabeebSpectatorEvent.muteChanged, onSpectatorMuteChanged);
		$player.unbind(TabeebSpectatorEvent.volumeChanged).on(TabeebSpectatorEvent.volumeChanged, onSpectatorVolumeChanged);

		$player.unbind(TabeebSpectatorEvent.hotspotAudioEvent).on(TabeebSpectatorEvent.hotspotAudioEvent, onSpectatorHotspotAudioEvent);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogOpened).on(TabeebSpectatorEvent.hotspotDialogOpened, onSpectatorHotspotDialogOpened);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogClosed).on(TabeebSpectatorEvent.hotspotDialogClosed, onSpectatorHotspotDialogClosed);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogCommentClicked).on(TabeebSpectatorEvent.hotspotDialogCommentClicked, onSpectatorHotspotDialogCommentClicked);

		$player.unbind(TabeebSpectatorEvent.laserPointerMoved).on(TabeebSpectatorEvent.laserPointerMoved, onSpectatorLaserPointerMoved);
		$player.unbind(TabeebSpectatorEvent.largeVideoToggled).on(TabeebSpectatorEvent.largeVideoToggled, onSpectatorLargeVideoToggled);
		$player.unbind(TabeebSpectatorEvent.userAudioMutedChanged).on(TabeebSpectatorEvent.userAudioMutedChanged, onSpectatorUserAudioMuteChanged);
	}

	// </editor-fold>
}

TabeebPresenterManager.Events = {
	spectatorModeChanged: "spectatorModeChanged",
	presenterModeChanged: "presenterModeChanged",
	presentationStarted: "presentationStarted",
	presentationEnded: "presentationEnded",
	presenterChanged: "presenterChanged",
	participantOnlineStatusChanged: "participantOnlineStatusChanged",
	participantStartedSpeaking: "participantStartedSpeaking",
	participantEndedSpeaking: "participantEndedSpeaking",
	participantVideoMuteChange: "participantVideoMuteChange",
	participantAudioMuteChange: "participantAudioMuteChange",
	largeVideoToggled: "largeVideoToggled",
	userAudioMutedChanged: "userAudioMutedChanged"
};