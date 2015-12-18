var tabeebConnect = null;

/**
 * Created by cody on 7/30/15.
 */

function TabeebConnect (optionsIn) {

	//<editor-fold name="Variables">

	var self = this;
	var $self = $(this);
	tabeebConnect = this;

	var defaults = {
		conferenceId: '',
		getVideoElementForUser: null,
		getVideoElementContainerForUser: function (userid) {},
		getAudioElementForUser: function () {},
		userId: '',
		onReady: function () { },
		onVideoStreamSwitched: function () {},
		//getLargeVideoContainer: function () {},
		//setLargeVideoVisible: function (visible) {},
		isPresenter: function (userid) {},
		onStreamAttached: function () {},
		onVideoMuted: function (userId, isMuted) {},
		onAudioMuted: function (userId, isMuted) {},
		onUserJoined: function (userId) {},
		onUserLeft: function (userId) {}
	};

	var options = $.extend(defaults, optionsIn);
	var meet = null;
	var localStream = null;
	var largeVideoStream = null;

	var userIdToJid = {};

	var streams = {};
	var userIdsWithStartedStream = [];

	//	var streams = [];

	//</editor-fold>

	setup();

	var service = {
		connect: connect,
		disconnect: disconnect,
		isAudioMuted: isAudioMuted,
		isVideoMuted: isVideoMuted,
		muteAudio: muteAudio,
		muteVideo: muteVideo,
		reattachVideos: reattachVideos,
		shareScreen: toggleScreenShare,
		isScreenSharing: isScreenSharing,
		unmuteAudio: unmuteAudio,
		unmuteVideo: unmuteVideo,
		userHasStream: userHasStream,
		userHasVideoStream: userHasVideoStream,
		getJidFromUserId: getJidFromUserId,
		reattachVideoForUser: reattachVideoForUser,
		onAudioLevelChange: function (userId, audioLevel) {},
		getMeet: function () { return meet; },
		toggleAudio: toggleAudio,
		toggleVideo: toggleVideo,
		setUserMute: setUserMute
	};

	return service;

	//<editor-fold name="Public Methods">

	function connect () {
		config.bosh += options.conferenceId;
		config.getroomnode = function () { return options.conferenceId; };

		console.log("Config", config);

		$(document).trigger($.Event('tabeebConnect_connect', {callback: onJitsiMeetStarted}));
	}

	function disconnect () {
		$(document).trigger($.Event('tabeebConnect_disconnect'));
		dispose();
	}

	function toggleAudio () {
		options.onAudioMuted(options.userId, !isAudioMuted());
		meet.UI.toggleAudio();
	}

	function toggleVideo () {
		options.onVideoMuted(options.userId, !isVideoMuted());
		meet.RTC.setVideoMute(!isVideoMuted(), function() {});
		//meet.UI.toggleVideo();
	}

	function setUserMute (userId, isMute) {
		var jid = getJidFromUserId(userId);
		meet.xmpp.setMute(jid, isMute);
	}

	function isAudioMuted (userId) {
		return meet && meet.RTC && meet.RTC.localAudio ? meet.RTC.localAudio.isMuted() : true;
	}

	function isVideoMuted (userId) {
		if (userId && userId != options.userId)
		{
			var isMuted = meet ? meet.RTC.isVideoMuted(getJidFromUserId(userId)) : true;
			if (userIdsWithStartedStream.indexOf(userId) <= 0)
				isMuted = true;
			console.log("Is user muted?", userId, isMuted);
			return isMuted;
		}
		else
		{
			try
			{
				console.log("Meet", meet, meet.RTC.localVideo.isMuted());
				var isMuted = meet ? meet.RTC.localVideo.isMuted() : true;
				return isMuted;
			}
			catch(ex) {
				return true;
			}
		}
	}

	function isScreenSharing (userId) {
		return meet ? meet.desktopsharing.isUsingScreenStream() : false;
	}

	function userHasStream (userId) {
		return streams.hasOwnProperty(userId) && (streams[userId].videoStream || streams[userId].audioStream);
	}

	function userHasVideoStream (userId) {
		return streams.hasOwnProperty(userId) && streams[userId].videoStream;
	}

	function toggleScreenShare () {
		console.error("Toggling Screen Share");
		meet.desktopsharing.toggleScreenSharing();
	}

	function muteAudio () {
		meet.xmpp.setAudioMute(true, function () {});
	}

	function muteVideo () {
		console.info("Muting video");
		meet.RTC.setVideoMute(true, function () {
			console.log("Callback!");
			options.onVideoMuted(options.userId, true);
		});
	}

	function unmuteAudio () {
		console.info("Unmuting audio");
		meet.xmpp.setAudioMute(false, function () {});
	}

	function unmuteVideo () {
		console.info("Unmuting video");
		meet.RTC.setVideoMute(false, function () {
			options.onVideoMuted(options.userId, false);
		});
	}

	function reattachVideoForUser (userId) {

		console.log("Reattaching video for userId", userId);

		if (!TabeebConnect.clientCanConnect())
		{
			console.warn("Unable to reattach due to browser restrictions.");
			return;
		}

		if (!streams.hasOwnProperty(userId))
		{
			console.warn("No stream for userId", userId);
			return;
		}

		var audioStream = streams[userId].audioStream;
		var videoStream = streams[userId].videoStream;
		var containerElement = options.getVideoElementContainerForUser(userId);

		if (videoStream)
		{
			var videoOrObject = containerElement.find("video, object")[0];
			attachStreamToElement(videoStream, $(videoOrObject));
			videoOrObject = containerElement.find("video, object");
			$("object").attr('width', '').attr('height', '');
			if (videoOrObject.length > 0)
				videoOrObject[0].play();
		}
		else {
			console.warn("No video stream to reattach", userId);
		}
		if (audioStream)
		{
			attachStreamToElement(audioStream, options.getAudioElementForUser(userId));
		}
	}

	function reattachVideos () {
		if (!TabeebConnect.clientCanConnect())
		{
			console.warn("Unable to reattach.");
			return;
		}

		setTimeout(function () {
			for (var userId in streams)
			{
				reattachVideoForUser(userId);
			}
		}, 50);
	}

	function onDesktopStreamCreated (stream, isUsingScreenStream, callback) {
		console.log("Desktop stream created", arguments);
	}

	function onVideoStreamSwitched (showingScreen) {
		console.log("Desktop stream switched. Showing desktop: ", showingScreen);
		options.onVideoStreamSwitched(showingScreen);
	}

	function setStreamToUserId (stream, userId, streamType) {
		stream.getOriginalStream().userId = userId;
		if (!streams[userId])
			streams[userId] = {};

		streams[userId][streamType + "Stream"] = stream.getOriginalStream();
	}

	//</editor-fold>

	function onJitsiMeetStarted (APP) {
		meet = APP;
		console.info("tabeebConnect.onJitsiMeetStarted");
		bindEvents();
	}

	function setup () {
		bindTestEvents();
	}

	function dispose () {
		if (localStream)
		{
			if (localStream.stop)
				localStream.stop();
			localStream = null;
			streams = {};
		}
		meet.xmpp.disposeConference();

		unbindEvents();
	}

	//<editor-fold name="Helper Functions">
	function attachStreamToElement (stream, $videoElement) {
		if ($videoElement == null || $videoElement.length == 0)
		{
			console.warn("Element should exist");
			return;
		}

		stream.videoElement = $videoElement;
		meet.RTC.attachMediaStream($videoElement, stream);

		options.onStreamAttached(stream, $videoElement);
	}

	function getRoomName () {
		return options.conferenceId + '@' + config.hosts.muc;
	}

	function getUserIdFromJid (jid) {
		var split = jid.split('/');
		var userId = split[split.length - 1];
		userIdToJid[userId] = jid;
		return userId;
	}

	function getJidFromUserId (userId) {
		var jid = userIdToJid[userId];
		return jid;
	}

	//</editor-fold>

	function isStreamVideo (stream) {
		return stream.getVideoTracks().length > 0;
	}

	function isStreamAudio (stream) {
		return stream.getAudioTracks().length > 0;
	}

	//<editor-fold name="JitsiMeet Events">
	function onLocalStreamCreated (stream, isMuted) {
		var actualStream = stream.getOriginalStream();
		console.log("tabeebConnect.onLocalStreamCreated", arguments);
		var $streamElement = null;

		if (isStreamVideo(stream.getOriginalStream()))
		{
			$streamElement = options.getVideoElementForUser(options.userId);
			if ($streamElement.length > 0)
			{
				$streamElement[0].onplaying = function () {
					userIdsWithStartedStream.push(options.userId);
					unmuteVideo();
				}
			}
		}
		else if (isStreamAudio(stream.getOriginalStream()))
		{
			$streamElement = options.getAudioElementForUser(options.userId);
		}

		localStream = stream.getOriginalStream();
		if (options.onReady)
		{
			options.onReady();
			options.onReady = null;
		}
		stream.userId = options.userId;

		setStreamToUserId(stream, stream.userId, stream.type);

		if (stream.videoType === "screen")
			screenShareScreenStreamCreated(stream, options.userId);
		else if (options.isPresenter(options.userId))
			options.setLargeVideoVisible(false);

		attachStreamToElement(actualStream, $streamElement);
	}

	function screenShareScreenStreamCreated (stream, userId) {
		console.log("Screen Share Stream Created", arguments);

		if (!options.isPresenter(userId))
			return;

		var largeVideoContainer = options.getLargeVideoContainer();
		var largeVideo = largeVideoContainer.find("video");
		largeVideoStream = stream.getOriginalStream();
		attachStreamToElement(stream.getOriginalStream(), largeVideo);
		options.setLargeVideoVisible(true);
	}

	function onLocalStreamEnded (stream) {
		console.log("tabeebConnect.onLocalStreamEnded", arguments);
		if (largeVideoStream == localStream)
		{
			//			options.setLargeVideoVisible(false);
		}
	}

	function onRoomJoinError (error) {
		console.error('tabeebConnect.onRoomJoinError', error);
	}

	function onRoomConnectError (error) {
		console.error('tabeebConnect.onRoomConnectError', error);
	}

	function onReadyToJoinRoom () {
		var contentName = getRoomName();

		console.log("Content Name", contentName);

		meet.xmpp.allocateConferenceFocus(contentName, function () {
			meet.xmpp.joinRoom(contentName, true, options.userId);
		});
	}

	function onRemoteStreamAdded (stream) {
		if (!stream.peerjid)
			return;

		var userId = getUserIdFromJid(stream.peerjid);
		stream.userId = userId;

		var $streamElement = null;

		if (isStreamVideo(stream.getOriginalStream()))
		{
			$streamElement = options.getVideoElementForUser(userId);
			setStreamToUserId(stream, stream.userId, "video");
		}
		else if (isStreamAudio(stream.getOriginalStream()))
		{
			$streamElement = options.getAudioElementForUser(userId);
			setStreamToUserId(stream, stream.userId, "audio");
		}

		//		$videoElement.css('height', $videoElement.width() * 3 / 4);

		console.log("Stream", stream);

		if (stream.videoType === "screen")
			screenShareScreenStreamCreated(stream, stream.userId, "video");

		attachStreamToElement(stream.getOriginalStream(), $streamElement);

		$streamElement[0].onplaying = function () {
			userIdsWithStartedStream.push(userId);
		}
	}

	function onRemoteStreamEnded () {
		console.log("onRemoteStreamEnded", arguments);
	}

	function onMUCMemberJoined (jid, id, displayName) {
	}

	function onMUCJoined (jid) {
		var userId = getUserIdFromJid(jid);
		options.onUserJoined(userId);
	}

	function onMUCRoleChanged () {
		console.log("onMUCRoleChanged", arguments);
	}

	function onMUCMemberLeft (jid) {
		console.log("onMUCMemberLeft", arguments);
		var userId = getUserIdFromJid(jid);
		console.log("Deleting from streams with userId", userId);
		delete streams[userId];
		options.onUserLeft(userId);
	}

	function onSetLocalDescriptionError () {
		console.log("onSetLocalDescriptionError argument", arguments);
	}

	function onSetRemoteDescriptionError () {
		console.log("onSetRemoteDescriptionError argument", arguments);
	}

	function onCreateAnswerError () {
		console.log("onCreateAnswerError argument", arguments);
	}

	function onJingleFatalError () {
		console.log("onJingleFatalError argument", arguments);
	}

	function onRemoteStreamChanged () {
		console.log("onRemoteStreamChanged", arguments);
	}

	//</editor-fold>

	function bindEvents () {
		meet.RTC.addStreamListener(onSetLocalDescriptionError, XMPPEvents.SET_LOCAL_DESCRIPTION_ERROR);
		meet.RTC.addStreamListener(onSetRemoteDescriptionError, XMPPEvents.SET_REMOTE_DESCRIPTION_ERROR);
		meet.RTC.addStreamListener(onCreateAnswerError, XMPPEvents.CREATE_ANSWER_ERROR);
		meet.RTC.addStreamListener(onJingleFatalError, XMPPEvents.JINGLE_FATAL_ERROR);

		meet.RTC.addStreamListener(onLocalStreamCreated, StreamEventTypes.EVENT_TYPE_LOCAL_CREATED);
		meet.RTC.addStreamListener(onLocalStreamCreated, StreamEventTypes.EVENT_TYPE_LOCAL_CHANGED);
		meet.RTC.addStreamListener(onLocalStreamEnded, StreamEventTypes.EVENT_TYPE_LOCAL_ENDED);
		meet.RTC.addStreamListener(onRemoteStreamAdded, StreamEventTypes.EVENT_TYPE_REMOTE_CREATED);
		meet.RTC.addStreamListener(onRemoteStreamEnded, StreamEventTypes.EVENT_TYPE_REMOTE_ENDED);
		meet.RTC.addStreamListener(onRemoteStreamChanged, StreamEventTypes.EVENT_TYPE_REMOTE_CHANGED); // remote_changed

		meet.xmpp.addListener(XMPPEvents.READY_TO_JOIN, onReadyToJoinRoom);
		meet.xmpp.addListener(XMPPEvents.CONNECTION_FAILED, onRoomConnectError);
		meet.xmpp.addListener(XMPPEvents.ROOM_JOIN_ERROR, onRoomJoinError);

		meet.xmpp.addListener(XMPPEvents.MUC_MEMBER_JOINED, onMUCMemberJoined);
		meet.xmpp.addListener(XMPPEvents.MUC_JOINED, onMUCJoined);
		meet.xmpp.addListener(XMPPEvents.PARTICIPANT_AUDIO_MUTED, onMUCMemberLeft);
		meet.xmpp.addListener(XMPPEvents.PARTICIPANT_VIDEO_MUTED, onVideoMuted);
		meet.xmpp.addListener(XMPPEvents.AUDIO_MUTED, onAudioMuted);
		meet.xmpp.addListener(XMPPEvents.PRESENCE_STATUS, onRemoteStats);

		meet.desktopsharing.addListener('ds.new_stream_created', onDesktopStreamCreated);
		meet.desktopsharing.addListener('ds.switching_done', onVideoStreamSwitched);

		meet.xmpp.addListener(XMPPEvents.START_MUTED_FROM_FOCUS, function (audio, video) {
			console.log("START MUTED", arguments);
		});


		if (options.onAudioLevelChange)
		{
			meet.statistics.addListener(StatisticsEvents.AUDIO_LEVEL, onAudioLevelChange);
		}
	}

	function onAudioLevelChange (jid, audioLevel) {
		var userId = getUserIdFromJid(jid);
		options.onAudioLevelChange(userId, audioLevel);
	}

	function onRemoteStats() {
		console.log("onRemoteStats", arguments);
	}

	function onVideoMuted (jid, isMuted) {
		if (!options.onVideoMuted)
			return;

		var userId = getUserIdFromJid(jid);
		options.onVideoMuted(userId, isMuted);

		if (!streams[userId])
		{
			reattachVideoForUser(getUserIdFromJid(jid));
		}
	}

	function onAudioMuted (jid, isMuted) {
		if (!options.onAudioMuted)
			return;

		var userId = getUserIdFromJid(jid);
		options.onAudioMuted(userId, isMuted);
	}

	function bindTestEvents () {
		$(document).on("keypress", function (event) {
			if (!event.ctrlKey) return;

			if (event.which == 49) { // Ctrl + 1
				console.info("Calling Test Reattach Videos");
				reattachVideos();
			}
			else if (event.which == 50) { // Ctrl + 1
				console.info("calling Test Toggle Video");
				toggleVideo();
			}
			else
				console.log("Event.which", event.which);
		});
	}

	function unbindEvents () {
	}
}

