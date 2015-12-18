/**
 * Created by cody on 9/16/15.
 */

/**
 * @param {TabeebHUDService.defaults} options
 * @param {jQuery} $triggerElement
 * @param {jQuery} $pluginContainer
 * @param {TabeebCanvasService} canvasService
 * @param {TabeebPresenterManager} presentationMgr
 * @param {PDFManager} pdfManager
 * @constructor
 */
function TabeebHUDNavigationBar (options, $triggerElement, $pluginContainer, canvasService, pdfManager, presentationMgr) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $navigationBar = null;

	//</editor-fold>

	var service = {
		resize: resize,
		updateZoomButtons: updateZoomButtons,
		setVisible: setVisible
	};

	init();

	return service;

	///////////////////////

	function init () {
		$navigationBar = $pluginContainer.find(".tabeebNavigationBar");
		setupNavigationButtons();
		$(canvasService).on(TabeebCanvasService.CanvasServiceEventType.zoomChanged, onCanvasZoomLevelChanged);

		if (options.disableNavigationBar === true) {
			$navigationBar.remove();
		}

		if (options.hideNavigationBarOnLoad === true)
			setVisible(false);

		//if (options.canDragNavigationBar)
		//	$navigationBar.draggable({
		//		containment: $pluginContainer
		//	});
	}

	//<editor-fold name="Public Methods">

	function resize () {
		$navigationBar.css({
			left: parseFloat($navigationBar.parent().width())/2 - parseFloat($navigationBar.width())/2,
			bottom: "15px"
		});
		if (!TabeebInputService.isTouchDevice())
		{

			if ($navigationBar.parent().width() < 425)
			{
				$navigationBar.css('left', '15px');
			}

		}
	}

	function setVisible (isVisible) {
		if (isVisible === true)
			$navigationBar.show();
		else
			$navigationBar.hide();
	}

	function updateZoomButtons () {
		if (!canvasService) return;

		var $zoomInButton = $pluginContainer.find(".tabeebZoomInButton");
		var $zoomOutButton = $pluginContainer.find(".tabeebZoomOutButton");

		if (pdfManager.isActive())
		{
			var zoomPerc = (pdfManager.getZoomPercentage());
			$pluginContainer.find(".tabeebZoomIndicator").text(Math.round(zoomPerc*100) + "%");

			var maxZoom = pdfManager.getOptions().maxZoom;
			var minZoom = pdfManager.getOptions().minZoom;

			if (zoomPerc + 0.01 >= maxZoom)
				$zoomInButton.addClass("disabled");
			else
				$zoomInButton.removeClass("disabled");

			if (zoomPerc <= minZoom)
				$zoomOutButton.addClass("disabled");
			else
				$zoomOutButton.removeClass("disabled");
		}
		else
		{
			if (canvasService.getZoomLevel() >= canvasService.getMaxZoomLevel())
				$zoomInButton.addClass("disabled");
			else
				$zoomInButton.removeClass("disabled");
			if (canvasService.getZoomLevel() <= canvasService.getMinZoomLevel())
				$zoomOutButton.addClass("disabled");
			else
				$zoomOutButton.removeClass("disabled");

			var currentZoom = canvasService.getZoomLevel();

			var zoomPerc = Math.round(currentZoom * 100);
			$pluginContainer.find(".tabeebZoomIndicator").text(zoomPerc + "%");
		}
	}

	//</editor-fold>

	function setupNavigationButtons () {
		var $button = $pluginContainer.find(".tabeebPreviousMediaButton");
		$button.on("click", onPreviousMediaButtonClicked);
		$button = $pluginContainer.find(".tabeebNextMediaButton");
		$button.on("click", onNextMediaButtonClicked);

		$button = $pluginContainer.find(".tabeebZoomInButton");
		$button.on("click", onZoomInButtonClicked);
		$button = $pluginContainer.find(".tabeebZoomOutButton");
		$button.on("click", onZoomOutButtonClicked);
	}

	function canNavigate () {
		var presenterId = presentationMgr.getPresenterId();
		if (presenterId && presenterId.length > 0)
		{
			if (!presentationMgr.isCurrentUserPresenter())
				return false;
		}
		return true;
	}

	function onNextMediaButtonClicked () {
		if (!canNavigate())
			return;

		if (!$(this).hasClass("disabled"))
			$triggerElement.trigger(TabeebEvent.nextMedia);
	}

	function onPreviousMediaButtonClicked () {
		if (!canNavigate())
			return;

		if (!$(this).hasClass("disabled"))
			$triggerElement.trigger(TabeebEvent.previousMedia);
	}

	function onZoomInButtonClicked () {
		if (pdfManager.isActive())
		{
			var scale = pdfManager.getScale();
			scale += 0.05;
			pdfManager.setScale(scale);
		}
		else
		{
			var zoomLevel = canvasService.getZoomLevel();
			if (zoomLevel >= canvasService.option("maxZoomLevel"))
				return;

			zoomLevel = Math.min(canvasService.option("maxZoomLevel"), zoomLevel + 0.05);
			canvasService.setScaleFactor(zoomLevel);
			canvasService.setPan();
			canvasService.redrawAnnotations();
		}

		updateZoomButtons();
	}

	function onZoomOutButtonClicked () {
		if (pdfManager.isActive())
		{
			var scale = pdfManager.getScale();
			scale -= 0.05;
			pdfManager.setScale(scale);
		}
		else
		{
			var zoomLevel = canvasService.getZoomLevel();
			if (zoomLevel <= canvasService.option("minZoomLevel"))
				return;

			zoomLevel = Math.max(Math.min(canvasService.option("minZoomLevel"), canvasService.getFullSizeZoomLevel()), zoomLevel - 0.05);
			canvasService.setScaleFactor(zoomLevel);
			canvasService.setPan();
			canvasService.redrawAnnotations();
		}
		updateZoomButtons();
	}

	//<editor-fold name="Canvas Events">

	function onCanvasZoomLevelChanged () {
		updateZoomButtons();
	}

	//</editor-fold>

}