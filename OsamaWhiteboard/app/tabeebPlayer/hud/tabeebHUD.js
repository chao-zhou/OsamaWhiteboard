/**
 * Created by cody on 9/1/15.
 * Slowly refactoring items over to TabeebHUDService from tabeebPlayer
 */

/**
 * @param {jQuery} $pluginContainer
 * @param {jQuery} $triggerElement
 * @param {TabeebModules} modules
 * @param {TabeebHUDService.defaults} optionsIn
 * @returns {{setScreenMode: setScreenMode, setDrawMode: setDrawMode, getScreenMode: Function, getDrawMode: Function, resize: resize}}
 * @constructor
 */
function TabeebHUDService ($pluginContainer, $triggerElement, modules, optionsIn) {

	//<editor-fold name="Variables">

	/**@type {TabeebHUDService.defaults}*/
	var options = $.extend(TabeebHUDService.defaults, optionsIn);
	/**@type {jQuery}*/
	var $palette = null;
	/**@type {jQuery}*/
	var $shapes = null;
	/**@type {jQuery}*/
	var $mediaContainer = null;

	var screenMode = options.defaultScreenMode;
	var drawMode = options.defaultDrawMode;

	/**@type {jQuery}*/
	var $this = $(this);

	/**@type {TabeebHUDNavigationBar}*/
	var navigationHUD;
	/**@type {TabeebHUDControlBar}*/
	var controlbarHUD;
	/**@type {TabeebAudioRecordingBar}*/
	var audioHUD;
	/**@type {TabeebPaletteService}*/
	var paletteService;

	//</editor-fold>

	init();

	return {
		setScreenMode: setScreenMode,
		setDrawMode: setDrawMode,
		getScreenMode: function () { return screenMode; },
		getDrawMode: function () { return drawMode; },
		resize: resize,
		getOptions: function () { return options; },
		setReadOnly: setReadOnly
	};

	//////////////////////////////////

	function init () {
		paletteService = new TabeebPaletteService(options, $triggerElement, $pluginContainer, modules.canvasService);
		navigationHUD = new TabeebHUDNavigationBar(options, $triggerElement, $pluginContainer, modules.canvasService, modules.pdfManager, modules.presenterManager);
		controlbarHUD = new TabeebHUDControlBar(options, $triggerElement, $pluginContainer, modules.undoManager, modules.canvasService, modules.audioService);
		audioHUD = new TabeebAudioRecordingBar(options, $this, $pluginContainer, modules.audioService);

		modules.paletteService = paletteService;
		modules.controlbarHUD = controlbarHUD;
		modules.navigationHUD = navigationHUD;


		$palette = $pluginContainer.find(".tabeebDrawingPalette");
		$shapes = $pluginContainer.find(".tabeebShapeOptions");
		$mediaContainer = $pluginContainer.find(".tabeebMediaContainer");

		setDrawMode(options.defaultDrawMode);
		setScreenMode(options.defaultScreenMode);

		bindEvents();

		if (TabeebInputService.isTouchDevice())
			options.controlBarDisplay = options.controlBarMobileDisplay;
	}

	function resize () {
		navigationHUD.resize();
		controlbarHUD.resize();
		position();
		audioHUD.resize();
	}

	function position () {
		var $navigationBar = $pluginContainer.find(".tabeebNavigationBar");
		var $micButton = $pluginContainer.find(".tabeebHUD.tabeebRecordingButton");
		var $drawModeButton = $pluginContainer.find(".tabeebDrawModeButton");
		var $audioGalleryButton = $pluginContainer.find(".tabeebAudioGalleryButton");

		var $all = $pluginContainer.find(".tabeebHUD.tabeebRecordingButton, .tabeebDrawModeButton, .tabeebAudioGalleryButton");
		$all.css({
			'left': '',
			'bottom': ''
		});

		if ($navigationBar.collidesWith($drawModeButton)) {
			$drawModeButton.css('bottom', 30 + $drawModeButton.height());
			$navigationBar.css("left", $drawModeButton.css("left"))
		}

		if ($navigationBar.collidesWith($audioGalleryButton)) {
			$audioGalleryButton.css('bottom', 30 + $drawModeButton.height());
		}
	}

	function bindEvents () {
		setupAudioButtons();
		setupGalleryButtons();
		setupShapeButtons();

		$pluginContainer.find(".tabeebDrawMode").on('click', onSelectableDrawModeButtonClicked);
		$pluginContainer.find(".tabeebScreenMode").on('click', onSelectableScreenModeButtonClicked);
	}

	function setupShapeButtons() {
		$pluginContainer.find("[data-stroketype]").on('click', onShapeTypeClicked);
	}

	function onShapeTypeClicked() {
		var $item = $(this);
		$pluginContainer.find(".tabeebPenColor").removeClass("selected");
		$item.parents(".tabeebShapeOptions").find(".tabeebShapeItem").removeClass("selected");
		$item.addClass("selected");
		/**@type {String}*/
		var type = $item.data("stroketype");

		if (type.indexOf("_Hotspot") >= 0) {
			modules.canvasService.setAttachHotSpotToAnnotations(true);
			type = type.replace("_Hotspot", "");
		}
		else {
			modules.canvasService.setAttachHotSpotToAnnotations(false);
		}

		modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode[type]);
		selectButton($item);
		paletteService.updatePenColor();
	}

	//<editor-fold name="Draw and Screen Mode">

	function onSelectableScreenModeButtonClicked () {
		var $item = $(this);
		var mode = $item.data("screenmode");

		if (mode.indexOf("/") >= 0)
		{
			var screenModes = mode.split('/');
			if (screenMode == TabeebScreenModeType[screenModes[1]])
			{
				setScreenMode(TabeebScreenModeType[screenModes[0]]);
				console.info("Setting screen mode to ", TabeebScreenModeType[screenModes[0]]);
			}
			else
			{
				console.info("Setting screen mode to ", TabeebScreenModeType[screenModes[1]]);
				setScreenMode(TabeebScreenModeType[screenModes[1]]);
			}
		}
		else
			setScreenMode(TabeebScreenModeType[mode]);
	}

	function onSelectableDrawModeButtonClicked () {
		var $item = $(this);
		var drawMode = $item.data("drawmode");
		setDrawMode(TabeebDrawModeType[drawMode]);
	}

	/**
	 * @param {Boolean} flag
	 */
	function setReadOnly (flag) {
		if (flag) {
			controlbarHUD.hide()
		}
		else
		{
			controlbarHUD.show()
		}
	}

	/**
	 * @param {Number|TabeebDrawModeType} mode
	 */
	function setDrawMode (mode) {
		drawMode = mode;
		switch (mode)
		{
			case TabeebDrawModeType.Eraser:
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.Eraser);
				selectButton(".tabeebEraserButton");
				break;
			case TabeebDrawModeType.Pointer:
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.Laser);
				selectButton(".tabeebLaserPointerButton");
				break;
			case TabeebDrawModeType.Text:
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.Text);
				selectButton(".tabeebTextButton");
				break;
			case TabeebDrawModeType.Pen:
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.Pen);
				selectButton(".tabeebPenButton");
				break;
			case TabeebDrawModeType.Selection:
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.PanZoom);
				selectButton(".tabeebSelectionButton");
				break;
			case TabeebDrawModeType.Cursor:
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.Hotspot);
				selectButton(".tabeebHotspotButton");
				break;
		}

		if (mode != TabeebDrawModeType.Cursor)
			$pluginContainer.find(".tabeebCanvasCursor").hide();

		$pluginContainer.trigger($.Event(TabeebEvent.drawModeChanged, { mode: drawMode}));
	}

	function selectButton (button) {
		$pluginContainer.find(".tabeebPenColor, .tabeebControlBarButtonContainer, .tabeebDrawMode").removeClass("selected");

		if (button != null)
		{
			var $button = $pluginContainer.find(button);
			$button.addClass("selected");
			paletteService.updatePenColor(modules.canvasService.getStrokeAttributes().color);
		}
	}

	/**
	 * @param {TabeebScreenModeType} mode
	 * @param {*} [currentWhiteboardType]
	 */
	function setScreenMode (mode, currentWhiteboardType) {
		screenMode = mode;
		$pluginContainer.find(".tabeebNavigationButton").css("color", "");

		if (mode == TabeebScreenModeType.Navigation && currentWhiteboardType == TabeebWhiteBoardType.Text)
		{
			mode = TabeebScreenModeType.Text;
		}

		for(var key in TabeebScreenModeType) {
			var className = 'tabeeb' + key + 'Screen';
			if (TabeebScreenModeType[key] == mode)
				$pluginContainer.addClass(className);
			else
				$pluginContainer.removeClass(className);
		}

		if (mode == TabeebScreenModeType.Gallery)
		{
			$triggerElement.trigger(TabeebEvent.galleryRequested);
		}

		switch (mode)
		{
			case TabeebScreenModeType.Draw:
				showNavigation(false);
				setDrawMode(drawMode);
				controlbarHUD.setActive(true);
				showGallery(false);
				showAudioGallery(false);
				break;
			case TabeebScreenModeType.Navigation:
				showNavigation(true);
				controlbarHUD.setActive(false);
				showGallery(false);
				showAudioGallery(true);
				setDrawMode(TabeebDrawModeType.Pen);
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.PanZoom);
				break;
			case TabeebScreenModeType.Gallery:
				showNavigation(false);
				controlbarHUD.setActive(false);
				showGallery(true);
				showAudioGallery(false);
				modules.canvasService.getVideoService().pause();
				break;
			case TabeebScreenModeType.Disabled:
				showNavigation(false);
				controlbarHUD.setActive(false);
				showGallery(false);
				showAudioGallery(false);
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.PanZoom);
				break;
			case TabeebScreenModeType.Text:
				showNavigation(true);
				//$pluginContainer.find(".tabeebDrawModeButton, .tabeebZoomInButton, .tabeebZoomOutButton, .tabeebLaserPointerButton").hide();
				showGallery(false);
				showAudioGallery(true);
				controlbarHUD.setActive(false);
				$pluginContainer.find(".tabeebHotspotButton").hide();
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.Text);
				break;
			case TabeebScreenModeType.Spectator:
				showNavigation(false);
				showGallery(false);
				controlbarHUD.setActive(false);
				showAudioGallery(true);
				$pluginContainer.find(".tabeebBottomBar").show();
				$pluginContainer.find(".tabeebNavigationButton").not(".tabeebHotspotButton").hide();
				$pluginContainer.find(".tabeebHotspotButton").show();
				modules.canvasService.setInputMode(TabeebCanvasService.CanvasInputMode.PanZoom);
				break;
		}

		if (mode == TabeebScreenModeType.Text)
			$pluginContainer.find(".textboard-only").show();
		else
			$pluginContainer.find(".textboard-only").hide();

		if (mode != TabeebDrawModeType.Draw)
			$pluginContainer.find(".tabeebTextAnnotationInput").hide();

		$pluginContainer.trigger($.Event(TabeebEvent.screenModeChanged, { mode: screenMode}));
	}

	//</editor-fold>

	//<editor-fold name="Gallery">

	function setupGalleryButtons () {
		$pluginContainer.find(".tabeebGalleryModeButton").on('click touchend', onGalleryModeButtonClicked);
	}

	function showGallery (flag) {
		if (flag === true)
		{
			$mediaContainer.hide();
			modules.galleryService.show();
		}
		else
		{
			modules.galleryService.hide();
			$mediaContainer.show();
		}
	}

	function onGalleryModeButtonClicked () {
		setScreenMode(TabeebScreenModeType.Gallery);
		console.log("Trigger Element", $triggerElement[0]);
		$triggerElement.trigger(TabeebEvent.galleryRequested);
	}

	//</editor-fold>

	//<editor-fold name="Navigation & Zoom">

	function showAudioGallery (flag) {
		if (modules.canvasService.inVideoMode())
			flag = false;

		if (flag) {

		}

		modules.audioService.showAudioContainer(flag);
	}

	function showNavigation (flag) {
		if (flag)
			$pluginContainer.find(".tabeebNavigationButton, .tabeebBottomBar").show();
		else
			$pluginContainer.find(".tabeebNavigationButton, .tabeebBottomBar").hide();

		$palette.hide();
		$shapes.hide();
	}

	//<editor-fold name="Audio">

	function setupAudioButtons () {
		var $audioButton = $pluginContainer.find(".tabeebMicrophoneButton");
		$audioButton.on('click touchend', onMicrophoneButtonClicked);
	}

	function onMicrophoneButtonClicked () {
		var recordingState = modules.audioService.getState();
		if (recordingState == TabeebAudioService.RecordingState.Stopped || recordingState == TabeebAudioService.RecordingState.Paused)
			modules.audioService.startRecording();
		else
			modules.audioService.stopRecording();
	}

	//</editor-fold>
}

