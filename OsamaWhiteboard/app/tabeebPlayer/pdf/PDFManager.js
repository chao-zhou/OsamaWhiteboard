/**
 * Created by cody on 10/23/15.
 */

var PDFManager = null;

(function () {
	"use strict";
	/**
	 * @param {jQuery} $container
	 * @param {PDFManager.defaults} optionsIn
	 * @returns {{loadDocument: loadDocument}}
	 * @constructor
	 */
	PDFManager = function PDFManager ($container, optionsIn) {

		//<editor-fold name="Variables">

		/**@type {PDFManager.defaults}*/
		var options = $.extend(PDFManager.defaults, optionsIn);
		var self = this;
		var $self = $(self);
		var ready = false;
		/**@type {HTMLElement}*/
		var canvas = null;
		/**@type {CanvasRenderingContext2D}*/
		var context = null;
		/**@type {PDFPageProxy}*/
		var currentPage = null;
		var disabled = true;
		var currentScale = 1.0;
		var rendering = false;
		var currentTextLayer = null;
		var textLayerEnabled = true;
		var currentUrl = null;

		/**@type {PDFDocumentProxy}*/
		var currentPDF = null;

		var centeringLeft = 0;
		var centeringTop = 0;

		var currentPanX = 0;
		var currentPanY = 0;
		/**
		 * @type {{canvasContext: CanvasRenderingContext2D, viewport: PDFJS.PageViewport, textLayer: TextLayerBuilder}}
		 */
		var renderContext = {
			canvasContext: null,
			viewport: null,
			textLayer: null
		};

		//</editor-fold>

		init();

		return {
			loadDocument: loadDocument,
			onReady: onReady,
			render: render,
			setPan: setPan,
			getPan: getPan,
			translatePan: translatePan,
			setScale: setScale,
			getPageSize: getPageSize,
			getScale: function () { return renderContext && renderContext.viewport ? renderContext.viewport.scale : -1; },
			setTextLayerEnabled: setTextLayerEnabled,
			addEventListener: addEventListener,
			removeEventListener: removeEventListener,
			getPageCount: function () { return currentPDF.pdfInfo.numPages; },
			getCurrentUrl: function () { return currentUrl; },
			setActive: setActive,
			isActive: isActive,
			getScaleFactor: function () { return currentScale; },
			getZoomPercentage: getZoomPercentage,
			resize: resize,
			getOptions: function () { return options; }
		};

		function init () {
			PDFJS.disableWorker = true;
			canvas = document.createElement("canvas");
			$(canvas).addClass("pdfManagerCanvas");
			canvas.style.pointerEvents = "none";
			context = canvas.getContext("2d");
			canvas.width = $container.width();
			canvas.height = $container.height();
			$container.append(canvas);
		}

		//<editor-fold name="Public Methods">

		/**
		 * @param {String} url
		 * @param {Number} [pageNumber]
		 * @param {Number} [scaleFactor]
		 */
		function loadDocument (url, pageNumber, scaleFactor) {
			if (pageNumber == null)
				pageNumber = 1;

			emitEvent($.Event(PDFManager.Events.loading, {}));
			ready = false;

			if (currentUrl != url) {
				currentUrl = url;

				console.log("Loading PDF");
				var start = new Date().getTime();

				return PDFJS.getDocument(url).then(function (pdf) {
					var timeElapsed = (new Date().getTime() - start) / 1000;
					console.log("PDF Loaded, Time To Load", timeElapsed + "s");
					currentPDF = pdf;
					return loadPage(pdf, pageNumber, scaleFactor);
				});
			}
			else {
				currentUrl = url;
				return loadPage(currentPDF, pageNumber, scaleFactor);
			}
		}

		function loadPage (pdf, pageNumber, scaleFactor) {

			console.log("Loading Page", pageNumber);

			return pdf.getPage(pageNumber).then(function (page) {
				console.log("Page loaded");
				currentPage = page;
				var currentScale = scaleFactor == null ? $container.width() / page.getViewport(1.0).width : scaleFactor;
				renderContext.viewport = page.getViewport(currentScale);
				renderContext.canvasContext = context;

				setPan(0, 0);

				return render().then(function () {
					emitEvent($.Event(PDFManager.Events.documentReady, {
						pdf: pdf,
						page: page,
						pageNumber: pageNumber,
						pageCount: currentPDF.pdfInfo.numPages,
						canvas: canvas,
						scaleFactor: currentScale
					}));
					setPan(0, 0);
					setScale(currentScale);
					ready = true;
				});
			});
		}

		function addEventListener (eventName, callback) {
			$self.on(eventName, callback);
			return this;
		}

		function removeEventListener (eventName, callback) {
			if (callback)
				$self.off(eventName, callback);
			else
				$self.off(eventName);
			return this;
		}

		function setActive (flag) {
			disabled = !flag;

			if (flag)
			{
				canvas.style.display = "block";
			}
			else
			{
				canvas.style.display = "none";
			}
		}

		function isActive () {
			return !disabled;
			//return canvas && canvas.style.display == "block";
		}

		function resize () {
			//setScale(currentScale);
			centerCanvas();
			setPan(currentPanX, currentPanY);
		}

		/**
		 * @param {Boolean} flag
		 */
		function setTextLayerEnabled (flag) {

			if (flag != textLayerEnabled)
				emitEvent($.Event(PDFManager.Events.textLayerActiveChanged, {isActive: flag}));

			textLayerEnabled = flag;

			if (renderContext.textLayer == null) return;

			var textLayerDiv = renderContext.textLayer.textLayerDiv;
			if (flag)
			{
				textLayerDiv.style.display = "";
			}
			else
			{
				textLayerDiv.style.display = "none";
			}
		}

		function setScale (newScaleFactor, doNotRender) {
			if (!currentPage)
				return;

			if (rendering === true) {
				return;
			}

			newScaleFactor = Math.min(options.maxZoom, Math.max(getMinScale(), newScaleFactor));

			if (newScaleFactor == currentScale)
				return;

			var viewport = currentPage.getViewport(newScaleFactor);
			renderContext.viewport = viewport;
			canvas.width = renderContext.viewport.width;
			canvas.height = renderContext.viewport.height;
			//console.log("Scale Factor", newScaleFactor);
			currentScale = newScaleFactor;
			centerCanvas();
			if (doNotRender != true)
			{
				render().then(function () {
					centerCanvas();
				});
			}
			emitEvent($.Event(PDFManager.Events.zoomChanged, {
				canvas: canvas,
				scaleFactor: newScaleFactor,
				width: canvas.width,
				height: canvas.height,
				maxPan: getMaxPan()
			}));
		}

		function getZoomPercentage () {
			if (canvas && currentPage)
			{
				var currentWidth = (canvas.width / (getPageSize().width));
				return currentWidth;
			}
			else
				return 1;
		}

		function getPageSize () {
			if (currentPage)
				return currentPage.getViewport(1.0);

			return null;
		}

		function getPan () {
			return {
				x: currentPanX,
				y: currentPanY
			};
		}

		function getMaxPan () {
			return {
				x: canvas.width - $container.width(),
				y: canvas.height - $container.height()
			};
		}

		/**
		 * @param {Number} panX
		 * @param {Number} panY
		 */
		function setPan (panX, panY) {
			if (panX == null)
				panX = currentPanX;
			if (panY == null)
				panY = currentPanY;

			if (renderContext.viewport)
			{
				panX = Math.max(0, Math.min(panX, canvas.width - $container.width()));
				panY = Math.max(0, Math.min(panY, canvas.height - $container.height()));
			}

			canvas.style.left = (-panX + centeringLeft) + "px";
			canvas.style.top = (-panY + centeringTop) + "px";

			currentPanX = panX;
			currentPanY = panY;

			if (renderContext.textLayer)
			{
				renderContext.textLayer.textLayerDiv.style.left = canvas.style.left;
				renderContext.textLayer.textLayerDiv.style.top = canvas.style.top;
			}

			emitEvent($.Event(PDFManager.Events.panChanged, {
				canvas: canvas,
				panX: Math.abs(panX) + centeringLeft,
				panY: Math.abs(panY) + centeringTop
			}));
			centerCanvas();
		}

		function translatePan (tX, tY) {
			var newLeft = (!canvas.style.left) ? 0 : parseFloat(canvas.style.left);
			var newTop = (!canvas.style.top) ? 0 : parseFloat(canvas.style.top);
			newLeft += tX;
			newTop += tY;

			newLeft = Math.min(0, Math.max(newLeft, -canvas.width + $container.width()));
			newTop = Math.min(0, Math.max(newTop, -canvas.height + $container.height()));

			setPan(-newLeft, -newTop);
		}

		function centerCanvas () {
			if (options.centerCanvas === true)
			{
				var left = Math.max(0, ($container.width() - canvas.width) / 2);
				var top = Math.max(0, ($container.height() - canvas.height) / 2);
				centeringLeft = left;
				centeringTop = top;
				emitEvent($.Event(PDFManager.Events.canvasOffsetChanged, {canvas: canvas, left: left, top: top}));
			}
		}

		function render () {
			if (rendering === true)
				return;

			initTextLayer(currentPage, renderContext.viewport);
			rendering = true;

			//renderContext.canvasContext.clearRect(0, 0, canvas.width, canvas.height);

			return currentPage.render(renderContext).then(function () {
				rendering = false;
				var $textLayer = $(renderContext.textLayer.textLayerDiv);
				$textLayer.css({
					width: canvas.width + "px",
					height: canvas.height + "px"
				});
				$textLayer.children().remove();
				renderContext.textLayer.viewport = renderContext.viewport;
				renderContext.textLayer.setTextContent(renderContext.textContent);
				renderContext.textLayer.renderLayer();
				setPan(currentPanX, currentPanY);
				$self.trigger(PDFManager.Events.rendered);
				return true;
			});
		}

		/**
		 * @param {Function} callback
		 */
		function onReady (callback) {
			if (ready === true)
				callback();
			else
			{
				$self.one(PDFManager.Events.documentReady, callback);
			}
		}

		//</editor-fold>

		function getMinScale () {
			if (currentPage && options.minZoomToContainer === true)
				return Math.max(options.minZoom, $container.width() / currentPage.getViewport(1.0).width);
			else
				return options.minZoom;
		}

		function initTextLayer (page, viewport) {

			$container.find(".textLayer").remove();

			var $textLayerDiv = $("<div />")
				.addClass("textLayer")
				.css("height", canvas.height + "px")
				.css("width", canvas.width + "px");

			$container.append($textLayerDiv);

			page.getTextContent().then(function (textContent) {
				renderContext.textContent = textContent;
				var textLayer = new TextLayerBuilder({
					viewport: viewport,
					textLayerDiv: $textLayerDiv[0],
					pageIdx: currentPage.pageIndex

				});
				currentTextLayer = $textLayerDiv[0];
				textLayer.setTextContent(textContent);
				renderContext.textLayer = textLayer;
				var rC = {
					canvasContext: renderContext.canvasContext,
					viewport: viewport,
					textLayer: textLayer
				};
				renderContext.textLayer = textLayer;
				renderContext.textLayer.textLayerDiv.style.left = canvas.style.left;
				renderContext.textLayer.textLayerDiv.style.top = canvas.style.top;

				setTextLayerEnabled(textLayerEnabled);
				render();
			});
		}

		function emitEvent (event) {
			if (disabled)
			{
				return;
			}

			$self.trigger(event);
		}
	};

	PDFManager.defaults = {
		maxZoom: 2,
		minZoom: 0.25,
		minZoomToContainer: false,
		centerCanvas: true
	};

	PDFManager.Events = {
		documentReady: "documentReady",
		panChanged: "panChanged",
		zoomChanged: "zoomChanged",
		textLayerActiveChanged: "textLayerActiveChanged",
		canvasOffsetChanged: "canvasOffsetChanged",
		loading: "loading",
		rendered: "rendering"
	};
})();
