"use strict";

/**
 * @param {jQuery} $triggerElement
 * @param {TabeebModules} modules
 * @param {jQuery} $canvasElement
 * @param {jQuery} $videoContainer
 * @param {TabeebCanvasService.defaults} optionsIn
 * @param {*} allOptions
 * @class
 * @property {TabeebAudioService} audioService
 */
function TabeebCanvasService ($triggerElement, modules, $canvasElement, $videoContainer, optionsIn, allOptions) {
	var self = this;
	var options = $.extend(TabeebCanvasService.defaults, optionsIn);

	var annotationMgr = modules.annotationManager;
	var userMgr = modules.userManager;

	/**@type {TabeebAudioService}*/
	self.audioService = null;
	/**@type {TabeebCanvasHotspotManager}*/
	self.hotspotManager = null;
	/**@type {TabeebInputService}*/
	var inputService = null;
	var CANVAS_HORIZONTAL_MARGIN = 5;
	/**@type {TabeebCanvasService}*/
	var that = null;
	/**@type {jQuery}*/
	var $canvas = null;
	/**@type {jQuery}*/
	var $textAnnotationInput = null;
	/**@type {jQuery}*/
	var $textAsset = null;
	/**@type {jQuery}*/
	var $textAssetContainer = null;
	var backgroundSize = null;
	var maximumCanvasSize = {width: 0, height: 0};
	var scaleFactor = 1.0;
	var fullImageScaleFactor = 1.0;
	var imageAspectRatio = 1.0;
	/**@type {CanvasRenderingContext2D}*/
	var context = null;
	/**@type {jQuery}*/
	var $pluginContainer = $canvasElement.parents(".tabeebPluginContainer");
	var awaitingYourAnnotation = false;

	var attachHotspotToAnnotations = false;

	self.setAttachHotSpotToAnnotations = function (flag) { attachHotspotToAnnotations = flag; };

	var hotspotCount = 0;

	var paintingDisabled = false;

	var pinching = false;
	var startScale = 0;

	var $this = null;

	var contentType = 0;

	var panX = 0;
	var panY = 0;

	//Center location for zoom to focus into (based off of image coords)
	var zoomFocusX = 0;
	var zoomFocusY = 0;

	var mutedUserIds = [];

	var startPanX = 0;
	var startPanY = 0;
	var previousPanX = 0;
	var previousPanY = 0;
	var maxPanX = 0;
	var maxPanY = 0;
	var inVideoMode = false;
	var inAudioMode = false;

	/** @type {jQuery} */
	var $annotationEditor = $canvasElement.parent().find(".tabeebAnnotationEditor");

	/** @type {TabeebAnnotation} */
	var currentAnnotation = null;

	var requestedStrokeColor = "white";// { r: 255, g: 255, b: 255, a: 1.0 };
	var requestedStrokeTransparency = 1.0;
	var currentStrokeTransparency = 1.0;
	var requestedStrokeWidth = 10;
	var requestedFontSize = requestedStrokeWidth * 4;
	var pointsInCurrentStroke = [];
	/**@type {Array.<TabeebAnnotation>}*/
	var currentlyDisplayedAnnotations = [];
	var inputMode = TabeebCanvasService.CanvasInputMode.None;

	var drawing = false;
	var panning = false;

	var lastRecordedPoint = {x: -1, y: -1};
	var videoService = null;
	var currentVideoTime = 0;
	var currentAudioTime = 0;

	var laserPointerPosition = {x: 1, y: 1};
	var laserMode = false;

	init.call(this);
	setupEventHandlersForOptions();
	bindTextAssetEvents();

	function init () {
		that = this;
		$canvas = $canvasElement;
		context = $canvasElement[0].getContext("2d");
		$this = $(this);
		$canvas.parent().find(".tabeebTextAnnotationInput");
		$textAnnotationInput = $canvas.parent().find(".tabeebTextAnnotationInput");
		$textAsset = $canvas.parent().find(".tabeebTextAsset");
		$textAssetContainer = $canvas.parent().find(".tabeebTextAssetContainer");
		backgroundSize = {width: options.width, height: options.height};
		$textAnnotationInput.on("input keyup", textInputKeyPressed);
		videoService = new TabeebVideoService($videoContainer, $canvasElement, modules);
		modules.videoService = videoService;

		$(videoService).on(TabeebVideoService.VideoServiceEventType.videoTimeUpdated, onVideoTimeUpdated);
		$(videoService).on(TabeebVideoService.VideoServiceEventType.videoTimeSeeked, onVideoTimeUpdated);
		$(userMgr).on(TabeebUserManager.Events.userMuteChanged, onUserMuteChanged);

		inputService = new TabeebInputService($canvas, {
			pointerDown: pointerDownReceived,
			pointerMove: pointerMoveReceived,
			pointerUp: pointerUpReceived,
			pinchStart: startPinch,
			pinchMove: movePinch,
			pinchEnd: endPinch,
			mouseWheel: mouseWheelReceived,
			swipeLeft: swipeLeft,
			swipeRight: swipeRight,
			doubleClick: doubleClick
		});

		initAnnotationEditor();

		$(document).on('keydown', onKeyPress);

		$canvasElement.on('mousemove', onCanvasMouseMoved);

		$pluginContainer.on(TabeebEvent.drawModeChanged, onDrawModeChanged);
		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationUpdated, onAnnotationUpdated);
		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationAdded, onAnnotationAdded);
		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationHiddenChanged, onAnnotationHiddenChanged);
		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationUnselected, function (event) {
			var ann = event.annotation;

			if (annotationMgr.getSelectedAnnotations().length == 0)
			{
				showAnnotationEditor(false);
			}
			else
			{
				console.warn("These annotations are still selected", annotationMgr.getSelectedAnnotations());
			}
		});
		$(annotationMgr).on(TabeebAnnotationManager.Events.annotationSelected + " " + TabeebAnnotationManager.Events.annotationUnselected, function (event) {
			var selectedAnnotations = annotationMgr.getSelectedAnnotations();
			if (selectedAnnotations.length == 0) {
				annotationMgr.getAll().forEach(function (ann) { ann.dimmed = false; });
				self.redrawAnnotations();
			}
		});
	}

	function onAnnotationAdded (event) {
		/**@type {TabeebAnnotation}*/
		var annotation = event.annotation;

		if (awaitingYourAnnotation === true && attachHotspotToAnnotations === true)
		{
			if (annotation.layerId != userMgr.getThisUser().id)
				return;

			awaitingYourAnnotation = false;

			if ((annotation.parentId && annotation.parentId.length > 0))
				return;

			createAnchoredHotspotAnnotation(annotation);
		}
	}

	function onAnnotationHiddenChanged (event) {
		var selectedAnnotations = annotationMgr.getSelectedAnnotations();

		/**@type {TabeebAnnotation}*/
		var annotation = annotationMgr.find(event.annotation);
		var isHidden = event.isHidden;
		self.redrawAnnotations();
	}

	/**
	 * @param {TabeebAnnotation} parentAnnotation
	 */
	function createAnchoredHotspotAnnotation (parentAnnotation) {
		var oldMode = inputMode;

		inputMode = TabeebCanvasService.CanvasInputMode.Hotspot;
		var anchorPosition = parentAnnotation.getAnchoredAnnotationPosition(context);
		var x = imageToCanvasCoordX(anchorPosition.x);
		var y = imageToCanvasCoordY(anchorPosition.y) - 8;

		addPointToCurrentStroke(x, y);
		startAnnotation();
		endCurrentAnnotation(parentAnnotation.id);
		inputMode = oldMode;
	}

	function addPointToCurrentStroke (x, y) {
		pointsInCurrentStroke.push({x: x, y: y});
	}

	function onAnnotationUpdated (event) {
		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		selectedAnnotations.forEach(function (ann) {
			if (ann.id == event.annotation.id)
			{
				if (isTextInputMode())
				{
					positionTextEditorToAnnotation(ann);
				}
				//clearSelectedAnnotations();
			}
		});
	}

	this.getOptions = function () {
		return options;
	};

	this.bindAudioEvents = function () {
		var audioService = that.audioService;
		$(audioService).on(TabeebAudioService.AudioEvent.audioEnded, function () { if (!inVideoMode) setAudioMode(false); });
		$(audioService).on(TabeebAudioService.AudioEvent.recordingFinished, function () { if (!inVideoMode) setAudioMode(false); });
		$(audioService).on(TabeebAudioService.AudioEvent.audioStarted, function () { if (!inVideoMode) setAudioMode(true); });
		$(audioService).on(TabeebAudioService.AudioEvent.recordingStarted, function () { if (!inVideoMode) setAudioMode(true); });
		$(audioService).on(TabeebAudioService.AudioEvent.audioSeeked, onAudioTimeUpdated);
		$(audioService).on(TabeebAudioService.AudioEvent.recordingTimeUpdated, onAudioTimeUpdated);
		$(audioService).on(TabeebAudioService.AudioEvent.audioTimeUpdated, onAudioTimeUpdated);

		initHotspotManager();
	};

	this.option = function (optionKey, value) {
		if (value == null)
			return options[optionKey];
		else
			options[optionKey] = value;
	};

	function initHotspotManager () {
		if (!self.hotspotManager)
		{
			self.hotspotManager = new TabeebCanvasHotspotManager($triggerElement, $canvas, modules, lastRecordedPoint, allOptions.hotspotOptions);
			modules.hotspotManager = self.hotspotManager;

			var hotspotTriggerElement = self.hotspotManager.getTriggerElement();
			hotspotTriggerElement.on(TabeebCanvasHotspotManager.Events.dialogClosed, function (e) {
				var selectedAnnotations = annotationMgr.getSelectedAnnotations();
				$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.annotationUnselected, {annotation: e.annotation}));
				if (selectedAnnotations.length > 0)
				{
					var annotation = selectedAnnotations[0];
					var childrenAnnotations = annotationMgr.getChildAnnotations(annotation);
					if (!annotation || !childrenAnnotations || childrenAnnotations.length === 0)
					{
						deleteSelectedAnnotation();
					}
					annotationMgr.clearSelectedAnnotations();
					annotationMgr.getAll().forEach(function (a) { a.dimmed = false; });
				}
			});
			hotspotTriggerElement.on(TabeebCanvasHotspotManager.Events.dialogOpened, function (d) {
				var selectedAnnotations = annotationMgr.getSelectedAnnotations();
				if (!selectedAnnotations || selectedAnnotations.length === 0)
				{
					var annotation = d.hotspotAnnotation;
					self.selectAnnotation(annotation.id);
				}
			});
			hotspotTriggerElement.on(TabeebCanvasHotspotManager.Events.deletePopupClicked, function (d) {
				deleteSelectedAnnotation();
			});
		}
	}

	function initAnnotationEditor () {
		var $editTextButton = $annotationEditor.find(".tabeebEditAnnotationTextButton");
		$editTextButton.on('click', function () {
			var selectedAnnotations = annotationMgr.getSelectedAnnotations();
			var annotation = selectedAnnotations[0];
			annotation.invisible = true;
			$annotationEditor.hide();
			that.redrawAnnotations();
			var point = {
				x: imageToCanvasCoordX(annotation.textInfo.point.x),
				y: imageToCanvasCoordY(annotation.textInfo.point.y)
			};
			openTextEditor(point, annotation.textInfo.text);
			annotationMgr.selectAnnotation(annotation);
		});

		$annotationEditor.on("click", ".tabeebDeleteAnnotationButton", deleteSelectedAnnotation);
	}

	function deleteSelectedAnnotation () {
		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		var annotation = selectedAnnotations[0];

		if (!annotation)
			return;

		if (annotation.canDelete === false || annotation.permission == TabeebAnnotationPermissionType.readOnly || annotation.permission == TabeebAnnotationPermissionType.replyOnly)
			return;

		annotationMgr.clearSelectedAnnotations();

		showAnnotationEditor(false);
		if (annotation != null)
			$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.annotationDeleted, {annotation: annotation}));
	}

	function onDrawModeChanged (event) {
		var drawMode = event.mode;
		laserMode = (drawMode == TabeebDrawModeType.Pointer);
		self.setLaserPointerPosition(-1, -1);
		endTextAnnotation();
		//endCurrentAnnotation();
	}

	function onKeyPress (event) {
		if (event.which == 46)
		{
			var selectedAnnotations = annotationMgr.getSelectedAnnotations();
			if (selectedAnnotations.length > 0)
				deleteSelectedAnnotation();
			$annotationEditor.find(".tabeebDeleteAnnotationButton").click();
		}
	}

	function onCanvasMouseMoved (event) {
		if (laserMode === true)
			self.setLaserPointerPosition(event.offsetX, event.offsetY);
	}

	this.setLaserPointerPosition = function (x, y) {
		var oldX = laserPointerPosition.x;
		var oldY = laserPointerPosition.y;

		if (oldX != x || oldY != y)
		{
			laserPointerPosition.x = x;
			laserPointerPosition.y = y;

			$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.laserPointerMoved, {
				x: that.canvasToImageCoordX(x),
				y: that.canvasToImageCoordY(y)
			}));
		}

		that.redrawAnnotations();
	};

	function getPlaybackTime () {
		if (inAudioMode)
			return currentAudioTime;
		else if (inVideoMode)
			return currentVideoTime;
		else
			return 0;
	}

	/**
	 * @param {TabeebAnnotation|String} annotationOrAnnotationId
	 */
	self.selectAnnotation = function (annotationOrAnnotationId) {
		if (modules.options.readOnly === true) return;

		var annotation = annotationMgr.find(annotationOrAnnotationId);

		if (annotation.canBeSelected())
		{
			annotationMgr.getAll().forEach(function (ann) { ann.dimmed = true; });
		}
		annotationMgr.selectAnnotation(annotationOrAnnotationId, true, true);

		positionAnnotationEditor();
		showAnnotationEditor(true);

		self.redrawAnnotations();
	};

	function setAudioMode (flag) {
		inAudioMode = flag;
		if (!inAudioMode)
		{
			that.redrawAnnotations();
		}
	}

	this.setZoomFocus = function (x, y) {
		zoomFocusX = x;
		zoomFocusY = y;
	};

	this.getInputService = function () { return inputService; };
	this.getZoomFocusX = function () { return zoomFocusX; };
	this.getZoomFocusY = function () { return zoomFocusY; };
	this.getCanvasElement = function () { return $canvasElement; };
	this.getVideoService = function () { return videoService; };
	this.getMutedUserIds = function () { return mutedUserIds; };

	this.getOffsetOfAnnotation = function (annotationOrAnnotationId) {
		var annotation = annotationMgr.find(annotationOrAnnotationId);
		var annotationBoundingRectangle = annotation.getRectangle(context);
		annotationBoundingRectangle.x = imageToCanvasCoordX(annotationBoundingRectangle.x);
		annotationBoundingRectangle.y = imageToCanvasCoordY(annotationBoundingRectangle.y);
		var offset = {
			left: parseFloat($canvas.offset().left) + annotationBoundingRectangle.x,
			top: parseFloat($canvas.offset().top) + annotationBoundingRectangle.y,
			width: annotationBoundingRectangle.width * scaleFactor,
			height: annotationBoundingRectangle.height * scaleFactor
		};
		return offset;
	};

	//<editor-fold desc="Canvas Input Handling">
	//---------------------------------------
	// Canvas input handling
	//---------------------------------------
	this.setInputMode = function (mode) {
		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		if ($textAnnotationInput.is(":visible") && selectedAnnotations.length > 0)
			endEditText();

		inputMode = mode;

		if (mode == TabeebCanvasService.CanvasInputMode.None)
			inputService.setInputMode(TabeebInputService.InputMode.None);
		else if (mode == TabeebCanvasService.CanvasInputMode.PanZoom)
			inputService.setInputMode(TabeebInputService.InputMode.Navigation);
		else
		{
			inputService.setInputMode(TabeebInputService.InputMode.Draw);
			annotationMgr.clearSelectedAnnotations();
			this.redrawAnnotations();
		}

		annotationMgr.clearSelectedAnnotations();
	};

	/**
	 * @returns {TabeebCanvasService.CanvasInputMode|Number}
	 */
	this.getInputMode = function () {
		return inputMode;
	};

	this.inVideoMode = function () { return inVideoMode; };

	this.getStrokeAttributes = function () {
		return {
			color: requestedStrokeColor,
			transparency: requestedStrokeTransparency,
			width: requestedStrokeWidth
		};
	};

	this.getBackgroundSize = function () {
		return backgroundSize;
	};

	/**
	 * @param {String} color
	 * @param {Number} transparency
	 * @param {Width} width
	 * @param sendUpdateEvent
	 */
	this.setStrokeAttributes = function (color, transparency, width, sendUpdateEvent) {
		var rgba = TabeebPlayerUtil.colorStringToRGB(color);
		if (transparency != null)
			rgba.a = transparency;

		requestedStrokeColor = TabeebPlayerUtil.RGBAToColor(rgba);
		requestedStrokeTransparency = rgba.a;
		requestedStrokeWidth = width;
		requestedFontSize = width * 4 + 6;

		$textAnnotationInput.css('fontSize', imageToCanvasFontSize(requestedFontSize) + 'px');
		$textAnnotationInput.css({color: requestedStrokeColor});

		var selectedAnnotations = annotationMgr.getSelectedAnnotations();

		if (selectedAnnotations.length > 0)
		{
			console.log("selected annotations stroke attributes", selectedAnnotations);

			$.each(selectedAnnotations,
				/**
				 * @param {number} index
				 * @param {TabeebAnnotation} annotation
				 */
				function (index, annotation) {
					console.log("stroke attributes setting", annotation);
					var event = createAnnotationUpdateEvent(annotation, function () {
						annotation.setStrokeAttributes({color: requestedStrokeColor, width: width});
					});
					//if (sendUpdateEvent)
					$this.trigger(event);

					that.redrawAnnotations();
				});
		}
	};

	function emulateInsertText (text) {
		var sel, textRange;
		event.preventDefault();
		if (document.body.createTextRange)
		{
			try
			{
				document.execCommand("ms-beginUndoUnit", false, null);
			} catch (e)
			{
			}
			if (document.selection)
			{
				textRange = document.selection.createRange();
			}
			else if (window.getSelection)
			{
				sel = window.getSelection();
				var range = sel.getRangeAt(0);

				// Create a temporary element to allow us to move a TextRange to the correct place
				var tempEl = document.createElement("span");
				tempEl.innerHTML = "&#FEFF;";
				range.deleteContents();
				range.insertNode(tempEl);
				textRange = document.body.createTextRange();
				textRange.moveToElementText(tempEl);
				tempEl.parentNode.removeChild(tempEl);
			}

			textRange.text = text;
			textRange.collapse(false);
			textRange.select();

			try
			{
				document.execCommand("ms-endUndoUnit", false, null);
			} catch (e)
			{
			}
		}
		else
		{
			document.execCommand("insertText", false, text);
		}
	}

	function bindTextAssetEvents () {
		$textAsset.on('blur', onTextAssetChanged);
		$textAsset.on('keydown', /**@param {*|jQuery.Event} event*/ function (event) {
			// Escape key
			if (event.which == 27)
				$(this).blur();
			// Enter key
			else if (event.which == 13)
			{
				emulateInsertText("\n");
				event.preventDefault();
			}
			// Tab key
			else if (event.which == 9)
			{
				emulateInsertText("\t");
				event.preventDefault();
			}
		});
		$textAsset.on('mouseleave', function () { $(this).blur(); });

		$textAsset.on('mouseenter click touchstart', function (e) {
			if (!$triggerElement[0].$element.hasClass("spectating"))
				$(this)
					.attr("contenteditable", true);

			e.stopImmediatePropagation();
		});

		$textAsset.on('paste', function (event) {
			event.preventDefault();
			var text = (event.originalEvent || event).clipboardData.getData('text/plain') || prompt('Paste something:');
			window.document.execCommand('insertText', false, text);
		});
	}

	function onUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var isMuted = event.isMuted;
		var index = mutedUserIds.indexOf(user.id);

		if (index >= 0)
			mutedUserIds.splice(index, 1);

		if (isMuted === true)
			mutedUserIds.push(user.id);

		self.redrawAnnotations();
		self.audioService.updateMutedUserIds(mutedUserIds);
	}

	this.onParticipantChange = function (participant) {

		var index = mutedUserIds.indexOf(participant.id);

		if (index >= 0)
		{
			if (participant.showStrokes === true)
				mutedUserIds.splice(mutedUserIds.indexOf(participant.id));
		}
		else if (participant.showStrokes === false)
			mutedUserIds.push(participant.id);

		this.audioService.updateMutedUserIds(mutedUserIds);
	};

	$(inputService).on('tap', function (event) {
		if (event.tapCount == 1)
		{
			videoService.tapPlay();
		}
		// Act like a double click
		if (event.tapCount == 2)
			doubleClick();
	});

	function setupEventHandlersForOptions () {
		connectEventHandler(options.pointerMove, TabeebInputService.InputServiceEvent.pointerMove);
		connectEventHandler(options.strokeStarted, TabeebCanvasService.CanvasServiceEventType.strokeStarted);
		connectEventHandler(options.strokeComplete, TabeebCanvasService.CanvasServiceEventType.strokeComplete);
		connectEventHandler(options.textStarted, TabeebCanvasService.CanvasServiceEventType.textStarted);
		connectEventHandler(options.textComplete, TabeebCanvasService.CanvasServiceEventType.textComplete);
		connectEventHandler(options.annotationsDisplayed, TabeebCanvasService.CanvasServiceEventType.annotationsDisplayed);
	}

	function doubleClick () {
	}

	function textInputKeyPressed (event) {
		// Escape key
		if (event.which == 27)
		{
			$textAnnotationInput.hide();
			return;
		}

		positionTextInput();
	}

	function positionTextInput () {
		var inputText = $textAnnotationInput.val();
		var lines = inputText.split("\n");
		var cols = 1;
		for (var i = 0; i < lines.length; i++)
		{
			cols = Math.max(cols, lines[i].length);
		}

		$textAnnotationInput.attr("cols", cols + 1).attr("rows", lines.length);

		//calculate bounds of textbox

		//Overflowing to right
		var overflowX = $textAnnotationInput.offset().left + $textAnnotationInput.outerWidth() - $canvasElement.offset().left - $canvasElement.width();
		if (overflowX > 0)
		{
			$textAnnotationInput.css("left", parseFloat($textAnnotationInput.css("left")) - overflowX);
		}

		//Overflowing to bottom
		var overflowY = $textAnnotationInput.offset().top + $textAnnotationInput.outerHeight() - $canvasElement.offset().top - $canvasElement.height();
		if (overflowY > 0)
			$textAnnotationInput.css("top", parseFloat($textAnnotationInput.css("top")) - overflowY);

		var underflowX = $canvasElement.offset().left - $textAnnotationInput.offset().left;

		var text = $textAnnotationInput.val();
		if (underflowX > 0)
		{
			text = text.substring(0, text.length - 1) + '\n' + text.substring(text.length - 1, text.length);
			$textAnnotationInput.val(text);
			$textAnnotationInput.css("left", $canvasElement.offset().left);
		}

		var underflowY = $canvasElement.offset().top - $textAnnotationInput.offset().top;
		if (underflowY > 0)
		{
			//Remove latest character and the new line since it won't fit
			text = text.substring(0, text.length - 2);
			$textAnnotationInput.val(text);
			$textAnnotationInput.css("top", $canvasElement.offset().top);
		}
	}

	function endEditText () {
		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		var annotation = selectedAnnotations[0];
		if (!annotation || !annotation.textInfo)
			return;

		var oldText = annotation.textInfo.text;
		annotation.invisible = false;
		$textAnnotationInput.hide();
		showAnnotationEditor(true);
		that.redrawAnnotations();

		annotation.textInfo.text = oldText;
		var event = createAnnotationUpdateEvent(annotation, function () { annotation.textInfo.text = $textAnnotationInput.val(); });

		$this.trigger(event);
	}

	function endTextAnnotation () {
		if (!$textAnnotationInput.is(":visible"))
			return;

		var inputText = $textAnnotationInput.val();
		if (inputText.length > 0)
		{
			var selectedAnnotations = annotationMgr.getSelectedAnnotations();
			if (selectedAnnotations[0] != null)
			{
				return endEditText();
			}

			var position = $textAnnotationInput.position();
			var canvasPosition = $canvas.position();
			var borderWidth = parseFloat($textAnnotationInput.css("border-width"));
			borderWidth = isNaN(borderWidth) ? 0 : borderWidth;

			var scaledPoint = {
				x: canvasToImageCoordX(parseFloat(position.left) - parseFloat(canvasPosition.left) + borderWidth),
				y: canvasToImageCoordY(parseFloat(position.top) - parseFloat(canvasPosition.top) - borderWidth)
			};

			var textInfo = {
				text: inputText,
				color: requestedStrokeColor,
				fontSize: requestedFontSize,
				point: scaledPoint
			};
			if (inVideoMode)
			{
				textInfo.timestamp = videoService.getCurrentPlaybackTime() - 0.1;
				if (textInfo.timestamp < 0)
					textInfo.timestamp = 0;
			}
			else if (inAudioMode)
				textInfo.timestamp = currentAudioTime;
			else
				textInfo.timestamp = -1;

			// Redraw previous strokes if this is transparent
			if (currentStrokeTransparency < 1.0)
				that.redrawAnnotations();

			var type = TabeebAnnotationType.Text;

			if (inputMode == TabeebCanvasService.CanvasInputMode.Callout)
			{
				startAnnotation({textInfo: textInfo});
				type = TabeebAnnotationType.Callout;
			}
			else
			{
				$triggerElement.trigger(TabeebCanvasService.CanvasServiceEventType.textComplete, {
					textInfo: textInfo,
					type: type
				});
			}
		}

		awaitingYourAnnotation = true;

		$textAnnotationInput.hide();
	}

	function swipeLeft () {
		if (inputMode != TabeebCanvasService.CanvasInputMode.PanZoom && inputMode != TabeebCanvasService.CanvasInputMode.Text) return;
		if (inputMode != TabeebCanvasService.CanvasInputMode.Text && panX < maxPanX)
			return;

		var $nextMediaButton = $canvasElement.parent().parent().parent().find(".tabeebNextMediaButton");
		$nextMediaButton.click();
	}

	function swipeRight () {
		if (inputMode != TabeebCanvasService.CanvasInputMode.PanZoom && inputMode != TabeebCanvasService.CanvasInputMode.Text) return;
		if (inputMode != TabeebCanvasService.CanvasInputMode.Text && panX > 0)
			return;

		var $prevMediaButton = $canvasElement.parent().parent().parent().find(".tabeebPreviousMediaButton");
		$prevMediaButton.click();
	}

	function startPinch (event) {
		if (inputMode != TabeebCanvasService.CanvasInputMode.PanZoom || inVideoMode)
		{
			event.preventDefault();
			return;
		}

		var offset = $canvasElement.offset();

		startScale = scaleFactor;

		var x = event.center.x - offset.left;
		var y = event.center.y - offset.top;
		x = canvasToImageCoordX(x) / backgroundSize.width;
		y = canvasToImageCoordY(y) / backgroundSize.height;
		that.setZoomFocus(x, y);

		pinching = true;
	}

	function movePinch (event) {
		if (!pinching)
			return;

		var newScale = startScale + (event.scale - 1.0);
		that.setScaleFactor(newScale);

		var maxPanX = that.getMaxPanX();
		var maxPanY = that.getMaxPanY();

		var newPanX = maxPanX * zoomFocusX;
		var newPanY = maxPanY * zoomFocusY;

		that.setPan(newPanX, newPanY);
	}

	function endPinch () {
		pinching = false;
	}

	var previousPanPointX = 0;
	var previousPanPointY = 0;
	var startedPanOnSelectedAnnotation = false;
	var originalAnnotationLocation = null;

	function startPan (point) {

		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		if (selectedAnnotations[0] != null)
		{
			originalAnnotationLocation = selectedAnnotations[0].getCoordinates();
		}
		else if (!isTextEditorOpen())
			selectAnnotations(point, function (annotation) { return annotation.type == TabeebAnnotationType.Hotspot; });

		//showAnnotationEditor(false);

		panning = true;
		drawing = false;

		if (!isResizing() && modules.options.readOnly !== true)
		{
			$canvas.css("cursor", "move");
		}

		startPanX = (point.x);
		startPanY = (point.y);

		previousPanX = panX;
		previousPanY = panY;
		previousPanPointX = point.x;
		previousPanPointY = point.y;
		var rect = getClickRectangle(point);
		startedPanOnSelectedAnnotation = isResizing() ? true : selectedAnnotations.length > 0 && selectedAnnotations[0].collidesWithRectangle(rect, context, fontFamily, scaleFactor);
	}

	/**
	 * @param {{x:number,y:number}} point
	 */
	function movePan (point) {
		if (!isResizing() && modules.options.readOnly !== true)
		{
			$canvas.css("cursor", "move");
		}

		if (!panning || isNaN(point.x))
			return;

		//var tX = (previousPanPointX - point.x);
		//var tY = (previousPanPointY - point.y);

		//$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.translatePan, {translateX: tX, translateY: tY}));

		var panX = previousPanX + (startPanX - point.x);
		var panY = previousPanY + (startPanY - point.y);

		zoomFocusX += (startPanX - point.x);
		zoomFocusY += (startPanY - point.y);

		var selectedAnnotations = annotationMgr.getSelectedAnnotations();

		if (selectedAnnotations.length == 0 || !startedPanOnSelectedAnnotation)
			setPan(panX, panY);
		else
		{
			var translateX = (point.x - previousPanPointX) / scaleFactor;
			var translateY = (point.y - previousPanPointY) / scaleFactor;
			if (isResizing())
			{
				var direction = $canvas.css('cursor').split('-')[0];
				$.each(selectedAnnotations, function (index, annotation) {
					annotation.resize(direction, translateX, translateY);
				});
			}
			else
			{
				$.each(selectedAnnotations, function (index, annotation) {
					if (annotation.selected == true && annotation.permission !== TabeebAnnotationPermissionType.readOnly&& annotation.permission !== TabeebAnnotationPermissionType.replyOnly && (index == 0 || annotation.parentId == selectedAnnotations[0].id))
						annotation.translate(translateX, translateY);
				});
			}
			that.redrawAnnotations();
		}
		previousPanPointX = point.x;
		previousPanPointY = point.y;
	}

	this.setPan = setPan;

	this.resetPan = function () {
		panX = Math.max(0, panX);
		panY = Math.max(0, panY);

		if (panX > maxPanX)
			panX = maxPanX;

		if (panY > that.getMaxPanY())
			panY = that.getMaxPanY();
	};

	function setPan (x, y) {
		if (inVideoMode || isNaN(x) || isNaN((y)) || paintingDisabled)
			return;

		panX = Math.max(0, x);
		panY = Math.max(0, y);

		if (panX > maxPanX)
			panX = maxPanX;

		if (panY > that.getMaxPanY())
			panY = that.getMaxPanY();

		if (contentType == TabeebContentType.Text)
		{
			$textAssetContainer.scrollTop(panY);
		}

		$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.setPan, {panX: panX, panY: panY}));
		that.redrawAnnotations();
	}

	function endPan (point) {
		panning = false;
		var panX = previousPanX + (startPanX - point.x);
		var panY = previousPanY + (startPanY - point.y);

		if (panX == previousPanX && panY == previousPanY)
		{
			checkForClickedAnnotations(point, null);
		}
		else
		{
			var selectedAnnotations = annotationMgr.getSelectedAnnotations();
			if (selectedAnnotations.length == 0 || !startedPanOnSelectedAnnotation)
				setPan(panX, panY);
			else
			{
				showAnnotationEditor(true);
				//var event = $.Event(TabeebCanvasService.CanvasServiceEventType.annotationMoved, { annotations: selectedAnnotations[0], oldLocation: originalAnnotationLocation, newLocation: selectedAnnotations[0].getCoordinates() });

				selectedAnnotations.forEach(function (annotation, index) {
					if (selectedAnnotations[0].type == TabeebAnnotationType.Hotspot && index > 0)
						return;

					var newCoordinates = annotation.getCoordinates();
					annotation.setCoordinates(originalAnnotationLocation);
					var event = createAnnotationUpdateEvent(annotation, function () {
						annotation.setCoordinates(newCoordinates);
						originalAnnotationLocation = null;
					});
					$this.trigger(event);
				});
			}
		}
	}

	function showAnnotationEditor (flag) {

		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		var annotation = selectedAnnotations[0];

		if (annotation == null || flag === false || annotation.type == TabeebAnnotationType.Hotspot)
		{
			$annotationEditor.hide();
		}
		else if (flag === true)
		{
			if (annotation == null)
				return;

			var $deleteButton = $annotationEditor.find(".tabeebDeleteAnnotationButton");

			if (selectedAnnotations[0].textInfo)
				$annotationEditor.find(".tabeebEditAnnotationTextButton").show();
			else
				$annotationEditor.find(".tabeebEditAnnotationTextButton").hide();

			if (annotation.type == TabeebAnnotationType.Hotspot || annotation.canDelete === false)
			{
				$annotationEditor.hide();
				$deleteButton.hide();
			}
			else
			{
				$annotationEditor.show();
				$deleteButton.show();
			}
		}
		positionAnnotationEditor();
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @param {Function} callBackThatDoesEdits
	 * @returns {{oldAnnotationData, newAnnotationData}}
	 */
	function createAnnotationUpdateEvent (annotation, callBackThatDoesEdits) {
		// Create deep copy
		var oldAnnotationData = $.extend(true, {}, annotation);
		callBackThatDoesEdits.call();
		var newAnnotationData = $.extend(true, {}, annotation);
		return $.Event(TabeebCanvasService.CanvasServiceEventType.annotationUpdated, {
			oldAnnotationData: oldAnnotationData,
			newAnnotationData: newAnnotationData
		});
	}

	function mouseWheelReceived (event) {

		if (inVideoMode || $textAnnotationInput.is(":visible"))
			return;

		var delta = (event.originalEvent.wheelDelta || -event.originalEvent.detail || -event.originalEvent.deltaY);

		if (modules.player.contentMode == TabeebContentType.Pdf) {
			$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.mouseWheel, { delta: delta }));
			return;
		}

		if (contentType == TabeebContentType.Text)// || modules.player.contentMode == TabeebContentType.Pdf)
		{
			delta /= 15;
			if (RTCBrowserType.isFirefox())
				delta *= 45;

			setPan(panX, panY - delta);
			return;
		}

		var scale = scaleFactor;
		if (delta > 0)
			scale += 0.05;
		else
			scale -= 0.05;

		that.setScaleFactor(scale);
		setPan(panX, panY);
		that.redrawAnnotations();
	}

	/**
	 * @param {{x:number,y:number}} point
	 * @param {Function} conditionalFunction
	 */
	function selectAnnotations (point, conditionalFunction) {
		var rect = getClickRectangle(point);

		var needsRedraw = false;
		//var oldLength = selectAnnotations.length;
		endTextAnnotation();
		annotationMgr.clearSelectedAnnotations(true);

		var collidedAnnotations = getAnnotationsCollidingWithPoint(point);

		for (var i = collidedAnnotations.length - 1; i >= 0; i--)
		{
			var annotation = collidedAnnotations[i];

			if (!annotation.canBeSelected()) continue;

			if (conditionalFunction)
			{
				if (!conditionalFunction(annotation))
					continue;
			}

			if (annotation.collidesWithRectangle(rect, context, fontFamily, scaleFactor))
			{
				if (!annotation.selected)
					needsRedraw = true;
				self.selectAnnotation(annotation);
				break;
			}
		}
		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		annotationMgr.setDimmedExcept(selectedAnnotations[0]);
		//if (needsRedraw || selectAnnotations.length != oldLength)
		that.redrawAnnotations();

		if (selectedAnnotations.length == 0)
		{
			showAnnotationEditor(false);
		}
		else
		{
			showAnnotationEditor(true);
		}
	}

	function positionAnnotationEditor () {
		//if (selectedAnnotations.length == 0)
		//{
		//	showAnnotationEditor(false);
		//	return;
		//}

		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		var annotation = selectedAnnotations[0];
		if (!annotation)
			return;

		var topLeft = annotation.getRectangle(context);
		$annotationEditor.css({
			top: parseFloat($canvas.css("top")) + (topLeft.y * scaleFactor) - panY - $annotationEditor.width(),
			left: parseFloat($canvas.css("left")) + (topLeft.x * scaleFactor) - panX - $annotationEditor.height()
		});
	}

	function isTextInputMode () {
		var selectedAnnotations = annotationMgr.getSelectedAnnotations();

		return inputMode == TabeebCanvasService.CanvasInputMode.Text ||
			inputMode == TabeebCanvasService.CanvasInputMode.Callout ||
			($textAnnotationInput.is(":visible") && selectedAnnotations[0] != null && selectedAnnotations[0].textInfo != null);
	}

	function endCallout (point) {
		var payload = {
			type: TabeebAnnotationType.Callout,
			timestamp: -1,
			textInfo: currentAnnotation.textInfo,
			anchor: {x: canvasToImageCoordX(point.x), y: canvasToImageCoordY(point.y)}
		};

		$triggerElement.trigger(TabeebCanvasService.CanvasServiceEventType.textComplete, payload);
		currentAnnotation = null;
		$pluginContainer.removeClass("drawing");
		endCurrentAnnotation();
	}

	function disposeCurrentAnnotation () {
		pointsInCurrentStroke = [];
		currentAnnotation = null;
		$pluginContainer.removeClass("drawing");
	}

	function endCurrentAnnotation (parentId) {
		var scaledPoints = pointsInCurrentStroke.map(function (point) {
			return {
				x: canvasToImageCoordX(point.x),
				y: canvasToImageCoordY(point.y)
			}
		});

		scaledPoints = currentAnnotation.finalizeStrokes(scaledPoints);

		// Redraw previous strokes if this is transparent
		if (currentStrokeTransparency < 1.0)
			that.redrawAnnotations();

		var stroke = currentAnnotation.createPayload(inputMode, requestedStrokeColor, requestedStrokeWidth, scaledPoints, convertCanvasInputModeToAnnotationType(inputMode));

		if (inVideoMode)
		{
			stroke.timestamp = videoService.getCurrentPlaybackTime() - 0.1;
			if (stroke.timestamp < 0)
				stroke.timestamp = 0;
		}
		else if (inAudioMode)
		{
			stroke.timestamp = currentAudioTime;
		}
		else
			stroke.timestamp = -1;

		stroke.parentId = parentId;

		if (scaledPoints.length <= 2 && currentAnnotation.type != TabeebAnnotationType.Hotspot)
		{
			var x1 = scaledPoints[0].x;
			var y1 = scaledPoints[0].y;
			var x2 = scaledPoints[scaledPoints.length - 1].x;
			var y2 = scaledPoints[scaledPoints.length - 1].y;
			if (x1 == x2 && y1 == y2)
			{
				disposeCurrentAnnotation();
				return;
			}
		}

		awaitingYourAnnotation = true;

		if (currentAnnotation.type != -1) //-1 type is used for testing, thus not sent up
			$triggerElement.trigger(TabeebCanvasService.CanvasServiceEventType.strokeComplete, stroke);

		disposeCurrentAnnotation();
	}

	function isResizing (point) {
		return $canvas.css('cursor').indexOf('resize') >= 0;
	}

	function checkForClickedAnnotations (point, event) {
		for (var i = 0; i < currentlyDisplayedAnnotations.length; i++)
		{
			var annotation = currentlyDisplayedAnnotations[i];
			var rect = getClickRectangle(point);
			if (!isAnnotationHidden(annotation) && annotation.collidesWithRectangle(rect, context, fontFamily, scaleFactor))
			{
				var offset = self.getOffsetOfAnnotation(annotation);
				$canvasElement.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.annotationClicked, {
					annotation: annotation,
					inputMode: inputMode,
					originalEvent: event,
					canvasX: imageToCanvasCoordX(point.x),
					canvasY: imageToCanvasCoordY(point.y),
					pageX: offset.left + offset.width,
					pageY: offset.top + offset.height / 2
					//pageX: point.x + $canvas.offset().left,
					//pageY: point.y + $canvas.offset().top
				}));
			}
		}
	}

	function setLastRecordedPoint (point) {
		lastRecordedPoint.x = point.x;
		lastRecordedPoint.y = point.y;
	}

	function pointerDownReceived (event) {
		if (currentAnnotation != null && currentAnnotation.type == TabeebAnnotationType.Callout)
			return endCallout(event.point);

		var collidingAnnotations = getAnnotationsCollidingWithPoint(event.point);

		if (isTextInputMode())
		{
			if ($textAnnotationInput.val().length > 0 && $textAnnotationInput.is(":visible"))
			{
				endTextAnnotation();
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			else if (collidingAnnotations.length == 0)
				return openTextEditor(event.point);
		}
		if (!isResizing() && !isTextEditorOpen())
			selectAnnotations(event.point);

		if (TabeebInputService.isTouchDevice())
		{
			highlightHoveringAnnotations(event.point);
		}

		var selectedAnnotations = annotationMgr.getSelectedAnnotations();
		if (selectedAnnotations.length > 0 || inputMode == TabeebCanvasService.CanvasInputMode.PanZoom || (inSelectionMode() && collidingAnnotations.length > 0) || isResizing())
		{
			startPan(event.point);
			return;
		}

		if (selectedAnnotations.length > 0)
			return;

		drawing = true;
		panning = false;

		setLastRecordedPoint(event.point);

		startAnnotation();
		pointsInCurrentStroke = [event.point];
		$triggerElement.trigger(TabeebCanvasService.CanvasServiceEventType.strokeStarted);
	}

	function startAnnotation (extraData) {
		if (modules.options.readOnly === true)
			return;

		var type = convertCanvasInputModeToAnnotationType(inputMode);

		//if (type == -1) return;

		if (type != TabeebAnnotationType.Callout)
			endTextAnnotation();

		var annotationData = {
			type: convertCanvasInputModeToAnnotationType(inputMode),
			text: $textAnnotationInput.val(),
			selected: true,
			stroke: {
				color: inputMode == TabeebCanvasService.CanvasInputMode.Eraser ? "white" : requestedStrokeColor,
				width: requestedStrokeWidth
			}
		};

		$.extend(annotationData, extraData);

		$pluginContainer.addClass("drawing");
		currentAnnotation = TabeebPlayerUtil.convertPluginAnnotationToCanvasAnnotation(annotationData);

		return currentAnnotation;
	}

	/**
	 * @param {TabeebCanvasService.CanvasInputMode} canvasInputMode
	 * @returns {TabeebAnnotationType|number}
	 */
	function convertCanvasInputModeToAnnotationType (canvasInputMode) {
		if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Pen)
			return TabeebAnnotationType.Stroke;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Eraser)
			return TabeebAnnotationType.ErasedStroke;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Laser)
			return TabeebAnnotationType.LaserStroke;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Line)
			return TabeebAnnotationType.Line;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Rectangle)
			return TabeebAnnotationType.Rectangle;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Ellipse)
			return TabeebAnnotationType.Ellipse;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Rectangle_Filled)
			return TabeebAnnotationType.Rectangle_Filled;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Ellipse_Filled)
			return TabeebAnnotationType.Ellipse_Filled;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.ArrowEnd)
			return TabeebAnnotationType.ArrowEnd;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.ArrowBoth)
			return TabeebAnnotationType.ArrowBoth;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Text)
			return TabeebAnnotationType.Text;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Callout)
			return TabeebAnnotationType.Callout;
		else if (canvasInputMode == TabeebCanvasService.CanvasInputMode.Hotspot)
			return TabeebAnnotationType.Hotspot;
		else
		{
			console.error("Unknown input mode: " + canvasInputMode);
			return -1;
		}
	}

	function pointerUpReceived (event) {

		if (panning)
			return endPan(event.point);

		//if (inputMode == TabeebCanvasService.CanvasInputMode.PanZoom)
		//	checkForClickedAnnotations(event.point, event);

		if (!drawing)
			return;

		drawing = false;
		panning = false;

		if (!currentAnnotation)
			return;

		endCurrentAnnotation();
	}

	function getClickRectangle (point) {
		var rect = {
			x: canvasToImageCoordX(point.x) - 5,
			y: canvasToImageCoordY(point.y) - 5,
			width: 10,
			height: 10
		};

		if (TabeebInputService.isTouchDevice())
		{
			rect.x -= 2.5;
			rect.y -= 2.5;
			rect.width += 5;
			rect.height += 5;
		}

		return rect;
	}

	/**
	 * @param {{x:Number, y:Number}} point
	 * @returns {Array.<TabeebAnnotation>}
	 */
	function getAnnotationsCollidingWithPoint (point) {
		if (modules.options.hideAllAnnotations === true)
			return [];

		var collidedAnnotations = [];
		var clickRect = getClickRectangle(point);
		for (var i = 0; i < currentlyDisplayedAnnotations.length; i++)
		{
			var annotation = currentlyDisplayedAnnotations[i];

			if (annotation.canBeSelected() === false)
				continue;

			if (annotation.collidesWithRectangle(clickRect, context, fontFamily, scaleFactor))
			{
				collidedAnnotations.push(annotation);
			}
		}
		return collidedAnnotations;
	}

	/**
	 * @param point {{x:number, y:number}}
	 */
	function highlightHoveringAnnotations (point) {
//		if (modules.options.readOnly === true) return;

		var needsRedraw = false;
		var overResizeRectangleDirection = null;

		var foundHighlighted = false;
		var rect = getClickRectangle(point);

		for (var i = currentlyDisplayedAnnotations.length - 1; i >= 0; i--)
		{
			var annotation = currentlyDisplayedAnnotations[i];
			if (!annotation.canBeSelected() && annotation.type !== TabeebAnnotationType.Hotspot)
				continue;

			if (!inSelectionMode() && annotation.type != 6)
				continue;

			if (foundHighlighted === false && annotation.collidesWithRectangle(rect, context, fontFamily, scaleFactor))
			{
				if (!annotation.highlighted)
				{
					needsRedraw = true;
					$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.annotationMouseEnter, {annotation: annotation}));
				}
				annotation.highlighted = true;
				foundHighlighted = true;
			}
			else if (annotation.highlighted == true)
			{
				annotation.highlighted = false;
				needsRedraw = true;
				$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.annotationMouseLeave, {annotation: annotation}));
			}
			if (annotation.selected == true)
			{
				var overResizeRectangle = annotation.isRectOverResizeRectangle(rect, context, fontFamily);
				if (overResizeRectangle != -1)
					overResizeRectangleDirection = overResizeRectangle;
			}
		}

		if (overResizeRectangleDirection != null && overResizeRectangleDirection != false)
			$canvas.css('cursor', overResizeRectangleDirection + '-resize');
		else
			$canvas.css('cursor', '');

		if (needsRedraw)
			that.redrawAnnotations();

		if (foundHighlighted === true && overResizeRectangle == null && modules.options.readOnly !== true)
		{
			$canvas.css("cursor", "move");
		}

	}

	function inSelectionMode () {
		if (modules.options.readOnly === true)
			return false;

		return true;
		//return (inputMode == TabeebCanvasService.CanvasInputMode.Selection);
	}

	function pointerMoveReceived (event) {

		if (!panning && !drawing && currentAnnotation == null)
		{
			highlightHoveringAnnotations(event.point);
		}

		var collidedAnnotations = getAnnotationsCollidingWithPoint(event.point);
		if (collidedAnnotations.length > 0 && !isResizing() && modules.options.readOnly !== true)
		{
			$canvas.css("cursor", "move");
		}
		else if ($canvas.css("cursor") == "move")
			$canvas.css("cursor", "");

		if (panning)
		{
			movePan.call(this, event.point);
			return;
		}

		// Terminate the stroke if we get a mouse move without the button down
		if (drawing && !event.leftButtonDown)
		{
			pointerUpReceived.call(this, event);
			return;
		}

		if (!drawing && !currentAnnotation)
			return;

		// If the mouse was already down when it entered the canvas, start the stroke
		if (!drawing && !panning && event.leftButtonDown)
		{
			pointerDownReceived.call(this, event);
			return;
		}

		pointsInCurrentStroke.push(event.point);
		setLastRecordedPoint(event.point);
		that.redrawAnnotations();

		//            $triggerElement.trigger(TabeebInputService.InputServiceEvent.pointerMove, scaledPoint);
	}

	function isTextEditorOpen () {
		return $textAnnotationInput.is(":visible");
	}

	function positionTextEditorToAnnotation (annotation) {
		if (!annotation || !annotation.textInfo)
			return;

		var point = {
			x: imageToCanvasCoordX(annotation.textInfo.point.x),
			y: imageToCanvasCoordY(annotation.textInfo.point.y)
		};

		var canvasPosition = $canvas.position();
		var fontSize = imageToCanvasFontSize(requestedFontSize);
		$textAnnotationInput.css({
			fontSize: fontSize + "px",
			top: point.y + canvasPosition.top,
			left: point.x + canvasPosition.left
		});
	}

	/**
	 * @param {{x:number,y:number}} point
	 * @param {string} [text=] text
	 */
	function openTextEditor (point, text) {

		annotationMgr.clearSelectedAnnotations();

		if (!text) text = "";
		$triggerElement.trigger(TabeebCanvasService.CanvasServiceEventType.textStarted);

		var canvasPosition = $canvas.position();
		var fontSize = imageToCanvasFontSize(requestedFontSize);
		$textAnnotationInput.css({
			fontSize: fontSize + "px",
			top: point.y + canvasPosition.top,
			left: point.x + canvasPosition.left
		});
		$textAnnotationInput.show();
		$textAnnotationInput.val(text);
		setTimeout(function () {
			$textAnnotationInput.focus();
		}, 100);

		positionTextInput();
	}

	function connectEventHandler (func, eventName) {
		if (typeof func !== "function")
			return;

		$triggerElement.on(eventName, func);
	}

	//<editor-fold>

	//<editor-fold desc="Canvas Sizing">
	//---------------------------------------
	// Canvas sizing
	//---------------------------------------
	this.sizeCanvasForFullImage = function () {
		if (contentType == TabeebContentType.Text)
			return;

		var canvasAspectRatio = maximumCanvasSize.width / maximumCanvasSize.height;
		imageAspectRatio = backgroundSize.width / backgroundSize.height;
		if (imageAspectRatio > canvasAspectRatio)
		{
			// Constrained by the width
			setCanvasSize(maximumCanvasSize.width - CANVAS_HORIZONTAL_MARGIN, maximumCanvasSize.width / imageAspectRatio);
		}
		else
		{
			// Constrained by the height
			setCanvasSize(maximumCanvasSize.height * imageAspectRatio, maximumCanvasSize.height);
		}

		//setCanvasSize(maximumCanvasSize.width - CANVAS_HORIZONTAL_MARGIN, maximumCanvasSize.width / imageAspectRatio);
		//this.setScaleFactor($pluginContainer.find(".tabeebMediaContainer").width() / backgroundSize.width);
		//setPan(0, 0);
		panX = 0;
		panY = 0;
		this.setScaleFactor($canvas.width() / backgroundSize.width, modules.player.contentMode == TabeebContentType.Pdf);
		self.redrawAnnotations();
	};

	this.setCanvasSize = function (width, height) {
		$canvas[0].width = width;
		$canvas[0].height = height;
		setMaxPan();
	};

	function setCanvasSize (width, height) {
		$canvas.css({top: (maximumCanvasSize.height - height) / 2, left: (maximumCanvasSize.width - width) / 2});
		$canvas[0].width = width;

		//if (resizeCallback != null)
		//    resizeCallback();
		if (inVideoMode)
		{
			$canvas[0].height = height - TabeebVideoService.VIDEO_CONTROL_BAR_HEIGHT;
			videoService.resize(width, height);
		}
		else
		{
			$canvas[0].height = height;
		}

		if ($textAssetContainer.is(":visible"))
		{
			$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.canvasResized, {
				$canvasElement: $textAssetContainer,
				width: $textAssetContainer[0].width,
				height: $textAssetContainer[0].height,
				scaleFactor: 1.0
			}));
		}
		else
		{
			$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.canvasResized, {
				$canvasElement: $canvas,
				width: $canvas[0].width,
				height: $canvas[0].height,
				scaleFactor: scaleFactor
			}));
		}
	}

	/** @returns {number}*/
	this.getPanX = function () { return panX; };
	/** @returns {number}*/
	this.getPanY = function () { return panY; };
	/** @returns {number}*/
	this.getMaxPanX = function () { return Math.floor((backgroundSize.width * scaleFactor) - $canvas.innerWidth()); };
	/** @returns {number}*/
	this.getMaxPanY = function () {
		switch (contentType)
		{
			case TabeebContentType.Text:
				return $textAsset.height() - $textAssetContainer.height();
			default:
				return Math.max(0, Math.floor((backgroundSize.height * scaleFactor) - $canvas.innerHeight()));
				break;
		}
	};

	function setMaxPan () {
		if (inVideoMode)
		{
			maxPanX = 0;
			maxPanY = 0;
		}
		else if (contentType == TabeebContentType.Text)
		{
			maxPanX = 0;
			maxPanY = $textAsset.height();
		}
		else
		{
			var canvasWidth = parseInt($canvas.width()) + 4;
			var canvasHeight = parseInt($canvas.height()) + 3;
			var scaledBackgroundWidth = parseFloat(backgroundSize.width * scaleFactor);
			var scaledBackgroundHeight = parseFloat(backgroundSize.height * scaleFactor);
			var _maxPanX = Math.floor(scaledBackgroundWidth - canvasWidth);
			var _maxPanY = Math.floor(scaledBackgroundHeight - canvasHeight);

			maxPanX = Math.max(0, _maxPanX);
			maxPanY = Math.max(0, _maxPanY);
			//maxPanX = Math.floor((backgroundSize.width * scaleFactor) - $canvas.innerWidth());
			//maxPanY = Math.floor((backgroundSize.height * scaleFactor) - $canvas.innerHeight());

			// Reset panning and set background size to the new size
			$canvas.css("background-position", "0px 0px");
			$canvas.css("background-size", (backgroundSize.width * scaleFactor) + "px " + (backgroundSize.height * scaleFactor) + "px");
		}
	}

	this.setScaleFactor = function (newScaleFactor, ignoreLimits) {
		if (paintingDisabled)
			return;

		if (newScaleFactor == null)
			newScaleFactor = scaleFactor;

		if (contentType == TabeebContentType.Text || currentAnnotation != null || panning)
			return;

		if (ignoreLimits != true)
			newScaleFactor = Math.min(Math.max(newScaleFactor, this.getMinZoomLevel()), this.getMaxZoomLevel());

		var requestedWidth = backgroundSize.width * newScaleFactor;
		var requestedHeight = backgroundSize.height * newScaleFactor;

		if (requestedHeight <= maximumCanvasSize.height && requestedWidth <= maximumCanvasSize.width)
		{
			// There is space for the image on the canvas...just make the canvas the requested size
			setCanvasSize(requestedWidth, requestedHeight);
		}
		else
		{
			if (!inVideoMode)
			{

				// The image won't fit unscaled onto the canvas area...make the canvas as big as it can be
				var canvasAspectRatio = maximumCanvasSize.width / maximumCanvasSize.height;
				if (imageAspectRatio > canvasAspectRatio)
				{
					// Constrained by the width
					setCanvasSize(maximumCanvasSize.width, Math.min(maximumCanvasSize.height, backgroundSize.height * newScaleFactor));
				}
				else
				{
					// Constrained by the height
					setCanvasSize(Math.min(maximumCanvasSize.width, backgroundSize.width * newScaleFactor), maximumCanvasSize.height);
				}
			}
			else
				return;
		}

		scaleFactor = newScaleFactor;

		setMaxPan();

		$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.zoomChanged, {
			scaleFactor: scaleFactor,
			min: self.getMinZoomLevel(),
			max: self.getMaxZoomLevel()
		}));
	};

	/**
	 * @returns {TabeebVideoService}
	 */
	this.getVideoService = function () {
		return videoService;
	};

	/**
	 * @param {Number} width
	 * @param {Number} height
	 */
	this.resize = function (width, height) {
		if (width && height)
		{
			var borderWidth = parseInt($canvas.css("border-width"))*2;
			if (isNaN(borderWidth)) // IE Fix
				borderWidth = 2;
			maximumCanvasSize.width = width - borderWidth;
			maximumCanvasSize.height = height - borderWidth;
		}

		// Special case handling. If the image is scaled to show all of it, do that again with new canvas size
		if (scaleFactor == fullImageScaleFactor || inVideoMode)
		{
			// Keep the "full size" image
			this.sizeCanvasForFullImage();
			fullImageScaleFactor = scaleFactor;
		}
		else
		{
			// Try to keep the same scale factor
			this.setScaleFactor(scaleFactor);
		}
		this.redrawAnnotations();

		var $audioContainer = $canvas.parent().find(".tabeebAudioContainer");

		$textAssetContainer.css(
			{
				'height': $canvas.height() - $audioContainer.height(),
				'max-width': $canvas.width() - 60, // Minus 60 for the next/prev buttons
				"max-height": $canvas.height() - $audioContainer.height() - 55,
				'left': parseFloat($canvas.css("left")) + 31,
				'top': parseFloat($canvas.css("top")) + 1
			}
		);

		positionAnnotationEditor();

		this.hotspotManager.resize();
		this.redrawAnnotations();
	};

	this.getZoomLevel = function () { return scaleFactor; };
	this.getFullSizeZoomLevel = function () { return fullImageScaleFactor; };
	this.getMinZoomLevel = function () { return Math.min(fullImageScaleFactor, options.minZoomLevel); };
	this.getMaxZoomLevel = function () { return options.maxZoomLevel; };

	//<editor-fold>

	function onTextAssetChanged () {
		$textAsset.attr("contenteditable", false);
		var text = $textAsset.html();
		$textAsset.html(text);
		$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.textContentChanged, {'text': text}));
	}

	this.setTextMedia = function (text) {
		$this.trigger($.Event(TabeebCanvasService.CanvasServiceEventType.mediaChanged, {pageType: TabeebWhiteBoardType.Text}));
		var deferred = $.Deferred();

		$canvas.hide();
		$textAssetContainer.show();
		$textAsset.html(text);

		$canvas.css("background-color", "transparent");
		that.setScaleFactor(1.0);

		inVideoMode = false;

		// Return immediately with a success
		deferred.resolve("success");
		return deferred.promise();

	};

	function clearCurrentAnnotation () {
		drawing = false;
		panning = false;
		disposeCurrentAnnotation();
		$textAnnotationInput.hide();
	}

	//<editor-fold desc="Canvas Media Handling">
	//---------------------------------------
	// Canvas media handling
	//---------------------------------------
	this.setMedia = function (type, url, pageType, imageWidth, imageHeight) {
		clearCurrentAnnotation();

		$(this).trigger($.Event(TabeebCanvasService.CanvasServiceEventType.mediaChanged, {pageType: pageType}));
		annotationMgr.clearSelectedAnnotations();

		if (type == null)
			return;

		contentType = type;
		$textAssetContainer.hide();
		$canvas.show();

		var deferred = $.Deferred();
		$canvas.removeClass("video");
		if (type == TabeebContentType.Video)
		{
			if (!inVideoMode)
			{
				// Setup video characteristics
				inVideoMode = true;
				$canvas.addClass("video");
				$canvas.css("background-image", "");
				backgroundSize = {width: options.width, height: options.height};
				this.sizeCanvasForFullImage();
				$canvas.addClass("transparent");
			}

			videoService.play(url);
			deferred.resolve("success");
			return deferred.promise();
		}
		else if (inVideoMode)
		{
			// Exit video mode
			inVideoMode = false;
			$canvas.removeClass("video");
			videoService.hide();
			setCanvasSize.call(this, $canvas.width(), maximumCanvasSize.height);
			$canvas.removeClass("transparent");
		}

		// TBD: support other media types
		//if (type != TabeebContentType.Image && pageType != TabeebWhiteBoardType.Text)
		//{
		//	deferred.fail("failed");
		//	return deferred.promise();
		//}

		if (type == TabeebContentType.Image)
		{

			if (url == null)
			{
				$canvas.css("background-image", "");
				backgroundSize = {width: options.width, height: options.height};

				this.sizeCanvasForFullImage();
				fullImageScaleFactor = scaleFactor;
				setPan(0, 0);

				// Return immediately with a success
				deferred.resolve("success");
				return deferred.promise();
			}

			paintingDisabled = true;
			self.setLoadingState(true);

			// Get the size of the image so we can scale/constrain things
			var $img = $("<img />").attr("src", url);
			$img.on("load", function () {
				self.setLoadingState(false);
				backgroundSize.width = imageWidth ? imageWidth : this.width;
				backgroundSize.height = imageHeight ? imageHeight : this.height;
				that.sizeCanvasForFullImage();
				fullImageScaleFactor = scaleFactor;
				// Now just set the image as the background
				$canvas.css("background-image", "url(" + url + ")");
				$canvas.css("background-repeat", "no-repeat");
				$canvas.css("background-size", (backgroundSize.width * scaleFactor) + "px " + (backgroundSize.height * scaleFactor) + "px");
				$canvas.css("pointer-events", "");
				paintingDisabled = false;

				deferred.resolve("success");
			});
		}
		else if (type == TabeebContentType.Pdf)
		{
			$canvas.css({left: 0, top: 0});
			deferred.resolve("success");
		}

		return deferred.promise();
	};

	this.setLoadingState = function (isLoading) {
		if (isLoading === true)
		{
			$pluginContainer.find(".tabeebMediaContainer").css({
				"background-image": "url(https://s3.amazonaws.com/media.feastly/static/image/spinner.gif)",
				"background-position": "center",
				"background-repeat": "no-repeat",
				"background-size": "50px 50px"
			});
			$canvas.hide();
		}
		else
		{
			$pluginContainer.find(".tabeebMediaContainer").css("background-image", "");
			$canvas.show();
		}
	};

	this.clearMedia = function () {
		$canvas.css("background-image", "");
		backgroundSize = {width: options.width, height: options.height};
		return this;
	};

	this.setBackgroundSize = function (width, height) {
		backgroundSize = {width: width, height: height};
		this.setScaleFactor(scaleFactor);
		return this;
	};

	function onAudioTimeUpdated (event) {
		if (event == null || inVideoMode)
			return;

		currentAudioTime = event.currentTime;
		updateTimedAnnotationTime(event.currentTime);
	}

	function onVideoTimeUpdated (event, timeObj) {
		if (event == null)
			return;
		currentVideoTime = timeObj.time;

		updateTimedAnnotationTime(currentVideoTime);
	}

	function updateTimedAnnotationTime (time) {
		var annotationsToDisplay = getActiveAnnotations(time);

		// See if there are any changes

		var changes = false;
		var clearSelectedAnnotations = false;
		if (annotationsToDisplay.length != currentlyDisplayedAnnotations.length)
		{
			changes = true;
		}
		else
		{
			for (var i = 0; i < annotationsToDisplay.length; i++)
			{
				var id = annotationsToDisplay[i].id;

				var annotation = $.grep(currentlyDisplayedAnnotations, function (a) { //noinspection JSReferencingMutableVariableFromClosure
					return a.id == id;
				});
				if (annotation == null)
				{
					changes = true;
					break;
				}
			}
		}

		var selectedAnnotations = annotationMgr.getSelectedAnnotations();

		selectedAnnotations.forEach(function (annotation) {
			var found = false;
			for (var i = 0; i < annotationsToDisplay.length; i++)
			{
				if (annotationsToDisplay[i].id == annotation.id)
				{
					found = true;
					break;
				}
			}
			if (found === false)
			{
				clearSelectedAnnotations = true;
			}
		});

		for (var i = 0; i < selectedAnnotations; i++)
		{
			var annotations = $.grep(annotationsToDisplay, function (a) { //noinspection JSReferencingMutableVariableFromClosure
				return a.id == id;
			});
			if (annotations == null && currentlyDisplayedAnnotations[i].selected === true)
			{
				clearSelectedAnnotations = true;
				break;
			}
		}

		if (clearSelectedAnnotations === true)
		{
			annotationMgr.clearSelectedAnnotations();
		}

		// Redraw all annotations if there were changes.
		if (changes)
		{
			context.clearRect(0, 0, $canvas[0].width, $canvas[0].height);
			drawAnnotations.call(that, annotationsToDisplay);
			currentlyDisplayedAnnotations = annotationsToDisplay;
		}
	}

	function getActiveAnnotations (time) {
		var interval = options.annotationDisplayInterval;
		var parentId = null;
		if (inAudioMode)
		{
			interval = 999999;
			//parentId = self.audioService.getCurrentAudio().annotationId;
		}

		var activeAnnotations = annotationMgr.getAnnotationsByTime(time, interval, parentId);

		return activeAnnotations;
	}

	this.getCurrentlyDrawnAnnotations = function () { return currentlyDisplayedAnnotations; };

	//<editor-fold>

	//<editor-fold desc="Canvas Media Handling">
	//---------------------------------------
	// Canvas drawing
	//---------------------------------------

	this.canvasToImageCoordX = canvasToImageCoordX;
	this.canvasToImageCoordY = canvasToImageCoordY;
	this.imageToCanvasCoordX = imageToCanvasCoordX;
	this.imageToCanvasCoordY = imageToCanvasCoordY;

	function canvasToImageCoordX (x) { return (panX + x) / scaleFactor; }

	function canvasToImageCoordY (y) { return (panY + y) / scaleFactor; }

	function imageToCanvasCoordX (x) { return x * scaleFactor - panX; }

	function imageToCanvasCoordY (y) { return y * scaleFactor - panY; }

	function imageToCanvasFontSize (size) { return size * scaleFactor; }

	this.clearAnnotations = function () {
		context.clearRect(0, 0, $canvas[0].width, $canvas[0].height);
		self.hotspotManager.hide();
		return this;
	};

	function drawAnnotations (annotations) {
		hotspotCount = 0;
		for (var i = 0; i < annotations.length; i++)
		{
			var annotation = annotations[i];
			if (annotation.type == TabeebAnnotationType.Hotspot)
			{
				annotation.hotspotCount = ++hotspotCount;
			}
			var ownerUserId = annotations[i].layerId;
			if (mutedUserIds.indexOf(ownerUserId) == -1)
				displayAnnotation.call(this, annotations[i]);
		}
	}

	function isAnnotationHidden (annotation) {
		var layerId = annotation.layerId;
		return mutedUserIds.indexOf(layerId) >= 0;
	}

	this.redrawAnnotations = function () {
		update();
		paint();
		return this;
	};

	function update () {
	}

	function paint () {
		if (paintingDisabled) return;

		context.clearRect(0, 0, $canvas[0].width, $canvas[0].height);

		if (modules.options.hideAllAnnotations !== true)
		{
			var activeAnnotations = getActiveAnnotations.call(this, getPlaybackTime());
			drawAnnotations(activeAnnotations);
			currentlyDisplayedAnnotations = activeAnnotations;

			if (currentAnnotation)
				currentAnnotation.preview(context, pointsInCurrentStroke, panX, panY, scaleFactor, fontFamily);
		}
		else if (modules.options.hideAllAnnotations === true)
		{
			currentlyDisplayedAnnotations = [];
		}

		positionAnnotationEditor();

		if (laserPointerPosition.x > 0)
			drawLaserPointer(laserPointerPosition.x, laserPointerPosition.y);

		$canvas.css("background-position", -panX + "px " + -panY + "px");
		$canvas.css("background-size", (backgroundSize.width * scaleFactor) + "px " + (backgroundSize.height * scaleFactor) + "px");
	}

	function drawLaserPointer (x, y) {
		context.beginPath();
		context.fillStyle = 'red';
		context.lineWidth = 2;
		context.strokeStyle = 'red';
		context.arc(x, y, 5, 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
	}

	var fontFamily = $textAnnotationInput.css("font-family");

	/**
	 * @param {TabeebAnnotation} annotation
	 */
	function displayAnnotation (annotation) {
		if (!annotation.invisible && !paintingDisabled)
		{
			annotation.draw(context, panX, panY, scaleFactor, fontFamily);
			if ((inSelectionMode() || annotation.type == 6) && (annotation.highlighted == true || annotation.selected))
			{
				annotation.drawHighlighted(context, panX, panY, scaleFactor, fontFamily);
			}
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 */
	this.displayLaserAnnotation = function (annotation) {
		annotation = TabeebPlayerUtil.convertPluginAnnotationToCanvasAnnotation(annotation);
		displayAnnotation.call(this, annotation);

		// Time delay then erase
		setTimeout(function () {
			that.redrawAnnotations();
		}, 500);
	};

	//<editor-fold>

	this.dispose = function () {
		videoService.dispose();
		inputService.dispose();
		this.hotspotManager.dispose();
	};
}

TabeebCanvasService.defaults = {
	pointerMove: function () { },
	strokeStarted: function () { },
	strokeComplete: function () { },
	textStarted: function () { },
	textComplete: function () { },
	annotationsDisplayed: function () { },
	width: 1000,
	height: 750,
	minZoomLevel: 0.2,
	maxZoomLevel: 2,
	annotationDisplayInterval: 5
};

/**
 * @readonly
 * @enum {Number}
 */
TabeebCanvasService.CanvasInputMode =
{
	None: 0,
	Pen: 1,
	Eraser: 2,
	Laser: 3,
	Text: 4,
	PanZoom: 5,
	Line: 6,
	Selection: 7,
	Rectangle: 8,
	Rectangle_Filled: 9,
	Ellipse: 10,
	Ellipse_Filled: 11,
	ArrowEnd: 12,
	Callout: 13,
	ArrowBoth: 14,
	Hotspot: 15
};

/**
 * @readonly
 * @enum {String}
 */
TabeebCanvasService.CanvasServiceEventType =
{
	strokeStarted: "strokeStarted", // No parameters
	strokeComplete: "strokeComplete",  // Parameter: { mode: CanvasInputMode, color: string, width: number, endpoints: [ { x: number, y: number } ]
	textStarted: "textStarted", // No parameters
	textComplete: "textComplete",  // Parameter: { text: string, color: string, fontSize: int, point: { x: number, y: number } }
	annotationsDisplayed: "annotationsDisplayed", // No parameters
	canvasResized: "canvasResized",
	zoomChanged: "canvasZoomChanged",
	textContentChanged: "textContentChanged",
	mediaChanged: "mediaChanged",
	annotationDeleted: "annotationDeleted",
	annotationUpdated: "annotationUpdated",
	annotationClicked: "annotationClicked",
	annotationMouseEnter: "annotationMouseEnter",
	annotationMouseLeave: "annotationMouseLeave",
	laserPointerMoved: "laserPointerMoved",
	translatePan: "translatePan",
	setPan: "setPan",
	annotationSelected: "annotationSelected",
	annotationUnselected: "annotationUnselected",
	mouseWheel: "mouseWheel"
};