TabeebHUDService.defaults = {
	defaultPaletteColorIndex: 4,
	defaultStrokeSize: 4,
	defaultDrawMode: TabeebDrawModeType.Selection,
	defaultScreenMode: TabeebScreenModeType.Navigation,
	paletteColors: [
		"#FFFFFF", // white
		"#D9D9D9", // light gray
		"#6D6D6D", // medium gray
		"#000000", // black
		"#FB000E", // red

		"#F86601", // orange
		"#FFFE09", // yellow
		"#0F7301", // green
		"#23FF07", // lime green
		"#1FFFFF", // light blue

		"#00006F", // dark purple
		"#0002F9", // medium blue
		"#6900CD",
		"#FF00FF",
		"#F8016C"
	],
	canDragControlBar: false,
	canDragNavigationBar: true,
	canDragPalettePopup: true,
	canDragShapePopup: true,
	controlBarDisplay: "vertical", //auto, vertical, horizontal
	controlBarMobileDisplay: "vertical", //auto, vertical, horizontal
	/**
	 * "Ellipse", "Ellipse_Filled", "Line", "Callout", "Rectangle", "Rectangle_Filled", "ArrowEnd", "ArrowBoth"
	 */
	disabledShapes: ["Callout"],
	hideNavigationBarOnLoad: false,
	hideAnnotationToggleButtonOnLoad: false
};