/**
 * Created by cody on 12/10/15.
 */

var TabeebJitsiConnect;

(function () {
	"use strict";

	TabeebJitsiConnect = function TabeebJitsiConnect (optionsIn) {

		//<editor-fold name = "Variables">

		var self = this;
		var $self = $(self);
		/**@type {TabeebJitsiConnect.defaults}*/
		var options = $.extend(TabeebJitsiConnect.defaults, optionsIn);
		/**@type {{UI:UI, API:API, RTC:RTC, xmpp:XMPP}}*/
		var APP = null;

		//</editor-fold>

		//<editor-fold name="Initialization">

		init();

		function init () {
		}

		function onJitsiMeetStarted (app) {
			APP = app;
			console.log("Jitsi Meet Started Up");
			bindEvents();
		}

		function bindEvents () {
			APP.RTC.addStreamListener(streamHandler,
				StreamEventTypes.EVENT_TYPE_LOCAL_CREATED);
			APP.RTC.addStreamListener(streamHandler,
				StreamEventTypes.EVENT_TYPE_LOCAL_CHANGED);
			APP.RTC.addStreamListener(function (stream) {
				VideoLayout.onRemoteStreamAdded(stream);
			}, StreamEventTypes.EVENT_TYPE_REMOTE_CREATED);
			APP.RTC.addListener(RTCEvents.VIDEO_MUTE, UI.setVideoMuteButtonsState);

			APP.statistics.addListener(StatisticsEvents.AUDIO_LEVEL,
				function(jid, audioLevel) {
					var resourceJid;
					if(jid === APP.statistics.LOCAL_JID) {
						resourceJid = AudioLevels.LOCAL_LEVEL;
						if(APP.RTC.localAudio.isMuted()) {
							audioLevel = 0;
						}
					} else {
						resourceJid = Strophe.getResourceFromJid(jid);
					}

					AudioLevels.updateAudioLevel(resourceJid, audioLevel,
						UI.getLargeVideoResource());
				});
			APP.desktopsharing.addListener(
				DesktopSharingEventTypes.INIT,
				ToolbarToggler.showToolbar);
			APP.desktopsharing.addListener(
				DesktopSharingEventTypes.SWITCHING_DONE,
				Toolbar.changeDesktopSharingButtonState);
			APP.desktopsharing.addListener(
				DesktopSharingEventTypes.FIREFOX_EXTENSION_NEEDED,
				function (url) {
					APP.UI.messageHandler.openMessageDialog(
						"dialog.extensionRequired",
						null,
						null,
						APP.translation.generateTranslationHTML(
							"dialog.firefoxExtensionPrompt", {url: url}));
				});
			APP.xmpp.addListener(XMPPEvents.CONNECTION_FAILED, onXmppConnectionFailed);
			APP.xmpp.addListener(XMPPEvents.DISPOSE_CONFERENCE, onDisposeConference);
			APP.xmpp.addListener(XMPPEvents.GRACEFUL_SHUTDOWN, function () {
				messageHandler.openMessageDialog(
					'dialog.serviceUnavailable',
					'dialog.gracefulShutdown'
				);
			});
			APP.xmpp.addListener(XMPPEvents.RESERVATION_ERROR, function (code, msg) {
				var title = APP.translation.generateTranslationHTML(
					"dialog.reservationError");
				var message = APP.translation.generateTranslationHTML(
					"dialog.reservationErrorMsg", {code: code, msg: msg});
				messageHandler.openDialog(
					title,
					message,
					true, {},
					function (event, value, message, formVals) {
						return false;
					}
				);
			});
			APP.xmpp.addListener(XMPPEvents.BRIDGE_DOWN, function () {
				messageHandler.showError("dialog.error",
					"dialog.bridgeUnavailable");
			});

			APP.xmpp.addListener(XMPPEvents.MUC_JOINED, onMucJoined);
			APP.xmpp.addListener(XMPPEvents.MUC_MEMBER_JOINED, onMucMemberJoined);
			APP.xmpp.addListener(XMPPEvents.MUC_ROLE_CHANGED, onMucRoleChanged);
			APP.xmpp.addListener(XMPPEvents.PRESENCE_STATUS, onMucPresenceStatus);
			APP.xmpp.addListener(XMPPEvents.SUBJECT_CHANGED, chatSetSubject);
			APP.xmpp.addListener(XMPPEvents.MUC_MEMBER_LEFT, onMucMemberLeft);
			APP.xmpp.addListener(XMPPEvents.PARTICIPANT_VIDEO_TYPE_CHANGED,
				onPeerVideoTypeChanged);
			APP.xmpp.addListener(XMPPEvents.PARTICIPANT_AUDIO_MUTED,
				VideoLayout.onAudioMute);
			APP.xmpp.addListener(XMPPEvents.PARTICIPANT_VIDEO_MUTED,
				VideoLayout.onVideoMute);
			APP.xmpp.addListener(XMPPEvents.AUDIO_MUTED_BY_FOCUS, function (doMuteAudio) {
				UI.setAudioMuted(doMuteAudio);
			});
			APP.xmpp.addListener(XMPPEvents.START_MUTED_SETTING_CHANGED, function (audio, video) {
				SettingsMenu.setStartMuted(audio, video);
			});
			APP.xmpp.addListener(XMPPEvents.START_MUTED_FROM_FOCUS, function (audio, video) {
				UI.setInitialMuteFromFocus(audio, video);
			});

			APP.xmpp.addListener(XMPPEvents.JINGLE_FATAL_ERROR, function (session, error) {
				UI.messageHandler.showError("dialog.sorry",
					"dialog.internalError");
			});

			APP.xmpp.addListener(XMPPEvents.SET_LOCAL_DESCRIPTION_ERROR, function () {
				messageHandler.showError("dialog.error",
					"dialog.SLDFailure");
			});
			APP.xmpp.addListener(XMPPEvents.SET_REMOTE_DESCRIPTION_ERROR, function () {
				messageHandler.showError("dialog.error",
					"dialog.SRDFailure");
			});
			APP.xmpp.addListener(XMPPEvents.CREATE_ANSWER_ERROR, function () {
				messageHandler.showError();
			});
			APP.xmpp.addListener(XMPPEvents.FOCUS_DISCONNECTED, function (focusComponent, retrySec) {
				UI.messageHandler.notify(
					null, "notify.focus",
					'disconnected', "notify.focusFail",
					{component: focusComponent, ms: retrySec});
			});

			APP.xmpp.addListener(XMPPEvents.ROOM_JOIN_ERROR, function (pres) {
				UI.messageHandler.openReportDialog(null,
					"dialog.connectError", pres);
			});
			APP.xmpp.addListener(XMPPEvents.ROOM_CONNECT_ERROR, function (pres) {
				UI.messageHandler.openReportDialog(null,
					"dialog.connectError", pres);
			});

			APP.xmpp.addListener(XMPPEvents.READY_TO_JOIN, function () {
				var roomName = getRoomName();
				APP.xmpp.allocateConferenceFocus(roomName, onRoomJoined);
			});
		}

		//</editor-fold>

		function onRoomJoined () {
			var roomName = getRoomName();
			APP.xmpp.joinRoom(roomName, true, options.userId);
		}

		function getRoomName () {
			return options.conferenceId + '@' + config.hosts.muc;
		}

		//<editor-fold name="Public Methods">

		this.startCall = function () {
			config.bosh += options.conferenceId; // Add the room name to the BOSH url
			config.getroomnode = function () { return options.conferenceId; };

			$(document).trigger($.Event('tabeebConnect_connect', {callback: onJitsiMeetStarted}));
		};

		this.endCall = function () {

		};

		//</editor-fold>
	};

	TabeebJitsiConnect.defaults = {
		conferenceId: '',
		getVideoElementForUser: null,
		userId: '',

		// Callbacks
		getVideoElementContainerForUser: function (userid) {},
		getAudioElementForUser: function () {},
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
})();
