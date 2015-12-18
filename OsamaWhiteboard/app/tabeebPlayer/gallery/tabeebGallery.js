'use strict';

/**
 * Created by cody on 8/31/15.
 */

/**
 * @param {jQuery} $triggerElement
 * @param {jQuery} $galleryContainer
 * @param {TabeebGalleryService.defaults} optionsIn
 * @constructor
 */
function TabeebGalleryService($triggerElement, $galleryContainer, optionsIn) {
	/**@type {TabeebGalleryService.defaults} options*/
	var options = $.extend(TabeebGalleryService.defaults, optionsIn);

	var disabled = false;

	/**@type {jQuery}*/
	var $container = $galleryContainer;

	var pathPieces = location.pathname.substr(1).split("/");
	pathPieces.splice(pathPieces.length - 1, 1);
	var jsPathPieces = $("#tabeebPlayerJS").attr("src").split('/');
	jsPathPieces.splice(jsPathPieces.length - 1, 1);
	var pluginBaseUrl = location.origin + "/" + pathPieces.join("/") + "/" + jsPathPieces.join("/") + "/";

	/**@type {{pageId:Number, thumbnailUrl:String, contentType: TabeebContentType, isEmpty:Boolean, caption:String, order:Number, canDelete:boolean}[]}*/
	var slides = [];

	/**@type {PDFDocumentProxy}*/
	var lastPdf = null;
	/**@type {String}*/
	var lastPdfUrl = null;
	/**@type {Array.<PDFPageProxy>}*/
	var currentPdfPages = [];

	init();

	return {
		show: show,
		hide: hide,
		setSlides: setSlides,
		resize: resizeThumbnails,
		setDisabled: setDisabled
	};

	//////////////////////

	function init() {
		bindEvents();
	}

	function setDisabled (flag) {
		disabled = flag;
		resizeThumbnails();
	}

	function bindEvents () {
		$container.on('click', '.tabeebGalleryItem .tabeebGalleryDeleteButton', galleryDeleteButtonClicked);
		$container.on('click', '.tabeebGalleryItem', galleryItemClicked);
	}

	//<editor-fold name="Click Events">
	function galleryDeleteButtonClicked(event) {
		if (disabled) return;

		var pageId = $(this).parent().data("whiteboard-id");
		$triggerElement.trigger(TabeebEvent.deletePage, [pageId]);
		event.preventDefault();
		event.stopPropagation();
	}

	function galleryItemClicked(event) {
		if (disabled) return;

		var index = $(this).index();
		$triggerElement.trigger(TabeebEvent.setMedia, [index]);
		event.preventDefault();
		event.stopPropagation();
	}
	//</editor-fold>


	/**
	 * @param {{pageId:Number, thumbnailUrl:String, contentType: TabeebContentType, isEmpty:Boolean, caption:String, order:Number, canDelete:boolean, pdfURL:String, pdfPage:Number}[]} newSlides
	 */
	function setSlides (newSlides) {
		slides = newSlides;
		generateHTML();
	}

	function generateHTML () {
		var html = "";
		for (var i = 0; i < slides.length; i++)
		{
			var slide = slides[i];
			html += '<div class="tabeebGalleryItem" data-whiteboard-id="' + slide.pageId + '">';
			html += '<div style="position: relative; width: 100%; height: 100%">';
			html += '<div class="tabeebGalleryItemBorder">';

			if (slide.pdfURL) {
				html += '<canvas class="tabeebGalleryPdfCanvas" data-pdf-page="' + slide.pdfPage + '" data-pdf-url="' + slide.pdfURL + '"></canvas>';
			}
			else
			{

				if (slide.thumbnailUrl)
					html += '<img src="' + slide.thumbnailUrl + '?' + new Date().getTime() + '" />';
				else
					html += '<img src="' + pluginBaseUrl + 'assets/whiteboard.png" />';
			}

			if (slide.caption)
				html += '<div class="tabeebGalleryItemDetails">' + slide.caption + '</div>';

			html += '</div>';
			html += '</div>';

			if (slide.canDelete === true && options.canDeleteSlides)
				html += '<span class="tabeeb-icon-md icon-trash-empty tabeebGalleryDeleteButton"></span>';
			//html += '<p style="color: blue;background: white;">Order: ' + slide.order + '</p>';
			html += '</div>';
		}

		$container.html(html);
		generatePDFThumbnails();
		resizeThumbnails();
	}

	function generatePDFThumbnails () {
		$container.find(".tabeebGalleryPdfCanvas").each(generatePdfCanvas);
	}

	function generatePdfCanvas () {
		currentPdfPages = [];

		var canvas = this;
		var $this = $(canvas);
		var pdfUrl = $this.attr("data-pdf-url");
		var pdfPage = parseInt($this.attr("data-pdf-page"));
		if (pdfUrl == lastPdfUrl) {
			loadAndRenderPage(lastPdf);
		}
		else {
			PDFJS.getDocument(pdfUrl).then(function(pdf) {
				loadAndRenderPage(pdf);
				lastPdf = pdf;
			});
		}

		/**@param {PDFDocumentProxy} pdf*/
		function loadAndRenderPage (pdf) {
			console.log("Going to load and render page", pdfPage);
			pdf.getPage(pdfPage).then(/**@param {PDFPageProxy} page*/function (page) {
				currentPdfPages.push(page);
				renderPage(canvas, page);
			});
		}
	}

	function renderPage (canvas, page) {
		if (page.rendering === true) {
			console.log("Re-rendering page cancelled due to previous render call");
			return;
		}

		page.rendering = true;

		var scale = $(canvas).parent().innerHeight() / page.getViewport(1.0).height;
		//var scale = 0.1;

		console.log("Scale", scale, $(canvas).parent().innerHeight(), page.getViewport(1.0).height);
		var context = canvas.getContext("2d");
		var viewport = page.getViewport(scale);
		canvas.height = $(canvas).parent().innerHeight();
		canvas.width = viewport.width;
		var renderContext = {
			canvasContext: context,
			viewport: viewport
		};
		page.render(renderContext).then(function () {
			page.rendering = false;
		});
	}

	function resizeThumbnails() {
		var itemWidth = $container.find(".tabeebGalleryItem").first().css("width");
		$container.find(".tabeebGalleryItem").css('height', itemWidth);
		$container.find(".tabeebGalleryPdfCanvas").each(function (index) {
			if (currentPdfPages[index] == null)
				return;
			renderPage(this, currentPdfPages[index]);
		});
	}


	function show () {
		generateHTML();
		$container.show();
		resizeThumbnails();
	}

	function hide () {
		$container.hide();
	}
}

/**
 * @type {{canDeleteSlides: boolean}}
 */
TabeebGalleryService.defaults = {
	canDeleteSlides: true
};