/**
 * Created by cody on 9/21/15.
 */

/**
 * @param {TabeebHUDService.defaults} options
 * @param {jQuery} $triggerElement
 * @param {jQuery} $pluginContainer
 * @param {TabeebAudioService} audioService
 * @constructor
 */
function TabeebAudioRecordingBar (options, $triggerElement, $pluginContainer, audioService) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $audioBar = null;
	/**@type {jQuery}*/
	var $volumeIndicator = null;
	/**@type {jQuery}*/
	var $recordingTime = null;
	/**@type {jQuery}*/
	var $navigationBar = null;
	/**@type {jQuery}*/
	var $micButton = null;
	/**@type {jQuery}*/
	var $drawModeButton = null;

	//</editor-fold>

	var service = {
		resize: resize
	};

	init();

	return service;

	///////////////////////////

	function init () {
		$audioBar = $pluginContainer.find(".tabeebAudioRecordingBar");
		$volumeIndicator = $audioBar.find(".tabeebVolumeIndicator");
		$recordingTime = $audioBar.find(".tabeebAudioRecordingTimer");
		$navigationBar = $pluginContainer.find(".tabeebNavigationBar");
		$micButton = $pluginContainer.find(".tabeebRecordingButton, .tabeebActivateRecordingBar");
		$drawModeButton = $pluginContainer.find(".tabeebDrawModeButton");

		resize();

		bindAudioEvents();
	}

	function bindAudioEvents () {
		var $audioService = $(audioService);

		$audioService.on(TabeebAudioService.AudioEvent.recordingVolumeChanged, onRecordingVolumeChanged);
		$audioService.on(TabeebAudioService.AudioEvent.recordingStarted, onRecordingStarted);
		$audioService.on(TabeebAudioService.AudioEvent.recordingFinished, onRecordingEnded);
		$audioService.on(TabeebAudioService.AudioEvent.recordingTimeUpdated, onRecordingTimeUpdated);
	}

	//<editor-fold name="Public Functions">

	function resize () {
		var $mediaContainer = $(".tabeebPluginMainArea");

		$audioBar.css({
			left: $mediaContainer.outerWidth() / 2 - $audioBar.outerWidth() / 2,
			bottom: "15px",
			width: $navigationBar.width()
		});

		if (!TabeebInputService.isTouchDevice())
		{
			//if ($pluginContainer.width() < 575)
			//{
			//	$micButton.css('left', $drawModeButton.css('left')).css('bottom', '');
			//}
			//
			//if ($pluginContainer.width() < 425)
			//{
			//	$micButton.css('bottom', 30 + $drawModeButton.height());
			//}
			//
			//if ($pluginContainer.width() >= 575)
			//{
			//	$micButton.css('left', '').css('bottom', '');
			//}
		}
	}

	//</editor-fold>

	//<editor-fold name="Audio Events">

	function onRecordingVolumeChanged (event) {
		var perc = event.volume;
		$volumeIndicator.css('width', perc + '%');
	}

	function onRecordingStarted (event) {
		if ($(".ui-dialog").is(":visible"))
			return;

		$micButton.addClass("active");

		$pluginContainer.addClass('tabeebRecording');
		resize();
	}

	function onRecordingEnded (event) {
		resize();
		$micButton.removeClass("active");
		$pluginContainer.removeClass('tabeebRecording');
	}

	function msToTime (s) {
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;
		if (hrs.toString().length == 1)
			hrs = "0" + hrs;
		if (mins.toString().length == 1)
			mins = "0" + mins;
		if (secs.toString().length == 1)
			secs = "0" + secs;

		return hrs + ':' + mins + ':' + secs;
	}

	function onRecordingTimeUpdated (event) {
		var duration = event.currentTime;

		if (audioService.getState() == TabeebAudioService.RecordingState.Recording)
			$recordingTime.text(msToTime(duration * 1000));
		else
			$recordingTime.text('');
	}

	//</editor-fold>
}