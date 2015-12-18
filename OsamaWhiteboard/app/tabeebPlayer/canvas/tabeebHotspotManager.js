/**
 * Created by cody on 9/1/15.
 */

/**
 * @param {jQuery} $triggerElement
 * @param {jQuery} $canvas
 * @param {TabeebModules} modules
 * @param {{x:Number, y:Number}} lastMousePosition
 * @param {TabeebCanvasHotspotManager.defaults} optionsIn
 * @constructor
 */
function TabeebCanvasHotspotManager ($triggerElement, $canvas, modules, lastMousePosition, optionsIn) {

	//<editor-fold name="Variables">

	var annotationMgr = modules.annotationManager;

	var opts = $.extend(TabeebCanvasHotspotManager.defaults, optionsIn);
	var self = this;
	var $self = $(this);
	var ready = false;

	var $mediaContainer = null;
	/**@type {jQuery}*/
	var $popup = null;
	/**@type {jQuery}*/
	var $popupBody = null;
	/**@type {jQuery}*/
	var $dialog = null;
	/**@type {jQuery}*/
	var $volumeIndicator = null;
	/**@type {jQuery}*/
	var $recordingTime = null;
	/**@type {jQuery}*/
	var $spinner = null;
	/**@type {HotspotAnnotation}*/
	var currentHotspot = null;
	/**@type {jQuery}*/
	var $scrollButtonContainer = null;
	/**@type {jQuery}*/
	var $pauseRecordingButton = null;
	/**@type {jQuery}*/
	var $startRecordingButton = null;
	/**@type {jQuery}*/
	var $audioPlaybackButton = null;
	/**@type {jQuery}*/
	var $thumbnailImage = null;
	/**@type {jQuery}*/
	var $replyButton = null;
	/**@type {jQuery}*/
	var $replySection = null;
	/**@type {jQuery}*/
	var $audioTab = null;
	/**@type {jQuery}*/
	var $arrow = null;

	var lastEvent = null;

	var annotationsReady = false;

	var currentAudio = null;

	var containerSize = {width: 0, height: 0};

	var sb_timer = null;
	var pendingAudioAnnotations = 0;

	//</editor-fold>

	init();

	return {
		show: show,
		hide: hide,
		dispose: dispose,
		playAudioAnnotation: playAudioAnnotation,
		getTriggerElement: function () { return $self; },
		getCurrentHotspot: function () { return currentHotspot; },
		getAudioElement: getAudio,
		focusOnComment: focusOnComment,
		resize: resize,
		onReady: onReady,
		onAnnotationsReady: onAnnotationsReady,
		toggleReplySection: toggleReplySection
	};

	//////////////////////////

	//<editor-fold name="Initialization">

	function init () {
		$mediaContainer = $canvas.parent();
		$canvas.on(TabeebCanvasService.CanvasServiceEventType.annotationClicked, onAnnotationClicked);

		$.get(TabeebPlayerUtil.getPluginBaseUrl() + "canvas/hotspotPopup.html", onHTMLLoaded);

		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationAdded, onAnnotationAdded);
		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationRemoved, onAnnotationDeleted);
		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationHiddenChanged, onAnnotationHiddenChanged);
		$(modules.audioService).on(TabeebAudioService.AudioEvent.recordingTimeUpdated, onRecordingTimeUpdated);
		$(modules.audioService).on(TabeebAudioService.AudioEvent.recordingVolumeChanged, onRecordingVolumeUpdated);
		$(modules.audioService).on(TabeebAudioService.AudioEvent.audioPlaybackReady, onAudioPlaybackReady);
		$(modules.audioService).on(TabeebAudioService.AudioEvent.audioPlaybackCleared, onAudioPlaybackCleared);
	}

	function initDialogUI () {
		var dialogOptions = $.extend({
			autoOpen: false,
			resizable: false,
			dialogClass: "tabeebDialog",
			draggable: false,
			modal: true,
			open: function (event) {
				onBoundingFunctionStart();

				$(".tabeebDialog .ui-dialog-titlebar").remove();

				if (!$dialog)
					initDialog();

				var $overlay = $(".ui-widget-overlay");
				$overlay.addClass("tabeebWidgetOverlay");
				$overlay.css({
					'left': $mediaContainer.parent().offset().left,
					'top': $mediaContainer.parent().offset().top,
					'width': $mediaContainer.parent().outerWidth(),
					'height': $mediaContainer.parent().outerHeight()
				}).off('click').on('click', function () {
					hide();
				});

				$self.trigger($.Event(TabeebCanvasHotspotManager.Events.dialogOpened, {hotspotAnnotation: currentHotspot}));

				$popup.find(".hotspotDialogTabs").tabs({
					heightStyle: 'fill'
				});

				resizeBody();

				$dialog.parent().find(".ui-resizable-n, .ui-resizable-w, .ui-resizable-nw, .ui-resizable-sw").remove();
				onBoundingFunctionStart();
				setDialogIntoBounds(containerSize);

				if ($popupBody.find(".tabeebHotspotMessage").length == 0) {
					toggleReplySection(true);
				}
				else {
					toggleReplySection(false);
				}

			},
			close: function (event) {
				$self.trigger($.Event(TabeebCanvasHotspotManager.Events.dialogClosed, {annotation: currentHotspot}));
				defocusAllComments();
				currentHotspot = null;
			},
			resize: onDialogResize,
			resizeStop: onResizeStop,
			resizeStart: onBoundingFunctionStart
		}, opts.uiDialogOptions);

		$popup.dialog(dialogOptions);
	}

	function onHTMLLoaded (data) {

		modules.player.$element.on(TabeebEvent.optionsUpdated, onOptionsUpdated);

		$popup = $(data);
		$popupBody = $popup.find(".hotspotDialogBody");
		$recordingTime = $popup.find(".hotspotDialogAudioTimer");
		$volumeIndicator = $popup.find(".hotspotDialogRecordingVolume");
		$spinner = $popup.find(".hotspotDialogAudioSpinner");
		$scrollButtonContainer = $popup.find(".hotspotDialogScrollButtonContainer");
		$audioTab = $popup.find(".tabeebHotspotAudioTab");
		$replyButton = $popup.find(".hotspotReplyButton");
		$replySection = $popup.find(".hotspotDialogHeader");
		$thumbnailImage = $popup.find(".hotspotThumbnail");

		if (!setThumbnailImageToThisUser())
		{
			$(modules.userManager).on(TabeebUserManager.Events.userAdded, setThumbnailImageToThisUser);
		}
		initDialogUI();
		$popup.find(".hotspotDialogTextInput").keydown(function (e) {
			if (e.keyCode == 13 && e.ctrlKey) // Enter Key
			{
				var $input = $(".hotspotDialogTextInput:visible");
				var text = $input.val();
				if (text == null || text.replace("\n", "").length <= 0)
					return false;

				e.preventDefault();
				onTextSubmit();
			}
		});
		$popup.find(".hotspotDialogTextSubmitButton").on('click', onTextSubmit);
		$popup.find(".hotspotDialogAudioSubmitButton").on('click', onSubmitRecordingButtonClicked);
		$popup.find(".hotspotDialogTextCancelButton").on('click', onCancelButtonClicked);
		$popup.find(".tabeebDeleteAnnotationButton").on('click', onDeletePopupButtonClicked);

		$startRecordingButton = $popup.find(".hotspotDialogRecordButton");
		$pauseRecordingButton = $popup.find(".hotspotDialogPauseRecordingButton");
		$audioPlaybackButton = $popup.find(".hotspotDialogPlayAudioRecordingButton");

		$startRecordingButton.on('click', onRecordingButtonClicked);
		$pauseRecordingButton.on('click', onPauseRecordingButtonClicked);
		$popup.find(".tabeebHotspotResetAudioButton").on("click", onResetRecordingButtonClicked);
		$audioPlaybackButton.on('click', onPlaybackAudioButtonClicked);

		$popup.on('click', '.deleteButton', onDeleteButtonClicked);
		$popup.on('click', '.tabeebHotspotMessage', onCommentClicked);

		$replyButton.on("click", onReplyButtonClicked);

		if (!modules.audioService.isBrowserCompatible())
			$popup.find(".tabeebHotspotAudioTab").remove();

		if (RTCBrowserType.isFirefox())
			$pauseRecordingButton.hide();

		ready = true;

		if (modules.audioService.canRecordAudio() === false) {
			$popup.find("a[href='#audio-tab']").hide();
		}

		$self.trigger(createHotspotReadyEvent());
	}

	//</editor-fold>

	function defocusAllComments () {
		var $focusedComments = $popup.find(".tabeebHotspotMessage.highlighted");
		$focusedComments.each(function (index, el) {
			var $this = $(this);
			$this.removeClass("highlighted");
			var annotationId = $this.attr("data-id");
			var annotation = annotationMgr.find(annotationId);
			annotationMgr.unselectAnnotation(annotation);
		});
	}

	function focusOnComment (annotationOrAnnotationId) {
		if (annotationsReady === true)
		{
			var annotation = annotationMgr.find(annotationOrAnnotationId);
			var $comment = getMessagejQueryById(annotation.id);
			var scrollY = $comment.offset().top - ($popupBody.offset().top - $popupBody.scrollTop());
			defocusAllComments();
			$comment.addClass("highlighted");
			$popupBody.animate({scrollTop: scrollY}, 'slow');
			annotationMgr.selectAnnotation(annotation, false, false);
			$self.trigger(event);
		}
		else
		{
			$self.one(TabeebCanvasHotspotManager.Events.annotationsReady, function () { focusOnComment(annotationOrAnnotationId); });
		}
	}

	//<editor-fold name="Public Methods">

	/**
	 * @param {Function} callback
	 */
	function onReady (callback) {
		if (ready)
			callback(createHotspotReadyEvent());
		else
			$self.one(TabeebCanvasHotspotManager.Events.hotspotReady, callback);
	}

	/**
	 * @param {Function} callback
	 */
	function onAnnotationsReady (callback) {
		if (annotationsReady === true)
			callback();
		else
		{
			console.log("Adding listener for annotations Ready event.");
			$self.one(TabeebCanvasHotspotManager.Events.annotationsReady, function () {
				console.log("Triggering callback", callback);
				callback();
			});
		}
	}

	function resize () {
		if ($popup)
		{
			var maxWidth = Math.min(opts.uiDialogOptions.minWidth, parseInt($(document.body).width()));
			$popup.dialog("option", "maxWidth", maxWidth);
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @param {Boolean} autoScroll
	 * @param {Event} event
	 */
	function show (annotation, event, autoScroll) {
		event = null;

		if (annotation != currentHotspot)
		{
			annotationsReady = false;
			generateHTML(annotation);
		}

		if (annotationMgr.getChildAnnotations(annotation).length > 0)
			$popupBody.show();

		annotation.highlighted = false;

		$popup.dialog('open');

		if (autoScroll == null || autoScroll === true)
		{
			setTimeout(function () {
				scrollToBottom();
				if (containerSize.width > 0)
					setDialogIntoBounds(containerSize);
			}, 50);
		}

		if (annotation.canDelete === true)
			$popup.find(".tabeebDeleteAnnotationButton").show();
		else
			$popup.find(".tabeebDeleteAnnotationButton").hide();

		annotationsReady = true;
		$self.trigger($.Event(TabeebCanvasHotspotManager.Events.annotationsReady, {}));

		onOptionsUpdated();
		positionDialogToHotspot();
	}

	function onOptionsUpdated (e) {
		/**@type {$.fn.tabeebPlayer.defaults}*/
		var options = modules.options;
		if (options.readOnly === true || (currentHotspot != null && (currentHotspot.permission == TabeebAnnotationPermissionType.readOnly))) {
			$replyButton.hide();
			$replySection.hide();
		}
		else if (!$replyButton.is(":visible") && !$replySection.is(":visible")) {
			$replyButton.show();
		}

		if (currentHotspot != null) {
			var $deleteButton = $popup.find(".tabeebDeleteAnnotationButton");
			if (currentHotspot.permission == TabeebAnnotationPermissionType.readOnly || currentHotspot.permission == TabeebAnnotationPermissionType.replyOnly || currentHotspot.canDelete === false) {
				$deleteButton.hide();
			}
			else
			{
				$deleteButton.show();
			}
		}
	}

	function positionDialogToHotspot () {
		var offset = modules.canvasService.getOffsetOfAnnotation(currentHotspot);
		var event = $.Event("", {
			pageX: parseInt(offset.left + offset.width),
			pageY: parseInt(offset.top + offset.height)
		});

		$popup.dialog('option', 'position', {
			my: "left+25 top-64",
			at: "left top",
			collision: "fit",
			of: event,
			using: function (offset, info) {
				if (offset.left != event.pageX + 25) { // x-collision
					$arrow.hide();
				}
				else {
					$arrow.show();
					$arrow.css("top", "");
					if (offset.top != event.pageY - 64) { // y-collision
						var offsetY = event.pageY - offset.top - 64;
						var top = parseInt($arrow.css("top"));
						top += offsetY;
						$arrow.css("top", top);
					}
				}

				$(this).css({
					left: offset.left + 'px',
					top: offset.top + 'px'
				});
			}
		});
	}

	function hide () {
		if ($popup == null || !$popup.is(":visible"))
			return;

		if ($popup)
			$popup.dialog('close');

		if ($canvas)
			$canvas.click().focus();
	}

	function dispose () {
		hide();
		currentHotspot = null;
	}

	function playAudioAnnotation (audioAnnotationOrAnnotationId, currentTime) {
		var id = (typeof audioAnnotationOrAnnotationId == 'string') ? audioAnnotationOrAnnotationId : audioAnnotationOrAnnotationId.id;

		/**@type {Audio}*/
		var audio = getMessagejQueryById(id).find("audio")[0];
		bindAudioEvents($(audio));

		if (audio.readyState >= 3) // 4 = HAVE_ENOUGH_DATA - enough data available to start playing
		{
			console.log("Audio should be ready.");
			if (currentTime)
				audio.currentTime = currentTime;

			audio.play();
		}
		else
		{
			$(audio).on("canplaythrough loadedmetadata", function () {
				if (currentTime)
					audio.currentTime = currentTime;

				audio.play();
			});
		}
	}

	function getAudio (audioAnnotationOrAnnotationId) {
		var id = (typeof audioAnnotationOrAnnotationId == 'string') ? audioAnnotationOrAnnotationId : audioAnnotationOrAnnotationId.id;
		var audio = getMessagejQueryById(id).find("audio")[0];
		return audio;
	}

	//</editor-fold>

	function setThumbnailImageToThisUser () {
		var thisUser = modules.userManager.getThisUser();
		if (!thisUser)
			return false;

		if (thisUser.avatarUrl && thisUser.avatarUrl.length > 0)
		{
			$thumbnailImage.attr('src', thisUser.avatarUrl);
		}
		else
		{
			$thumbnailImage.replaceWith(TabeebPlayerUtil.createHTMLForBlankAvatar(thisUser.displayName).addClass("hotspotThumbnail")[0]);
		}

		$(modules.userManager).off(TabeebUserManager.Events.userAdded, setThumbnailImageToThisUser);
		return true;
	}

	function canDeleteHotspot () {
		if (currentHotspot == null)
			return false;

		if (currentHotspot.canDelete === false)
			return false;

		if (currentHotspot.permission == TabeebAnnotationPermissionType.replyOnly) {
			return false;
		}

		return true;
	}

	function createHotspotReadyEvent () {
		return $.Event(TabeebCanvasHotspotManager.Events.hotspotReady, {
			popupElement: $popup[0],
			textInputElement: $popup.find(".hotspotDialogTextInput")[0]
		});
	}

	function onDrag () {
		setDialogIntoBounds(containerSize);
	}

	function onBoundingFunctionStart () {
		var $body = $("body");
		containerSize.width = $body.innerWidth() - 35;
		containerSize.height = $body.innerHeight() - 35;
	}

	function onResizeStop () {
		setDialogIntoBounds(containerSize);
	}

	function onDragStop () {
		setDialogIntoBounds(containerSize);
	}

	/**
	 * @param {{width:Number, height:Number}} size
	 */
	function setDialogIntoBounds (size) {
		if (size == null)
			size = containerSize;

		$dialog.css('max-width', size.width);
		$dialog.css('max-height', size.height);

		var dialogWidth = $dialog.width();
		var dialogHeight = $dialog.height();

		var dialogLeft = $dialog.offset().left;
		var dialogTop = $dialog.offset().top;

		var maxLeft = Math.max(0, size.width - dialogWidth);
		var maxTop = Math.max(0, size.height - dialogHeight);
		if (dialogLeft > maxLeft)
			$dialog.css('left', maxLeft);
		if (dialogTop > maxTop)
			$dialog.css('top', maxTop);
		if (dialogLeft < 0)
			$dialog.css('left', 0);
		if (dialogTop < 0)
			$dialog.css('top', 0);
	}

	function initDialog () {
		$dialog = $(".tabeebDialog");
		$arrow = $('<div class="hotspotArrowBorder"></div><div class="hotspotArrow"></div>');
		$dialog.append($arrow);
	}

	function scrollToBottom () {
		$popupBody.animate({scrollTop: $popupBody[0].scrollHeight}, 'slow');
	}

	function onDialogResize (event) {
		resizeBody();
		setDialogIntoBounds(containerSize);
	}

	//<editor-fold name="Audio Events">

	function onAudioPlaybackReady () {
		currentAudio = null;
		$popup.find(".hotspotDialogAudioSubmitButton").removeClass("disabled");
		$audioPlaybackButton.removeClass("disabled");
		$spinner.hide();
	}

	function onAudioPlaybackCleared () {
		currentAudio = null;
		$popup.find(".hotspotDialogAudioSubmitButton");
		$audioPlaybackButton.addClass("disabled");
		$spinner.hide();
		$startRecordingButton.removeClass("disabled");
		$recordingTime.text("00:00:00");
	}

	function onRecordingVolumeUpdated (event) {
		var volume = event.volume;
		$volumeIndicator.width(volume);
	}

	function onRecordingTimeUpdated (event) {
		var duration = event.currentTime;

		if (modules.audioService.getState() == TabeebAudioService.RecordingState.Recording || modules.audioService.getState() == TabeebAudioService.RecordingState.Paused || currentAudio != null)
			$recordingTime.text(msToTime(duration * 1000));
		//else
		//	$recordingTime.text("00:00:00");
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

	//</editor-fold>

	function createHotspotEvent (type) {
		return $.Event(type, {
			hotspotAnnotationId: currentHotspot.id
		});
	}

	function resizeDialog (width, height) {
		$(".tabeebDialog").css({
			'width': Math.min($popup.dialog("option", "minWidth"), width),
			'height': height
		});
		resizeBody();
	}

	function resizeBody (height) {
		if (!height)
			height = parseFloat($(".tabeebDialog").height());

		var tabbedPanelHeight = parseFloat($popup.find(".hotspotDialogHeader").height());

		var bodyHeight = parseFloat(height) - tabbedPanelHeight + 20;

		$popupBody.css({
			height: 'auto',
			'max-height': bodyHeight
		});

		$scrollButtonContainer.height(bodyHeight);
	}

	//<editor-fold name="GUI">
	function onSubmitRecordingButtonClicked () {
		if ($(this).hasClass("disabled")) return;
		$(this).addClass("disabled");
		modules.audioService.stopRecording(currentHotspot);
		$spinner.show();
		pendingAudioAnnotations++;
		$startRecordingButton.removeClass("active disabled");
		$audioPlaybackButton.addClass("disabled");
		$recordingTime.text("00:00:00");
		$volumeIndicator.width(0);
	}

	function onRecordingButtonClicked () {
		if ($(this).hasClass("disabled")) return;

		var audioState = modules.audioService.getState();

		$volumeIndicator.width(0);
		if (audioState == TabeebAudioService.RecordingState.Recording)
		{

			modules.audioService.stopRecording(currentHotspot, true);
			$spinner.show();
			$pauseRecordingButton.addClass("disabled");
			$startRecordingButton.addClass("disabled");
			$popup.find(".tabeebHotspotRecordingIndicator").fadeOut();
			$audioTab.removeClass("recording");
		}
		else
		{
			$audioTab.addClass("recording");
		}

		if (audioState == TabeebAudioService.RecordingState.Stopped || audioState == TabeebAudioService.RecordingState.Paused)
		{
			modules.audioService.startRecording(currentHotspot);
			$startRecordingButton.addClass("active");
			$popup.find(".tabeebHotspotRecordingIndicator").fadeIn();
			$pauseRecordingButton.removeClass("disabled");
		}
	}

	function onPauseRecordingButtonClicked () {
		if ($(this).hasClass("disabled")) return;

		if (modules.audioService.getState() == TabeebAudioService.RecordingState.Recording)
		{
			modules.audioService.pauseRecording();
			$(this).addClass("disabled");
			$startRecordingButton.removeClass("disabled active");
		}
		else
		{
			var audio = modules.audioService.getPlaybackAudio();
			modules.audioService.playbackCurrentRecording();
			if (audio.paused)
			{
				$audioPlaybackButton.removeClass("disabled");
				$(this).addClass("disabled");
			}
			else
			{
				$audioPlaybackButton.addClass("disabled");
			}
		}
	}

	function onResetRecordingButtonClicked () {
		$popup.find(".hotspotDialogAudioSubmitButton").addClass("disabled");
		modules.audioService.clearRecording();
		$volumeIndicator.width(0);
		$popup.find(".hotspotDialogRecordButton").removeClass("active");
	}

	function onDeleteButtonClicked (event) {
		var $this = $(this);
		var annotationId = $this.hasClass("tabeebHotspotMessage") ? $this.data("id") : $this.parents(".tabeebHotspotMessage").data("id");
		var annotation = annotationMgr.find(annotationId);

		if (annotation.permission == TabeebAnnotationPermissionType.readOnly || currentHotspot.permission == TabeebAnnotationPermissionType.replyOnly) {
			return;
		}

		if (confirm("Delete?"))
		{
			if (!annotationId)
			{
				console.warn("Could not find data-id attribute", this);
				return;
			}

			$triggerElement[0].$element.trigger($.Event(TabeebEvent.annotationDeleted), annotation);
		}
	}

	function onCommentClicked (event) {
		var annotationId = $(this).data("id");
		$self.trigger($.Event(TabeebCanvasHotspotManager.Events.commentFocused, {annotationId: annotationId}));
		focusOnComment(annotationId);
	}

	function onTextSubmit () {
		var $input = $(".hotspotDialogTextInput:visible");
		var text = $input.val();
		if (!text || text.length <= 0)
			return;

		$input.val('');
		var textInfo = {
			text: text,
			color: "black",
			fontSize: 0,
			point: {x: 0, y: 0}
		};

		$triggerElement.trigger(TabeebCanvasService.CanvasServiceEventType.textComplete, {
			textInfo: textInfo,
			type: TabeebAnnotationType.Text,
			parentId: currentHotspot.id
		});
	}

	function onPlaybackAudioButtonClicked () {
		if ($(this).hasClass("disabled")) return;

		var justCreatedPlayback = modules.audioService.playbackCurrentRecording();
		var audio = modules.audioService.getPlaybackAudio();
		if (justCreatedPlayback)
		{
			currentAudio = audio;
			$(currentAudio).on("ended", function () {
				$pauseRecordingButton.addClass("disabled");
				$audioPlaybackButton.removeClass("disabled");
			});
		}

		if (currentAudio.paused)
		{
			$pauseRecordingButton.addClass("disabled");
			$audioPlaybackButton.removeClass("disabled");
		}
		else
		{
			$pauseRecordingButton.removeClass("disabled");
			$audioPlaybackButton.addClass("disabled");
		}
	}

	function onCancelButtonClicked () {
		if ($popup.find('.tabeebHotspotMessage').length == 0)
		{
			var $input = $(".hotspotDialogTextInput:visible");
			$input.val('');
			hide();
		}
		else
		{
			onReplyButtonClicked();
		}
	}

	function onDeletePopupButtonClicked () {
		if (canDeleteHotspot())
			$self.trigger($.Event(TabeebCanvasHotspotManager.Events.deletePopupClicked));
	}

	/**
	 * @param {Boolean} [flag]
	 */
	function toggleReplySection (flag) {
		if (flag == null)
		{
			$replyButton.toggle();
			$replySection.toggle(!$replyButton.is(":visible"));
		}
		else if (flag === true) {
			$replyButton.hide();
		}
		else if (flag === false) {
			$replyButton.show();
		}

		$replySection.toggle(!$replyButton.is(":visible"));
		if ($replyButton.is(":visible")) {
			var newBodyHeight = $popupBody.height() + $replySection.outerHeight();
			$popupBody.css("max-height", Math.max(100, newBodyHeight));
		}
		else {
			var newBodyHeight = $popupBody.height() - $replySection.outerHeight();
			$popupBody.css("max-height", Math.max(100, newBodyHeight));
		}
	}

	function onReplyButtonClicked () {
		toggleReplySection();

		var $input = $(".hotspotDialogTextInput:visible").focus();

		positionDialogToHotspot();
	}

	function onAnnotationClicked (event) {
		var annotation = event.annotation;
		if (annotation.type != TabeebAnnotationType.Hotspot) return;

		show(annotation, event);
	}

	//</editor-fold>

	//<editor-fold name="Annotation Manager Events">
	function onAnnotationAdded (event) {
		var annotation = event.annotation;
		if (annotation.type == TabeebAnnotationType.Hotspot && annotation.autoOpen === true)
		{//Your recently added hotspot
			show(annotation);
			modules.videoService.pause();
		}

		if (!currentHotspot) return;

		if (annotation.parentId == currentHotspot.id)
		{
			$popupBody.show();
			addHTMLFromAnnotation(annotation);
			scrollToBottom();
			toggleReplySection(false);
		}

		if (annotation.layerId == opts.layerId)
		{
			pendingAudioAnnotations--;
			console.log("Pending Audio Annotations", pendingAudioAnnotations);
			if (pendingAudioAnnotations <= 0)
			{
				$spinner.hide();
				pendingAudioAnnotations = 0;
			}
		}

		show(currentHotspot, lastEvent, false);
	}

	function onAnnotationDeleted (event) {
		if (!currentHotspot) return;
		var annotation = event.annotation;
		if (currentHotspot.id == annotation.id)
		{
			defocusAllComments();
			$popup.dialog('close');
		}
		else
		{
			getMessagejQueryById(annotation.id).remove();
			if ($popup.find(".tabeebHotspotMessage").length == 0)
				$popupBody.hide();
		}
	}

	function onAnnotationHiddenChanged (event) {
		var annotation = event.annotation;
		var isHidden = event.isHidden;

		var $comments = getCommentById(annotation.id);

		if (isHidden === true)
			$comments.hide();
		else
			$comments.show();

		if (getVisibleComments().length == 0)
			hide();
	}

	/**
	 * @returns {jQuery}
	 */
	function getAllComments () {
		return $popup.find(".tabeebHotspotMessage");
	}

	function getCommentById (annotationId) {
		return $popup.find(".tabeebHotspotMessage[data-id='"+annotationId+"']");
	}

	function getVisibleComments () {
		return $popup.find(".tabeebHotspotMessage:visible");
	}

	/**
	 * @param {String} annotationId
	 * @returns {jQuery}
	 */
	function getMessagejQueryById (annotationId) {
		return $popup.find('.tabeebHotspotMessage[data-id="' + annotationId + '"]');
	}

	//</editor-fold>

	//<editor-fold name="HTML Methods">
	/**
	 * @param {TabeebAnnotation} parentAnnotation
	 */
	function generateHTML (parentAnnotation) {
		annotationsReady = false;
		var childrenAnnotations = annotationMgr.getChildAnnotations(parentAnnotation);
		currentHotspot = parentAnnotation;

		$popupBody.find(".tabeebHotspotMessage").remove();

		var count = 0;

		for (var i = 0; i < childrenAnnotations.length; i++)
		{
			addHTMLFromAnnotation(childrenAnnotations[i], false);
			count++;
		}

		if (count == 0)
		{
			$popupBody.hide();
		}

		bindAudioEvents();
	}

	function createHTMLForDeleteButton () {
		if (!TabeebInputService.isTouchDevice())
			return '<div class="deleteButton glyphicon glyphicon-remove"></div>';
		else
			return '<div class="deleteButton mobile glyphicon glyphicon-remove"></div>';
	}

	function bindAudioEvents ($audioEl) {
		var audioEvents = "abort ended error pause play ratechange seeked volumechange";
		if ($audioEl)
			$audioEl.off(audioEvents).on(audioEvents, onAudioElementEvent);
		else
			$popupBody.find("audio").off(audioEvents).on(audioEvents, onAudioElementEvent);
	}

	function onAudioElementEvent (event) {
		var annotationId = $(this).parents(".tabeebHotspotMessage").data("id");
		var annotation = annotationMgr.find(annotationId);
		this.annotation = annotation;
		event.currentTime = this.currentTime;
		event.volume = this.volume;
		event.muted = this.muted;

		var hotspotEvent = $.Event(TabeebCanvasHotspotManager.Events.audioEvent, {
			parentAnnotation: currentHotspot,
			audioAnnotation: annotation,
			audioEvent: event
		});
		$(self).trigger(hotspotEvent);
	}

	/**
	 * @param {Date} date
	 */
	function convertDateToString (date) {
		var now = new Date();
		if (now.toDateString() == date.toDateString())
		{
			return date.toLocaleTimeString(navigator.language, {
					hour: '2-digit',
					minute: '2-digit'
				}) + ", today";
		}
		else
		{
			return date.toLocaleDateString();
		}
	}

	function linkify (inputText) {
		//inputText = TabeebPlayerUtil.escapeHtml(inputText);
		var replacedText, replacePattern1, replacePattern2, replacePattern3;

		//URLs starting with http://, https://, or ftp://
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

		//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
		replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

		//Change email addresses to mailto:: links.
		replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
		replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

		return replacedText;
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @param {Boolean} doBindEvents
	 */
	function addHTMLFromAnnotation (annotation, doBindEvents) {
		var html = '';
		var dateCreated = new Date(annotation.dateCreated);
		var user = modules.userManager.find(annotation.layerId);

		if (annotation.hidden === true)
			html += '<div class="tabeebHotspotMessage" data-id="' + annotation.id + '" style="display: none;">';
		else
			html += '<div class="tabeebHotspotMessage" data-id="' + annotation.id + '">';

		if (annotation.type == TabeebAnnotationType.Text)
		{
			var messageInfo = annotation.textInfo.text;

			if (user.avatarUrl)
				html += '<img src="' + user.avatarUrl + '" class="hotspotThumbnail">';
			else
				html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).addClass("hotspotThumbnail")[0].outerHTML;

			html += '<p>';
			html += '<strong style="font-weight: bold; padding-right: 2px">' + user.displayName + '</strong><br>';
			html += '<span class="tabeebHotspotMessageBody">';
			html += linkify(annotation.textInfo.text);
			html += '</span><br>';
			html += '<br><span class="hotspotDateString">' + convertDateToString(dateCreated) + '</span>';
			html += '</p>';

			if (annotation.canDelete !== false)
				html += createHTMLForDeleteButton();

			html += '</div>';
		}
		else if (annotation.type == TabeebAnnotationType.Audio)
		{
			var messageInfo = annotation.caption;
			if (user.avatarUrl)
				html += '<img src="' + user.avatarUrl + '" class="hotspotThumbnail">';
			else
				html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).addClass("hotspotThumbnail")[0].outerHTML;

			html += '<p>';
			html += '<strong style="font-weight: bold; padding-right: 2px">' + user.displayName + ' </strong><br>';
			html += '<audio controls data-id="' + annotation.id + '"><source src="' + annotation.url + '"></audio>';
			html += '<br><span class="hotspotDateString">' + convertDateToString(dateCreated) + '</span>';
			html += '</p>';
			if (annotation.canDelete !== false)
				html += createHTMLForDeleteButton();
			html += '</div>';
		}
		else
		{
			console.warn("Unhandled annotation type", annotation.type);
			return;
		}

		var $html = $(html);

		$popupBody.append($html);

		if (doBindEvents === true)
			bindAudioEvents();
	}

	//</editor-fold>
}

/**
 * @type {String}
 * @readonly
 * @enum
 */
TabeebCanvasHotspotManager.Events = {
	dialogOpened: "tchsmDialogOpened",
	dialogClosed: "tchsmDialogClosed",
	audioEvent: "tchsmAudioEvent",
	commentFocused: "tchsmCommentFocused",
	commentBlurred: "tchsmCommentBlurred",
	deletePopupClicked: "tchsmDeletePopupClicked",
	hotspotReady: "tchsmHotspotReady",
	annotationsReady: "tchsmAnnotationReady"
};

TabeebCanvasHotspotManager.defaults = {
	thumbnailImageUrl: null,
	layerId: '',
	uiDialogOptions: {
		width: 500
	}
};