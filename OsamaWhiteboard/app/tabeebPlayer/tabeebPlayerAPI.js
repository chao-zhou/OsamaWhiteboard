/**
 * Created by cody on 10/26/15.
 */

(function () {
	//---------------------------------------
	// Prototype methods
	//---------------------------------------

	/**
	 * @param {TabeebPresenterMode} presentationMode
	 */
	TabeebPlayer.prototype.setPresentationMode = function (presentationMode) {
		this.presenterManager.setPresentationMode(presentationMode);
	};

	TabeebPlayer.prototype.setPresenterMode = function (flag) {
		console.error("Removed");
		//this.presenterManager.setPresenterMode(flag);
	};

	TabeebPlayer.prototype.setSpectatorMode = function (flag) {
		console.error("Removed");
		//this.presenterManager.setSpectatorMode(flag);
	};

	TabeebPlayer.prototype.parentSizeChanged = function () {
		this.handleResize();
	};

	/**
	 * @returns {$.fn.tabeebPlayer.defaults}
	 */
	TabeebPlayer.prototype.getOptions = function () {
		return this.options;
	};

	TabeebPlayer.prototype.updateOptions = function (optionsIn) {
		this.options = $.extend(this.options, optionsIn);
		this.modules.canvasService.redrawAnnotations();
		this.$element.trigger($.Event(TabeebEvent.optionsUpdated, {options: this.options, updatedOptions: optionsIn}));
	};

	TabeebPlayer.prototype.inPresentationMode = function () {
		return this.presenterManager.currentlyInPresentation();
	};

	TabeebPlayer.prototype.swapOutImageForPdf = function (pdfUrl, pdfPage) {
		var self = this;
		var panX = self.modules.canvasService.getPanX();
		var panY = self.modules.canvasService.getPanY();
		var currentScale = self.getScaleFactor().scaleFactor;

		this.modules.pdfManager.loadDocument(pdfUrl, pdfPage, currentScale).then(function () {
			self.setContentMode(TabeebContentType.Pdf);
			self.modules.canvasService.setPan(panX, panY);
		});
	};

	/**
	 * @param {TabeebContent} content
	 */
	TabeebPlayer.prototype.setContent = function (content) {
		this.ready = false;
		var self = this;
		var triggerCompletelyLoadedEvent = (this.contentName == "");

		if (content.hideAllAnnotations != null) {
			this.options.hideAllAnnotations = content.hideAllAnnotations;
		}

		this.contentName = content.contentName;
		this.undoManager.clearBuffer();
		this.whiteboardType = content.whiteboardType;
		this.slideCount = content.slideCount;

		var canvasOpts = self.modules.canvasService.getOptions();
		if (content.width && content.height) {
			canvasOpts.width = content.width;
			canvasOpts.height = content.height;
		}
		else
		{
			canvasOpts.width = TabeebCanvasService.defaults.width;
			canvasOpts.height = TabeebCanvasService.defaults.height;
		}

		for(var key in TabeebWhiteBoardType) {
			var className = 'tabeeb' + key + 'Mode';
			if (TabeebWhiteBoardType[key] == content.whiteboardType)
				this.$pluginContainer.addClass(className);
			else
				this.$pluginContainer.removeClass(className);
		}


		if (this.firstContent)
		{
			this.hudService.setScreenMode(this.options.defaultScreenModeType);
			this.firstContent = false;
		}

		if (/*this.hudService.getScreenMode() == TabeebScreenModeType.Gallery ||*/ this.hudService.getScreenMode() == TabeebScreenModeType.Text)
			this.hudService.setScreenMode(TabeebScreenModeType.Navigation);

		this.setContentMode(content.type);
		if (content.type == TabeebContentType.Pdf) {
			self.ready = false;
			this.currentSlideIndex = content.slideIndex;
			this.modules.pdfManager.onReady(function() {
				self.ready = true;
				self.$element.trigger($.Event(TabeebEvent.contentDisplayed, {content: content}));
			});
			this.modules.pdfManager.loadDocument(content.url, content.pdfPage);
		}

		if (content == null)
		{
			this.$element.trigger(TabeebEvent.error, {message: "Missing parameter for setContent function."});
			return;
		}

		this.$pluginContainer.find(".slideTitle").text(content.title);

		var $previousArrow = this.$pluginContainer.find(".tabeebPreviousMediaButton");
		var $nextArrow = this.$pluginContainer.find(".tabeebNextMediaButton");
		if (content.nextEnabled)
			$nextArrow.removeClass("disabled");
		else
			$nextArrow.addClass("disabled");
		if (content.previousEnabled)
			$previousArrow.removeClass("disabled");
		else
			$previousArrow.addClass("disabled");

		this.$pluginContainer.find(".tabeebSlideIndexContainer").text((content.slideIndex+1) + " / " + content.slideCount);
		//this.$pluginContainer.find(".tabeebSlideCount").text(content.slideCount);

		this.annotationMgr.clear();

		var player = this;
		var $element = this.$element;

		this.audioService.setVideoMode(content.type == TabeebContentType.Video);

		var promise = null;

		// Text whiteboard
		if (content.whiteboardType == TabeebWhiteBoardType.Text)
		{
			this.hudService.setScreenMode(TabeebScreenModeType.Text);
			promise = this.canvasService.setTextMedia(content.text);
		}
		else
		{
			this.whiteboardtype = TabeebWhiteBoardType.Normal;
			promise = this.canvasService.setMedia(content.type, content.url, 0,  content.width, content.height);
		}

		this.currentSlideIndex = content.slideIndex;


		promise.then(function () {
			if (content.type == TabeebContentType.Video)
			{
				player.$pluginContainer.find(".zoomButtons").hide();
			}
			else if (!TabeebInputService.isTouchDevice())
				player.$pluginContainer.find(".zoomButtons").show();

			// Now that the media has been loaded and displayed, add the annotations
			if (content.annotations instanceof Array)
			{
				content.annotations.forEach(function (ann) {
					if (self.modules.options.hideAnnotationsOnPageLoad == true)
					{
						ann.hidden = true;
						self.modules.globalAnnotationManager.setAnnotationHidden(ann.id, true);
					}
				});
				player.annotationMgr.addAll(content.annotations);
				player.audioService.setAnnotations();
			}

			self.ready = true;
			$element.trigger($.Event(TabeebEvent.contentDisplayed, {content: content}));
			player.handleResize();
			player.canvasService.sizeCanvasForFullImage();
			player.handleResize();
		});

		if (this.hudService.getScreenMode() == TabeebScreenModeType.Disabled)
			this.hudService.setScreenMode(this.options.defaultScreenModeType);


		$element.trigger(TabeebSpectatorEvent.setMediaIndex, [content.slideIndex]);

		$(this.onContentLoadedCallbackQueue).each(function () {
			this.call(player);
		});

		this.onContentLoadedCallbackQueue = [];

		if (content.type == TabeebContentType.Text)
			this.canvasService.setScaleFactor();

		if (triggerCompletelyLoadedEvent) {
			$element.trigger(TabeebEvent.completelyLoaded);
		}
	};

	TabeebPlayer.prototype.onDeletePageSuccess = function (pageId) {
		var $galleryItems = this.$pluginContainer.find(".tabeebGalleryContainer").find(".tabeebGalleryItem");
		$galleryItems.each(function () {
			var wId = $(this).data("whiteboard-id");
			if (wId == pageId)
			{
				$(this).remove();
			}
		});
	};

	TabeebPlayer.prototype.clearContent = function () {
		//        this.hudService.setScreenMode(TabeebScreenModeType.Disabled);
		this.$pluginContainer.find(".slideTitle").text("");
		this.$pluginContainer.find(".tabeebNextMediaButton").addClass("disabled");
		this.$pluginContainer.find(".tabeebPreviousMediaButton").addClass("disabled");
		this.canvasService.clearMedia();
	};

    // Only updates the image thumbnail with the given pageId
	TabeebPlayer.prototype.updateThumbnail = function (pageId) {
		var $gallery = this.$pluginContainer.find(".tabeebGalleryContainer");
		$gallery.find(".tabeebGalleryItem").each(function () {
			var $this = $(this);
			var wbId = $this.data("whiteboard-id");
			if (wbId == pageId)
			{
				var $img = $this.find("img");
				var url = $img.attr("src").substring(0, $img.attr("src").indexOf('?'));

				$img.attr('src', url + '?' + new Date().getTime());
			}
		});
	};

	TabeebPlayer.prototype.dispose = function () {
		// Canvas service also calls dispose on video service
		if (this.canvasService)
			this.canvasService.dispose();
		if (this.audioService)
			this.audioService.dispose();
		if (this.sidebarService)
			this.sidebarService.dispose();
	};

	/**
	 * @param {{PageId:Number, thumbnailUrl:String, contentType: TabeebContentType, isEmpty:Boolean, caption:String, order:Number, canDelete:boolean}[]} thumbnails
	 */
	TabeebPlayer.prototype.setThumbnails = function (thumbnails) {
		this.galleryService.setSlides(thumbnails);
		this.galleryService.resize();
	};

	/**
	 * @param {jQuery.Event} event
	 */
	TabeebPlayer.prototype.triggerEvent = function (event) {
		if (event.isPropagationStopped())
			return;

		$(this).trigger(event);
		event.stopPropagation();
		//        var player = $(this);
		//        player.trigger(event);
	};

	TabeebPlayer.prototype.setOnlinePresentationStatus = function (userId, isOnline) {
		this.presenterManager.setUserOnlineStatus(userId, isOnline);
	};

	/**
	 * @param {{id:string, showStrokes:boolean}} participant
	 */
	TabeebPlayer.prototype.updateParticipant = function (participant) {
		var participantIndex = -1;
		for (var i = 0; i < this.participants.length; i++)
		{
			if (this.participants[i].id == participant.id)
			{
				participantIndex = i;
			}
		}

		var p = this.participants[participantIndex];
		$.fn.extend(p, this.participants);

		//this.canvasService.onParticipantChange(participant);
		this.canvasService.redrawAnnotations();

		$(this).trigger($.Event(TabeebEvent.participantUpdated, {
			id: participant.id,
			muted: participant.showStrokes === false
		}));
	};

	TabeebPlayer.prototype.addParticipant = function (participant, user) {
		this.userMgr.addUser(user);

		for (var i = 0; i < this.participants.length; i++)
		{
			if (this.participants[i].id == participant.id)
				return this.updateParticipant(participant);
		}

		this.participants.push(participant);
		//this.canvasService.onParticipantChange(this.participants);
	};

	TabeebPlayer.prototype.removeParticipant = function (participant, user) {
		this.modules.userManager.removeUser(user);
		//this.userMgr.removeUser(user);

		var participantIndex = -1;
		for (var i = 0; i < this.participants.length && participantIndex == -1; i++)
		{
			if (this.participants[i].id == participant.id)
				participantIndex = i;
		}

		if (participantIndex == -1)
			return;

		this.participants.splice(participantIndex);
		//this.canvasService.onParticipantChange(this.participants);
	};

	TabeebPlayer.prototype.addAudioAnnotation = function (annotation) {
		this.annotationMgr.add(annotation);
		this.audioService.addToSoundboard(annotation);
		this.audioService.setAudioThumbnails();
	};

	TabeebPlayer.prototype.addAnnotation = function (annotation, recentlyPushedFlag, otherClient) {

		if (annotation.strokeType == TabeebAnnotationType.LaserStroke)
		{
			this.canvasService.displayLaserAnnotation(annotation);
			return;
		}

		var newAnnotation = this.annotationMgr.add(annotation);

		this.canvasService.redrawAnnotations();

		this.$element.trigger($.Event(TabeebOperationEvent.annotationAdded, {annotation: newAnnotation}));
	};

	TabeebPlayer.prototype.removeAnnotation = function (annotation, otherClient) {
		var deletedAnnotation = this.annotationMgr.find(annotation.id);

		if (deletedAnnotation != null && deletedAnnotation.selected === true)
			this.modules.annotationManager.unselectAnnotation(annotation);

		this.annotationMgr.remove(annotation);

		if (annotation.type == TabeebAnnotationType.Audio)
			this.audioService.setAnnotations(this.annotations);

		this.canvasService.redrawAnnotations();

		if (otherClient === true)
		{
			this.$element.trigger($.Event(TabeebOperationEvent.annotationDeleted, {annotation: deletedAnnotation}));
		}
	};

	TabeebPlayer.prototype.restoreAnnotation = function (annotation) {
		console.log("Restoring annotation", annotation.id);

		var lastOperation = this.undoManager.getLastOperationWithAnnotationId(annotation.id);

		console.log("Last Operation", lastOperation);

		var restoredAnnotation = annotation;

		if (lastOperation != null)
			restoredAnnotation = lastOperation.annotation;

		if (!restoredAnnotation)
		{
			throw "We're missing an annotation here.";
		}

		this.addAnnotation(restoredAnnotation, false, false);

		return restoredAnnotation;
		//        return this.undoManager.restoreRedoAnnotation();
	};

	TabeebPlayer.prototype.updateAnnotation = function (annotation, otherClient) {
		var canvasAnnotation = this.annotationMgr.find(annotation.id);
		if (canvasAnnotation == null)
			canvasAnnotation = this.annotationMgr.add(annotation);

		var oldAnnotationData = $.extend(true, {}, canvasAnnotation);
		// Extend the values so the reference remains the same
		$.extend(canvasAnnotation, annotation);
		var newAnnotationData = $.extend(true, {}, canvasAnnotation);
		this.canvasService.redrawAnnotations();

		if (otherClient === true)
			this.$element.trigger($.Event(TabeebOperationEvent.annotationUpdated, {
				oldAnnotationData: oldAnnotationData,
				newAnnotationData: newAnnotationData
			}));

		this.annotationMgr.add(annotation);
	};

	TabeebPlayer.prototype.startRecording = function () {
		return this.audioService.startRecording();
	};

	TabeebPlayer.prototype.stopRecording = function () {
		return this.audioService.stopRecording();
	};

	/**
	 * @param {TabeebChatMessage} chatMessage
	 */
	TabeebPlayer.prototype.addChatMessage = function (chatMessage) {
		this.chatMgr.addChatMessage(chatMessage);
	};

	/**
	 * @param {Array.<TabeebChatMessage>} chatMessages
	 */
	TabeebPlayer.prototype.addChatMessages = function (chatMessages) {
		this.chatMgr.addChatMessages(chatMessages);
	};

	TabeebPlayer.prototype.clearChatMessages = function () {
		this.chatMgr.clear();
	};

	TabeebPlayer.prototype.isConnected = function () {
		if (!this.presenterManager)
			return false;

		return this.presenterManager.currentlyInPresentation();
	};

	TabeebPlayer.prototype.connect = function (presenterId) {
		this.presenterManager.connect(presenterId);
		this.handleResize();
	};

	TabeebPlayer.prototype.setPresenter = function (presenterId) {
		console.log("Setting presenter", presenterId);
		this.presenterManager.setPresenter(presenterId);
		this.handleResize();
	};

	TabeebPlayer.prototype.disconnect = function () {
		this.presenterManager.disconnect();
	};

	TabeebPlayer.prototype.getSidebarWidth = function () {
		if (this.sidebarService)
			return this.sidebarService.getWidth();
		else
			return 0;
	};

	/**
	 * @param {Boolean} isNewPresenter
	 * @returns {TabeebPresenterState}
	 */
	TabeebPlayer.prototype.getPresenterState = function (isNewPresenter) {
		return this.presenterManager.getPresenterState(isNewPresenter);
	};

	/**
	 * @param {TabeebPresenterState} presenterState
	 */
	TabeebPlayer.prototype.setPresentationState = function (presenterState) {
		this.presenterManager.setPresenterState(presenterState);
	};

	TabeebPlayer.prototype.startCall = function () {
		this.$element.trigger(TabeebEvent.connectToPresentation);
	};

	TabeebPlayer.prototype.toggleSidebar = function () {
		this.modules.sidebarService.toggle();
		this.handleResize();
	};

	TabeebPlayer.prototype.doesSidebarNeedToggle = function () {
		if (!this.$pluginContainer || this.$pluginContainer.width() <= 50)
			return false;

		if (this.modules.sidebarService.getWidth())

			return !this.modules.sidebarService.isActive();
	};

	TabeebPlayer.prototype.getScreenMode = function () {
		return this.hudService.getScreenMode();
	};

	/**
	 * @param {Array.<TabeebAnnotation>} annotations
	 * @param {Number} pageNumber
	 */
	TabeebPlayer.prototype.addGlobalAnnotations = function (annotations, pageNumber) {
		var modules = this.modules;

		if (annotations.hasOwnProperty("length") && annotations.length > 0)
		{
			if (pageNumber)
				annotations.forEach(function (annotation) { annotation.pageNumber = pageNumber; });
			modules.globalAnnotationManager.addAll(annotations);
		}
		else
		{
			if (pageNumber)
				annotations.pageNumber = pageNumber;
			modules.globalAnnotationManager.add(annotations);
		}
	};

	/**
	 * @param {Array.<TabeebAnnotation>} annotations
	 */
	TabeebPlayer.prototype.removeGlobalAnnotations = function (annotations) {
		var modules = this.modules;

		if (annotations.hasOwnProperty("length") && annotations.length > 0) {
			annotations.forEach(function (annotation) {
				modules.globalAnnotationManager.remove(annotation);
			});
		}
		else
			modules.globalAnnotationManager.remove(annotations);
	};

	function hotspotClicked (annotation) {
		var modules = this.modules;
		console.log("Ann", annotation);
		modules.canvasService.selectAnnotation(annotation.id);

		if (modules.canvasService.inVideoMode())
		{
			modules.videoService.onready(function () {
				modules.videoService.setCurrentTime(annotation.timestamp);
				modules.videoService.pause();
			});
		}
		else if (annotation.timestamp >= 0)
		{
			modules.audioService.onready(annotation.parentId, function () {
				modules.audioService.playAudioAnnotation(annotation.parentId);
				$(modules.audioService.getCurrentAudio()).one("timeupdate", function () {
					modules.audioService.setCurrentTime(annotation.timestamp);
					modules.audioService.pause();
				});
			});
		}

		var offset = modules.canvasService.getOffsetOfAnnotation(annotation.id);
		var hotspotManager = modules.canvasService.hotspotManager;
		offset.left += offset.width;
		hotspotManager.show(modules.globalAnnotationManager.find(annotation.id), $.Event("", {
			pageX: offset.left,
			pageY: offset.top
		}), false);
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 */
	function hotspotCommentClicked (annotation) {
		var modules = this.modules;

		if (annotation.canBeSelected() === false)
			return;

		var parentAnnotation = modules.annotationManager.find(annotation.parentId);
		hotspotClicked.call(this, parentAnnotation);
		modules.canvasService.hotspotManager.focusOnComment(annotation);
		modules.canvasService.selectAnnotation(annotation.parentId);
	}

	function audioClicked (annotation) {
		var modules = this.modules;
		if (modules.audioService.isAudioReady(annotation.id))
			modules.audioService.playAudioAnnotation(annotation.id);
		else
		{
			if (modules.canvasService.inVideoMode())
				modules.videoService.onready(
					function () {
						var annotationId = event.audioName;
						modules.audioService.playAudioAnnotation(annotation.id);
					}
				);
			else
				$(modules.audioService).one(TabeebAudioService.AudioEvent.audioReady, function (event) {
					var annotationId = event.audioName;
					modules.audioService.playAudioAnnotation(annotation.id);
				});
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 */
	function annotationSelected (annotation) {
		var modules = this.modules;
		modules.canvasService.hotspotManager.hide();

		if (modules.canvasService.inVideoMode())
		{
			modules.videoService.onready(function () {
				modules.videoService.setCurrentTime(annotation.timestamp);
				modules.videoService.play();
			});
		}
		else if (annotation.timestamp >= 0)
		{
			modules.audioService.onready(annotation.parentId, function () {
				modules.audioService.playAudioAnnotation(annotation.parentId);
				$(modules.audioService.getCurrentAudio()).one("timeupdate", function () {
					modules.audioService.setCurrentTime(annotation.timestamp);
				});
			});
		}
		else
		{
			//modules.hudService.setScreenMode(TabeebScreenModeType.Navigation);
			//modules.hudService.setDrawMode(TabeebDrawModeType.Selection);
			modules.canvasService.selectAnnotation(annotation.id);
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 */
	function getCallbackForSelectingAnnotation (annotation) {
		if (annotation.type == TabeebAnnotationType.Hotspot)
			return hotspotClicked;
		else if (isHotspotComment(annotation))
			return hotspotCommentClicked;
		else if (annotation.type == TabeebAnnotationType.Audio)
			return audioClicked;
		return annotationSelected;
	}

	function isHotspotComment (annotation) {
		return annotation.parentId && (annotation.type == TabeebAnnotationType.Text || annotation.type == TabeebAnnotationType.Audio);
	}

	TabeebPlayer.prototype.selectAnnotation = function (annotationId) {
		var self = this;
		if (this.modules.presenterManager.getPresentationMode() == TabeebPresenterMode.Spectator && !this.modules.presenterManager.isCurrentUserPresenter())
		{
			console.log("Can't while spectating.");
			return;
		}

		var globalAnn = this.modules.globalAnnotationManager.find(annotationId);

		if (globalAnn == null) {
			console.error("Unable to locate global annotation with id", annotationId);
			return;
		}

		if (globalAnn.type != TabeebAnnotationType.Audio)
		{
			if (this.modules.options.hideAllAnnotations === true)
				return;
		}

		if (globalAnn.pageNumber - 1 != this.modules.player.currentSlideIndex)
		{
			this.$element.trigger(TabeebEvent.setMedia, [globalAnn.pageNumber - 1]);
			this.$element.one(TabeebEvent.contentDisplayed, function () {
				setTimeout(getCallbackForSelectingAnnotation(globalAnn).call(self, globalAnn), 1);
			});
		}
		else
		{
			var ann = self.modules.annotationManager.find(annotationId);
			if (ann.hidden === true) {
				self.modules.annotationManager.setAnnotationHidden(ann, false, ann.type != TabeebAnnotationType.Hotspot);
				self.modules.globalAnnotationManager.setAnnotationHidden(ann, false, ann.type != TabeebAnnotationType.Hotspot);
			}

			setTimeout(getCallbackForSelectingAnnotation(globalAnn).call(self, globalAnn), 1);
		}
	};

	TabeebPlayer.prototype.clearSelectedAnnotations = function () {
		this.modules.annotationManager.clearSelectedAnnotations();
		this.modules.globalAnnotationManager.clearSelectedAnnotations();
	};

	/**
	 * @param {Number} index
	 * @param {Number} [transparency]
	 * @param {Number} [width]
	 */
	TabeebPlayer.prototype.setStrokeAttributes = function (index, transparency, width) {
		var colors = this.modules.hudService.getOptions().paletteColors;

		if (index < 0)
			index = 0;
		if (index >= colors.length)
			index = colors.length - 1;

		var currentAttributes = this.modules.canvasService.getStrokeAttributes();
		var newColor = colors[index];
		var newTransparency = transparency == null ? currentAttributes.transparency : transparency;
		var newWidth = width == null ? currentAttributes.width : width;

		this.modules.canvasService.setStrokeAttributes(newColor, newTransparency, newWidth, false);
		this.modules.paletteService.setSelectedIndex(index);
	};

	/**
	 * @param {TabeebAnnotation|String} annotationOrAnnotationId
	 * @param {Boolean} isLocked
	 */
	TabeebPlayer.prototype.lockAnnotation = function (annotationOrAnnotationId, isLocked) {
		var ann = this.modules.annotationManager.find(annotationOrAnnotationId);
		var globalAnn = this.modules.annotationManager.find(ann);
		ann.locked = isLocked;
		globalAnn.locked = isLocked;
		this.modules.canvasService.redrawAnnotations();
	};

	/**
	 * @param {Number} newScaleFactor
	 */
	TabeebPlayer.prototype.setScaleFactor = function (newScaleFactor) {
		if (this.modules.pdfManager.isActive())
		{
			this.modules.pdfManager.setScale(newScaleFactor);
		}
		else
		{
			this.modules.canvasService.setScaleFactor(newScaleFactor);
		}
		this.modules.canvasService.redrawAnnotations();
	};

	/**
	 * @returns {{scaleFactor, maxScaleFactor, minScaleFactor}}
	 */
	TabeebPlayer.prototype.getScaleFactor = function () {
		if (this.modules.pdfManager.isActive())
		{
			var current = this.modules.pdfManager.getScaleFactor();
			var opts = this.modules.pdfManager.getOptions();
			var max = opts.maxZoom;
			var min = opts.minZoom;
			return {
				scaleFactor: current,
				maxScaleFactor: max,
				minScaleFactor: min,
				percent: Math.round(current * 100)
			};
		}
		else
		{
			var current = this.modules.canvasService.getZoomLevel();
			var max = this.modules.canvasService.getMaxZoomLevel();
			var min = this.modules.canvasService.getMinZoomLevel();
			return {
				scaleFactor: current,
				maxScaleFactor: max,
				minScaleFactor: min,
				percent: Math.round(current * 100)
			};
		}
	};

	/**
	 * @returns {{color, transparency, width}|{color: string, transparency: number, width: number}}
	 */
	TabeebPlayer.prototype.getStrokeAttributes = function () {
		return this.modules.canvasService.getStrokeAttributes();
	};

	/**
	 * @param {String} color
	 * @param {Number} transparency
	 * @param {Width} width
	 */
	TabeebPlayer.prototype.setStrokeAttributes = function (color, transparency, width) {
		this.modules.canvasService.setStrokeAttributes(color, transparency, width, false);
	};

	TabeebPlayer.prototype.undo = function () {
		this.modules.undoManager.undo();
	};

	TabeebPlayer.prototype.redo = function () {
		this.modules.undoManager.redo();
	};

	/**
	 * @param {TabeebCanvasService.CanvasInputMode|Number} drawMode
	 */
	TabeebPlayer.prototype.setCanvasInputMode = function (drawMode) {
		this.modules.canvasService.setInputMode(drawMode);
		if (drawMode == TabeebCanvasService.CanvasInputMode.Text)
			this.modules.hudService.setDrawMode(TabeebDrawModeType.Text);
		else if (drawMode == TabeebCanvasService.CanvasInputMode.Laser)
			this.modules.hudService.setDrawMode(TabeebDrawModeType.Pointer);
		else if (drawMode == TabeebCanvasService.CanvasInputMode.PanZoom)
			this.modules.hudService.setDrawMode(TabeebDrawModeType.Selection);
		else if (drawMode == TabeebCanvasService.CanvasInputMode.Pen)
			this.modules.hudService.setDrawMode(TabeebDrawModeType.Pen);
	};

	/**
	 * @returns {TabeebCanvasService.CanvasInputMode|Number}
	 */
	TabeebPlayer.prototype.getCanvasInputMode = function () {
		return this.modules.canvasService.getInputMode();
	};

	TabeebPlayer.prototype.startRecordingAudio = function () {
		this.modules.audioService.startRecording();
	};

	TabeebPlayer.prototype.pauseRecordingAudio = function () {
		this.modules.audioService.pauseRecording();
	};

	TabeebPlayer.prototype.stopRecordingAudio = function () {
		this.modules.audioService.stopRecording();
	};

	TabeebPlayer.prototype.openGallery = function  () {
		this.modules.hudService.setScreenMode(TabeebScreenModeType.Gallery);
	};

	/**
	 * @param {TabeebScreenModeType|Number} screenMode
	 */
	TabeebPlayer.prototype.closeGallery = function (screenMode) {
		this.modules.hudService.setScreenMode( screenMode == null ? this.options.defaultScreenModeType : screenMode);
	};

	/**
	 * @param {Array.<String> | String} arrayOfAnnotationIds
	 * @param {Boolean} isHidden
	 */
	TabeebPlayer.prototype.setAnnotationsHiddenByIds = function (arrayOfAnnotationIds, isHidden) {
		var self = this;
		if (!Array.isArray(arrayOfAnnotationIds))
			arrayOfAnnotationIds = [arrayOfAnnotationIds];

		arrayOfAnnotationIds.forEach(function (annotationId) {
			self.modules.globalAnnotationManager.setAnnotationHidden(annotationId, isHidden);
			self.modules.annotationManager.setAnnotationHidden(annotationId, isHidden);
		});
	};

	TabeebPlayer.prototype.setAnnotationToggleButtonHidden = function (isHidden) {
		this.modules.controlbarHUD.setToggleButtonVisible(!isHidden);
		this.handleResize();
	};

	/**
	 * @param {Boolean} isHidden
	 */
	TabeebPlayer.prototype.setAnnotationToolbarHidden = function (isHidden) {
		this.modules.controlbarHUD.setActive(!isHidden);
		this.handleResize();
	};

	TabeebPlayer.prototype.setNavigationBarHidden = function (isHidden) {
		this.modules.navigationHUD.setVisible(!isHidden);
		this.handleResize();
	};

	/**
	 * @param {Boolean} isHidden
	 */
	TabeebPlayer.prototype.setAllAnnotationHidden = function (isHidden) {
		this.options.hideAllAnnotations = isHidden;
		this.clearSelectedAnnotations();
		this.modules.canvasService.redrawAnnotations();
	};

	/**
	 * @returns {{slideIndex: (number|*), totalSlides: (number|*)}}
	 */
	TabeebPlayer.prototype.getSlideIndexInfo = function () {
		return {
			slideIndex: this.currentSlideIndex,
			totalSlides: this.slideCount
		};
	};

	TabeebPlayer.prototype.nextSlide = function () {
		if (this.currentSlideIndex < this.slideCount - 1)
			this.$element.trigger(TabeebEvent.nextMedia);
	};

	TabeebPlayer.prototype.previousSlide = function () {
		if (this.currentSlideIndex > 0)
			this.$element.trigger(TabeebEvent.previousMedia);
	};

	/**
	 * @param {Number} index
	 * @param {Number} [transparency]
	 * @param {Number} [width]
	 */
	TabeebPlayer.prototype.setStrokeAttributes = function (index, transparency, width) {
		var colors = this.modules.hudService.getOptions().paletteColors;

		if (index < 0)
			index = 0;
		if (index >= colors.length)
			index = colors.length - 1;

		var currentAttributes = this.modules.canvasService.getStrokeAttributes();
		var newColor = colors[index];
		var newTransparency = transparency == null ? currentAttributes.transparency : transparency;
		var newWidth = width == null ? currentAttributes.width : width;

		this.modules.canvasService.setStrokeAttributes(newColor, newTransparency, newWidth, false);
		this.modules.paletteService.setSelectedIndex(index);
	};

	/**
	 * @param {TabeebAnnotationMode | Number} annotationMode
	 */
	TabeebPlayer.prototype.setAnnotationMode = function (annotationMode) {
		var self = this;
		switch (annotationMode) {
			case TabeebAnnotationMode.HideAll:
				self.updateOptions({
					hideAllAnnotations: true,
					readOnly: true
				});
				break;
			case TabeebAnnotationMode.ReadOnly:
				self.updateOptions({
					hideAllAnnotations: false,
					readOnly: true
				});
				break;
			default:
				self.updateOptions({
					hideAllAnnotations: false,
					readOnly: false
				});
				self.setAnnotationToggleButtonHidden(false);
				break;
		}
		console.log(self.options);
	}
})();