/**
 * Created by cody on 9/16/15.
 */

/**
 * @constructor
 * @param {TabeebHUDService.defaults} options
 * @param {jQuery} $triggerElement
 * @param {jQuery} $pluginContainer
 * @param {TabeebUndoManager} undoManager
 * @param {TabeebCanvasService} canvasService
 * @param {TabeebAudioService} audioService
 */
function TabeebHUDControlBar (options, $triggerElement, $pluginContainer, undoManager, canvasService, audioService) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $controlBar = null;
	/**@type {jQuery}*/
	var $palette = null;
	/**@type {jQuery}*/
	var $shapes = null;
	/**@type {jQuery}*/
	var $drawModeButton = null;
	/**@type {jQuery}*/
	var $audioGalleryButton = null;
	/**@type {jQuery}*/
	var $microPhoneButton = null;

	//</editor-fold>

	var service = {
		setActive: setActive,
		resize: resize,
		hide: hide,
		show: show,
		setToggleButtonVisible: setToggleButtonVisible
	};

	init();

	return service;

	///////////////////////////////

	function init () {
		$controlBar = $pluginContainer.find(".tabeebControlBar");
		$palette = $pluginContainer.find(".tabeebDrawingPalette");
		$shapes = $pluginContainer.find(".tabeebShapeOptions");
		$drawModeButton = $pluginContainer.find(".tabeebDrawModeButton");
		$audioGalleryButton = $pluginContainer.find(".tabeebAudioGalleryContainerToggle");


		$microPhoneButton = $pluginContainer.find(".tabeebMicrophoneButton");
		if (audioService.canRecordAudio() === false)
		{

			$microPhoneButton.remove();
		}

		//$controlBar.find(".tabeebShapeOptionsButton").on("click", onShapeOptionsButtonClicked);
		//$controlBar.find(".tabeebOptionsButton").on("click", onOptionsButtonClicked);

		$pluginContainer.on("click", "[data-popup-toggle]", onPopupToggleButtonClicked);

		$controlBar.find(".tabeebUndoButton").on("click", onUndoButtonClicked);
		$controlBar.find(".tabeebRedoButton").on("click", onRedoButtonClicked);
		$audioGalleryButton.on("click", onAudioGalleryButtonClicked);

		$triggerElement.on(TabeebEvent.optionsUpdated, onOptionsUpdated);

		if (options.canDragControlBar === true)
			$controlBar.draggable({
				containment: $pluginContainer
			});

		if (options.canDragPalettePopup === true)
			$palette.draggable({
				containment: $pluginContainer
			});

		if (options.canDragShapePopup === true)
			$shapes.draggable({
				containment: $pluginContainer
			});

		$controlBar.addClass(getDisplay());

		options.disabledShapes.forEach(function (shape) {
			$shapes.find("[data-stroketype='" + shape + "']").addClass("tabeebHiddenButton");
		});

		if (options.hideAnnotationToggleButtonOnLoad === true) {
			setToggleButtonVisible(false);
		}
	}

	//<editor-fold name="Public Methods">

	function setActive (flag) {
		if (flag)
		{
			//$controlBar.show('fast');
			$controlBar.animate({opacity: 1}, 100).css('pointer-events', 'all');
			$drawModeButton.addClass("active");
			$drawModeButton.show();
			positionControlBar();
		}
		else
		{
			$controlBar.animate({opacity: 0}, 100).css('pointer-events', 'none');
			$drawModeButton.removeClass("active")
		}
	}

	function resize () {
		positionControlBar();
	}

	function hide () {
		$drawModeButton.hide();
	}

	function show () {
		$drawModeButton.show();
	}

	function setToggleButtonVisible (isEnabled) {
		$drawModeButton.removeClass("tabeebInvisibleButton");
		if (isEnabled === false) {
			$drawModeButton.addClass("tabeebInvisibleButton");
		}
	}

	//</editor-fold>

	function getAdjustDisplay () {
		if (options.controlBarDisplay != 'auto')
			return options.controlBarDisplay;

		var display;
		if ($pluginContainer.width() > $pluginContainer.height())
			display = 'horizontal';
		else
			display = 'vertical';

		$controlBar.removeClass('auto vertical horizontal');
		$controlBar.addClass(display);
		return display;
	}

	function getDisplay () {
		return getAdjustDisplay();
	}

	function positionControlBar () {

		var left = $drawModeButton.css('left');
		var bottom = parseFloat($drawModeButton.css('bottom')) + parseFloat($drawModeButton.outerHeight()) + 5;
		var display = getDisplay();

		if (!$drawModeButton.is(":visible") || $drawModeButton.css("visibility") === "hidden") {
			bottom = parseFloat($drawModeButton.css("bottom"));

			if (display === 'horizontal')
				$controlBar.position({
					my: "left bottom",
					at: "left bottom",
					of: $drawModeButton,
					within: $pluginContainer,
					collision: "fit"
				});
			else if (display == 'vertical')
				$controlBar.position({
					my: "left bottom",
					at: "left bottom",
					of: $drawModeButton,
					within: $pluginContainer,
					collision: "fit"
				});
			else
				console.warn("Unknown display type", display);

			return;
		}

		if (display === 'horizontal')
			$controlBar.position({
				my: "left bottom-5",
				at: "left top",
				of: $drawModeButton,
				within: $pluginContainer,
				collision: "fit"
			});
		else if (display == 'vertical')
			$controlBar.position({
				my: "left bottom-5",
				at: "left top",
				of: $drawModeButton,
				within: $pluginContainer,
				collision: "fit"
			});
		else
			console.warn("Unknown display type", display);

		var offset = $controlBar.offset();
		if (offset.top < 0)
		{
			$controlBar.addClass("tabeebControlbarTwoPerRow");
			console.warn("Not enough vertical space for the control bar.");
		}
		else
			$controlBar.removeClass("tabeebControlbarTwoPerRow");

		//$controlBar.css({
		//	left: left,
		//	bottom: bottom
		//});
	}

	function showElement ($el) {
		$el.show().animate({opacity: 1}, 100).css('pointer-events', 'all');
	}

	function hideElement ($el) {
		$el.animate({opacity: 0}, 100).css('pointer-events', 'none');
	}

	function toggleElement ($el) {
		if ($el.css('opacity') == 0 || !$el.is(":visible"))
			showElement($el);
		else
			hideElement($el);
	}

	//<editor-fold name="Button Events">

	function onUndoButtonClicked (event) {
		undoManager.undo();
		event.stopPropagation();
		event.preventDefault();
	}

	function onRedoButtonClicked () {
		undoManager.redo();
	}

	function showAudioGallery (flag) {
		if (canvasService.inVideoMode())
			flag = false;

		audioService.showAudioContainer(flag);
	}

	function onOptionsUpdated (e) {
		var options = e.options;
		if (options.readOnly === true) {
			setToggleButtonVisible(false);
			setActive(false);
		}
		else if (options.readOnly === false)
		{
		}
	}

	function onAudioGalleryButtonClicked () {
		var flag = !audioService.isAudioContainerVisible;
		showAudioGallery(flag);
	}

	function onPopupToggleButtonClicked (event) {
		var $this = $(this);
		var popupName = $this.attr("data-popup-toggle");
		var $popup = $pluginContainer.find("[data-popup-name='" + popupName + "']");
		togglePopup($popup, $this);
	}

	function hideAllPopups () {
		$pluginContainer.find("[data-popup-name]").each(function (index, element) {
			var $this = $(this);
			hideElement($this);
		});
	}

	/**
	 * @param {jQuery} $popup
	 * @param {jQuery} $triggerElement
	 */
	function togglePopup ($popup, $triggerElement) {
		hideAllPopups();
		toggleElement($popup);

		var display = getDisplay();

		if (display === 'vertical')
			$popup.position({
				my: "left+5 Center",
				at: "right center",
				of: $triggerElement,
				within: $pluginContainer
			});
		else if (display === 'horizontal')
			$popup.position({
				my: "right bottom-50",
				at: "right top",
				of: $triggerElement,
				within: $pluginContainer
			});
		else
			console.warn("Unknown display type", display);
	}

	//</editor-fold>
}