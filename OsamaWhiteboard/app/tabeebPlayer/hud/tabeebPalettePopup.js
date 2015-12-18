/**
 * Created by cody on 9/24/15.
 */

/**
 * @param {TabeebHUDService.defaults} options
 * @param {jQuery} $triggerElement
 * @param {jQuery} $pluginContainer
 * @param {TabeebCanvasService} canvasService
 * @constructor
 */
function TabeebPaletteService (options, $triggerElement, $pluginContainer, canvasService) {

	//<editor-fold name="Variables">

	var $palette;
	var visible = false;

	//</editor-fold>

	var service = {
		setActive: setActive,
		isVisible: function () { return visible; },
		updatePenColor: updatePenColor,
		setSelectedIndex: setSelectedIndex
	};

	init();

	return service;

	//////////////////////////////

	function init () {
		$palette = $pluginContainer.find(".tabeebDrawingPalette");
		setupDrawingPalette();
	}

	function setupDrawingPalette () {
		var $colorHolder = $palette.find(".tabeebPaletteColors");

		var paletteColors = options.paletteColors;

		// Create the colors and set up the event handler
		$.each(paletteColors, function (index, colorString) {
			var $div = $("<div class='tabeebPaletteColor' style='background-color: " + colorString + "'></div>");

			//Add border around white palette color to make it not appear invisible
			if (colorString == "#FFFFFF")
				$div.css("border", "1px solid gray");

			$colorHolder.append($div);
		});

		var $paletteColors = $palette.find(".tabeebPaletteColor");
		var defaultColorIndex = options.defaultPaletteColorIndex ? options.defaultPaletteColorIndex : 3;

		var $defaultColor = $paletteColors.eq(defaultColorIndex);
		$defaultColor.addClass("selected");

		var color = $defaultColor.css("background-color");
		var $strokeSizeInput = $palette.find(".tabeebStrokeSizeInput");
		$strokeSizeInput.val(options.defaultStrokeSize);

		$paletteColors.on("click", function () { onPaletteColorChanged($(this)); });
		$palette.find(".tabeebTransparencyInput").on("change input", function (e) { onPaletteTransparencyChanged(this, e); });
		$strokeSizeInput.on("change input", function (e) { onPaletteStrokeSizeChanged(this, e); });
		//Sets defaults
		onPaletteColorChanged($defaultColor, true);
		onPaletteStrokeSizeChanged($strokeSizeInput[0], {});
	}

	//<editor-fold name="Public Methods">

	function setActive (flag) {
		if (!flag)
			flag = !visible;


	}

	function setSelectedIndex (index) {
		var $element = $palette.find(".tabeebPaletteColor").eq(index);
		onPaletteColorChanged($element, true);
	}

	function updatePenColor (penColor) {
		if (!penColor)
			penColor = canvasService.getStrokeAttributes().color;

		$pluginContainer.find(".tabeebPenColor, .tabeebControlBarButtonContainer, .tabeebDrawMode").css("color", "");
		$pluginContainer.find(".tabeebPenColor.active, .tabeebPenColor.selected, .tabeebDrawMode.selected").css("color", penColor);
		if ($pluginContainer.find(".tabeebShapeItem.selected").length > 0)
			$pluginContainer.find(".tabeebPenColor.tabeebShapeOptionsButton").css("color", penColor);
		else if ($pluginContainer.find(".tabeebHotspotItem.selected").length > 0)
			$pluginContainer.find('[data-popup-toggle="hotspots"]').css("color", penColor);
		else
			$pluginContainer.find(".tabeebPenColor.tabeebShapeOptionsButton").css("color", "");

		var $optionsButton = $pluginContainer.find(".tabeebOptionsButton");
		$optionsButton.css('color', penColor);
	}

	//</editor-fold>

	function onPaletteColorChanged ($element, doNotSendEvent) {
		$palette.find(".tabeebPaletteColor").removeClass("selected");
		$element.addClass("selected");
		var color = $element.css("background-color");

		if (doNotSendEvent != true)
			$element.trigger(TabeebEvent.penColorChanged, $element.index());

		var attr = canvasService.getStrokeAttributes();
		$palette.find(".tabeebStrokeSizePreview").css("background-color", color);
		$palette.find(".tabeebPreviewTriangleTopLeft").css("border-color", color + " transparent transparent transparent");
		$palette.find(".tabeebPreviewTriangleBottomRight").css("border-color", "transparent transparent " + color.toString().replace("rgb", "rgba").replace(")", ", 0.75)") + " transparent");

		canvasService.setStrokeAttributes(color, attr.transparency, attr.width, true);

		updatePenColor(color);
	}

	function onPaletteStrokeSizeChanged (element, event) {
		var value = parseInt(element.value);
		var attr = canvasService.getStrokeAttributes();

		if (event.type == "change")
			canvasService.setStrokeAttributes(attr.color, attr.transparency, value, true);
		else
			canvasService.setStrokeAttributes(attr.color, attr.transparency, value, false);

		var valueBy30 = value / 32.0 * 30;
		$palette.find(".tabeebStrokeSizePreview").width(valueBy30 + "px").height(valueBy30 + "px");
	}

	function onPaletteTransparencyChanged (element, event) {
		var value = parseInt(element.value);
		var attr = canvasService.getStrokeAttributes();
		if (event.type == "change")
			canvasService.setStrokeAttributes(attr.color, value / 100.0, attr.width, true);
		else
			canvasService.setStrokeAttributes(attr.color, value / 100.0, attr.width, false);

		$palette.find(".tabeebTransparencyPreview").css("opacity", value / 100.0);
	}

	//</editor-fold>
}