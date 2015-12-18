/**
 * Created by cody on 9/28/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebUserManager} userMgr
 * @param {TabeebPresenterManager} presentationMgr
 * @constructor
 */
function TabeebPresentationPanel ($sideBar, $triggerElement, userMgr, presentationMgr) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $presenterContainer = null;
	/**@type {jQuery}*/
	var $presenterName = null;

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	////////////////////////////

	function init () {
		$panel = $sideBar.find(".tabeebPresentationPanel");
		$presenterContainer = $panel.find(".tabeebPresenterUserContainer");
		$presenterName = $panel.find(".tabeebPresenterName");

		if (presentationMgr.currentlyInPresentation())
			onPresentationStarted();

		bindEvents();

		var $indicators = $panel.find(".tabeebAudioIndicator, .tabeebVideoIndicator");
		$indicators.hide();
	}

	function bindEvents () {
		$(presentationMgr).on(TabeebPresenterManager.Events.presentationStarted, onPresentationStarted);
		$(presentationMgr).on(TabeebPresenterManager.Events.presentationEnded, onPresentationEnded);
		$(presentationMgr).on(TabeebPresenterManager.Events.presenterChanged, onPresenterChanged);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantVideoMuteChange, onVideoMuteChange);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantAudioMuteChange, onAudioMuteChange);
		$(presentationMgr).on(TabeebPresenterManager.Events.largeVideoToggled, onLargeVideoToggled);

		$(userMgr).on(TabeebUserManager.Events.userMuteChanged, onUserMuteChanged);

		$sideBar.on("click", ".tabeebCallButton", onConnectButtonClicked);
		$sideBar.on("click", ".tabeebChangePresenterButton", onChangePresenterButtonClicked);
		$panel.find(".tabeebEndCallButton").on("click", onEndCallButtonClicked);
		$panel.find(".tabeebToggleAudioButton").on("click", onToggleAudioButtonClicked);
		$panel.find(".tabeebToggleVideoButton").on("click", onToggleVideoButtonClicked);
		$panel.find(".tabeebMuteAllAudio").on("click", onMuteAllAudioClicked);
		$panel.find(".tabeebMuteAllVideo").on("click", onMuteAllVideoClicked);
		$panel.find(".tabeebShareScreenButton").on("click", presentationMgr.toggleScreenShare);
		$panel.find(".tabeebToggleMuteButton").on("click", onPresenterToggleOwnStrokesClicked);
		$sideBar.on("click", ".tabeebToggleMuteAudioButton", onTabeebToggleMuteAudioButtonClicked);
	}

	//<editor-fold name="Public Methods">

	function dispose () {

	}

	function resize () {
		var availableHeight = parseFloat($panel.innerHeight());
		availableHeight -= parseFloat($panel.find(".tabeebControls").outerHeight());
		availableHeight -= parseFloat($panel.find(".tabeebPresenterBottomControls").innerHeight());
		availableHeight -= 15; //padding
		$presenterContainer.height(availableHeight);
		positionPresenterName();
	}

	//</editor-fold>

	function positionPresenterName () {
		var $presenterVideo = getPresenterVideo();

		var videoWidth = $presenterVideo.innerWidth();
		var videoHeight = $presenterVideo.innerHeight();
		var bottom = 0;

		if (videoWidth * (9 / 16) > videoHeight) //constrained by height
		{
			videoWidth = videoHeight * (16 / 9);
			$presenterName.css("top", videoHeight - 4);
		}
		else //constrained by width
		{
			if ($presenterVideo.is("object"))
			{
				videoHeight = videoWidth * (9/16);
				var top = videoHeight - 4;
				top += ($presenterVideo.height() - videoHeight)/2;
				$presenterName.css("top", top);
			}
			else
			{
				$presenterName.css("bottom", "");
			}
		}

		var containerWidth = $presenterName.parent().innerWidth();
		$presenterName.css({
			"left": (containerWidth - videoWidth)/2
		});
	}

	function getDisplayName (displayName) {
		return displayName.length <= 9 ? displayName : displayName.substring(0, 6) + '...';
	}

	function getUserContainerById (userId) {
		if (presentationMgr.getPresenterId() == userId)
			return $panel;
		else
			return $sideBar.find(".tabeebUserContainer[data-id='" + userId + "']")
	}

	//<editor-fold name="Events">

	function onMuteAllAudioClicked () {
		userMgr.users.forEach(function (user) {
			if (user.id == presentationMgr.getPresenterId())
				return;

			var $container = getUserContainerById(user.id);
			if ($container.hasClass("audioMuted"))
				return;

			$container.find(".tabeebToggleMuteAudioButton").click();
		});
	}

	function onMuteAllVideoClicked () {
		console.warn("Not implemented");
	}

	function onPresenterToggleOwnStrokesClicked () {
		userMgr.setMuted(presentationMgr.getPresenterId(), !$(this).hasClass("disabled"))
	}

	function getAvatarElement ($container) {
		var imgSrc = $container.find(".tabeebUserAvatar").attr("src");
		if (imgSrc == null || imgSrc.length == 0)
		{
			return $container.find(".tabeebBlankAvatar");
		}
		else
		{
			return $container.find(".tabeebUserAvatar");
		}
	}

	function onVideoMuteChange (event) {
		var userId = event.userId;
		var videoOn = event.videoOn;

		if (!TabeebConnect.clientCanConnect())
		{
			console.warn("Not adding video class since they can't connect");
			videoOn = false;
		}

		var $container = getUserContainerById(userId);
		var $video = $container.find("video, object");
		var $avatar = getAvatarElement($container);


		console.log("Video Mute Change", event);

		if (videoOn === true)
		{
			$avatar.hide().css("height", $video.height());
			$container.addClass("video");
			$container.find("video, object").show();
			$container.find(".tabeebVideoIndicator").css({
				"background": "",
				"color": ""
			});
			console.log("Settings to normal", $avatar);
		}
		else
		{
			$container.removeClass("video");
			if ($video.height() > 0)
				$avatar.show().css("height", $video.height());
			$container.find("video, object").hide();

			console.log("Settings to gray and white", $avatar);

			$container.find(".tabeebVideoIndicator").css({
				"background": "gray",
				"color": "white"
			});
		}
		$container.find(".tabeebBlankAvatar").css("height", "");

		var user = userMgr.find(userId);
		console.log(user.displayName + " turned their video to", videoOn);
		positionPresenterName();
	}

	function onLargeVideoToggled (event) {
		var isVisible = event.active;
		if (isVisible)
		{
			$panel.find(".tabeebVideoIndicator").hide();
			$panel.find(".tabeebShareIndicatorText").text("Share Document");
		}
		else
		{
			$panel.find(".tabeebVideoIndicator").show();
			$panel.find(".tabeebShareIndicatorText").text("Share Screen");
		}
		positionPresenterName();
	}

	function onAudioMuteChange (event) {
		var userId = event.userId;
		var audioOn = event.audioOn;
		var $container = getUserContainerById(userId);
		if (audioOn)
		{
			$container.addClass("audio");
			$container.find(".tabeebAudioIndicator").css({
				"background": "",
				"color": ""
			});
		}
		else
		{
			$container.removeClass("audio");
			$container.find(".tabeebAudioIndicator").css({
				"background": "gray",
				"color": "white"
			});
		}

		var user = userMgr.find(userId);
		console.log(user.displayName + " turned their audio to", audioOn);
	}

	function togglePresenterAvatarVisibile (flag) {
		$presenterContainer.find("img, .tabeebBlankAvatar").hide();
		if (flag === true) {

		}
		else if (flag === false) {

		}
		else {

		}
	}

	function onPresenterChanged (event) {
		var userId = event.presenterId;
		var videoOn = event.presenterVideoOn;

		if (userId && userId.length > 0)
		{
			onAudioMuteChange({userId: userId, audioOn: true});
			onVideoMuteChange({userId: userId, videoOn: !presentationMgr.isVideoMuted(userId)});

			var user = userMgr.find(userId);

			if (user.avatarUrl && user.avatarUrl.length > 0)
			{
				$presenterContainer.find("img").attr("src", user.avatarUrl);
				$presenterContainer.find(".tabeebBlankAvatar").hide();
			}
			else
			{
				if (presentationMgr.isVideoMuted(userId))
				{
					$presenterContainer.find(".tabeebBlankAvatar").show().find("span").text(TabeebPlayerUtil.getInitials(user.displayName));
					$presenterContainer.find("img").hide();
				}
			}

			$presenterName.text(user.displayName);
			positionPresenterName();
		}

		AdapterJS.webRTCReady(function() {
			var $indicators = $panel.find(".tabeebAudioIndicator, .tabeebVideoIndicator");
			$indicators.show();
		});

		if (videoOn === false) {
			togglePresenterAvatarVisibile(false);
		}
	}

	function onToggleAudioButtonClicked () {
		presentationMgr.toggleThisUsersAudio();
	}

	function onToggleVideoButtonClicked () {
		presentationMgr.toggleThisUsersVideo();
	}

	function onEndCallButtonClicked () {
		$triggerElement.trigger(TabeebEvent.disconnectFromPresentation);
	}

	function onUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var $toggleMuteButton = $panel.find(".tabeebToggleMuteButton");
		if (user.thisUser === true) {
			$toggleMuteButton.removeClass("disabled");
			if (user.annotationsMuted)
				$toggleMuteButton.addClass("disabled");
		}
	}

	function onConnectButtonClicked () {
		$triggerElement.trigger(TabeebEvent.connectToPresentation);
	}

	function onChangePresenterButtonClicked () {
		var $this = $(this);
		var $userContainer = $this.parents(".tabeebUserContainer");
		var userId = $userContainer.attr("data-id");
		console.log("Requesting change of presenter", userId);
		presentationMgr.changePresenter(userId);
	}

	function onTabeebToggleMuteAudioButtonClicked () {
		var $this = $(this);
		var $userContainer = $this.parents(".tabeebUserContainer");
		var userId = $userContainer.attr("data-id");
		if (!$userContainer.hasClass("audioMuted"))
		{
			presentationMgr.setUserMuted(userId, true);
			$userContainer.addClass("audioMuted");
			$this.css("background", "red");
		}
		else
		{
			presentationMgr.setUserMuted(userId, false);
			$userContainer.removeClass("audioMuted");
			if (presentationMgr.isAudioMuted(userId))
				$this.css("background", "gray");
			else
				$this.css("background", "");
		}
	}

	function onPresentationStarted () {
		console.log("onPresentationStarted");
		$panel.show();
	}

	function onPresentationEnded () {
		$panel.hide();
	}

	//</editor-fold>


	/**
	 * @returns {jQuery|*}
	 */
	function getPresenterVideo () {
		return $presenterContainer.find("video, object");
	}
}