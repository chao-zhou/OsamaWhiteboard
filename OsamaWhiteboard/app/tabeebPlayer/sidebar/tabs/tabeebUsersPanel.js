/**
 * Created by cody on 9/28/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebUserManager} userMgr
 * @param {TabeebInviteDialog} inviteDialog
 * @param {TabeebPresenterManager} presentationMgr
 * @constructor
 */
function TabeebUsersPanel ($sideBar, $triggerElement, inviteDialog, userMgr, presentationMgr) {
	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $speakingIndicator = null;

	/**@type {Array.<String>}*/
	var namesTalking = [];

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	////////////////////////////

	function init () {
		$panel = $sideBar.find(".tabeebUsersPanel");
		$speakingIndicator = $panel.find(".tabeebCurrentlySpeaking");
		bindEvents();
	}

	function bindEvents () {
		for (var i = 0; i < userMgr.users.length; i++) {
			onUserAdded({user: userMgr.users[i]});
		}

		$(userMgr).on(TabeebUserManager.Events.userAdded, onUserAdded);
		$(userMgr).on(TabeebUserManager.Events.userRemoved, onUserRemoved);
		$(userMgr).on(TabeebUserManager.Events.userMuteChanged, onUserMuteChanged);

		$(presentationMgr).on(TabeebPresenterManager.Events.participantEndedSpeaking, onUserStoppedTalking);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantStartedSpeaking, onUserStartedTalking);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantOnlineStatusChanged, onOnlineStatusChange);
		$(presentationMgr).on(TabeebPresenterManager.Events.userAudioMutedChanged, onUserAudioMutedChanged);
		$(presentationMgr).on(TabeebPresenterManager.Events.presenterChanged, onPresenterChanged);

		$panel.on("click", ".tabeebToggleMuteButton", onToggleMuteButtonClicked);
		$panel.on("click", ".tabeebToggleVideoButton", onToggleVideoButton);
		$panel.on("click", ".tabeebToggleAudioButton", onToggleAudioButtonClicked);
		$panel.on("click", ".tabeebInviteUser", onInviteButtonClicked);
		//$panel.on("click", ".tabeebInviteUser", onInviteButtonClicked)

	}

	//<editor-fold name="Public Methods">

	function dispose () {
		inviteDialog.dispose();
	}

	function resize () {
		var $tabeebUsers = $panel.find("> .tabeebUserContainer:not(.disabled):visible");

		var height = parseFloat($tabeebUsers.width()) * 9/16;
		$tabeebUsers.height(height);
	}

	//</editor-fold>

	function sort () {
		var thisUser = userMgr.getThisUser();

		var sortedItems = $panel.find("> div").sort(function (a, b) {

			if ($(a).hasClass("disabled") || $(b).hasClass("disabled")) return;

			var id = $(a).attr('data-id');
			var id2 = $(b).attr('data-id');
			var userA = userMgr.find(id);
			var userB = userMgr.find(id2);
			//var userB = userMgr.find($(b).attr('data-id'));

			if (!userA)
				return 1;
			if (!userB)
				return -1;

			if (thisUser && id == thisUser.id)
				return -1;
			if (thisUser && id2 == thisUser.id)
				return 1;

			if ($(a).hasClass("offline"))
				return 1;
			if ($(b).hasClass("offline"))
				return -1;

			if (userA && userB)
				return 0;
		});
		$panel.find("> div").detach();
		$panel.append(sortedItems);
		resize();
	}

	function onUserStoppedTalking (event) {
		var user = userMgr.find(event.userId);
		var index = namesTalking.indexOf(user.displayName);
		setTimeout(function () {
			if (index >= 0)
				namesTalking.splice(index, 1);
			updateNamesTalking();
		}, 1000);
	}

	function onUserStartedTalking (event) {
		var user = userMgr.find(event.userId);
		var index = namesTalking.indexOf(user.displayName);
		if (index < 0)
			namesTalking.push(user.displayName);
		updateNamesTalking();
	}

	function onOnlineStatusChange (event) {
		var userId = event.userId;
		var isOnline = event.isConnected;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);

		$container.removeClass("audioMuted");

		onUserStoppedTalking({userId: userId});

		if (isOnline) {
			$container.addClass("online").removeClass("offline");
		}
		else
		{
			$container.addClass("offline").removeClass("online audio video");
		}

		sort();
		updateNamesTalking();
	}

	function onUserAudioMutedChanged (event) {
		var userId = event.userId;
		var isMuted = event.isMuted;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);
		var $audioIndicator = $container.find(".tabeebAudioIndicator");
		$container.removeClass("audioMuted");

		if (presentationMgr.isAudioMuted(userId))
			$audioIndicator.css("background", "gray");
		else
			$audioIndicator.css("background", "");
		if (isMuted)
		{
			$container.addClass("audioMuted");
			$audioIndicator.css("background", "red");
		}
	}

	function onVideoMuteChange (event) {
		var userId = event.userId;
		var videoOn = event.videoOn;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);
		if (videoOn)
			$container.addClass("video");
		else
			$container.removeClass("video");

		console.log(user.displayName + " turned their video to", videoOn);
	}

	function onAudioMuteChange (event) {
		var userId = event.userId;
		var audioOn = event.audioOn;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);
		if (audioOn)
			$container.addClass("audio");
		else
			$container.removeClass("audio");
	}

	function onPresenterChanged (event) {
		var presenterId = event.presenterId;

		$panel.find(".tabeebUserContainer").show();

		if (!presenterId || presenterId.length == 0)
			return;

		var user = userMgr.find(presenterId);
		var $container = getElementForUser(user);
		$container.hide();
		resize();
	}

	function updateNamesTalking () {
		if (namesTalking.length == 0)
			$speakingIndicator.html('<span class="tabeebSpeakingIndicator icon-speaking" style="opacity: 0;"></span>');
		else if (namesTalking.length == 1)
			$speakingIndicator.html('<span class="tabeebSpeakingIndicator icon-speaking"></span>' + namesTalking[0] + ' is speaking ...');
		else
		{
			var text = '<span class="icon-speaking"></span>';
			for (var i = 0; i < namesTalking.length; i++) {
				if (i + 1 == namesTalking.length)
					text += ' and ' + namesTalking[i];
				else if (i + 2 == namesTalking.length)
					text += namesTalking[i];
				else
					text += namesTalking[i] + ', ';
			}
			text += ' are speaking ...';
			$speakingIndicator.html(text);
		}
	}

	function onUserAdded (event) {
		var user = event.user;
		var $element = createElementForUser(user);
		user.$videoElement = $element.find("video");
		$panel.append($element);
		sort();
	}

	function onUserRemoved (event) {
		var user = event.user;
		getElementForUser(user).remove();
	}

	function onUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var $container = getElementForUser(user);
		var $toggleMuteButton = $container.find(".tabeebToggleMuteButton");
		$toggleMuteButton.removeClass("disabled");
		if (user.annotationsMuted)
			$toggleMuteButton.addClass("disabled");
	}

	function onInviteButtonClicked (event) {
		inviteDialog.show();
	}

	function onToggleMuteButtonClicked (event) {
		var userId = $(this).parents(".tabeebUserContainer").attr('data-id');
		userMgr.setMuted(userId);
	}

	function onToggleVideoButton () {
		var user = userMgr.getThisUser();
		var $container = getElementForUser(user);
		presentationMgr.toggleThisUsersVideo();
	}

	function onToggleAudioButtonClicked () {
		var user = userMgr.getThisUser();
		var $container = getElementForUser(user);
		if ($container.hasClass("audioMuted"))
			return;
		presentationMgr.toggleThisUsersAudio();
	}

	/**
	 * @param {TabeebUser} user
	 * @returns {jQuery}
	 */
	function getElementForUser (user) {
		return $panel.find(".tabeebUserContainer[data-id='" + user.id + "']")
	}

	//<editor-fold name="HTML Methods">

	/**
	 * @param {TabeebUser} user
	 */
	function createElementForUser (user) {
		var html = '';

		if (user.id == presentationMgr.getPresenterId())
			html += '<div class="tabeebUserContainer offline col-xs-6" data-id="' + user.id + '" style="display: none;">';
		else
			html += '<div class="tabeebUserContainer offline col-xs-6" data-id="' + user.id + '">';

		html += '<div class="tabeebUser">';

		if (user.avatarUrl && user.avatarUrl.length > 0)
			html += '<img src="' + user.avatarUrl + '" class="tabeebUserAvatar img-responsive" />';
		else
			html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).css("margin", "auto")[0].outerHTML;

		html += '<video autoplay oncontextmenu="return false;"></video>';

		if (user != userMgr.getThisUser())
			html += '<audio autoplay oncontextmenu="return false;" style="display: none;"></audio>';

		if (user.displayName.length > 11)
		{
			html += '<span>' + user.displayName.substr(0, 8) + '...</span>';
		}
		else
		{
			html += '<span>' + user.displayName + '</span>';
		}

		html += '<div class="tabeebOnlineIndicator">(Offline)</div>';

		html += createHTMLForUserControls(user);

		html += '</div>';

		html += '</div>';

		return $(html);
	}

	function createHTMLForUserControls (user) {
		var thisClientCanConnect = TabeebConnect.clientCanConnect();

		var html = '';

		html += '<div class="tabeebPanelControls">';

		html += '<div class="tabeebPresenterModeButton tabeebChangePresenterButton tabeebUserOnlineButton icon-desktop" style="font-size: 12px; line-height: 28px;"></div>';

		var thisUser = userMgr.getThisUser();

		if (thisClientCanConnect && user == thisUser)
			html += '<div class="tabeebSpectatorModeButton tabeebVideoIndicator tabeebToggleVideoButton icon-videocam"></div>';

		html += '<div class="tabeebHideOnPresentationMode tabeebToggleMuteButton icon-draw-mode"></div>';
		html += '<div class="tabeebPresenterModeButton tabeebToggleMuteButton icon-draw-mode"></div>';

		if (thisClientCanConnect && user == thisUser)
			html += '<div class="tabeebSpectatorModeButton tabeebAudioIndicator tabeebToggleAudioButton icon-mic"></div>';

		html += '<div class="tabeebPresenterModeButton tabeebAudioIndicator tabeebToggleMuteAudioButton icon-mic"></div>';
		//html += '<div class="icon-draw-mode"></div>';

		html += '</div>';

		return html;
	}

	//</editor-fold>

	function bindTest () {
	}

}