TabeebConnect.pluginIsInstalled = function () {
	var comName = AdapterJS.WebRTCPlugin.pluginInfo.prefix;
	var plugName = AdapterJS.WebRTCPlugin.pluginInfo.plugName;

	if (!RTCBrowserType.isIExplorer()) {
		var pluginArray = navigator.plugins;
		for (var i = 0; i < pluginArray.length; i++) {
			if (pluginArray[i].name.indexOf(plugName) >= 0) {
				return true;
			}
		}
		return false;
	} else {
		try {
			var axo = new ActiveXObject(comName + '.' + plugName);
		} catch (e) {
			return false;
		}
		return true;
	}
};

TabeebConnect.clientCanConnect = function () {
	if (TabeebInputService.isTouchDevice())
		return false;

	if (RTCBrowserType.isFirefox())
	{
		return true;
	}
	else if (RTCBrowserType.isChrome() || (RTCBrowserType.isTemasysPluginUsed()))
		return true;
	else
		return false;
};

TabeebConnect.clientCanShareScreen = function () {
	console.info('RTC: Client has chrome screenshare extension enabled: ', DetectRTC.hasChromeScreenShareExtension);
	return DetectRTC.hasChromeScreenShareExtension || RTCBrowserType.isTemasysPluginUsed();
};

TabeebConnect.installChromeScreenShareExtension = function () {
	chrome.webstore.install();
};

function checkClientExtension (chromeExtensionId) {
	if (typeof chrome === 'undefined' || !chrome.runtime)
	{
		DetectRTC.hasChromeScreenShareExtension = false;
		return;
	}
	try
	{
		chrome.runtime.sendMessage(
			chromeExtensionId,
			{getVersion: true},
			function (response) {
				if (!response || !response.version)
				{
					DetectRTC.hasChromeScreenShareExtension = false;
					console.warn('Looking for chrome screenshare extension id: ' + chromeExtensionId + '. Extension not installed?: ', chrome.runtime.lastError);
					return;
				}
				DetectRTC.hasChromeScreenShareExtension = true;
				console.info('RTC: Looking for chrome screenshare extension. Found. Ext Id: ', chromeExtensionId);
			}
		);
	} catch (ex) {}
}

DetectRTC.load(
	function () {
		checkClientExtension(config.chromeExtensionId);
	});

checkClientExtension(config.chromeExtensionId);