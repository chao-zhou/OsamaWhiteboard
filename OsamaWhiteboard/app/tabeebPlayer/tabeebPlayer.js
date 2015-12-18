"use strict";

var TabeebPlayer;

(function ($ /*, window, document, undefined */) {

	var pluginBaseUrl = TabeebPlayerUtil.getPluginBaseUrl();

	// Calculate the location of the plugin pieces
	var MIN_WIDTH_FOR_TWO_PANELS = 800;

	// Main object for the player. This is accessed using the JQuery "data" function.
	/**
	 * @param {jQuery} $elementIn
	 * @param {$.fn.tabeebPlayer.defaults} optionsIn
	 * @class
	 */
	TabeebPlayer = function TabeebPlayer($elementIn, optionsIn) {
		var self = this;

		this.$element = $elementIn;

		this.ready = false;

		/**@type {jQuery}*/
		this.$pluginContainer = null;
		/**@type {jQuery}*/
		this.$controlBar = null;
		/**@type {jQuery}*/
		this.$palette = null;
		/**@type {jQuery}*/
		this.$leftPanel = null;
		/**@type {$.fn.tabeebPlayer.defaults}*/
		this.options = $.extend(true, {}, optionsIn); // Make own (deep) copy
		/**@type {TabeebCanvasService}*/
		this.canvasService = null; // CanvasService object to handle canvas operations
		/**@type {TabeebAudioService}*/
		this.audioService = null;
		/**@type {TabeebGalleryService}*/
		this.galleryService = null;
		this.slides = [];
		/**@type {TabeebAnnotationManager}*/
		this.annotationMgr = null;
		/**@type {TabeebHUDService}*/
		this.hudService = null;
		/**@type {TabeebSidebarService}*/
		this.sidebarService = null;
		/**@type {TabeebUserManager}*/
		this.userMgr = null;
		/**@type {TabeebChatManager}*/
		this.chatMgr = null;

		this.contentMode = TabeebContentType.Image;

		this.contentName = "";

		this.participants = [];
		this.firstContent = true;

		/**@type {TabeebPresenterManager}*/
		this.presenterManager = null;
		this.currentSlideIndex = 0;
		this.whiteboardType = null;
		this.undoManager = null;

		this.onContentLoadedCallbackQueue = [];

		/**@type {TabeebModules}*/
		this.modules = {
			hudService: null,
			userManager: null,
			chatManager: null,
			annotationManager: null,
			presenterManager: null,
			sidebarService: null,
			galleryService: null,
			canvasService: null,
			audioService: null,
			inviteDialog: null,
			videoService: null,
			globalAnnotationManager: new TabeebAnnotationManager(),
			player: self,
			undoManager: null,
			options: this.options
		};

		var userEnteredPresentationAudio;
		var userLeftPresentationAudio;

		init();

		/////////////////////

		function toggleFullScreen() {
			var doc = window.document;
			var docEl = doc.documentElement;

			if (doc.requestFullScreen)
				doc.requestFullScreen();
			else if (docEl.requestFullScreen)
				docEl.requestFullScreen();
		}

		function loadStyleSheet(url, cb) {
			var $link = $('<link rel="stylesheet" type="text/css" />').attr("href", url);
			$link.load(cb);
			$("head").append($link);
		}

		function init () {

			initSounds();

			if (typeof jQuery.ui === 'undefined') {
				console.error("jQuery UI is required for the Tabeeb Plugin.");
				self.$element.trigger(TabeebEvent.error, { message: "jQuery UI is not loaded." });
			}

			if (TabeebInputService.isTouchDevice())
				self.$element.one("click", function () { toggleFullScreen(); });

			// Setup event handlers
			connectEventHandler(self.options.undo, TabeebEvent.undo);
			connectEventHandler(self.options.redo, TabeebEvent.redo);
			connectEventHandler(self.options.annotationAdded, TabeebEvent.annotationAdded);
			connectEventHandler(self.options.annotationDeleted, TabeebEvent.annotationDeleted);
			connectEventHandler(self.options.annotationRestored, TabeebEvent.annotationRestored);
			connectEventHandler(self.options.annotationUpdateRestored, TabeebEvent.annotationUpdateRestored);
			connectEventHandler(self.options.previousMedia, TabeebEvent.previousMedia);
			self.$element.on(TabeebEvent.nextMedia + " " + TabeebEvent.previousMedia + " " + TabeebEvent.setMedia, function () { self.canvasService.clearAnnotations(); });
			connectEventHandler(self.options.nextMedia, TabeebEvent.nextMedia);
			connectEventHandler(self.options.setMedia, TabeebEvent.setMedia);
			connectEventHandler(self.options.contentDisplayed, TabeebEvent.contentDisplayed);
			connectEventHandler(self.options.annotationsDisplayed, TabeebEvent.annotationsDisplayed);
			connectEventHandler(self.options.loaded, TabeebEvent.loaded);
			connectEventHandler(self.options.error, TabeebEvent.error);
			connectEventHandler(self.options.galleryRequested, TabeebEvent.galleryRequested);
			connectEventHandler(self.options.deletePage, TabeebEvent.deletePage);
			connectEventHandler(self.options.audioRecordingAdded, TabeebEvent.audioRecordingAdded);
			connectEventHandler(self.options.penColorChanged, TabeebEvent.penColorChanged);
			connectEventHandler(self.options.textContentChanged, TabeebEvent.textContentChanged);
			connectEventHandler(self.options.annotationsUpdated, TabeebEvent.annotationsUpdated);
			connectEventHandler(self.options.userInvited, TabeebEvent.inviteUser);
			connectEventHandler(self.options.externalUserInvited, TabeebEvent.inviteExternalUser);
			connectEventHandler(self.options.connectToPresentation, TabeebEvent.connectToPresentation);
			connectEventHandler(self.options.disconnectFromPresentation, TabeebEvent.disconnectFromPresentation);
			connectEventHandler(self.options.onChatMessageAdded, TabeebChatPanel.Events.sendChatMessage);
			connectEventHandler(self.options.completelyLoaded, TabeebEvent.completelyLoaded);
			connectEventHandler(self.options.onPresenterChangeRequest, TabeebEvent.requestPresenterChange);
			connectEventHandler(self.options.annotationSelected, TabeebEvent.annotationSelected);
			connectEventHandler(self.options.annotationUnselected, TabeebEvent.annotationUnselected);
			$(self).on(TabeebPresenterEvent.updatePresenterState, self.options.updatePresenterState);

			//connectEventHandler(self.options.updatePresenterState, TabeebPresenterEvent.updatePresenterState);

			self.$element.on(TabeebEvent.nextMedia + " " + TabeebEvent.previousMedia + " " + TabeebEvent.setMedia, function () {
				self.canvasService.clearAnnotations();
			});

			// Load the tabeebPlayer style sheet
			var $head = $("head");

			if ($head.find("link[href$='tabeebPlayer.css']").length == 0)
				$head.append($('<link rel="stylesheet" type="text/css" />').attr('href', pluginBaseUrl + 'tabeebPlayer.css'));

			function onStyleSheetLoaded () {
				self.handleResize();
			}

			// Load the video.js components
			if (self.options.autoLoadCSS === true)
			{
				loadStyleSheet(pluginBaseUrl + 'vendor/videojs/video-js.css', onStyleSheetLoaded);
				loadStyleSheet(pluginBaseUrl + 'canvas/tabeebPlayerHotspots.css', onStyleSheetLoaded);
				loadStyleSheet(pluginBaseUrl + 'hud/styling/hud.css', onStyleSheetLoaded);
				loadStyleSheet(pluginBaseUrl + 'sidebar/styling/tabeebSidebar.css', onStyleSheetLoaded);
			}
			loadPluginHtml.call(self);

			// Initialize tooltips

			if (self.options.tooltips && !TabeebInputService.isTouchDevice())
				self.$element.children().tooltip();

			self.drawMode = self.options.defaultDrawModeType;
			self.modules.inviteDialog = new TabeebInviteDialog(self.$element, self.userMgr, self.options);
			self.$element.on(TabeebEvent.optionsUpdated, onOptionsUpdated);
		}

		function onOptionsUpdated (event) {
			/**@type {$.fn.tabeebPlayer.defaults}*/
			var opts = event.updatedOptions;
			if (opts.hasOwnProperty("hiddenButtons")) {
				setupHiddenButtons();
			}
		}

		function createCustomColorStyling () {
			if (!self.options.themeColor)
				return;

			self.$element.append("<style>.tabeebCustomColorOnActive.active, .tabeebCustomColor, .tabeebCustomColorOnActive.selected { color: " + self.options.themeColor + " !important; } .tabeebCustomBGColor, .tabeebCustomBGColorOnActive.active { background: " + self.options.themeColor + " !important; } .tabeebControlBarItems { border-color: " + self.options.themeColor + " !important; }</style>");
		}

		function initSounds() {
			userEnteredPresentationAudio = new Audio(self.options.userJoinedPresentationAudioUrl);
			userLeftPresentationAudio = new Audio(self.options.userLeftPresentationAudioUrl);
		}

		function onAnnotationSelected (event) {
			var annotation = event.annotation;
			self.$element.trigger(TabeebEvent.annotationSelected, {annotationId: annotation.id, parentAnnotationId: annotation.parentId});
		}

		function onAnnotationUnselected (event) {
			var annotation = event.annotation;
			self.$element.trigger(TabeebEvent.annotationUnselected, {annotationId: annotation.id, parentAnnotationId: annotation.parentId});
		}

		function onAllModulesLooaded () {
			self.$pluginContainer.find(".tabeebPluginMainArea").css("padding", self.modules.options.padding);
			$(self.modules.annotationManager).on(TabeebAnnotationManager.Events.annotationSelected, onAnnotationSelected);
			$(self.modules.annotationManager).on(TabeebAnnotationManager.Events.annotationUnselected, onAnnotationUnselected);

			//self.modules.hotspotManager.getTriggerElement().on(TabeebCanvasHotspotManager.Events.annotationSelected, onAnnotationSelected);
			//self.modules.hotspotManager.getTriggerElement().on(TabeebCanvasHotspotManager.Events.annotationUnselected, onAnnotationUnselected);

			self.modules.canvasService.hotspotManager.onReady(self.options.hotspotOnReady);
		}

		function setupHiddenButtons () {
			self.$pluginContainer.find(".tabeebHiddenButton, .tabeebInvisibleButton").removeClass("tabeebHiddenButton").removeClass("tabeebInvisibleButton");

			for (var i = 0; i < self.options.hiddenButtons.length; i++)
			{
				var $button = self.$pluginContainer.find(".tabeeb" + self.options.hiddenButtons[i] + "Button");
				if ($button.length > 0)
				{
					if (self.options.hiddenButtons[i] === "DrawMode")
						$button.addClass("tabeebInvisibleButton");
					else
						$button.addClass("tabeebHiddenButton");
				}
				else
					console.warn(self.options.hiddenButtons[i] + " was not found in the HTML.");
			}
		}

		function loadPluginHtml() {
			self.annotationMgr = new TabeebAnnotationManager();
			self.modules.annotationManager = self.annotationMgr;
			self.userMgr = new TabeebUserManager();
			self.modules.userManager = self.userMgr;
			self.chatMgr = new TabeebChatManager();
			self.modules.chatManager = self.chatMgr;
			// Load the basic structure from HTML
			var defaultDrawModeType = self.options.defaultDrawModeType;
			self.$element.load(pluginBaseUrl + "tabeebPlayer.html", function (response, status) {
				createCustomColorStyling();
				if (status == "error")
				{
					self.$element.trigger(TabeebEvent.error, { message: "Failed to load plugin structure" });
					return;
				}

				self.$pluginContainer = self.$element.children(".tabeebPluginContainer");
				self.$controlBar = $(this).find(".tabeebControlBar");
				self.$leftPanel = self.$pluginContainer.find(".tabeebPluginMainArea");
				self.$palette = $(this).find(".tabeebDrawingPalette");
				self.$shapes = $(this).find(".tabeebShapeOptions");

				initializeLayout.call(self);
				initializeAudio.call(self);

				self.presenterManager = new TabeebPresenterManager(self, self.galleryService, self.userMgr, $(self.audioService), $(self.canvasService.getVideoService()));
				self.modules.videoService = self.canvasService.getVideoService();
				self.modules.presenterManager = self.presenterManager;

				$(self.presenterManager).on(TabeebPresenterManager.Events.participantOnlineStatusChanged, onOnlineStatusChange);


				var $undoButton = self.$pluginContainer.find(".tabeebUndoButton");
				var $redoButton = self.$pluginContainer.find(".tabeebRedoButton");
				self.undoManager = new TabeebUndoManager(self.$element, self.canvasService, self.annotationMgr, $undoButton, $redoButton);
				self.modules.undoManager = self.undoManager;

				self.handleResize();

				// Set it to disabled until we get media/content
				setupHiddenButtons();

				if (self.options.controlBarContainer != null)
				{
					setTimeout(function () {
						$(self.options.controlBarContainer).append(self.$controlBar).append(self.$palette);
					}, 1);
				}

				self.sidebarService = new TabeebSidebarService(pluginBaseUrl, self.$pluginContainer, self.$element, self.modules, self.options);
				self.modules.sidebarService = self.sidebarService;
				self.hudService = new TabeebHUDService(self.$pluginContainer, self.$element, self.modules, self.options.hudServiceOptions);
				self.modules.hudService = self.hudService;
				self.hudService.setDrawMode(defaultDrawModeType);
				self.$element.trigger(TabeebEvent.loaded);
				self.$pluginContainer.removeClass("loading");
				self.handleResize();

				onAllModulesLooaded();
			});

			if (TabeebInputService.isTouchDevice())
			{
				self.$element.addClass("mobile");
			}

			self.$element.show();

			self.$element.on(TabeebEvent.nextMedia + " " + TabeebEvent.previousMedia + " " + TabeebEvent.setMedia, function () {
				self.canvasService.clearAnnotations();
			});
		}

		function initPdfManager() {
			var $mediaContainer = self.$leftPanel.find(".tabeebMediaContainer");
			self.modules.pdfManager = new PDFManager($mediaContainer, {
				minZoom: self.modules.options.minZoomLevel,
				maxZoom: self.modules.options.maxZoomLevel
			});
			var pdfMgr = self.modules.pdfManager;
			var canvasService = self.modules.canvasService;
			pdfMgr.setTextLayerEnabled(false);

			function setCanvasSizeRelativeToPdfCanvas (canvas) {
				var width = Math.min(canvas.width, $mediaContainer.width());
				var height = Math.min(canvas.height, $mediaContainer.height());
				self.modules.canvasService.setCanvasSize(width, height);
			}

			pdfMgr
				.addEventListener(PDFManager.Events.documentReady, function (event) {
					var pageSize = pdfMgr.getPageSize();
					self.modules.canvasService.setBackgroundSize(pageSize.width, pageSize.height);

					setCanvasSizeRelativeToPdfCanvas(event.canvas);
					self.modules.canvasService.setScaleFactor(event.scaleFactor);
					self.modules.canvasService.setPan(0, 0);
					self.modules.canvasService.setLoadingState(false);
					//self.modules.canvasService.redrawAnnotations();
				})
				.addEventListener(PDFManager.Events.canvasOffsetChanged, function (event) {
					self.$pluginContainer.find(".tabeebCanvas").css({
						"left": event.left,
						"top": event.top
					});
					setCanvasSizeRelativeToPdfCanvas(event.canvas);
					self.modules.canvasService.redrawAnnotations();
				})
				.addEventListener(PDFManager.Events.zoomChanged, function (event) {
					setCanvasSizeRelativeToPdfCanvas(event.canvas);
					self.modules.canvasService.setScaleFactor(event.scaleFactor, true);
					self.modules.canvasService.redrawAnnotations();
					self.modules.canvasService.setPan(canvasService.getPanX(), canvasService.getPanY());
					pdfMgr.setPan(canvasService.getPanX(), canvasService.getPanY());
				})
				.addEventListener(PDFManager.Events.panChanged, function (event) {
					//self.modules.canvasService.redrawAnnotations();
				})
				.addEventListener(PDFManager.Events.loading, function () {
					self.modules.canvasService.setLoadingState(true);
				});

			$(self.modules.canvasService).on(TabeebCanvasService.CanvasServiceEventType.setPan, function (event) {
				pdfMgr.setPan(event.panX, event.panY);
			}).on(TabeebCanvasService.CanvasServiceEventType.mouseWheel, function (event) {
				var delta = event.delta;
				var currentScale = pdfMgr.getScale();
				if (delta > 0)
				{
					currentScale += 0.05;
				}
				if (delta < 0) {
					currentScale -= 0.05;
				}
				pdfMgr.setScale(currentScale);
			});
		}

		function onOnlineStatusChange (event) {
			var isOnline = event.isConnected;
			if (isOnline)
			{
				userEnteredPresentationAudio.play();
			}
			else
			{
				userLeftPresentationAudio.play();
			}

		}

		// <editor-fold desc="Event handling from canvas service">
		function onCanvasPointerMove(event, scaledPoint) {
			//if (event == null || scaledPoint == null)
			//    return;
		}

		function onCanvasStrokeStarted() {
			// Hide the drawing palette
			self.$palette.hide();
			self.$shapes.hide();
		}

		function convertCanvasEndpointsToPluginCoordinates(endpoints) {
			var coordinates = [];
			for (var i = 1; i < endpoints.length; i++)
			{
				coordinates.push({
					start: {x: endpoints[i - 1].x, y: endpoints[i - 1].y},
					end: {x: endpoints[i].x, y: endpoints[i].y}
				});
			}
			return coordinates;
		}

		function onCanvasStrokeComplete(event, stroke) {
			var player = this;
			if (event == null)
				return;

			if (stroke.mode == TabeebCanvasService.CanvasInputMode.Laser)
			{
				// Redraw the strokes after the timeout to remove the laser stroke from the screen
				var canvasService = player.canvasService;
				setTimeout(function () {
					canvasService.redrawAnnotations();
				}, 500);
			}

			player.$element.trigger(TabeebEvent.annotationAdded, {
				type: stroke.type,
				timestamp: stroke.timestamp,
				stroke: {
					color: stroke.color,
					width: stroke.width,
					endpoints: convertCanvasEndpointsToPluginCoordinates(stroke.endpoints)
				},
				parentId: stroke.parentId
			});
		}

		function onCanvasTextStarted() {
			var player = this;
			// Hide the drawing palette
			player.$palette.hide();
			player.$shapes.hide();
		}

		function onCanvasTextComplete(event, info) {
			var player = this;
			if (event == null)
				return;

			var payload = null;

			if (info.type == TabeebAnnotationType.Text)
				payload = {
					type: info.type,
					timestamp: info.textInfo.timestamp,
					textInfo: info.textInfo,
					parentId: info.parentId
				};
			else if (info.type == TabeebAnnotationType.Callout)
			{
				payload = info;
			}
			else
				console.error("Unknown text annotation type: " + info.type);

			player.$element.trigger(TabeebEvent.annotationAdded, payload);
		}

		function onCanvasAnnotationsDisplayed() {
			var player = this;
			player.$element.trigger(TabeebEvent.annotationsDisplayed);
		}

		// </editor-fold>

		// <editor-fold desc="Initialization and layout">
		function initializeLayout() {
			var player = this;
			player.canvasService = new TabeebCanvasService($(this), self.modules,
				player.$pluginContainer.find(".tabeebCanvas"),
				player.$pluginContainer.find(".tabeebVideoContainer"),
				{
					pointerMove: onCanvasPointerMove,
					strokeStarted: onCanvasStrokeStarted,
					strokeComplete: onCanvasStrokeComplete,
					textStarted: onCanvasTextStarted,
					textComplete: onCanvasTextComplete,
					annotationsDisplayed: onCanvasAnnotationsDisplayed,
					width: player.options.width,
					height: player.options.height,
					minZoomLevel: player.options.minZoomLevel,
					maxZoomLevel: player.options.maxZoomLevel,
					annotationDisplayInterval: player.options.annotationDisplayInterval
				},
				self.options
			);
			self.modules.canvasService = player.canvasService;

			initPdfManager();
			initGalleryService();

			$(player.canvasService).on(TabeebCanvasService.CanvasServiceEventType.textContentChanged, function (event) { onTextContentChanged.call(player, event.text); });
			//$(player.canvasService).on(TabeebCanvasService.CanvasServiceEventType.annotationMoved, function (event) {
			//    event.type = TabeebEvent.annotationsUpdated;
			//    player.$element.trigger(event);
			//    player.$element.trigger($.Event(TabeebOperationEvent.annotationMoved, {annotation: event.annotations[0], oldLocation: event.oldLocation, newLocation: event.newLocation}));
			//});
			$(player.canvasService).on(TabeebCanvasService.CanvasServiceEventType.annotationDeleted, function (event) {
				event.type = TabeebEvent.annotationDeleted;
				player.$element.trigger(event, event.annotation);
				player.$element.trigger($.Event(TabeebOperationEvent.annotationDeleted, {annotation: event.annotation}));
			});
			$(player.canvasService).on(TabeebCanvasService.CanvasServiceEventType.annotationUpdated, function (event) {
				player.$element.trigger($.Event(TabeebEvent.annotationsUpdated, {annotations: [event.newAnnotationData]}));
				player.$element.trigger($.Event(TabeebOperationEvent.annotationUpdated, {
					oldAnnotationData: event.oldAnnotationData,
					newAnnotationData: event.newAnnotationData
				}));
			});
		}

		function initGalleryService() {
			var $gallery = self.$pluginContainer.find(".tabeebGalleryContainer");
			self.galleryService = new TabeebGalleryService(self.$element, $gallery, self.options.galleryServiceOptions);
			self.modules.galleryService = self.galleryService;
			self.$element.on(TabeebEvent.setMedia, function () { self.firstContent = true; });
		}

		function onTextContentChanged(text) {
			var player = this;
			player.$element.trigger($.Event(TabeebEvent.textContentChanged, {text: text}));
		}

		// Audio

		function initializeAudio() {
			var player = this;

			player.audioService = new TabeebAudioService(
				player.annotationMgr,
				player.$pluginContainer.find(".tabeebAudioContainer"),
				$(player.canvasService.getVideoService()),
				self.modules,
				{
					userId: player.options.userId
				}
			);
			player.modules.audioService = player.audioService;

			player.canvasService.audioService = player.audioService;
			player.canvasService.bindAudioEvents();

			$(player.audioService).on(TabeebAudioService.AudioEvent.recordingFinished, function (event) {
				var e = $.Event(TabeebEvent.audioRecordingAdded, {
					timestamp: event.timestamp,
					audioType: event.audioType,
					audioData: event.audioData,
					size: event.size,
					duration: event.duration,
					parentAnnotation: event.parentAnnotation
				});

				player.$element.trigger(e);
			});

			$(player.audioService).on(TabeebAudioService.AudioEvent.audioDeleted, function (event) {
				var annotationId = event.annotationId;
				var annotation = player.annotationMgr.find(annotationId);
				player.annotationMgr.remove(annotationId);

				player.$element.trigger(TabeebEvent.annotationDeleted, annotation);
			});

			$(player.canvasService).on(TabeebCanvasService.CanvasServiceEventType.canvasResized, function (event) {
				player.audioService.resize(event.$canvasElement);
			});
		}

		function connectEventHandler(func, eventName) {
			if (typeof func !== "function")
				return;

			self.$element.on(eventName, func);
		}

		/**
		 * @param {Function} callback
		 */
		this.onReady = function (callback) {
			if (this.ready === true)
				callback();
			else
				this.$element.one(TabeebEvent.contentDisplayed, function () { callback(); });
		};

		this.bindGalleryEvents = function ()
		{
			console.warn("No longer implemented");
		};

		this.unbindGalleryEvents = function () {
			console.warn("No longer implemented");
		};

		this.getSlideIndex = function () { return this.currentSlideIndex; };

		this.handleResize = function () {
			if (!self.hudService)
				return;

			if (self.sidebarService)
				self.sidebarService.resize();

			// When in text mode on a touch device, don't handle resizing since it messes with the location of the textarea
			if (TabeebInputService.isTouchDevice() && this.hudService.getScreenMode() == TabeebScreenModeType.Draw && self.hudService.getDrawMode() == TabeebDrawModeType.Text)
				return;

			var playerWidth = this.$element.innerWidth();
			var playerHeight = this.$element.innerHeight();

			// Width of left and right panels
			var rightPanelWidth = self.sidebarService.getWidth();
			if (playerWidth < MIN_WIDTH_FOR_TWO_PANELS)
			{
				rightPanelWidth = 0;
			}

			// Full plugin - full size
			//player.$pluginContainer.width(playerWidth);
			//player.$pluginContainer.height(playerHeight);

			if (this.$pluginContainer == null)
				return;

			// Main window (left panel)
			var $leftPanel = this.$leftPanel;
			var leftPanelPadding = $leftPanel.innerWidth() - $leftPanel.width();
			var leftPanelWidth = playerWidth - rightPanelWidth - leftPanelPadding;
			var availableHeight = playerHeight - leftPanelPadding;
			$leftPanel.width(leftPanelWidth);
			$leftPanel.height(availableHeight);

			// Right panel
			var $rightPanel = this.$pluginContainer.find(".tabeebPluginRightPanel");
			if (rightPanelWidth == 0)
			{
				$rightPanel.hide();
			}
			else
			{
				$rightPanel.show();
				var elementPadding = $rightPanel.innerWidth() - $rightPanel.width();
				$rightPanel.width(rightPanelWidth);
				$rightPanel.height(playerHeight - elementPadding);
				$rightPanel.css({left: leftPanelWidth + leftPanelPadding});
			}

			// Size and position the main media container - the container for the canvas, video, etc.
			var $mediaContainer = $leftPanel.find(".tabeebMediaContainer");
			var containerPadding = $mediaContainer.innerWidth() - $mediaContainer.width();
			var $slideTitle = this.$pluginContainer.find(".slideTitle");
			availableHeight -= containerPadding;
			if ($slideTitle.is(":visible"))
				availableHeight -= $slideTitle.height();
			var $bottomBar = this.$pluginContainer.find(".tabeebBottomBar");
			if ($bottomBar.is(":visible"))
				availableHeight -= $bottomBar.height();

			var $navigationBar = self.$pluginContainer.find(".tabeebNavigationBar");

			var $bottomHUD = self.$pluginContainer.find(".tabeebBottomHUD").not(".tabeebInvisibleButton");

			if ($bottomHUD.is(":visible"))
				availableHeight -= ( parseFloat($navigationBar.css('bottom')) + parseFloat($navigationBar.height()) );

			$mediaContainer.height(availableHeight);

			if (TabeebInputService.isTouchDevice())
			{
				$mediaContainer.width(leftPanelWidth - 4);
				$mediaContainer.css({left: 2});
			}
			else
			{
				var mediaContainerWidth = 0;
				if (mediaContainerWidth > 0)
					$mediaContainer.width(mediaContainerWidth);
				$mediaContainer.css({left: leftPanelPadding / 2});
				$mediaContainer.css({'max-width': $mediaContainer.parent().width() - (parseFloat($mediaContainer.css("left")) * 2)})
			}

			this.$pluginContainer.find("canvas").css(
				{
					//"max-width": canvasMaxWidth,
					//"max-height": canvasMaxHeight
				});

			this.canvasService.resize($mediaContainer.innerWidth(), $mediaContainer.height());
			this.modules.pdfManager.resize();

			if (this.whiteboardType == TabeebWhiteBoardType.Normal)
				this.audioService.resize(this.$pluginContainer.find(".tabeebCanvas"));
			else
				this.audioService.resize(this.$pluginContainer.find(".tabeebTextAssetContainer"));

			if (this.hudService.getScreenMode() == TabeebScreenModeType.Gallery)
				self.galleryService.resize();

			self.hudService.resize();
		};

		this.setContentMode = function (mode) {
			this.modules.hudService.setReadOnly(this.options.readOnly);

			if (mode == self.contentMode)
				return;

			self.contentMode = mode;
			var $canvas = self.$pluginContainer.find(".tabeebCanvas");
			var $mediaContainer = self.$pluginContainer.find(".tabeebMediaContainer");
			$canvas.css({
				"background": ""
			});
			$mediaContainer.css("overflow", "");

			switch (mode)
			{
				case TabeebContentType.Pdf:
					$canvas.css({
						"background": "none"
					});
					$mediaContainer.css("overflow", "hidden");
					self.modules.pdfManager.setActive(true);
					self.modules.pdfManager.onReady(function (event) {
					});

					break;
			}

			if (mode != TabeebContentType.Pdf)
				self.modules.pdfManager.setActive(false);

			self.$element.trigger($.Event(TabeebEvent.contentModeChanged, { mode: mode}));
		};

		// </editor-fold>

	};

	$.fn.tabeebPlayer = function (options) {
		var mergedOptions = $.extend({}, $.fn.tabeebPlayer.defaults, options);

		return this.each(function () {
			if ($(this).data("tabeebPlayer") == null)
			{
				$(this).data("tabeebPlayer", new TabeebPlayer($(this), mergedOptions));
			}
			else
			{
				$(this).data("tabeebPlayer").updateOptions(mergedOptions);
			}
		});
	};

	$.fn.tabeebPlayer.defaults =
	{
		minZoomLevel: 0.2,
		maxZoomLevel: 2.0,
		defaultDrawModeType: TabeebDrawModeType.Selection,
		defaultScreenModeType: TabeebScreenModeType.Navigation,
		width: 1000,
		height: 750,
		tooltips: true,
		annotationDisplayInterval: 5,
		strokeSize: 10,
		galleryServiceOptions: {},
		hudServiceOptions: {
			/**
			 * "Ellipse", "Ellipse_Filled", "Line", "Callout", "Rectangle", "Rectangle_Filled", "ArrowEnd", "ArrowBoth"
			 */
			disabledShapes: []
		},
		sidebarOptions: {
			enabled: true
		},
		hotspotOptions: {
			uiDialogOptions: {}
		},
		autoLoadCSS: true,
		/* Hidden Buttons: "Options", "ShapeOptions", "Pen", "Eraser", "LaserPointer", "Text", "Undo", "Redo", "ExitDrawMode", "NextMedia", "PrevMedia", "AudioGallery", "Selection", "GalleryDelete"
		 * "Navigation", "LaserPointer" - All Navigation Buttons hidden
		 * "ZoomIn", "ZoomOut", "DrawMode", "GalleryMode", "Microphone"
		 * */
		hiddenButtons: ["Eraser", "LaserPointer"],
		callbacks: {
			searchUser: function() {
				/**@type {Array.<TabeebUser>}*/
				var arrayOfTabeebUsers = [];
				var deferred = $.Deferred();
				deferred.resolve(arrayOfTabeebUsers);
				return deferred.promise();
			}
		},
		/* jQuery Object, DOM element, Selector */
		controlBarContainer: null,
		defaultUserAvatarUrl: '',
		userJoinedPresentationAudioUrl: pluginBaseUrl + 'sounds/joined.wav',
		userLeftPresentationAudioUrl: pluginBaseUrl + 'sounds/left.wav',
		canvasOnAnnotationSelected: function (annotationId) {},
		canvasOnAnnotationUnselected: function (annotationId) {},
		hotspotOnReady: function (event) { },
		themeColor: null,

		readOnly: false,
		hideAllAnnotations: false,
		hideAnnotationsOnPageLoad: true,
		padding: 10,
		autoPlayVideos: true,

		//autoAssociateHotspotsWithAnnotations: true,
		//autoAssociatedHotspotAnnotationTypes: [
		//	//TabeebAnnotationType.Stroke, // 0
		//	//TabeebAnnotationType.Rectangle, // 101
		//	//TabeebAnnotationType.Rectangle_Filled, // 103
		//	//TabeebAnnotationType.Ellipse, // 102
		//	//TabeebAnnotationType.Ellipse_Filled, // 104
		//	//TabeebAnnotationType.ArrowEnd, // 105
		//	//TabeebAnnotationType.ArrowBoth, // 106
		//	//TabeebAnnotationType.Line, // 100
		//	//TabeebAnnotationType.Text // 3
		//],

		// Events
		undo: null,
		redo: null,
		annotationAdded: null,
		annotationDeleted: null,
		annotationRestored: null,
		annotationUpdateRestored: null,
		previousMedia: null,
		nextMedia: null,
		contentDisplayed: null,
		annotationsDisplayed: null,
		loaded: null,
		error: null,
		galleryRequested: null,
		setMedia: null,
		deletePage: null,
		audioRecordingAdded: null,
		penColorChanged: null,
		textContentChanged: null,
		annotationsUpdated: null,
		userInvited: null,
		externalUserInvited: null,
		connectToPresentation: null,
		disconnectFromPresentation: null,
		onChatMessageAdded: null,
		completelyLoaded: null,
		onPresenterChangeRequest: null,
		annotationSelected: null,
		annotationUnselected: null
	};
})(jQuery, window, document);
