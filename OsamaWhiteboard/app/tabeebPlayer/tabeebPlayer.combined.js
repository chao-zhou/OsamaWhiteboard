/**
 * Created by cody on 7/8/15.
 */

/**
 * @readonly
 * @enum {string}
 */
var TabeebEvent =
{
    // Drawing
    undo: "undo", // Undo drawing operation occurred. No parameters
    redo: "redo", // Redo drawing operation occurred. No parameters
    annotationAdded: "annotationAdded", // Annotation added to drawing. Parameters: { type: TabeebAnnotationType, layerId: string,
                                        // IF STROKE:
                                        // stroke: { color: string, width: number, endpoints: [ { start: { x: number, y: number }, end: { x, y } } ] }
                                        // IF ERASED STROKE:
                                        // erasedStroke: { width: number, endpoints: [ { start: { x: number, y: number }, end: { x, y } } ] }
                                        // IF TEXT:
                                        // textInfo: { text: string, color: string, fontSize: number, point: { x: number, y: number } }
    annotationDeleted: "annotationDeleted", // Annotation removed from the drawing.
                                            // Parameters: annotation
    annotationRestored: "annotationRestored", // Annotation restored (with a Redo operation) to the drawing
    // Parameters: annotation

    // Navigation
    previousMedia: "previousMedia", // Previous Media button was clicked. Host should call setContent with new data. No parameters
    nextMedia: "nextMedia", // Next Media button was clicked. Host should call setContent with new data. No parameters

    // General status updates
    contentDisplayed: "contentDisplayed", // The media for the latest setContent call is visible to the user. No parameters
    annotationsDisplayed: "annotationsDisplayed", // The latest added annotations have been displayed

    // Misc
    loaded: "loaded", // Plugin DOM content has loaded. No parameters
    error: "error", // { message: "string" }
    galleryRequested: "galleryRequested",
    setMedia: "setMedia",
    deletePage: "deletePage",
    audioRecordingAdded: "audioRecordingAdded",
    penColorChanged: "penColorChanged",
    strokeStarted: "strokeStarted",
    strokeEnded: "strokeEnded",
    textContentChanged: "textContentChanged",
    participantUpdated: "participantUpdated",
    annotationsUpdated: "annotationsUpdated",
    screenModeChanged: "screenModeChanged",
    drawModeChanged: "drawModeChanged",
    contentModeChanged: "contentModeChanged",
    inviteUser: "inviteUser",
    inviteExternalUser: "inviteExternalUser",
    connectToPresentation: "connectToPresentation",
    disconnectFromPresentation: "disconnectFromPresentation",
    requestPresenterChange: "requestPresenterChange",
    completelyLoaded: "completelyLoaded",
    optionsUpdated: "optionsUpdated",
    annotationSelected: "annotationSelected",
    annotationUnselected: "annotationUnselected"
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebContentType =
{
    Image: 0,
    Video: 1,
    Text: 2,
    Pdf: 3
};

/**
 * @readonly
 * @enum {Number}
 */
var TabeebAnnotationMode = {
    Normal: 0,
    HideAll: 1,
    ReadOnly: 2
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebAnnotationType =
{
    Stroke: 0,
    ErasedStroke: 1,
    LaserStroke: 2,
    Text: 3,
    Audio: 4,
    Callout: 5,
    Hotspot: 6,
    Line: 100,
    Rectangle: 101,
    Ellipse: 102,
    Rectangle_Filled: 103,
    Ellipse_Filled: 104,
    ArrowEnd: 105,
    ArrowBoth: 106
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebDrawModeType =
{
    Pen: 0,
    Eraser: 1,
    Pointer: 2,
    Text: 3,
    Selection: 4,
    Cursor: 5
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebScreenModeType =
{
    Draw: 0,
    Navigation: 1,
    Gallery: 2,
    Disabled: 3,
    Text: 4,
    Spectator: 5 /* spectator of Presenter */
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebAssetType =
{
    Unknown: 0,
    Image: 1,
    Video: 2,
    Preview: 3
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebWhiteBoardType =
{
    Normal: 0,
    Text: 1
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebFinalizeStrokePolicy = {
    AllStrokes: 0,
    FirstAndLastStroke: 1
};

var TabeebPresenterEvent = {
    updatePresenterState: "updatePresenterState"
};

/**
 * @readonly
 * @enum {string}
 */
var TabeebSpectatorEvent =
{
    galleryPressed: "galleryPressed",
    setMediaIndex: "setMediaIndex",
    audioSeeked: "audioSeeked",
    audioPaused: "audioPaused",
    audioStart: "audioStart",
    videoSeeked: "videoSeeked",
    videoPaused: "videoPaused",
    videoStart: "videoStart",
    // For when you first join or presenter mode just begins
    presenterState: "presenterState",
    muteChanged: "muteChanged",
    volumeChanged: "volumeChanged",
    hotspotAudioEvent: "hotspotAudioEvent",
    hotspotDialogOpened: "hotspotDialogOpened",
    hotspotDialogClosed: "hotspotDialogClosed",
    hotspotDialogCommentClicked: "hotspotDialogCommentClicked",
    laserPointerMoved: "laserPointerMoved",
    largeVideoToggled: "largeVideoToggled",
    userAudioMutedChanged: "userAudioMutedChanged"
};

/**
 * @readonly
 * @enum {number}
 */
var TabeebPresenterMode =
{
    None: 0,
    Presenter: 1,
    Spectator: 2
};
//---------------------------------------
// Input service
//---------------------------------------
function TabeebInputService ($strokeElementIn, optionsIn) {
	var options = optionsIn;
	var $strokeElement = $strokeElementIn;
	var inputMode = 0;
	var $this = $(this);
	this.hammer = null;
	this.textBoardHammer = null;

	this.setInputMode = function (mode) {
		inputMode = mode;
		if (mode == TabeebInputService.InputMode.Draw)
		{
			if (this.hammer)
			{
				this.hammer.get("pinch").set({enable: false});
				this.hammer.get("pan").set({enable: false});
			}

			$strokeElement.off("touchstart").off("touchmove").off("touchend");
			$strokeElement.on({
				touchstart: touchStart,
				touchmove: touchMove,
				touchend: touchEnd
			});
		}
		else if (mode == TabeebInputService.InputMode.Navigation)
		{
			if (this.hammer)
			{
				this.hammer.get("pinch").set({enable: true});
				this.hammer.get("pan").set({enable: true});
			}
			$strokeElement.off("touchstart").off("touchmove").off("touchend");
		}
		else if (mode == TabeebInputService.InputMode.None)
		{
			if (this.hammer)
			{
				this.hammer.get("pinch").set({enable: false});
				this.hammer.get("pan").set({enable: false});
			}
			$strokeElement.off("touchstart").off("touchmove").off("touchend");
		}
	};

	this.getInputMode = function () { return inputMode; };

	function connectEventHandler (func, eventName) {
		if (typeof func !== "function")
			return;

		$strokeElement.on(eventName, func);
	}

	function isLeftButtonPressed (event) {
		return (event.buttons != null && event.buttons == 1) || (event.buttons == null && event.which == 1);
	}

	function createInputEvent (eventName, event) {
		if (event.offsetX)
			return $.Event(eventName, {
				point: {x: event.offsetX, y: event.offsetY},
				leftButtonDown: isLeftButtonPressed(event)
			});
		else
			return $.Event(eventName, {
				point: {
					x: event.pageX - $(event.currentTarget).offset().left,
					y: event.pageY - $(event.currentTarget).offset().top
				},
				leftButtonDown: isLeftButtonPressed(event)
			});
	}

	function createInputEventFromHammer (eventName, event) {
		// Firefox compatibility
		return $.Event(eventName, {
			point: {x: event.center.x - $strokeElement.offset().left, y: event.center.y - $strokeElement.offset().top},
			leftButtonDown: true
		});

		//return { x: event.layerX - event.currentTarget.offsetLeft,
		//    y: event.layerY - event.currentTarget.offsetTop };

	}

	function createInputEventFromMobile (eventName, event) {
		return $.Event(eventName, {
			point: {
				x: event.originalEvent.touches[0].pageX - $strokeElement.offset().left,
				y: event.originalEvent.touches[0].pageY - $strokeElement.offset().top
			},
			leftButtonDown: true,
			taps: event.taps
		});
	}

	function setupInputHandlers () {
		connectEventHandler.call(this, options.pointerDown, TabeebInputService.InputServiceEvent.pointerDown);
		connectEventHandler.call(this, options.pointerUp, TabeebInputService.InputServiceEvent.pointerUp);
		connectEventHandler.call(this, options.pointerMove, TabeebInputService.InputServiceEvent.pointerMove);
		connectEventHandler.call(this, options.pinchStart, TabeebInputService.InputServiceEvent.pinchStart);
		connectEventHandler.call(this, options.pinchMove, TabeebInputService.InputServiceEvent.pinchMove);
		connectEventHandler.call(this, options.pinchEnd, TabeebInputService.InputServiceEvent.pinchEnd);

		$strokeElement.on({
			mousemove: function (event) { $strokeElement.trigger(createInputEvent(TabeebInputService.InputServiceEvent.pointerMove, event)); },
			mousedown: function (event) { $strokeElement.trigger(createInputEvent(TabeebInputService.InputServiceEvent.pointerDown, event)); },
			mouseup: function (event) { $strokeElement.trigger(createInputEvent(TabeebInputService.InputServiceEvent.pointerUp, event)); },
			mouseout: function (event) {
				//Trigger a pointer move event if the mouse leaves the canvas area
				if (isLeftButtonPressed(event))
				{
					$strokeElement.trigger(createInputEvent(TabeebInputService.InputServiceEvent.pointerMove, event));
					//$strokeElement.trigger(createInputEvent(TabeebInputService.InputServiceEvent.pointerUp, event));
					event.stopPropagation();
					event.preventDefault();
				}
			},
			DOMMouseScroll: function (event) { options[TabeebInputService.InputServiceEvent.mouseWheel].call(null, event); }, //Firefox scroll
			dblclick: function (event) { options[TabeebInputService.InputServiceEvent.doubleClick].call(null, event); }
		});

		$strokeElement.parent().on('mousewheel', function (event) { options[TabeebInputService.InputServiceEvent.mouseWheel].call(null, event); });

		//Register mobile events
		if (TabeebInputService.isTouchDevice())
		{
			$strokeElement.on({
				touchstart: touchStart,
				touchmove: touchMove,
				touchend: touchEnd
			});
			setupGestureRecognition.call(this);
		}
	}

	function touchStart (event) {
		$strokeElement.trigger(createInputEventFromMobile(TabeebInputService.InputServiceEvent.pointerDown, event));
	}

	function touchMove (event) {
		$strokeElement.trigger(createInputEventFromMobile(TabeebInputService.InputServiceEvent.pointerMove, event));
	}

	function touchEnd (event) {
		$strokeElement.trigger(createInputEvent(TabeebInputService.InputServiceEvent.pointerUp, event));
	}

	function panStart (event) {
		console.info("pan start");
		$strokeElement.trigger(createInputEventFromHammer(TabeebInputService.InputServiceEvent.pointerDown, event));
	}

	function panMove (event) {
		$strokeElement.trigger(createInputEventFromHammer(TabeebInputService.InputServiceEvent.pointerMove, event));
	}

	function panEnd (event) {
		$strokeElement.trigger(createInputEventFromHammer(TabeebInputService.InputServiceEvent.pointerUp, event));
	}

	function pinchStart (event) {
		options[TabeebInputService.InputServiceEvent.pinchStart].call(null, event);
	}

	function pinchMove (event) {
		options[TabeebInputService.InputServiceEvent.pinchMove].call(null, event);
	}

	function pinchEnd (event) {
		options[TabeebInputService.InputServiceEvent.pinchEnd].call(null, event);
	}

	function swipeLeft (event) {
		options[TabeebInputService.InputServiceEvent.swipeLeft].call(null, event);
	}

	function swipeRight (event) {
		options[TabeebInputService.InputServiceEvent.swipeRight].call(null, event);
	}

	function mobileTap (event) {
		$this.trigger(event);
	}

	function setupGestureRecognition () {
		var input = this;
		input.hammer = new Hammer($strokeElement.get(0));
		var contentEditable = $strokeElement.parent().find(".tabeebTextAssetContainer").children()[0];
		input.textBoardHammer = new Hammer(contentEditable);
		input.hammer.get("pinch").set({enable: true});

		input.hammer.on("panstart", panStart);
		input.hammer.on("panmove", panMove);
		input.hammer.on("panend", panEnd);
		input.hammer.on("pinchstart", pinchStart);
		input.hammer.on("pinchmove", pinchMove);
		input.hammer.on("pinchend", pinchEnd);

		if (TabeebInputService.isTouchDevice())
		{
			input.hammer.on("swipeleft", swipeLeft);
			input.hammer.on("swiperight", swipeRight);
			input.hammer.on("tap", mobileTap);
			input.textBoardHammer.on("swipeleft", swipeLeft);
			input.textBoardHammer.on("swiperight", swipeRight);
		}
	}

	setupInputHandlers.call(this);

	this.dispose = function () {
		document.ontouchmove = function (e) {};
	};
}

TabeebInputService.InputServiceEvent =
{
	pointerMove: "pointerMove",
	pointerDown: "pointerDown",
	pointerUp: "pointerUp",
	pinchStart: "pinchStart",
	pinchMove: "pinchMove",
	pinchEnd: "pinchEnd",
	mouseWheel: "mouseWheel",
	swipeLeft: "swipeLeft",
	swipeRight: "swipeRight",
	doubleClick: "doubleClick"
};

window.mobileAndTabletcheck = function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};

jQuery.browser = jQuery.browser || {};
jQuery.browser.mobile = window.mobileAndTabletcheck();

TabeebInputService.isTouchDevice = function () {
	return jQuery.browser.mobile === true;
};

TabeebInputService.InputMode =
{
	None: 0,
	Draw: 1,
	Navigation: 2
};function TabeebPlayerUtil()
{
}

TabeebPlayerUtil.colorStringToRGB = function (colorString)
{
    var knownColorRegexes = [
        // RGB(R, G, B, A)
        {
            expression: /^rgba\((\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d\.?\d)\s?\)$/i,
            parser: function (pieces)
            {
                return {
                    r: parseInt(pieces[1]),
                    g: parseInt(pieces[2]),
                    b: parseInt(pieces[3]),
                    a: parseFloat(pieces[4])
                };
            }
        },

        // RGB(R, G, B)
        {
            expression: /^rgb\((\d{1,3})\s?,\s?(\d{1,3})\s?,\s?(\d{1,3})\s?\)$/i,
            parser: function (pieces)
            {
                return {
                    r: parseInt(pieces[1]),
                    g: parseInt(pieces[2]),
                    b: parseInt(pieces[3]),
                    a: 1.0
                };
            }
        },

        // Hex #xxyyzz
        {
            expression: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
            parser: function (pieces)
            {
                return {
                    r: parseInt(pieces[1], 16),
                    g: parseInt(pieces[2], 16),
                    b: parseInt(pieces[3], 16),
                    a: 1.0
                };
            }
        }
    ];

    var rgba = null;
    for (var i = 0; i < knownColorRegexes.length; i++)
    {
        var result = knownColorRegexes[i].expression.exec(colorString);
        if (result)
        {
            rgba = knownColorRegexes[i].parser(result);
            break;
        }
    }

    // Sanity check results
    if (rgba != null)
    {
        rgba.r = (rgba.r < 0 || isNaN(rgba.r) ? 0 : Math.min(rgba.r, 255));
        rgba.g = (rgba.g < 0 || isNaN(rgba.g) ? 0 : Math.min(rgba.g, 255));
        rgba.b = (rgba.b < 0 || isNaN(rgba.b) ? 0 : Math.min(rgba.b, 255));
        rgba.a = (rgba.a < 0 || isNaN(rgba.a) ? 0 : Math.min(rgba.a, 255));
    }
    else
        rgba = {r: 255, g: 255, b: 255, a: 1.0};

    return rgba;
};

/**
 * @return {string}
 */
TabeebPlayerUtil.RGBAToColor = function (rgba)
{
    if (rgba.a < 1.0)
        return "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + rgba.a + ")";

    var r = rgba.r.toString(16);
    var g = rgba.g.toString(16);
    var b = rgba.b.toString(16);
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
};

TabeebPlayerUtil.colorChannelMixer = function (colorChannelA, colorChannelB, amountToMix)
{
    var channelA = colorChannelA * amountToMix;
    var channelB = colorChannelB * (1 - amountToMix);
    return parseInt(channelA + channelB);
};

TabeebPlayerUtil.mixColors = function (rgb1, rgb2, amountToMix) {
    var rgbA = TabeebPlayerUtil.colorStringToRGB(rgb1);
    var rgbB = TabeebPlayerUtil.colorStringToRGB(rgb2);
    var r = TabeebPlayerUtil.colorChannelMixer(rgbA.r, rgbB.r, amountToMix);
    var g = TabeebPlayerUtil.colorChannelMixer(rgbA.g, rgbB.g, amountToMix);
    var b = TabeebPlayerUtil.colorChannelMixer(rgbA.b, rgbB.b, amountToMix);

    return "rgba(" + r + "," + g + "," + b + "," + amountToMix + ")";
};

TabeebPlayerUtil.getQueryParameterByName = function (url, name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

TabeebPlayerUtil.annotationInArray = function (array, annotationOrAnnotationId)
{
    var matchingAnnotations = $.grep(array, function (a)
    {
        return a.id == (typeof annotationOrAnnotationId == 'string') ? annotationOrAnnotationId : annotationOrAnnotationId.id;
    }).length;
    console.log("matchingAnnotations", matchingAnnotations);
    return matchingAnnotations > 0;
};


TabeebPlayerUtil.detectIE = function ()
{
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0)
    {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0)
    {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0)
    {
        // IE 12 => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
};

TabeebPlayerUtil.getPluginBaseUrl = function () {
    if (location.origin == null)
        location.origin = location.protocol + "//" + location.host;
    var pathPieces = location.pathname.substr(1).split("/");
    pathPieces.splice(pathPieces.length - 1, 1);
    var jsPathPieces = $("#tabeebPlayerJS").attr("src").split('/');
    jsPathPieces.splice(jsPathPieces.length - 1, 1);
    return location.origin + "/" + pathPieces.join("/") + "/" + jsPathPieces.join("/") + "/";
};

/**
 * @param {jQuery} $el
 */
$.fn.collidesWith = function ($el) {
    var $this = $(this);
    var offsetA = $this.offset();
    var offsetB = $el.offset();

    var rect1 = {
        x: offsetA.left,
        y: offsetA.top,
        width: $this.width(),
        height: $this.height()
    };

    var rect2 = {
        x: offsetB.left,
        y: offsetB.top,
        width: $el.width(),
        height: $el.height()
    };

    return ShapeCollisions.rectangleRectangle(rect1, rect2);
};

TabeebPlayerUtil.validateEmail = function (email) {
    var re = /^([\a-z0-9\+-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};

/**
 * @param {Date|String} date
 * @returns {string}
 */
TabeebPlayerUtil.convertDateToString = function (date) {
    if (typeof(date) === "string")
        date = new Date(date);

    var now = new Date();
    if (now.toDateString() == date.toDateString())
    {
        return "<br>" + date.toLocaleTimeString(navigator.language, {
                hour: '2-digit',
                minute: '2-digit'
            }) + ", today";
    }
    else
    {
        return date.toLocaleDateString();
    }
};

TabeebPlayerUtil.getInitials = function (displayName) {
    var nameSplits = displayName.split(" ");
    var initials = "";
    nameSplits.forEach(function (str) { initials += str.substring(0,1).toUpperCase(); });
    return initials;
};


/**
 * @param {string} displayName
 * @returns {jQuery}
 */
TabeebPlayerUtil.createHTMLForBlankAvatar = function (displayName) {
    var $div = ('<div class="tabeebBlankAvatar tabeebCustomBGColor"><span>' + this.getInitials(displayName) + '</span></div>');
    return $($div);
};

TabeebPlayerUtil.escapeHtml = function (string) {
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
};

TabeebPlayerUtil.convertPluginAnnotationToCanvasAnnotation = function (annotation) {
    var type = annotation.type;

    if (type == TabeebAnnotationType.Stroke || type == TabeebAnnotationType.LaserStroke || type == TabeebAnnotationType.ErasedStroke) {
        var newAnnotation = new StrokeAnnotation(annotation);
        newAnnotation.type = type;
        return newAnnotation;
    }
    else if (type == TabeebAnnotationType.Text)
        return new TextAnnotation(annotation);
    else if (type == TabeebAnnotationType.Line)
        return new LineAnnotation(annotation);
    else if (type == TabeebAnnotationType.Rectangle)
        return new RectangleAnnotation(annotation);
    else if (type == TabeebAnnotationType.Ellipse)
        return new CircleAnnotation(annotation);
    else if (type == TabeebAnnotationType.Rectangle_Filled)
        return new RectangleAnnotation(annotation, true);
    else if (type == TabeebAnnotationType.Ellipse_Filled)
        return new CircleAnnotation(annotation, true);
    else if (type == TabeebAnnotationType.ArrowEnd)
        return new ArrowLineAnnotation(annotation, false);
    else if (type == TabeebAnnotationType.ArrowBoth)
        return new ArrowLineAnnotation(annotation, true);
    else if (type == TabeebAnnotationType.Callout)
        return new CalloutAnnotation(annotation);
    else if (type == TabeebAnnotationType.Audio)
        return annotation;
    else if (type == TabeebAnnotationType.Hotspot)
        return new HotspotAnnotation(annotation);
    else {
        console.error("Unable to find annotation for annotation type: " + type);
        return annotation;
    }
};"use strict";

//---------------------------------------
// Video service
//---------------------------------------
/**
 * @param {jQuery} $videoContainer
 * @param {jQuery} $canvasElement
 * @param {TabeebModules} modules
 * @constructor
 */
function TabeebVideoService ($videoContainer, $canvasElement, modules) {
	var that = null;
	var $this = null;
	var $videoElement = null;
	/**@type {TabeebCanvasService}*/
	var $canvasService = null;
	/**@type {jQuery}*/
	var $controlBar = null;
	var lastTimeUpdate = -1;
	var MIN_UPDATE_INTERVAL = 0.0;
	/**@type {HTMLVideoElement}*/
	var videoElement = null;
	var currentPlayerTech = TabeebVideoService.PlayerTech.None;
	var videoPlayer = null;
	var playerSize = {width: 0, height: 0};
	var lastPlayer = null;
	var isVideoPlayerLoaded = false;
	var metadataLoaded = false;
	var progressCount = 0;
	var ready = false;

	vjs_original.MediaError.defaultMessages[4] = 'Your browser/device does not support the video file type. Please check back in a few minutes for the video to be encoded.';

	init.call(this);

	function init () {
		that = this;
		$this = $(that);
		$canvasService = $(modules.canvasService);
	}

	function getVideoJSTech (url) {
		if (TabeebVideoService.isYouTubeUrl(url))
			return "youtube";
		if (TabeebVideoService.isVimeoUrl(url))
			return "vimeo";
		return null;
	}

	this.onready = function (callback) {
		if (ready)
			callback();
		else
		{
			$this.one(TabeebVideoService.VideoServiceEventType.videoPlayerReady, function () { callback(); });
		}
	};

	function setupVideoJSPlayer (url) {
		var deferred = $.Deferred();

		var isYouTubeUrl = TabeebVideoService.isYouTubeUrl(url);

		var videoJSTech = getVideoJSTech(url);

		var newPlayer = videoJSTech;

		// No need to dispose
		if (newPlayer == lastPlayer && videoPlayer != null)
		{

			console.log("Setting src", url);
			videoPlayer.src(url);
			that.pause();
			$videoContainer.find(".vjs-play-control").removeClass("vjs-playing").addClass("vjs-paused");
			$videoContainer.find(".tabeebVideoPlayer").removeClass("vjs-playing");
		}
		else
		{
			destroyVideoPlayer();

			var videoJSOptions = {
				controls: true,
				autoplay: modules.options.autoPlayVideos,
				width: "100%",
				height: "100%",
				ytcontrols: false,
				preload: "metadata"
			};

			if (videoJSTech == "vimeo")
				videoJSOptions.src = url;

			$videoElement = $("<video class='tabeebVideoPlayer video-js vjs-default-skin' preload='metadata' data-setup='{}'><p class='vjs-no-js'>No support for HTML5 video</p></video>");
			$videoContainer.append($videoElement);
			videoElement = $videoElement[0];

			if (videoJSTech)
				videoJSOptions.techOrder = [videoJSTech];

			console.log("VideoJS options", videoJSOptions);

			videoPlayer = VideoJS(videoElement, videoJSOptions, function () {
				isVideoPlayerLoaded = true;
				this.on('loadedmetadata', function () {
					ready = true;

					if (videoJSTech === "vimeo") {
						setTimeout(function () {
							$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.videoPlayerReady));
						}, 5000);
					}
					else
					{
						$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.videoPlayerReady));
					}

				});
				this.src(url);
				this.pause();
				deferred.resolve(true);
				bindVideoEvents(this);
			});
		}

		// Setting this will allow youtube to play on Android / iOS
		//if (TabeebVideoService.isYouTubeUrl(url))
		videoPlayer.tech.playVideoIsAllowed = true;

		lastPlayer = newPlayer;

		return deferred.promise();
	}

	/**
	 * @param {String} url
	 * @returns {*}
	 */
	function setupAzureVideoPlayer (url) {
		var deferred = $.Deferred();

		var newPlayer = "AMP";
		if (lastPlayer == newPlayer)
		{
			if (videoPlayer.currentSrc() != url)
			{
				videoPlayer.src([
					{
						src: url, type: "application/vnd.ms-sstr+xml"
					},
					{
						src: getMP4UrlFromManifest(url)
					}
				]);
			}

			that.setCurrentTime(0);
		}
		else
		{
			destroyVideoPlayer();
			$videoElement = $("<video id='video1' class='tabeebVideoPlayer azuremediaplayer amp-default-skin'><p class='vjs-no-js'>No support for HTML5 video</p></video>");
			$videoContainer.append($videoElement);
			videoElement = $videoElement[0];

			var ampOptions = {
				"nativeControlsForTouch": false,
				autoplay: modules.options.autoPlayVideos,
				controls: true,
				width: "100%",
				height: "100%",
				poster: "",
				techOrder: ["azureHtml5JS", "flashSS", "html5", "silverlightSS"],
				streamingFormats: ["SMOOTH"]
			};

			videoPlayer = amp('video1', ampOptions, function () {
				isVideoPlayerLoaded = true;
				deferred.resolve(true);
				this.on('loadedmetadata', function () {
					ready = true;
					$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.videoPlayerReady));
				});

				this.src([
					{
						src: url, type: "application/vnd.ms-sstr+xml"
					},
					{
						src: getMP4UrlFromManifest(url)
					}
				]);

				bindVideoEvents(this);
			});

		}

		lastPlayer = newPlayer;

		return deferred.promise();
	}

	/**
	 * @param {String} url
	 * @returns {String}
	 */
	function getMP4UrlFromManifest (url) {
		return url.replace(".ism/manifest", "_H264_1000kbps_AAC_und_ch2_96kbps.mp4");
	}

	function setVideoJSError (msg) {
		if (msg)
			$(".vjs-error-display").show().html(msg);
		else
			$(".vjs-error-display").hide();
	}

	function bindVideoEvents (videoPlayer) {
		//        videoPlayer.controlBar.lockShowing();
		//        videoPlayer.controlBar.fullscreenToggle.hide();
		videoPlayer.on("timeupdate", onPlayerTimeUpdated);
		//        videoPlayer.on("seeking", onPlayerSeeked);
		videoPlayer.on("seeked", onPlayerSeeked);
		videoPlayer.on("pause", onPlayerPaused);
		videoPlayer.on("play", onPlayerResumed);
		videoPlayer.on("volumechange", onPlayerVolumeChanged);
		videoPlayer.on("loadedmetadata", onMetaDataLoaded);
		videoPlayer.on("progress", onProgress);
		videoPlayer.one('ready', function () {
			if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && isYouTube)
			{
				$canvasElement.hide();
				$videoContainer.addClass("nocontrolsiOS");
			}
		});

		$canvasService.on(TabeebCanvasService.CanvasServiceEventType.mediaChanged, function () {
			$videoContainer.hide();
			if (videoPlayer)
			{
				try
				{
					videoPlayer.pause();
				}
				catch (ex) {
					console.warn("Suppressed error", ex);
				}
			}
		});

	}

	function destroyVideoPlayer () {
		isVideoPlayerLoaded = false;
		ready = false;
		if (videoPlayer)
		{
			try
			{
				videoPlayer.dispose();
			}
			catch (ex)
			{
			}
			videoPlayer = null;
		}

		if ($videoElement != null)
			$videoElement.remove();

		currentPlayerTech = TabeebVideoService.PlayerTech.None;
	}

	function onMetaDataLoaded (event) {
		metadataLoaded = true;
		setVideoJSError(null);
	}

	function onPlayerVolumeChanged (event) {
		$this.trigger($.Event(TabeebVideoService.VideoServiceEventType.volumeChanged, {volume: videoPlayer.volume()}));
	}

	function onPlayerPaused () {
		$this.trigger(TabeebVideoService.VideoServiceEventType.videoPaused, {time: that.getCurrentPlaybackTime()});
	}

	function onProgress (event) {
		if (!metadataLoaded)
			progressCount++;

		if (progressCount == 10 && !metadataLoaded)
		{
			console.warn("The metadata is at the end of file, we'll have to load the entire video to play it.");
			setVideoJSError("<p style='font-size: 20px;'>The video is currently being processed in the cloud. Please check back in a few minutes.</p>");
		}
	}

	function onPlayerResumed () {
		$canvasElement.show();
		$videoContainer.removeClass("nocontrolsiOS");
		$this.trigger(TabeebVideoService.VideoServiceEventType.videoPlayed, {time: that.getCurrentPlaybackTime()});
	}

	function onPlayerSeeked (event) {
		$this.trigger(TabeebVideoService.VideoServiceEventType.videoTimeSeeked, {time: that.getCurrentPlaybackTime()});
	}

	function onPlayerTimeUpdated () {
		var newTime = that.getCurrentPlaybackTime();
		if (Math.abs(newTime - lastTimeUpdate) >= MIN_UPDATE_INTERVAL)
		{
			$this.trigger(TabeebVideoService.VideoServiceEventType.videoTimeUpdated, {time: newTime});
			lastTimeUpdate = newTime;
		}
	}

	this.resize = function (width, height) {
		// Size the video directly over the canvas
		playerSize.height = height - TabeebVideoService.VIDEO_CONTROL_BAR_HEIGHT + TabeebVideoService.VIDEO_CONTROL_BAR_TRACKING_BAR_HEIGHT;
		playerSize.width = width;
		var position = $canvasElement.position();
		$videoContainer.css({left: position.left + 1, top: position.top + 1});
		$videoContainer.width(playerSize.width);
		$videoContainer.height(playerSize.height);

		var $player = $videoContainer.find(".tabeebVideoPlayer");
		$player.width(playerSize.width);
		$player.height(playerSize.height);
	};

	var playAgain = true;

	/**
	 * Plays the url (YouTube video or video file). If no URL, the currently loaded video is played
	 * @param url
	 */
	this.play = function (url) {
		progressCount = 0;

		if (!url || url.length == 0)
		{
			videoPlayer.play();
			return;
		}

		//destroyVideoPlayer();
		$videoContainer.show();

		var isYouTube = TabeebVideoService.isYouTubeUrl(url);

		var videoSetupFunction = isManifest(url) ? setupAzureVideoPlayer : setupVideoJSPlayer;

		videoSetupFunction.call(that, url).then(function () {
			try
			{
				$controlBar = $videoContainer.find(".vjs-control-bar");
				// Hide on iOS since iOS will not let us start videos without natural click event inside the YouTube iFrame
				if (isYouTube && TabeebInputService.isTouchDevice())
				{
					$canvasElement.hide();
					$videoContainer.addClass("nocontrolsiOS");
				}

			}
			catch (exception)
			{
				console.error(exception);
			}
		});
	};

	function setVideoError (msg) {
		$videoContainer.find(".vjs-error-display div").text(msg).parent().show();
	}

	/**
	 * @param {String} url
	 * @returns {boolean}
	 */
	function isManifest (url) {
		return url.toLowerCase().indexOf("/manifest") + "/manifest".length == url.length;
	}

	this.setVolume = function (volume) {
		videoPlayer.volume(volume);
	};

	this.resume = function () {
		if (videoPlayer)
			videoPlayer.play();
	};

	this.pause = function () {
		if (videoPlayer && isVideoPlayerLoaded)
			videoPlayer.pause();
	};

	this.isPlaying = function () {
		if (!videoPlayer)
			return false;
		else
			return !videoPlayer.paused();
	};

	this.setCurrentTime = function (time) {
		try
		{
			if (videoPlayer != null && isVideoPlayerLoaded)
				videoPlayer.currentTime(time);
		} catch (e)
		{
		}
	};

	this.hide = function () {
		if (videoPlayer && isVideoPlayerLoaded)
			videoPlayer.pause();
		$videoContainer.hide();
	};

	this.getCurrentPlaybackTime = function () {
		if (videoPlayer == null)
			return -1;

		return videoPlayer.currentTime();
	};

	this.dispose = function () {
		console.log("Destroying Video Service");
		destroyVideoPlayer();
	};

	this.getVideoPlayer = function () { return videoPlayer; };

	this.tapPlay = function (event) {
		//        videoPlayer.tech.playVideoIsAllowed = true;
		//        $videoContainer.click();
		//        videoPlayer.play();
	};
}

TabeebVideoService.getThumbnailForVideo = function (url, cb) {
	var videoId = TabeebVideoService.getYouTubeVideoId(url);

	if (videoId != null)
	{
		if (cb)
			cb("http://img.youtube.com/vi/" + videoId + "/hqdefault.jpg");
		//return "http://img.youtube.com/vi/" + videoId + "/default.jpg"; // Default
		return "http://img.youtube.com/vi/" + videoId + "/hqdefault.jpg"; // High quality
		//return "http://img.youtube.com/vi/" + videoId + "/mqdefault.jpg"; // Medium quality
		//return "http://img.youtube.com/vi/" + videoId + "/sddefault.jpg"; // Standard definition
		//return "http://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg"; // Maximum resolution
	}

	return null;
};

TabeebVideoService.getThumbnailForVideoVimeo = function (url, cb) {
	var urlSplit = url.split('/');
	var id = urlSplit[urlSplit.length - 1];
	$.ajax({
		type: 'GET',
		url: 'https://vimeo.com/api/v2/video/' + id + '.json',
		jsonp: 'callback',
		dataType: 'jsonp',
		success: function (data) {
			cb(data[0].thumbnail_large);
		},
		failure: function (error) {
			console.error(error);
			cb(null);
		}
	});
};

TabeebVideoService.getThumbnailUrl = function (url, cb) {
	if (this.isYouTubeUrl(url))
		return this.getThumbnailForVideo(url, cb);
	else if (this.isVimeoUrl(url))
		return this.getThumbnailForVideoVimeo(url, cb);
};

TabeebVideoService.isYouTubeUrl = function (url) {
	return (url.toLowerCase().indexOf("youtube.com") != -1);
};

TabeebVideoService.isVimeoUrl = function (url) {
	return (url.toLowerCase().indexOf("vimeo.com") >= 0)
};

TabeebVideoService.getYouTubeVideoId = function (url) {
	if (!TabeebVideoService.isYouTubeUrl(url))
		return null;

	// Extract the video ID
	return TabeebPlayerUtil.getQueryParameterByName(url, "v");
};

TabeebVideoService.VideoServiceEventType =
{
	videoTimeUpdated: "videoTimeUpdated",
	videoTimeSeeked: "videoTimeSeeked",
	videoPaused: "videoPaused",
	videoPlayed: "videoPlayed",
	volumeChanged: "volumeChanged",
	videoPlayerReady: "videoPlayerReady"
};

TabeebVideoService.VIDEO_CONTROL_BAR_HEIGHT = 36;
TabeebVideoService.VIDEO_CONTROL_BAR_TRACKING_BAR_HEIGHT = 6;

TabeebVideoService.PlayerTech =
{
	None: 0,
	Normal: 1,
	YouTube: 2
};
'use strict';

/**
 * Created by cody on 6/8/15.
 */

/**
 * @param player
 * @param {TabeebGalleryService} galleryService
 * @param {TabeebUserManager} userMgr
 * @param {jQuery} $audioService
 * @param {jQuery} $videoService
 * @constructor
 */
function TabeebPresenterManager (player, galleryService, userMgr, $audioService, $videoService) {

	//<editor-fold name="Variables">

	var self = this;

	var $player = $(player);
	/**@type {TabeebAudioService}*/
	var audioService = $audioService[0];
	/**@type {TabeebVideoService}*/
	var videoService = $videoService[0];
	/**@type {TabeebCanvasService}*/
	var canvasService = player.canvasService;
	/**@type {TabeebPresenterMode}*/
	var presenterMode = TabeebPresenterMode.None;

	var presenterId = "";

	var hotspotManager = canvasService.hotspotManager;

	/**@type {TabeebAnnotationManager}*/
	var annotationMgr = player.annotationMgr;

	/**@type {TabeebCanvasHotspotManager}*/
	// Used to keep track of binded events
	var events = [];
	var that = this;

	/**@type {TabeebConnect}*/
	var connectService;

	this.mutedAudioUserIds = [];

	//</editor-fold>

	function resetVideoAndAudio () {
		videoService.setCurrentTime(0);
		videoService.pause();
	}

	//<editor-fold name="Jitsi Meet Integration">

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getVideoElementByUserId (userId) {
		var $video = null;

		if (userId == presenterId)
		{
			if (getLargeVideoContainer().is(":visible")) {
				console.log("Returning large video");
				return getLargeVideoContainer().find("video, object");
			}
			$video = player.$pluginContainer.find(".tabeebPresenterUserContainer").find("video, object");
		}
		else
			$video = getVideoElementContainerByUserId(userId).find("video");

		console.log("Finding video", userId, $video);

		return $video;
	}

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getVideoElementContainerByUserId (userId) {
		if (userId == presenterId)
		{
			var $largeVideoContainer = getLargeVideoContainer();
			if ($largeVideoContainer.is(":visible"))
				return $largeVideoContainer;

			return player.$pluginContainer.find(".tabeebPresenterUserContainer");
		}

		return player.$pluginContainer.find(".tabeebUserContainer[data-id='" + userId + "']")
	}

	this.reattachVideos = function () {
		if (connectService)
		{
			setTimeout(function() {
				connectService.reattachVideos();
			}, 5000);
		}
	};

	this.reattachVideo = function (userId) {
		if (connectService)
		{
			setTimeout(function() {
				connectService.reattachVideoForUser(userId);
			}, 1000);
		}
	};

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getAudioElementByUserId (userId) {
		var currentUser = userMgr.getThisUser();
		if (userId == currentUser.id)
		{
			console.log("No audio for self");
			return $("");
		}
		return player.$pluginContainer.find(".tabeebUserContainer[data-id='" + userId + "']").find("audio");
	}

	function getLargeVideoContainer () {
		return player.$pluginContainer.find(".tabeebLargeVideoContainer");
	}

	function onVideoStreamSwitched () {
		console.error("Video stream switched", arguments);
	}

	function setLargeVideoVisible (flag) {
		console.log("Setting Large Video", flag);
		var isCurrentVisible = getLargeVideoContainer().is(":visible");

		if (isCurrentVisible && flag === true)
		{
			return;
		}
		if (isCurrentVisible === false && flag === false)
		{
			return;
		}

		var isThisUserPresenter = (userMgr.getThisUser().id == presenterId);
		var $largeVideoContainer = player.$pluginContainer.find(".tabeebLargeVideoContainer");
		var $mediaContainer = player.$pluginContainer.find(".tabeebMediaContainer");
		if (flag) {
			$mediaContainer.hide();
			$largeVideoContainer.show();
		}
		else
		{
			$mediaContainer.show();
			$largeVideoContainer.hide();
		}

		if (connectService)
			connectService.reattachVideos();

		if (isThisUserPresenter)
		{
			$player.trigger($.Event(TabeebSpectatorEvent.largeVideoToggled, {active: flag}));
			$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { isScreenSharing: flag } }));
		}

		$(that).trigger($.Event(TabeebPresenterManager.Events.largeVideoToggled, {active: flag}));
	}

	this.setUserMuted = function (userId, isMuted) {
		connectService.setUserMute(userId, isMuted);
		if (isMuted && this.mutedAudioUserIds.indexOf(userId) < 0)
			this.mutedAudioUserIds.push(userId);
		else if (this.mutedAudioUserIds.indexOf(userId) >= 0)
			this.mutedAudioUserIds.splice(this.mutedAudioUserIds.indexOf(userId), 1);
		$player.trigger($.Event(TabeebSpectatorEvent.userAudioMutedChanged, {userId: userId, isMuted: isMuted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedAudioUserIds: this.mutedAudioUserIds } }));
	};

	this.toggleThisUsersAudio = function () {
		connectService.toggleAudio();
	};

	this.toggleThisUsersVideo = function () {
		connectService.toggleVideo();
	};

	this.getPresenterId = function () {
		return presenterId;
	};

	this.isVideoMuted = function (userId) {
		if (!userId) {
			userId = userMgr.getThisUser().id;
		}

		return connectService ? connectService.isVideoMuted(userId) : true;
	};

	this.isAudioMuted = function (userId) {
		if (!userId) {
			userId = userMgr.getThisUser().id;
		}

		return connectService ? connectService.isAudioMuted(userId) : true;
	};

	function onVideoMuted (userId, isMuted) {
		if (userId == presenterId && player.$pluginContainer.find(".tabeebLargeVideoContainer").is(":visible"))
		{
			isMuted = true;
		}

		var user = userMgr.find(userId);
		console.log("Setting " + user.displayName + "'s video to " + !isMuted);

		$(that).trigger($.Event(TabeebPresenterManager.Events.participantVideoMuteChange, {userId: userId, videoOn: !isMuted}));
	}

	function onAudioMuted (userId, isMuted) {
		$(that).trigger($.Event(TabeebPresenterManager.Events.participantAudioMuteChange, {userId: userId, audioOn: !isMuted}));
	}

	function onUserJoined (userId) {
		console.log("User joined", userId);
	}

	this.setUserOnlineStatus = setUserOnlineStatus;

	function setUserOnlineStatus (userId, isConnected) {
		if (that.mutedAudioUserIds.indexOf(userId) >= 0)
		{
			that.mutedAudioUserIds.splice(that.mutedAudioUserIds.indexOf(userId), 1);
			$(that).trigger($.Event(TabeebPresenterManager.Events.userAudioMutedChanged, {userId: userId, isMuted: false}));
		}

		console.info("Setting online status", userId, isConnected);
		$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		that.reattachVideos();
		//if (!isConnected)
		//{
		//	//var $container = getVideoElementContainerByUserId(userId);
		//	$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		//}
		//else
		//{
		//	$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		//}
	}

	function onAudioLevelChange (userId, audioLevel) {
		var isLocal = userId === "local";
		if (isLocal)
			userId = userMgr.getThisUser().id;

		var user = userMgr.find(userId);

		if (isLocal && connectService.isAudioMuted())
			audioLevel = 0;

		if ((audioLevel <= 0.005 && !isLocal) || (audioLevel <= 0.008 && isLocal)) {
			$(self).trigger($.Event(TabeebPresenterManager.Events.participantEndedSpeaking, {userId: user.id}));
		}
		else
		{
			$(self).trigger($.Event(TabeebPresenterManager.Events.participantStartedSpeaking, {userId: user.id}));
		}
	}

	function onUserLeft (userId) {
		setUserOnlineStatus(userId, false);
		console.log("User left", userId);
	}

	this.setAudioMuted = function (isMuted) {
		if (!isMuted) {
			isMuted = !connectService.isAudioMuted();
		}

		if (isMuted)
			connectService.muteAudio();
		else
			connectService.unmuteAudio();
	};

	this.toggleScreenShare = function () {
		connectService.shareScreen();
	};

	this.setVideoMuted = function (isMuted) {
		if (!isMuted) {
			isMuted = !connectService.isVideoMuted();
		}

		if (isMuted)
			connectService.muteVideo();
		else
			connectService.unmuteVideo();
	};

	this.setPresenter = function (presId) {
		setLargeVideoVisible(false);
		if (connectService && connectService.isScreenSharing())
			connectService.shareScreen();

		var oldPresenterId = presenterId;

		presenterId = presId;
		$(that).trigger($.Event(TabeebPresenterManager.Events.presenterChanged, {presenterId: presenterId, presenterVideoOn: connectService ? connectService.isVideoMuted(presId) : false }));

		if (presenterId == userMgr.getThisUser().id) {
			console.info("You are now the presenter.");
			this.setPresenterMode(true);
		}
		else
		{
			console.info("You are now a spectator");
			this.setSpectatorMode(true);
		}

		if (connectService && presId && presId.length > 0)
		{
			if (oldPresenterId && oldPresenterId.length > 0)
			{
			}
			//
			//connectService.reattachVideoForUser(presenterId);
		}

		if (connectService)
			connectService.reattachVideos();
	};

	this.changePresenter = function (userId) {
		player.$element.trigger($.Event(TabeebEvent.requestPresenterChange, {userId: userId}));
	};

	this.connect = function (presId) {

		console.log("Setting presenter id", presId, userMgr.getThisUser().id);

		if (userMgr.getThisUser().id == presenterId)
			this.setPresentationMode(TabeebPresenterMode.Presenter);
		else
			this.setPresentationMode(TabeebPresenterMode.Spectator);

		this.setPresenter(presId);
		var connectOptions = {
			boshUrl: 'https://webrtcdev.collaborate.center/http-bind',
			chromeExtensionId: 'adegdgcakdkmpacfffmjbjhagnkoncpj',
			domain: 'webrtcdev.collaborate.center',
			getVideoElementForUser: getVideoElementByUserId,
			getVideoElementContainerForUser: getVideoElementContainerByUserId,
			getAudioElementForUser: getAudioElementByUserId,
			userId: userMgr.getThisUser().id,
			conferenceId: player.contentName,
			onStreamAttached: function(stream, $element) {
				var user = userMgr.find(stream.userId);


				var container = player.$pluginContainer.find(".tabeebSidebarTab");
				var obj = container.find("object");
				obj.each(function (index, element) {
					this.width = 480;
					this.height = 480 * (9/16);
					//$(element).css('min-height', $(this).width()*3/4);
				});

				var $userContainer = getVideoElementContainerByUserId(stream.userId);

				var videoIsOn = !connectService.isVideoMuted(stream.userId);
				console.log("Stream Attached For", user.displayName, videoIsOn);

				$(that).trigger($.Event(TabeebPresenterManager.Events.participantVideoMuteChange, {userId: stream.userId, videoOn: videoIsOn}));

				$userContainer.addClass("video").addClass("audio");

				if (videoIsOn === false)
				{
					$userContainer.removeClass("video");
				}

				if ($userContainer.hasClass("offline"))
					setUserOnlineStatus(stream.userId, true);
			},
			onReady: function () {
			},
			onVideoStreamSwitched: onVideoStreamSwitched,
			setLargeVideoVisible: setLargeVideoVisible,
			getLargeVideoContainer: getLargeVideoContainer,
			isPresenter: function (userId) { return presenterId == userId; },
			onVideoMuted: onVideoMuted,
			onAudioMuted: onAudioMuted,
			onUserJoined: onUserJoined,
			onUserLeft: onUserLeft,
			onAudioLevelChange: onAudioLevelChange
		};

		if (TabeebConnect.clientCanConnect())
		{
			connectService = new TabeebConnect(connectOptions);
			connectService.connect();
		}
		else
		{
		}
	};

	this.disconnect = function () {
		if (connectService)
		{
			connectService.disconnect();
		}

		this.setPresentationMode(TabeebPresenterMode.None);
	};

	//</editor-fold>

	// <editor-fold desc="Presenter">
	/**
	 * @param isNewPresenter
	 * @returns {TabeebPresenterState}
	 */
	this.getPresenterState = function (isNewPresenter) {
		var state = {
			audioName: audioService.getCurrentAudio() ? audioService.getCurrentAudio().annotationId : null,
			audioPaused: audioService.getCurrentAudio() ? audioService.getCurrentAudio().paused : null,
			currentTime: canvasService.inVideoMode() ? videoService.getCurrentPlaybackTime() : audioService.getCurrentTime(),
			videoPaused: canvasService.inVideoMode() ? !videoService.isPlaying() : null,
			mutedUserIds: canvasService.getMutedUserIds(),
			slideIndex: player.currentSlideIndex,
			isScreenSharing: connectService ? connectService.isScreenSharing() : false,
			hotspotDialogAnnotationId: hotspotManager.getCurrentHotspot() ? hotspotManager.getCurrentHotspot().id : null,
			mutedAudioUserIds: this.mutedAudioUserIds
		};

		/*
		 Due to VideoJS timing issues, we have to tell if the presenter is being changed. That way we can set the video paused to true since there is a delay in telling VideoJS to pause
		 Ex:
		 videoPlayer.pause();
		 videoPlayer.paused(); // returns false
		 */
		if (isNewPresenter)
			state.videoPaused = true;

		return state;
	};

	this.setPresentationMode = function (mode) {
		if (mode == presenterMode)
			return;

		if (mode == TabeebPresenterMode.None) {
			if (presenterMode == TabeebPresenterMode.Presenter)
				that.setPresenterMode(false);
			else if (presenterMode == TabeebPresenterMode.Spectator)
				that.setSpectatorMode(false);

			$(that).trigger($.Event(TabeebPresenterManager.Events.presentationEnded, {}));
		}
		else if (mode == TabeebPresenterMode.Spectator)
		{
			if (presenterMode == TabeebPresenterMode.Presenter)
				that.setPresenterMode(false);
			else if (presenterMode == TabeebPresenterMode.Spectator)
				that.setSpectatorMode(false);

			that.setSpectatorMode(true);
		}
		else if (mode == TabeebPresenterMode.Presenter)
		{
			that.setPresenterMode(true);
		}

		if (presenterMode == TabeebPresenterMode.None && mode != TabeebPresenterMode.None)
		{
			$(that).trigger($.Event(TabeebPresenterManager.Events.presentationStarted, {isPresenter: mode == TabeebPresenterMode.Presenter}));
		}

		presenterMode = mode;
		$(that).trigger($.Event(TabeebPresenterManager.Events.presenterModeChanged, { presenterMode: mode }));
		player.handleResize();
	};

	this.currentlyInPresentation = function () {
		return presenterMode != TabeebPresenterMode.None;
	};

	this.getPresentationMode = function () {
		return presenterMode;
	};

	this.isCurrentUserPresenter = function () {
		return presenterId == userMgr.getThisUser().id;
	};

	this.setPresenterMode = function (flag) {
		unbindSpectatorEvents();
		resetVideoAndAudio();
		if (flag)
		{
			bindPresenterEvents();
			player.hudService.setScreenMode(player.options.defaultScreenModeType);
			galleryService.setDisabled(false);
			player.$element.addClass("presenting");
			player.$element.removeClass("spectating");
		}
		else
		{
			unbindPresenterEvents();
			player.$element.removeClass("presenting");
		}

		this.isPresenter = flag;
	};

	// Presenter events

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioSeeked (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioSeeked, {currentTime: event.currentTime}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { currentTime: event.currentTime } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterVolumeChanged (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.volumeChanged, {volume: event.volume}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { volume: event.volume } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterHotspotDialogOpened (event) {
		var hotspotAnnotation = event.hotspotAnnotation;
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogOpened, {annotationId: hotspotAnnotation.id}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { hotspotDialogAnnotationId: hotspotAnnotation.id } }));
	}

	function onPresenterHotspotDialogClosed () {
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogClosed, {}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { hotspotDialogAnnotationId: "" } }));
	}

	function onPresenterHotspotCommentClicked (event) {
		var annotationId = event.annotationId;
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogCommentClicked, {annotationId: annotationId}));
	}

	function onPresenterLaserPointerMoved (event) {
		console.log(event.x, event.y);
		$player.trigger($.Event(TabeebSpectatorEvent.laserPointerMoved, {
			x: event.x,
			y: event.y
		}));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterHotspotAudioEvent (event) {
		var audioEvent = event.audioEvent;
		var audioAnnotation = event.audioAnnotation;

		$player.trigger($.Event(TabeebSpectatorEvent.hotspotAudioEvent, {
			audioEvent: audioEvent,
			annotationId: audioAnnotation.id,
			currentTime: event.currentTime,
			volume: event.volume,
			muted: event.muted
		}));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterParticipantUpdated (event) {
		console.info("Participant Updated Event", event);
		if (event.isPropagationStopped())
			return;

		var participantId = event.id;
		var muted = event.muted;
		$player.trigger($.Event(TabeebSpectatorEvent.muteChanged, {id: participantId, muted: muted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedUserIds: canvasService.getMutedUserIds() } }));
		event.stopPropagation();
	}

	function onPresenterUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var isMuted = event.isMuted;
		$player.trigger($.Event(TabeebSpectatorEvent.muteChanged, {id: user.id, muted: isMuted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedUserIds: canvasService.getMutedUserIds() } }));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioStarted (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioStart, {
			audioName: event.audio.annotationId,
			playTime: event.audio.currentTime,
			resuming: event.resuming
		}));

		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { audioName: event.audio.annotationId, currentTime: event.audio.currentTime, audioPaused: false } }));

		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioPaused (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioPaused, {
			audioName: event.audio.annotationId,
			playTime: event.audio.currentTime
		}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { audioPaused: true, currentTime: event.audio.currentTime } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 * @param {Number} index
	 */
	function onPresenterSetMedia (event, index) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: index}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: index, inGallery: false } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterNextMedia (event) {
		// We get here
		//$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: player.currentSlideIndex + 1}));
		//$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: player.currentSlideIndex + 1, inGallery: false } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterPreviousMedia (event) {
		//$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: player.currentSlideIndex - 1}));
		//$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: player.currentSlideIndex - 1 }, inGallery: false }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 * @param {Number} index
	 */
	function onPresenterGalleryRequested (event, index) {
		$player.trigger($.Event(TabeebSpectatorEvent.galleryPressed, {index: index}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { inGallery: true } }));
		event.stopPropagation();
	}

	function onPresenterVideoPaused (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoPaused, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { videoPaused: true, currentTime: time.time } }));
		event.stopPropagation();
	}

	function onPresenterVideoPlayed (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoStart, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { videoPaused: false, currentTime: time.time } }));
		event.stopPropagation();
	}

	function onPresenterVideoTimeSeeked (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoSeeked, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { currentTime: time.time} }));
		event.stopPropagation();
	}

	function bindEvent ($target, eventType, func) {
		var bindedEvent = {
			target: $target,
			type: eventType,
			func: func
		};
		$target.off(eventType, func).on(eventType, func);

		events.push(bindedEvent);
	}

	function bindPresenterEvents () {
		// Trigger events so the pagePluginController can broadcast them to other users

		// Audio events
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioStarted, onPresenterAudioStarted);
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioPaused, onPresenterAudioPaused);
		bindEvent($audioService, TabeebAudioService.AudioEvent.volumeChanged, onPresenterVolumeChanged);
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioSeeked, onPresenterAudioSeeked);

		// Navigation events
		bindEvent(player.$element, TabeebEvent.galleryRequested, onPresenterGalleryRequested);
		bindEvent(player.$element, TabeebSpectatorEvent.setMediaIndex, onPresenterSetMedia);
		bindEvent(player.$element, TabeebEvent.nextMedia, onPresenterNextMedia);
		bindEvent(player.$element, TabeebEvent.previousMedia, onPresenterPreviousMedia);
		bindEvent(player.$element, TabeebEvent.setMedia, onPresenterSetMedia);

		// Video events
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoPaused, onPresenterVideoPaused);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoPlayed, onPresenterVideoPlayed);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoTimeSeeked, onPresenterVideoTimeSeeked);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.volumeChanged, onPresenterVolumeChanged);

		var $hotspotManager = canvasService.hotspotManager.getTriggerElement();

		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.audioEvent, onPresenterHotspotAudioEvent);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.dialogOpened, onPresenterHotspotDialogOpened);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.dialogClosed, onPresenterHotspotDialogClosed);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.commentFocused, onPresenterHotspotCommentClicked);

		bindEvent($player, TabeebEvent.participantUpdated, onPresenterParticipantUpdated);
		bindEvent($(canvasService), TabeebCanvasService.CanvasServiceEventType.laserPointerMoved, onPresenterLaserPointerMoved);

		bindEvent($(userMgr), TabeebUserManager.Events.userMuteChanged, onPresenterUserMuteChanged);
	}

	function unbindPresenterEvents () {
		for (var i = 0; i < events.length; i++)
		{
			var bindedEvent = events[i];
			bindedEvent.target.off(bindedEvent.type, bindedEvent.func);
		}
	}

	// </editor-fold>

	// <editor-fold desc="Spectator">
	this.setSpectatorMode = function (flag) {
		resetVideoAndAudio();
		unbindSpectatorEvents();
		if (flag)
		{
			unbindPresenterEvents();
			bindSpectatorEvents();
			player.hudService.setScreenMode(TabeebScreenModeType.Spectator);
			player.$element.addClass("spectating").removeClass("presenting");
			galleryService.setDisabled(true);
		}
		else
		{
			player.$element.removeClass("spectating");
			player.hudService.setScreenMode(player.options.defaultScreenModeType);
			galleryService.setDisabled(false);
		}
	};

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioStarted (event) {
		if (event.isPropagationStopped())
			return;

		audioService.onready(event.audioName, function () {
			if (event.resuming)
				audioService.resumeAudioElement();
			else
				audioService.playAudioWithElement(event.audioName);
			event.stopPropagation();
		});
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioPaused (event) {
		if (event.isPropagationStopped())
			return;

		audioService.pause(event.audioName);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioSeeked (event) {
		if (event.isPropagationStopped())
			return;

		audioService.setCurrentTime(event.currentTime);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoPaused (event) {
		if (event.isPropagationStopped())
			return;

		videoService.pause();
		videoService.setCurrentTime(event.currentTime);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoStart (event) {
		if (event.isPropagationStopped())
			return;

		videoService.onready(function () {
			videoService.setCurrentTime(event.currentTime);
			videoService.resume();
			event.stopPropagation();
		});

	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoSeeked (event) {
		if (event.isPropagationStopped())
			return;

		videoService.onready(function () {
			videoService.setCurrentTime(event.currentTime);
			event.stopPropagation();
		});
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorSetMediaIndex (event) {
		if (event.isPropagationStopped())
			return;

		player.$element.trigger(TabeebEvent.setMedia, event.index);
		event.stopPropagation();
	}

	/**
	 * @param {TabeebPresenterState} state
	 */
	this.setPresenterState = function (state) {
		//console.info("Received spectator presenter state", state);
		if (player.currentSlideIndex != state.slideIndex)
		{
			player.$element.trigger(TabeebEvent.setMedia, state.slideIndex);
			player.ready = false;
			player.onReady(function() { self.setPresenterState(state); });
			return;
		}

		if (state.isScreenSharing === true)
		{
			setLargeVideoVisible(true);
		}

		resetVideoAndAudio();

		if (state.mutedUserIds)
		{
			userMgr.users.forEach(function (user) {
				userMgr.setMuted(user.id, false);
			});
			state.mutedUserIds.forEach(function (userId) {
				userMgr.setMuted(userId, true);
			});
		}

		if (state.mutedAudioUserIds)
		{
			state.mutedAudioUserIds.forEach(function (userId) {
				console.log(userId, "is muted");
				onSpectatorUserAudioMuteChanged({userId: userId, isMuted: true});
			});
			canvasService.mutedUserIds = state.mutedUserIds;
		}
		// Check to see what audio the presenter is playing
		if (state.audioName && state.audioName.length > 0)
		{
			audioService.onready(state.audioName,
				function () {
					audioService.playAudioWithElement(state.audioName, state.currentTime);
					if (state.audioPaused === true)
						audioService.pause();

					if (state.volume)
						audioService.setVolume(state.volume);
				}
			);
		}

		if (state.hotspotDialogAnnotationId)
		{
			player.onReady(function () {
				var offset = canvasService.getOffsetOfAnnotation(state.hotspotDialogAnnotationId);
				var offsetEvent = {
					pageX: offset.left + offset.width,
					pageY: offset.top + offset.height
				};
				hotspotManager.show(annotationMgr.find(state.hotspotDialogAnnotationId), $.Event("Test", offsetEvent));
			});
		}

		// Recover video time and play status from presenter
		videoService.onready(function () {
			if (presenterMode != TabeebPresenterMode.Spectator)
				return;

			var millisecondsElapsed = (new Date()) - (new Date(state.timeStamp));
			if (state.videoPaused) {
				millisecondsElapsed = 0;
			}
			videoService.setCurrentTime(state.currentTime + (millisecondsElapsed/1000));

			if (state.volume)
				videoService.setVolume(volume);

			if (state.videoPaused === true || state.videoPaused == null)
				videoService.pause();
			else if (state.videoPaused === false)
			{
				millisecondsElapsed = (new Date()) - (new Date(state.timeStamp));
				videoService.play();
				videoService.setCurrentTime(state.currentTime + (millisecondsElapsed/1000));
			}
		});
	};

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorPresenterState (event) {
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorGalleryPressed (event) {
		if (event.isPropagationStopped())
			return;

		player.hudService.setScreenMode(TabeebScreenModeType.Gallery);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorMuteChanged (event) {
		if (event.isPropagationStopped())
			return;

		var id = event.id;
		var muted = event.muted;
		var participant = {
			id: id,
			showStrokes: !muted
		};

		userMgr.setMuted(id, muted);

		player.updateParticipant(participant);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVolumeChanged (event) {
		if (event.isPropagationStopped())
			return;

		var volume = event.volume;
		videoService.setVolume(volume);
		audioService.setVolume(volume);
		event.stopPropagation();
	}

	function onSpectatorHotspotAudioEvent (event) {
		console.log("Hotspot Audio Event From Presenter", event);
		var audioEvent = event.audioEvent;
		var annotationId = event.annotationId;
		var type = audioEvent.type;
		var hotspotManager = canvasService.hotspotManager;

		hotspotManager.onAnnotationsReady(function () {
			/**@type {Audio}*/
			var audioElement = hotspotManager.getAudioElement(annotationId);
			audioElement.volume = audioEvent.volume;
			//audioElement.currentTime = audioEvent.currentTime;
			audioElement.muted = audioEvent.muted;

			if (type == "play")
			{
				hotspotManager.playAudioAnnotation(annotationId, audioEvent.currentTime);
			}
			else if (type == "pause")
			{
				audioElement.pause();
			}
			else if (type == "seeked")
			{
				audioElement.currentTime = audioEvent.currentTime;
			}
		});
		hotspotManager.focusOnComment(annotationId);
	}

	function onSpectatorHotspotDialogOpened (event) {
		player.onReady(function () {
			setTimeout(function() {
				var offset = canvasService.getOffsetOfAnnotation(event.annotationId);
				var offsetEvent = {
					pageX: offset.left + offset.width,
					pageY: offset.top + offset.height
				};
				hotspotManager.show(annotationMgr.find(event.annotationId), $.Event("Test", offsetEvent));
			}, 500);
		});
	}

	function onSpectatorHotspotDialogClosed () {
		hotspotManager.hide();
	}

	function onSpectatorHotspotDialogCommentClicked (event) {
		var annotationId = event.annotationId;
		hotspotManager.focusOnComment(annotationId);
	}

	function onSpectatorLaserPointerMoved (event) {
		var x = canvasService.imageToCanvasCoordX(event.x);
		var y = canvasService.imageToCanvasCoordX(event.y);
		canvasService.setLaserPointerPosition(x, y);
	}

	function onSpectatorLargeVideoToggled (event) {
		var isVisible = event.active;
		console.log("Received large video state from presenter", isVisible);
		setLargeVideoVisible(isVisible);
	}

	function onSpectatorUserAudioMuteChanged (event) {
		var userId = event.userId;
		var isMuted = event.isMuted;
		console.log("Presenter muted spectator", userId, isMuted);

		if (isMuted && that.mutedAudioUserIds.indexOf(userId) < 0)
			that.mutedAudioUserIds.push(userId);
		else if (that.mutedAudioUserIds.indexOf(userId) >= 0)
			that.mutedAudioUserIds.splice(that.mutedAudioUserIds.indexOf(userId), 1);

		$(that).trigger($.Event(TabeebPresenterManager.Events.userAudioMutedChanged, {userId: userId, isMuted: isMuted}));
	}

	function unbindSpectatorEvents () {
		for (var eventName in TabeebSpectatorEvent)
		{
			if (TabeebSpectatorEvent.hasOwnProperty(eventName))
				$player.off(eventName);
		}
	}

	function bindSpectatorEvents () {
		// Incoming events

		// Audio Events
		$player.unbind(TabeebSpectatorEvent.audioStart).on(TabeebSpectatorEvent.audioStart, onSpectatorAudioStarted);
		$player.unbind(TabeebSpectatorEvent.audioPaused).on(TabeebSpectatorEvent.audioPaused, onSpectatorAudioPaused);
		$player.unbind(TabeebSpectatorEvent.audioSeeked).on(TabeebSpectatorEvent.audioSeeked, onSpectatorAudioSeeked);

		// Video Events
		$player.unbind(TabeebSpectatorEvent.videoPaused).on(TabeebSpectatorEvent.videoPaused, onSpectatorVideoPaused);
		$player.unbind(TabeebSpectatorEvent.videoStart).on(TabeebSpectatorEvent.videoStart, onSpectatorVideoStart);
		$player.unbind(TabeebSpectatorEvent.videoSeeked).on(TabeebSpectatorEvent.videoSeeked, onSpectatorVideoSeeked);

		// Navigation Events
		$player.unbind(TabeebSpectatorEvent.setMediaIndex).on(TabeebSpectatorEvent.setMediaIndex, onSpectatorSetMediaIndex);
		$player.unbind(TabeebSpectatorEvent.presenterState).on(TabeebSpectatorEvent.presenterState, onSpectatorPresenterState);
		$player.unbind(TabeebSpectatorEvent.galleryPressed).on(TabeebSpectatorEvent.galleryPressed, onSpectatorGalleryPressed);

		$player.unbind(TabeebSpectatorEvent.muteChanged).on(TabeebSpectatorEvent.muteChanged, onSpectatorMuteChanged);
		$player.unbind(TabeebSpectatorEvent.volumeChanged).on(TabeebSpectatorEvent.volumeChanged, onSpectatorVolumeChanged);

		$player.unbind(TabeebSpectatorEvent.hotspotAudioEvent).on(TabeebSpectatorEvent.hotspotAudioEvent, onSpectatorHotspotAudioEvent);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogOpened).on(TabeebSpectatorEvent.hotspotDialogOpened, onSpectatorHotspotDialogOpened);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogClosed).on(TabeebSpectatorEvent.hotspotDialogClosed, onSpectatorHotspotDialogClosed);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogCommentClicked).on(TabeebSpectatorEvent.hotspotDialogCommentClicked, onSpectatorHotspotDialogCommentClicked);

		$player.unbind(TabeebSpectatorEvent.laserPointerMoved).on(TabeebSpectatorEvent.laserPointerMoved, onSpectatorLaserPointerMoved);
		$player.unbind(TabeebSpectatorEvent.largeVideoToggled).on(TabeebSpectatorEvent.largeVideoToggled, onSpectatorLargeVideoToggled);
		$player.unbind(TabeebSpectatorEvent.userAudioMutedChanged).on(TabeebSpectatorEvent.userAudioMutedChanged, onSpectatorUserAudioMuteChanged);
	}

	// </editor-fold>
}

TabeebPresenterManager.Events = {
	spectatorModeChanged: "spectatorModeChanged",
	presenterModeChanged: "presenterModeChanged",
	presentationStarted: "presentationStarted",
	presentationEnded: "presentationEnded",
	presenterChanged: "presenterChanged",
	participantOnlineStatusChanged: "participantOnlineStatusChanged",
	participantStartedSpeaking: "participantStartedSpeaking",
	participantEndedSpeaking: "participantEndedSpeaking",
	participantVideoMuteChange: "participantVideoMuteChange",
	participantAudioMuteChange: "participantAudioMuteChange",
	largeVideoToggled: "largeVideoToggled",
	userAudioMutedChanged: "userAudioMutedChanged"
};'use strict';

/**
 * Created by Cody on 4/28/15.
 *
 * Used for audio recording and playback
 */

/**
 * @param {TabeebAnnotationManager} annotationMgr
 * @param {jQuery} $audioContainer
 * @param {jQuery} $videoServiceIn
 * @param {TabeebModules} modules
 * @param optionsIn
 * @constructor
 */
function TabeebAudioService (annotationMgr, $audioContainer, $videoServiceIn, modules, optionsIn) {
	var defaultOptions = {
		displayGalleryInVideoMode: true,
		displayPlayerInVideoMode: false
	};

	var options = $.extend(defaultOptions, optionsIn);

	var $pluginContainer = $audioContainer.parents(".tabeebPluginContainer");

	var $audioToggle = $pluginContainer.find(".tabeebAudioGalleryContainerToggle");
	var $audioGalleryContainer = $audioContainer.find(".tabeebAudioGalleryContainer");
	var $audioPlayerContainer = $audioContainer.find(".tabeebAudioPlayerContainer");
	var $audioElement = $audioPlayerContainer.find("audio");
	var $videoService = $videoServiceIn;
	var $badge = $pluginContainer.find(".tabeebAudioAnnotationBadge");
	var videoService = $videoService[0];
	var $this = $(this);
	var currentAudioLength = 0;

	/**@type {Audio}*/
	var lastRecordedAudio = null;
	var lastRecordedAudioPlaybackUrl = null;

	var audioInfo = null;

	var pausedTimeToAdd = 0;

	var currentParentAnnotation = null;

	var mutedUserIds = [];

	var recordingState = TabeebAudioService.RecordingState.Stopped;

	/**@type {AudioContext}*/
	var audioContext = null;
	/**@type {Recorder}*/
	var audioRecorder = null;
	var jsNode = null;

	var inVideoMode = false;
	var currentVideoTime = 0;
	var currentVideoTimeWhenRecordingStarted = 0;

	var recordStartTime = null;

	var that = this;

	// Used for visualization (unused as of now)
	var analyser = null;

	// Audio objects http://www.w3schools.com/tags/ref_av_dom.asp
	var soundboard = {};

	bindVideoEvents();
	bindAudioGalleryEvents();
	bindAudioElementEvents();

	function toggleAudioContainer () {
		$audioGalleryContainer.toggleClass("active");
		$audioToggle.toggleClass("active");
	}

	this.isBrowserCompatible = function () {
		return navigator.getUserMedia || navigator.webkitGetUserMedia;
	};

	this.getPlaybackAudio = function () {
		return lastRecordedAudio;
	};

	function displayUnsupportedBrowserError () {
		alert("Audio recording is not supported in your brwoser.");
	}

	this.canRecordAudio = function () {
		try {
			var AudioContext = (window.AudioContext ||
			window.webkitAudioContext ||
			window.mozAudioContext ||
			window.oAudioContext ||
			window.msAudioContext);

			navigator.getUserMedia = ( navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia ||
			navigator.msGetUserMedia);

			var audioContext = new AudioContext();
			return audioContext.createMediaStreamSource !== undefined;
		}
		catch (ex) {
			return false;
		}
	};

	/**
	 * @returns {boolean}
	 */
	function initAudioAndStartRecording () {
		AdapterJS.webRTCReady(function (isUsingPlugin) {

			try
			{
				window.AudioContext = (window.AudioContext ||
				window.webkitAudioContext ||
				window.mozAudioContext ||
				window.oAudioContext ||
				window.msAudioContext);

				navigator.getUserMedia = ( navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia);

				getUserMedia({audio: true, video: false}, initStream, function (err) {
					console.error(err);
					displayUnsupportedBrowserError();
				});
			} catch (ex) {
				displayUnsupportedBrowserError();
			}
		});

		//if (navigator.getUserMedia)
		//{
		//	navigator.getUserMedia(
		//		{
		//			audio: true
		//		},
		//		initStream,
		//		function (error) { console.error(error); }
		//	);
		//}
		//else
		//{
		//	alert("Audio recording is not supported in your browser currently.\nSupported Browsers: Chrome, Firefox");
		//	return false;
		//}

		audioContext = new AudioContext();

		analyser = audioContext.createAnalyser();
		jsNode = audioContext.createScriptProcessor(1024, 1, 1);
		analyser.smoothingTimeConstant = 0.3;
		analyser.fftSize = 1024;

		return true;
	}

	this.option = function (optionName, optionValue) {
		if (options.hasOwnProperty(optionName))
		{
			if (optionValue)
				options[optionName] = optionValue;
			else
				return options[optionName];
		}
		return null;
	};

	function shouldShowAudioContainer () {
		if (!options.displayGalleryInVideoMode && inVideoMode)
			return false;
		else
			return true;
	}

	this.showAudioContainer = function (flag) {
		if (flag && Object.keys(soundboard).length > 0 && shouldShowAudioContainer())
		{
			$audioGalleryContainer.show();
		}
		else
		{
			$audioGalleryContainer.hide();
		}
	};

	this.isAudioContainerVisible = function () {
		return $audioGalleryContainer.is(":visible");
	};

	function toggleAudioPlayer (flag) {
		if (!flag)
		{
			flag = !$audioPlayerContainer.is(":visible");
		}

		if (flag && !inVideoMode)
		{
			$audioPlayerContainer.show();
			$audioGalleryContainer.hide();
			$pluginContainer.addClass("tabeebPlayingAudio");
		}
		else
		{
			$audioPlayerContainer.hide();
			$audioGalleryContainer.show();
			$pluginContainer.removeClass("tabeebPlayingAudio");
		}
	}

	function initStream (stream) {
		var input = audioContext.createMediaStreamSource(stream);
		audioRecorder = new Recorder(input);

		input.connect(analyser);
		analyser.connect(jsNode);
		jsNode.connect(audioContext.destination);

		jsNode.onaudioprocess = function () {
			if (recordingState != TabeebAudioService.RecordingState.Recording) return;

			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			var values = 0;

			var length = array.length;
			for (var i = 0; i < length; i++)
			{
				values += array[i];
			}

			var average = values / length;
			$this.trigger($.Event(TabeebAudioService.AudioEvent.recordingVolumeChanged, {volume: average}));
		};

		startRecordingAudio();
	}

	function setRecordingState (newRecordingState) {
		var previousState = recordingState;
		recordingState = newRecordingState;

		//if (recordingState == TabeebAudioService.RecordingState.Recording)
		//    $microphoneButton.addClass("active");
		//else
		//    $microphoneButton.removeClass("active");

		var event = $.Event(TabeebAudioService.AudioEvent.stateChanged,
			{
				oldState: previousState,
				state: newRecordingState
			}
		);
		$this.trigger(event);
	}

	var BinaryFileReader = {
		read: function (file, callback) {
			var reader = new FileReader;

			var fileInfo = {
				name: file.name,
				type: file.type,
				size: file.size,
				file: null
			};

			reader.onload = function () {
				fileInfo.file = new Uint8Array(reader.result);
				callback(null, fileInfo);
			};

			reader.onerror = function () {
				callback(reader.error);
			};

			reader.readAsArrayBuffer(file);
		}
	};

	function buffersLoaded () {
		audioRecorder.exportWAV(
			function (blob) {
				//// save to the db
				BinaryFileReader.read(blob, function (err, audioInfo) {
					$this.trigger(
						$.Event(TabeebAudioService.AudioEvent.recordingFinished,
							{
								// audio data
								timestamp: currentVideoTimeWhenRecordingStarted,
								audioType: audioInfo.type,
								size: audioInfo.size,
								audioData: audioInfo.file,
								parentAnnotation: currentParentAnnotation,
								duration: getTimeSinceRecording()
							})
					);
					currentParentAnnotation = null;
				});
			});
	}

	this.getCurrentAudioOwnerUserId = function () {
		return $audioElement[0].userId;
	};

	function bindVideoEvents () {
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoTimeUpdated, onVideoTimeUpdated);
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoTimeSeeked, onVideoSeek);
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoPaused, onVideoPause);
		$videoService.on(TabeebVideoService.VideoServiceEventType.videoPlayed, onVideoPlay);
	}

	function bindAudioElementEvents () {
		$audioElement.on('play', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioStarted,
					{
						currentTime: $audioElement[0].currentTime,
						inVideo: false,
						resuming: true,
						audio: this
					})
			)
		});
		$audioElement.on('pause', function () {
			// Only trigger this event if the audio isn't pausing because it has reached the end
			if (this.currentTime < this.duration)
				$this.trigger($.Event(TabeebAudioService.AudioEvent.audioPaused, {
						currentTime: $audioElement[0].currentTime,
						inVideo: false,
						audio: this
					})
				);
		});
		$audioElement.on('volumechange', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.volumeChanged,
					{
						volume: this.volume,
						inVideo: false,
						audio: this
					})
			);
		});
		$audioElement.on('seeked seeking', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioSeeked,
					{
						currentTime: $audioElement[0].currentTime,
						inVideo: false,
						audio: this
					})
			);
		});
		$audioElement.on('timeupdate', function () {
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioTimeUpdated,
				{
					currentTime: $audioElement[0].currentTime,
					inVideo: false,
					audio: this
				}));
		})
	}

	function onVideoPlay (event, timeObj) {
		currentVideoTime = timeObj.time;
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			var duration = audio.duration;
			var playtime = audio.videoPlayTime;

			if (currentVideoTime >= playtime && currentVideoTime < playtime + duration)
			{
				console.log("Starting audio: " + name);
				audio.currentTime = currentVideoTime - playtime;
				audio.play();
				$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, audio, {
					currentTime: currentVideoTime,
					inVideo: true
				}));
			}
		}
	}

	function onVideoPause () {
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			soundboard[name].pause();
		}
	}

	function onVideoSeek (event, timeObj) {
		currentVideoTime = timeObj.time;
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			if (!audio.paused)
			{
				var newTime = currentVideoTime - audio.videoPlayTime;
				if (newTime < 0 || newTime >= audio.duration)
					audio.pause();
				else
					audio.currentTime = currentVideoTime - audio.videoPlayTime;
			}
		}
	}

	function onVideoTimeUpdated (event, timeObj) {
		currentVideoTime = timeObj.time;

		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			var duration = audio.duration;
			var playtime = audio.videoPlayTime;

			if (!isAudioMuted(audio))
				audio.volume = 1;
			else
				audio.volume = 0;

			//audio is playing
			if (!audio.paused)
			{
				if (currentVideoTime > playtime + duration)
				{
					console.log("Pausing audio: " + name);
					audio.pause();
					$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioEnded, audio, {
						currentTime: currentVideoTime
					}));
				}
			}
			else
			{
				if (currentVideoTime >= playtime && currentVideoTime < playtime + duration && videoService.isPlaying())
				{
					console.log("Starting audio: " + name);
					audio.currentTime = currentVideoTime - playtime;
					audio.play();
					$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, audio, {
						currentTime: currentVideoTime,
						inVideo: true
					}));
				}
			}
		}
	}

	this.setAnnotations = function () {
		clearSoundboard();

		var annotations = annotationMgr.getAnnotationsByType(TabeebAnnotationType.Audio);

		var count = 0;

		// Filter out audio annotations and load them
		for (var i = 0; i < annotations.length; i++)
		{
			if (annotations[i].type != TabeebAnnotationType.Audio)
				continue;

			that.addToSoundboard(annotations[i]);
			count++;
		}

		setBadgeCount(count);

		if (count == 0)
			$audioGalleryContainer.hide();

		this.setAudioThumbnails();
	};

	function setBadgeCount (audioCount) {
		var count = audioCount || that.getAudioCount();
		if (count == 0)
			$badge.hide();
		else
			$badge.show().text(count);
	}

	function clearSoundboard () {
		// Stop all audio files
		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;
			var audio = soundboard[name];
			audio.pause();
		}

		if ($audioElement.length > 0)
		{
			$audioElement.attr('src', '');
			if ($audioElement.is(":visible"))
				toggleAudioPlayer(false);
		}

		soundboard = {};
	}

	this.playAudioWithElement = function (audioName, currentTime) {
		var audio = soundboard[audioName];
		toggleAudioPlayer(true);
		$audioElement.attr('src', audio.currentSrc);
		$audioElement.load();
		$audioElement.data('audioName', audioName);
		$audioElement[0].play();
		$audioElement[0].annotationId = audioName;
		$audioElement[0].userId = audio.userId;

		if (currentTime >= 0)
			$audioElement.one('canplay', function () { $audioElement[0].currentTime = currentTime; });

		$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, audio));
	};

	this.updateMutedUserIds = function (newMutedUserIds) {
		mutedUserIds = newMutedUserIds
	};

	this.playbackCurrentRecording = function () {
		var justCreated = false;
		if (!lastRecordedAudio)
		{
			lastRecordedAudio = new Audio(lastRecordedAudioPlaybackUrl);
			lastRecordedAudio.ontimeupdate = onAudioPlaybackTimeUpdated;
			justCreated = true;
		}

		console.log("Last Audio", lastRecordedAudio.paused);

		if (lastRecordedAudio.paused)
			lastRecordedAudio.play();
		else
			lastRecordedAudio.pause();
		return justCreated;
		//console.error("Not implemented");
	};

	function onAudioPlaybackTimeUpdated () {
		$this.trigger($.Event(TabeebAudioService.AudioEvent.recordingTimeUpdated, {currentTime: this.currentTime}));
	}

	function isAudioMuted (audio) {
		return (mutedUserIds.indexOf(audio.userId) >= 0);
	}

	this.isAudioReady = function (audioName) {
		if (audioName == null)
			return false;

		return soundboard[audioName].ready === true;
	};

	this.playAudioAnnotation = function (audioName) {
		if (!options.displayPlayerInVideoMode && inVideoMode)
		{
			var audio = soundboard[audioName];
			videoService.setCurrentTime(audio.videoPlayTime);
			videoService.play();
			$audioGalleryContainer.removeClass("active");
			return;
		}

		//Play the audio
		$audioGalleryContainer.removeClass("active");
		$audioElement.addClass("active");
		$audioToggle.removeClass("active");
		that.playAudioWithElement(audioName);
	};

	this.onready = function (audioName, callback) {
		if (this.isAudioReady(audioName))
			callback();
		else
		{
			$this.one(TabeebAudioService.AudioEvent.audioReady + audioName, function () { callback(); });
		}
	};

	function bindAudioGalleryEvents () {
		$audioToggle.on('click', toggleAudioContainer);

		$audioGalleryContainer.on('click', '.tabeebAudioPlayButton', function () {
			var $audioItem = $(this);
			var $parent = $audioItem.parent();
			var audioName = $parent.data("audioname");

			that.playAudioAnnotation(audioName);
		});

		$audioElement.on('ended', function () {
			var audioName = $(this).data('audioName');
			$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioEnded, soundboard[audioName], {currentTime: $(this)[0].currentTime}));
			toggleAudioPlayer(false);
		});

		$audioElement.on('seeked', function () {
			var audioName = $(this).data('audioName');
			$this.trigger(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioEnded, soundboard[audioName], {currentTime: $(this)[0].currentTime}));
		});

		$audioGalleryContainer.on('click', '.tabeebAudioDeleteButton', function () {
			var $audioItem = $(this);
			var $parent = $audioItem.parent();
			var annotationId = $parent.data("audioname");

			if (confirm("This audio will be permanently deleted. Continue?"))
				$this.trigger($.Event(TabeebAudioService.AudioEvent.audioDeleted, {annotationId: annotationId}));
		})
	}

	function createTabeebAudioEvent (eventName, audioObj, eventProperties) {
		return $.Event(eventName, $.fn.extend({audio: audioObj}, eventProperties ? eventProperties : {}));
	}

	this.dispose = function () {
		$this = null;
		that = null;
		$audioElement.remove();
		clearSoundboard();
	};

	this.setCurrentTime = function (time) {
		console.log("Setting current audio time", time);
		$audioElement[0].currentTime = time;
	};

	this.getCurrentAudio = function () {
		return $audioElement[0];
	};

	this.getCurrentTime = function () {
		return $audioElement[0].currentTime;
	};

	this.setVolume = function (volume) {
		$audioElement[0].volume = volume;
	};

	this.setAudioThumbnails = function () {
		var html = "<div style='width: auto; white-space: nowrap; font-size: inherit; font-family: inherit !important;'>";

		for (var name in soundboard)
		{
			if (!soundboard.hasOwnProperty(name))
				continue;

			var audio = soundboard[name];
			var caption = audio.caption;
			var annotation = annotationMgr.find(audio.annotationId);

			html += '<div class="tabeebAudioItem" data-audioName="' + name + '" data-annotationId="' + audio.annotationId + '">';
			{
				html += '<div class="tabeebAudioPlayButton icon-play"></div>';

				//                if (audio.userId == options.userId)
				html += '<span class="tabeebAudioDeleteButton tabeeb-icon-sm icon-trash-empty tabeebGalleryDeleteButton"></span>';

				console.log("Audio Duration", audio.duration);

				if (inVideoMode)
					html += '<span>' + caption + '<br>' + formatSeconds(parseInt(audio.videoPlayTime)) + '</span>';
				else
					html += '<span>' + caption + '<br>' + formatSeconds(parseInt(annotation.duration/1000)) + '</span>';
				//html += '<span>' + audio.videoPlayTime + '</span>';
			}
			html += '</div>';
			// todo: Get date of audio creation
		}

		html += '</div>';
		$audioGalleryContainer.html(html);
	};

	function formatSeconds (seconds) {
		var date = new Date(1970, 0, 1);
		date.setSeconds(seconds);
		return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
	}

	var intervalId = 0;

	this.startRecording = function (parentAnnotation) {
		console.log("Start recording.");

		var audioService = this;
		currentParentAnnotation = parentAnnotation;

		if (!audioContext || RTCBrowserType.isFirefox())
		{
			initAudioAndStartRecording();
			return;
		}

		if (audioService.getState() == TabeebAudioService.RecordingState.Recording)
			throw "Audio Recording has already been started. Stop or pause recording before starting audio recording.";

		//Clear audio recorder if not coming from a paused state to a recording state
		if (audioService.getState() == TabeebAudioService.RecordingState.Stopped)
			audioRecorder.clear();

		startRecordingAudio();
	};

	function startRecordingAudio () {
		var wasPaused = (recordingState == TabeebAudioService.RecordingState.Paused);
		setRecordingState(TabeebAudioService.RecordingState.Recording);

		audioRecorder.record();

		currentVideoTimeWhenRecordingStarted = currentVideoTime;

		var event = $.Event(TabeebAudioService.AudioEvent.recordingStarted, {});
		$this.trigger(event);

		intervalId = setInterval(updateRecordingTime, 250);

		if (wasPaused)
		{
			recordStartTime = new Date().getTime();
			recordStartTime -= pausedTimeToAdd;
		}
		else
		{
			recordStartTime = new Date().getTime();
		}

		return true;
	}

	this.getRecordingDuration = function () {
		return getTimeSinceRecording();
	};

	function getTimeSinceRecording () {
		var then = recordStartTime;
		var now = new Date().getTime();
		return now - then;
	}

	function updateRecordingTime () {
		currentAudioLength = parseFloat(getTimeSinceRecording());

		console.log("Current Audio Length", currentAudioLength);

		$this.trigger($.Event(TabeebAudioService.AudioEvent.recordingTimeUpdated, {currentTime: currentAudioLength / 1000}));
	}

	/**
	 * @param {TabeebAnnotation} parentAnnotation
	 * @param {Boolean} dontSendAudioInfo
	 */
	this.stopRecording = function (parentAnnotation, dontSendAudioInfo) {
		setRecordingState(TabeebAudioService.RecordingState.Stopped);

		// Delay ending audio since the end of audio files are getting truncated
		setTimeout(function () {
			audioRecorder.stop();

			processAudio(!dontSendAudioInfo);

			var event = $.Event(TabeebAudioService.AudioEvent.recordingStopped, {recordingLength: getTimeSinceRecording()});
			$this.trigger(event);

			clearInterval(intervalId);
		}, 300);
	};

	function sendAudioInfo () {
		$this.trigger(
			$.Event(TabeebAudioService.AudioEvent.recordingFinished,
				{
					// audio data
					timestamp: currentVideoTimeWhenRecordingStarted,
					audioType: audioInfo.type,
					size: audioInfo.size,
					audioData: audioInfo.file,
					parentAnnotation: currentParentAnnotation,
					duration: currentAudioLength
				})
		);
		currentParentAnnotation = null;
	}

	function processAudio (sendAudio) {

		lastRecordedAudio = null;
		var audioCallback = sendAudio ? null : function (audioUrl) {
			lastRecordedAudioPlaybackUrl = audioUrl;
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioPlaybackReady));
		};

		audioRecorder && audioRecorder.exportWAV(
			function (blob) {
				BinaryFileReader.read(blob, function (err, audioinfo) {
					audioInfo = audioinfo;
					if (sendAudio)
						sendAudioInfo();
				});
			},
			null,
			audioCallback);
	}

	this.clearRecording = function () {
		if (lastRecordedAudio == null) return;

		lastRecordedAudioPlaybackUrl = null;
		lastRecordedAudio = null;
		audioRecorder.clear();

		$this.trigger($.Event(TabeebAudioService.AudioEvent.audioPlaybackCleared));
		setRecordingState(TabeebAudioService.RecordingState.Stopped);
	};

	this.pauseRecording = function () {
		if (recordingState == TabeebAudioService.RecordingState.Paused)
			return;

		pausedTimeToAdd = getTimeSinceRecording();
		setRecordingState(TabeebAudioService.RecordingState.Paused);
		clearInterval(intervalId);
		audioRecorder.stop();
	};

	this.addToSoundboard = function (annotation) //url, startTimeRelativeToVideo, annotation, annotationId, ownerUserId)
	{
		if (annotation.parentId)
			return;

		var name = annotation.id.toString();

		var audio = new Audio(annotation.url);

		audio.annotationId = annotation.id;
		audio.userId = annotation.layerId;
		audio.videoPlayTime = annotation.timestamp;
		audio.caption = annotation.caption;
		audio.playing = false;

		$(audio).on("canplaythrough", function () {
			audio.ready = true;
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioReady, {audioName: name}));
			// Trigger this event for tabeebAudioService internal use only
			$this.trigger($.Event(TabeebAudioService.AudioEvent.audioReady + name, {audioName: name}));
		});

		soundboard[name] = audio;

		setBadgeCount();

		this.showAudioContainer(true);
	};

	this.getAudioDuration = function (annotation) {
		return soundboard[annotation.id].duration;
	};

	this.getAudioCount = function () {
		var count = 0;
		for (var key in soundboard)
		{
			count++;
		}
		return count;
	};

	this.resumeAudioElement = function () {
		$audioElement[0].play();
	};

	this.resume = function (name) {
		soundboard[name].play();
		soundboard[name].playing = true;
	};

	this.play = function (name) {
		soundboard[name].play();
		soundboard[name].playing = true;

		$this.trigger(
			$.Event(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioStarted, soundboard[name],
					{
						audio: soundboard[name],
						resuming: false
					})
			));
	};

	this.pause = function (name) {
		if (soundboard[name] != null)
		{
			soundboard[name].pause();
			soundboard[name].playing = false;
		}

		if ($audioElement[0])
			$audioElement[0].pause();

		$this.trigger(
			$.Event(createTabeebAudioEvent(TabeebAudioService.AudioEvent.audioPaused, soundboard[name],
					{
						currentTime: soundboard[name] ? soundboard[name].currentTime : $audioElement[0].currentTime
					})
			));
	};

	this.setVideoMode = function (flag) {
		inVideoMode = flag;

		// Hide or show the audio gallery
		if (inVideoMode)
			$audioGalleryContainer.hide();
		else
			$audioGalleryContainer.show();
	};

	this.getState = function () { return recordingState; };

	/**
	 * @param {jQuery} $relativeElement
	 */
	this.resize = function ($relativeElement) {
		var bottom = Math.max(0, parseFloat($relativeElement.parent().outerHeight()) - parseFloat($relativeElement.outerHeight()) - parseFloat($relativeElement.css("top")));
		if (inVideoMode)
		{
			bottom -= TabeebVideoService.VIDEO_CONTROL_BAR_HEIGHT + TabeebVideoService.VIDEO_CONTROL_BAR_TRACKING_BAR_HEIGHT;
		}

		$audioGalleryContainer.add($audioPlayerContainer).css(
			{
				left: $relativeElement.css("left"),
				bottom: bottom
				//                top: Math.min(maxTop, parseFloat($relativeElement.css("top")) + parseFloat($relativeElement.outerHeight()))
			}
		).css("max-width", $relativeElement.outerWidth());

		$audioGalleryContainer.find(".tabeebAudioPlayButton:before").css("line-height", $audioGalleryContainer.height() * 0.75);
	};
}

/**
 * @readonly
 * @enum {number}
 */
TabeebAudioService.RecordingState =
{
	Stopped: 0,
	Recording: 1,
	Paused: 2
};
/**
 * @readonly
 * @enum {string}
 */
TabeebAudioService.AudioEvent =
{
	stateChanged: "statechanged",
	recordingStopped: "recordstop",
	recordingPaused: "recordpaused",
	recordingStarted: "recordstart",
	recordingFinished: "recordfinished",
	recordingTimeUpdated: "recordingTimeUpdated",
	recordingVolumeChanged: "recordingVolumeChanged",
	audioStarted: "audiostart",
	audioPaused: "audiopause",
	audioEnded: "audioend",
	audioDeleted: "audiodeleted",
	audioSeeked: "audioSeeked",
	volumeChanged: "volumeChanged",
	audioTimeUpdated: "audioTimeUpdated",
	audioReady: "audioReady",
	audioPlaybackReady: "audioPlaybackReady",
	audioPlaybackCleared: "audioPlaybackCleared"
};'use strict';

/**
 * Created by cody on 6/8/15.
 */

/**
 * @param player
 * @param {TabeebGalleryService} galleryService
 * @param {TabeebUserManager} userMgr
 * @param {jQuery} $audioService
 * @param {jQuery} $videoService
 * @constructor
 */
function TabeebPresenterManager (player, galleryService, userMgr, $audioService, $videoService) {

	//<editor-fold name="Variables">

	var self = this;

	var $player = $(player);
	/**@type {TabeebAudioService}*/
	var audioService = $audioService[0];
	/**@type {TabeebVideoService}*/
	var videoService = $videoService[0];
	/**@type {TabeebCanvasService}*/
	var canvasService = player.canvasService;
	/**@type {TabeebPresenterMode}*/
	var presenterMode = TabeebPresenterMode.None;

	var presenterId = "";

	var hotspotManager = canvasService.hotspotManager;

	/**@type {TabeebAnnotationManager}*/
	var annotationMgr = player.annotationMgr;

	/**@type {TabeebCanvasHotspotManager}*/
	// Used to keep track of binded events
	var events = [];
	var that = this;

	/**@type {TabeebConnect}*/
	var connectService;

	this.mutedAudioUserIds = [];

	//</editor-fold>

	function resetVideoAndAudio () {
		videoService.setCurrentTime(0);
		videoService.pause();
	}

	//<editor-fold name="Jitsi Meet Integration">

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getVideoElementByUserId (userId) {
		var $video = null;

		if (userId == presenterId)
		{
			if (getLargeVideoContainer().is(":visible")) {
				console.log("Returning large video");
				return getLargeVideoContainer().find("video, object");
			}
			$video = player.$pluginContainer.find(".tabeebPresenterUserContainer").find("video, object");
		}
		else
			$video = getVideoElementContainerByUserId(userId).find("video");

		console.log("Finding video", userId, $video);

		return $video;
	}

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getVideoElementContainerByUserId (userId) {
		if (userId == presenterId)
		{
			var $largeVideoContainer = getLargeVideoContainer();
			if ($largeVideoContainer.is(":visible"))
				return $largeVideoContainer;

			return player.$pluginContainer.find(".tabeebPresenterUserContainer");
		}

		return player.$pluginContainer.find(".tabeebUserContainer[data-id='" + userId + "']")
	}

	this.reattachVideos = function () {
		if (connectService)
		{
			setTimeout(function() {
				connectService.reattachVideos();
			}, 5000);
		}
	};

	this.reattachVideo = function (userId) {
		if (connectService)
		{
			setTimeout(function() {
				connectService.reattachVideoForUser(userId);
			}, 1000);
		}
	};

	/**
	 * @param userId
	 * @returns {jQuery}
	 */
	function getAudioElementByUserId (userId) {
		var currentUser = userMgr.getThisUser();
		if (userId == currentUser.id)
		{
			console.log("No audio for self");
			return $("");
		}
		return player.$pluginContainer.find(".tabeebUserContainer[data-id='" + userId + "']").find("audio");
	}

	function getLargeVideoContainer () {
		return player.$pluginContainer.find(".tabeebLargeVideoContainer");
	}

	function onVideoStreamSwitched () {
		console.error("Video stream switched", arguments);
	}

	function setLargeVideoVisible (flag) {
		console.log("Setting Large Video", flag);
		var isCurrentVisible = getLargeVideoContainer().is(":visible");

		if (isCurrentVisible && flag === true)
		{
			return;
		}
		if (isCurrentVisible === false && flag === false)
		{
			return;
		}

		var isThisUserPresenter = (userMgr.getThisUser().id == presenterId);
		var $largeVideoContainer = player.$pluginContainer.find(".tabeebLargeVideoContainer");
		var $mediaContainer = player.$pluginContainer.find(".tabeebMediaContainer");
		if (flag) {
			$mediaContainer.hide();
			$largeVideoContainer.show();
		}
		else
		{
			$mediaContainer.show();
			$largeVideoContainer.hide();
		}

		if (connectService)
			connectService.reattachVideos();

		if (isThisUserPresenter)
		{
			$player.trigger($.Event(TabeebSpectatorEvent.largeVideoToggled, {active: flag}));
			$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { isScreenSharing: flag } }));
		}

		$(that).trigger($.Event(TabeebPresenterManager.Events.largeVideoToggled, {active: flag}));
	}

	this.setUserMuted = function (userId, isMuted) {
		connectService.setUserMute(userId, isMuted);
		if (isMuted && this.mutedAudioUserIds.indexOf(userId) < 0)
			this.mutedAudioUserIds.push(userId);
		else if (this.mutedAudioUserIds.indexOf(userId) >= 0)
			this.mutedAudioUserIds.splice(this.mutedAudioUserIds.indexOf(userId), 1);
		$player.trigger($.Event(TabeebSpectatorEvent.userAudioMutedChanged, {userId: userId, isMuted: isMuted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedAudioUserIds: this.mutedAudioUserIds } }));
	};

	this.toggleThisUsersAudio = function () {
		connectService.toggleAudio();
	};

	this.toggleThisUsersVideo = function () {
		connectService.toggleVideo();
	};

	this.getPresenterId = function () {
		return presenterId;
	};

	this.isVideoMuted = function (userId) {
		if (!userId) {
			userId = userMgr.getThisUser().id;
		}

		return connectService ? connectService.isVideoMuted(userId) : true;
	};

	this.isAudioMuted = function (userId) {
		if (!userId) {
			userId = userMgr.getThisUser().id;
		}

		return connectService ? connectService.isAudioMuted(userId) : true;
	};

	function onVideoMuted (userId, isMuted) {
		if (userId == presenterId && player.$pluginContainer.find(".tabeebLargeVideoContainer").is(":visible"))
		{
			isMuted = true;
		}

		var user = userMgr.find(userId);
		console.log("Setting " + user.displayName + "'s video to " + !isMuted);

		$(that).trigger($.Event(TabeebPresenterManager.Events.participantVideoMuteChange, {userId: userId, videoOn: !isMuted}));
	}

	function onAudioMuted (userId, isMuted) {
		$(that).trigger($.Event(TabeebPresenterManager.Events.participantAudioMuteChange, {userId: userId, audioOn: !isMuted}));
	}

	function onUserJoined (userId) {
		console.log("User joined", userId);
	}

	this.setUserOnlineStatus = setUserOnlineStatus;

	function setUserOnlineStatus (userId, isConnected) {
		if (that.mutedAudioUserIds.indexOf(userId) >= 0)
		{
			that.mutedAudioUserIds.splice(that.mutedAudioUserIds.indexOf(userId), 1);
			$(that).trigger($.Event(TabeebPresenterManager.Events.userAudioMutedChanged, {userId: userId, isMuted: false}));
		}

		console.info("Setting online status", userId, isConnected);
		$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		that.reattachVideos();
		//if (!isConnected)
		//{
		//	//var $container = getVideoElementContainerByUserId(userId);
		//	$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		//}
		//else
		//{
		//	$(that).trigger($.Event(TabeebPresenterManager.Events.participantOnlineStatusChanged, { userId: userId, isConnected: isConnected }));
		//}
	}

	function onAudioLevelChange (userId, audioLevel) {
		var isLocal = userId === "local";
		if (isLocal)
			userId = userMgr.getThisUser().id;

		var user = userMgr.find(userId);

		if (isLocal && connectService.isAudioMuted())
			audioLevel = 0;

		if ((audioLevel <= 0.005 && !isLocal) || (audioLevel <= 0.008 && isLocal)) {
			$(self).trigger($.Event(TabeebPresenterManager.Events.participantEndedSpeaking, {userId: user.id}));
		}
		else
		{
			$(self).trigger($.Event(TabeebPresenterManager.Events.participantStartedSpeaking, {userId: user.id}));
		}
	}

	function onUserLeft (userId) {
		setUserOnlineStatus(userId, false);
		console.log("User left", userId);
	}

	this.setAudioMuted = function (isMuted) {
		if (!isMuted) {
			isMuted = !connectService.isAudioMuted();
		}

		if (isMuted)
			connectService.muteAudio();
		else
			connectService.unmuteAudio();
	};

	this.toggleScreenShare = function () {
		connectService.shareScreen();
	};

	this.setVideoMuted = function (isMuted) {
		if (!isMuted) {
			isMuted = !connectService.isVideoMuted();
		}

		if (isMuted)
			connectService.muteVideo();
		else
			connectService.unmuteVideo();
	};

	this.setPresenter = function (presId) {
		setLargeVideoVisible(false);
		if (connectService && connectService.isScreenSharing())
			connectService.shareScreen();

		var oldPresenterId = presenterId;

		presenterId = presId;
		$(that).trigger($.Event(TabeebPresenterManager.Events.presenterChanged, {presenterId: presenterId, presenterVideoOn: connectService ? connectService.isVideoMuted(presId) : false }));

		if (presenterId == userMgr.getThisUser().id) {
			console.info("You are now the presenter.");
			this.setPresenterMode(true);
		}
		else
		{
			console.info("You are now a spectator");
			this.setSpectatorMode(true);
		}

		if (connectService && presId && presId.length > 0)
		{
			if (oldPresenterId && oldPresenterId.length > 0)
			{
			}
			//
			//connectService.reattachVideoForUser(presenterId);
		}

		if (connectService)
			connectService.reattachVideos();
	};

	this.changePresenter = function (userId) {
		player.$element.trigger($.Event(TabeebEvent.requestPresenterChange, {userId: userId}));
	};

	this.connect = function (presId) {

		console.log("Setting presenter id", presId, userMgr.getThisUser().id);

		if (userMgr.getThisUser().id == presenterId)
			this.setPresentationMode(TabeebPresenterMode.Presenter);
		else
			this.setPresentationMode(TabeebPresenterMode.Spectator);

		this.setPresenter(presId);
		var connectOptions = {
			boshUrl: 'https://webrtcdev.collaborate.center/http-bind',
			chromeExtensionId: 'adegdgcakdkmpacfffmjbjhagnkoncpj',
			domain: 'webrtcdev.collaborate.center',
			getVideoElementForUser: getVideoElementByUserId,
			getVideoElementContainerForUser: getVideoElementContainerByUserId,
			getAudioElementForUser: getAudioElementByUserId,
			userId: userMgr.getThisUser().id,
			conferenceId: player.contentName,
			onStreamAttached: function(stream, $element) {
				var user = userMgr.find(stream.userId);


				var container = player.$pluginContainer.find(".tabeebSidebarTab");
				var obj = container.find("object");
				obj.each(function (index, element) {
					this.width = 480;
					this.height = 480 * (9/16);
					//$(element).css('min-height', $(this).width()*3/4);
				});

				var $userContainer = getVideoElementContainerByUserId(stream.userId);

				var videoIsOn = !connectService.isVideoMuted(stream.userId);
				console.log("Stream Attached For", user.displayName, videoIsOn);

				$(that).trigger($.Event(TabeebPresenterManager.Events.participantVideoMuteChange, {userId: stream.userId, videoOn: videoIsOn}));

				$userContainer.addClass("video").addClass("audio");

				if (videoIsOn === false)
				{
					$userContainer.removeClass("video");
				}

				if ($userContainer.hasClass("offline"))
					setUserOnlineStatus(stream.userId, true);
			},
			onReady: function () {
			},
			onVideoStreamSwitched: onVideoStreamSwitched,
			setLargeVideoVisible: setLargeVideoVisible,
			getLargeVideoContainer: getLargeVideoContainer,
			isPresenter: function (userId) { return presenterId == userId; },
			onVideoMuted: onVideoMuted,
			onAudioMuted: onAudioMuted,
			onUserJoined: onUserJoined,
			onUserLeft: onUserLeft,
			onAudioLevelChange: onAudioLevelChange
		};

		if (TabeebConnect.clientCanConnect())
		{
			connectService = new TabeebConnect(connectOptions);
			connectService.connect();
		}
		else
		{
		}
	};

	this.disconnect = function () {
		if (connectService)
		{
			connectService.disconnect();
		}

		this.setPresentationMode(TabeebPresenterMode.None);
	};

	//</editor-fold>

	// <editor-fold desc="Presenter">
	/**
	 * @param isNewPresenter
	 * @returns {TabeebPresenterState}
	 */
	this.getPresenterState = function (isNewPresenter) {
		var state = {
			audioName: audioService.getCurrentAudio() ? audioService.getCurrentAudio().annotationId : null,
			audioPaused: audioService.getCurrentAudio() ? audioService.getCurrentAudio().paused : null,
			currentTime: canvasService.inVideoMode() ? videoService.getCurrentPlaybackTime() : audioService.getCurrentTime(),
			videoPaused: canvasService.inVideoMode() ? !videoService.isPlaying() : null,
			mutedUserIds: canvasService.getMutedUserIds(),
			slideIndex: player.currentSlideIndex,
			isScreenSharing: connectService ? connectService.isScreenSharing() : false,
			hotspotDialogAnnotationId: hotspotManager.getCurrentHotspot() ? hotspotManager.getCurrentHotspot().id : null,
			mutedAudioUserIds: this.mutedAudioUserIds
		};

		/*
		 Due to VideoJS timing issues, we have to tell if the presenter is being changed. That way we can set the video paused to true since there is a delay in telling VideoJS to pause
		 Ex:
		 videoPlayer.pause();
		 videoPlayer.paused(); // returns false
		 */
		if (isNewPresenter)
			state.videoPaused = true;

		return state;
	};

	this.setPresentationMode = function (mode) {
		if (mode == presenterMode)
			return;

		if (mode == TabeebPresenterMode.None) {
			if (presenterMode == TabeebPresenterMode.Presenter)
				that.setPresenterMode(false);
			else if (presenterMode == TabeebPresenterMode.Spectator)
				that.setSpectatorMode(false);

			$(that).trigger($.Event(TabeebPresenterManager.Events.presentationEnded, {}));
		}
		else if (mode == TabeebPresenterMode.Spectator)
		{
			if (presenterMode == TabeebPresenterMode.Presenter)
				that.setPresenterMode(false);
			else if (presenterMode == TabeebPresenterMode.Spectator)
				that.setSpectatorMode(false);

			that.setSpectatorMode(true);
		}
		else if (mode == TabeebPresenterMode.Presenter)
		{
			that.setPresenterMode(true);
		}

		if (presenterMode == TabeebPresenterMode.None && mode != TabeebPresenterMode.None)
		{
			$(that).trigger($.Event(TabeebPresenterManager.Events.presentationStarted, {isPresenter: mode == TabeebPresenterMode.Presenter}));
		}

		presenterMode = mode;
		$(that).trigger($.Event(TabeebPresenterManager.Events.presenterModeChanged, { presenterMode: mode }));
		player.handleResize();
	};

	this.currentlyInPresentation = function () {
		return presenterMode != TabeebPresenterMode.None;
	};

	this.getPresentationMode = function () {
		return presenterMode;
	};

	this.isCurrentUserPresenter = function () {
		return presenterId == userMgr.getThisUser().id;
	};

	this.setPresenterMode = function (flag) {
		unbindSpectatorEvents();
		resetVideoAndAudio();
		if (flag)
		{
			bindPresenterEvents();
			player.hudService.setScreenMode(player.options.defaultScreenModeType);
			galleryService.setDisabled(false);
			player.$element.addClass("presenting");
			player.$element.removeClass("spectating");
		}
		else
		{
			unbindPresenterEvents();
			player.$element.removeClass("presenting");
		}

		this.isPresenter = flag;
	};

	// Presenter events

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioSeeked (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioSeeked, {currentTime: event.currentTime}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { currentTime: event.currentTime } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterVolumeChanged (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.volumeChanged, {volume: event.volume}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { volume: event.volume } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterHotspotDialogOpened (event) {
		var hotspotAnnotation = event.hotspotAnnotation;
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogOpened, {annotationId: hotspotAnnotation.id}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { hotspotDialogAnnotationId: hotspotAnnotation.id } }));
	}

	function onPresenterHotspotDialogClosed () {
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogClosed, {}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { hotspotDialogAnnotationId: "" } }));
	}

	function onPresenterHotspotCommentClicked (event) {
		var annotationId = event.annotationId;
		$player.trigger($.Event(TabeebSpectatorEvent.hotspotDialogCommentClicked, {annotationId: annotationId}));
	}

	function onPresenterLaserPointerMoved (event) {
		console.log(event.x, event.y);
		$player.trigger($.Event(TabeebSpectatorEvent.laserPointerMoved, {
			x: event.x,
			y: event.y
		}));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterHotspotAudioEvent (event) {
		var audioEvent = event.audioEvent;
		var audioAnnotation = event.audioAnnotation;

		$player.trigger($.Event(TabeebSpectatorEvent.hotspotAudioEvent, {
			audioEvent: audioEvent,
			annotationId: audioAnnotation.id,
			currentTime: event.currentTime,
			volume: event.volume,
			muted: event.muted
		}));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterParticipantUpdated (event) {
		console.info("Participant Updated Event", event);
		if (event.isPropagationStopped())
			return;

		var participantId = event.id;
		var muted = event.muted;
		$player.trigger($.Event(TabeebSpectatorEvent.muteChanged, {id: participantId, muted: muted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedUserIds: canvasService.getMutedUserIds() } }));
		event.stopPropagation();
	}

	function onPresenterUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var isMuted = event.isMuted;
		$player.trigger($.Event(TabeebSpectatorEvent.muteChanged, {id: user.id, muted: isMuted}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { mutedUserIds: canvasService.getMutedUserIds() } }));
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioStarted (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioStart, {
			audioName: event.audio.annotationId,
			playTime: event.audio.currentTime,
			resuming: event.resuming
		}));

		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { audioName: event.audio.annotationId, currentTime: event.audio.currentTime, audioPaused: false } }));

		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterAudioPaused (event) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.audioPaused, {
			audioName: event.audio.annotationId,
			playTime: event.audio.currentTime
		}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { audioPaused: true, currentTime: event.audio.currentTime } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 * @param {Number} index
	 */
	function onPresenterSetMedia (event, index) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: index}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: index, inGallery: false } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterNextMedia (event) {
		// We get here
		//$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: player.currentSlideIndex + 1}));
		//$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: player.currentSlideIndex + 1, inGallery: false } }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onPresenterPreviousMedia (event) {
		//$player.trigger($.Event(TabeebSpectatorEvent.setMediaIndex, {index: player.currentSlideIndex - 1}));
		//$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { slideIndex: player.currentSlideIndex - 1 }, inGallery: false }));
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 * @param {Number} index
	 */
	function onPresenterGalleryRequested (event, index) {
		$player.trigger($.Event(TabeebSpectatorEvent.galleryPressed, {index: index}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { inGallery: true } }));
		event.stopPropagation();
	}

	function onPresenterVideoPaused (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoPaused, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { videoPaused: true, currentTime: time.time } }));
		event.stopPropagation();
	}

	function onPresenterVideoPlayed (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoStart, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { videoPaused: false, currentTime: time.time } }));
		event.stopPropagation();
	}

	function onPresenterVideoTimeSeeked (event, time) {
		if (event.isPropagationStopped())
			return;

		$player.trigger($.Event(TabeebSpectatorEvent.videoSeeked, {currentTime: time.time}));
		$player.trigger($.Event(TabeebPresenterEvent.updatePresenterState, { model: { currentTime: time.time} }));
		event.stopPropagation();
	}

	function bindEvent ($target, eventType, func) {
		var bindedEvent = {
			target: $target,
			type: eventType,
			func: func
		};
		$target.off(eventType, func).on(eventType, func);

		events.push(bindedEvent);
	}

	function bindPresenterEvents () {
		// Trigger events so the pagePluginController can broadcast them to other users

		// Audio events
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioStarted, onPresenterAudioStarted);
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioPaused, onPresenterAudioPaused);
		bindEvent($audioService, TabeebAudioService.AudioEvent.volumeChanged, onPresenterVolumeChanged);
		bindEvent($audioService, TabeebAudioService.AudioEvent.audioSeeked, onPresenterAudioSeeked);

		// Navigation events
		bindEvent(player.$element, TabeebEvent.galleryRequested, onPresenterGalleryRequested);
		bindEvent(player.$element, TabeebSpectatorEvent.setMediaIndex, onPresenterSetMedia);
		bindEvent(player.$element, TabeebEvent.nextMedia, onPresenterNextMedia);
		bindEvent(player.$element, TabeebEvent.previousMedia, onPresenterPreviousMedia);
		bindEvent(player.$element, TabeebEvent.setMedia, onPresenterSetMedia);

		// Video events
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoPaused, onPresenterVideoPaused);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoPlayed, onPresenterVideoPlayed);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.videoTimeSeeked, onPresenterVideoTimeSeeked);
		bindEvent($videoService, TabeebVideoService.VideoServiceEventType.volumeChanged, onPresenterVolumeChanged);

		var $hotspotManager = canvasService.hotspotManager.getTriggerElement();

		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.audioEvent, onPresenterHotspotAudioEvent);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.dialogOpened, onPresenterHotspotDialogOpened);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.dialogClosed, onPresenterHotspotDialogClosed);
		bindEvent($hotspotManager, TabeebCanvasHotspotManager.Events.commentFocused, onPresenterHotspotCommentClicked);

		bindEvent($player, TabeebEvent.participantUpdated, onPresenterParticipantUpdated);
		bindEvent($(canvasService), TabeebCanvasService.CanvasServiceEventType.laserPointerMoved, onPresenterLaserPointerMoved);

		bindEvent($(userMgr), TabeebUserManager.Events.userMuteChanged, onPresenterUserMuteChanged);
	}

	function unbindPresenterEvents () {
		for (var i = 0; i < events.length; i++)
		{
			var bindedEvent = events[i];
			bindedEvent.target.off(bindedEvent.type, bindedEvent.func);
		}
	}

	// </editor-fold>

	// <editor-fold desc="Spectator">
	this.setSpectatorMode = function (flag) {
		resetVideoAndAudio();
		unbindSpectatorEvents();
		if (flag)
		{
			unbindPresenterEvents();
			bindSpectatorEvents();
			player.hudService.setScreenMode(TabeebScreenModeType.Spectator);
			player.$element.addClass("spectating").removeClass("presenting");
			galleryService.setDisabled(true);
		}
		else
		{
			player.$element.removeClass("spectating");
			player.hudService.setScreenMode(player.options.defaultScreenModeType);
			galleryService.setDisabled(false);
		}
	};

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioStarted (event) {
		if (event.isPropagationStopped())
			return;

		audioService.onready(event.audioName, function () {
			if (event.resuming)
				audioService.resumeAudioElement();
			else
				audioService.playAudioWithElement(event.audioName);
			event.stopPropagation();
		});
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioPaused (event) {
		if (event.isPropagationStopped())
			return;

		audioService.pause(event.audioName);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorAudioSeeked (event) {
		if (event.isPropagationStopped())
			return;

		audioService.setCurrentTime(event.currentTime);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoPaused (event) {
		if (event.isPropagationStopped())
			return;

		videoService.pause();
		videoService.setCurrentTime(event.currentTime);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoStart (event) {
		if (event.isPropagationStopped())
			return;

		videoService.onready(function () {
			videoService.setCurrentTime(event.currentTime);
			videoService.resume();
			event.stopPropagation();
		});

	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVideoSeeked (event) {
		if (event.isPropagationStopped())
			return;

		videoService.onready(function () {
			videoService.setCurrentTime(event.currentTime);
			event.stopPropagation();
		});
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorSetMediaIndex (event) {
		if (event.isPropagationStopped())
			return;

		player.$element.trigger(TabeebEvent.setMedia, event.index);
		event.stopPropagation();
	}

	/**
	 * @param {TabeebPresenterState} state
	 */
	this.setPresenterState = function (state) {
		//console.info("Received spectator presenter state", state);
		if (player.currentSlideIndex != state.slideIndex)
		{
			player.$element.trigger(TabeebEvent.setMedia, state.slideIndex);
			player.ready = false;
			player.onReady(function() { self.setPresenterState(state); });
			return;
		}

		if (state.isScreenSharing === true)
		{
			setLargeVideoVisible(true);
		}

		resetVideoAndAudio();

		if (state.mutedUserIds)
		{
			userMgr.users.forEach(function (user) {
				userMgr.setMuted(user.id, false);
			});
			state.mutedUserIds.forEach(function (userId) {
				userMgr.setMuted(userId, true);
			});
		}

		if (state.mutedAudioUserIds)
		{
			state.mutedAudioUserIds.forEach(function (userId) {
				console.log(userId, "is muted");
				onSpectatorUserAudioMuteChanged({userId: userId, isMuted: true});
			});
			canvasService.mutedUserIds = state.mutedUserIds;
		}
		// Check to see what audio the presenter is playing
		if (state.audioName && state.audioName.length > 0)
		{
			audioService.onready(state.audioName,
				function () {
					audioService.playAudioWithElement(state.audioName, state.currentTime);
					if (state.audioPaused === true)
						audioService.pause();

					if (state.volume)
						audioService.setVolume(state.volume);
				}
			);
		}

		if (state.hotspotDialogAnnotationId)
		{
			player.onReady(function () {
				var offset = canvasService.getOffsetOfAnnotation(state.hotspotDialogAnnotationId);
				var offsetEvent = {
					pageX: offset.left + offset.width,
					pageY: offset.top + offset.height
				};
				hotspotManager.show(annotationMgr.find(state.hotspotDialogAnnotationId), $.Event("Test", offsetEvent));
			});
		}

		// Recover video time and play status from presenter
		videoService.onready(function () {
			if (presenterMode != TabeebPresenterMode.Spectator)
				return;

			var millisecondsElapsed = (new Date()) - (new Date(state.timeStamp));
			if (state.videoPaused) {
				millisecondsElapsed = 0;
			}
			videoService.setCurrentTime(state.currentTime + (millisecondsElapsed/1000));

			if (state.volume)
				videoService.setVolume(volume);

			if (state.videoPaused === true || state.videoPaused == null)
				videoService.pause();
			else if (state.videoPaused === false)
			{
				millisecondsElapsed = (new Date()) - (new Date(state.timeStamp));
				videoService.play();
				videoService.setCurrentTime(state.currentTime + (millisecondsElapsed/1000));
			}
		});
	};

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorPresenterState (event) {
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorGalleryPressed (event) {
		if (event.isPropagationStopped())
			return;

		player.hudService.setScreenMode(TabeebScreenModeType.Gallery);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorMuteChanged (event) {
		if (event.isPropagationStopped())
			return;

		var id = event.id;
		var muted = event.muted;
		var participant = {
			id: id,
			showStrokes: !muted
		};

		userMgr.setMuted(id, muted);

		player.updateParticipant(participant);
		event.stopPropagation();
	}

	/**
	 * @param {jQuery.Event} event
	 */
	function onSpectatorVolumeChanged (event) {
		if (event.isPropagationStopped())
			return;

		var volume = event.volume;
		videoService.setVolume(volume);
		audioService.setVolume(volume);
		event.stopPropagation();
	}

	function onSpectatorHotspotAudioEvent (event) {
		console.log("Hotspot Audio Event From Presenter", event);
		var audioEvent = event.audioEvent;
		var annotationId = event.annotationId;
		var type = audioEvent.type;
		var hotspotManager = canvasService.hotspotManager;

		hotspotManager.onAnnotationsReady(function () {
			/**@type {Audio}*/
			var audioElement = hotspotManager.getAudioElement(annotationId);
			audioElement.volume = audioEvent.volume;
			//audioElement.currentTime = audioEvent.currentTime;
			audioElement.muted = audioEvent.muted;

			if (type == "play")
			{
				hotspotManager.playAudioAnnotation(annotationId, audioEvent.currentTime);
			}
			else if (type == "pause")
			{
				audioElement.pause();
			}
			else if (type == "seeked")
			{
				audioElement.currentTime = audioEvent.currentTime;
			}
		});
		hotspotManager.focusOnComment(annotationId);
	}

	function onSpectatorHotspotDialogOpened (event) {
		player.onReady(function () {
			setTimeout(function() {
				var offset = canvasService.getOffsetOfAnnotation(event.annotationId);
				var offsetEvent = {
					pageX: offset.left + offset.width,
					pageY: offset.top + offset.height
				};
				hotspotManager.show(annotationMgr.find(event.annotationId), $.Event("Test", offsetEvent));
			}, 500);
		});
	}

	function onSpectatorHotspotDialogClosed () {
		hotspotManager.hide();
	}

	function onSpectatorHotspotDialogCommentClicked (event) {
		var annotationId = event.annotationId;
		hotspotManager.focusOnComment(annotationId);
	}

	function onSpectatorLaserPointerMoved (event) {
		var x = canvasService.imageToCanvasCoordX(event.x);
		var y = canvasService.imageToCanvasCoordX(event.y);
		canvasService.setLaserPointerPosition(x, y);
	}

	function onSpectatorLargeVideoToggled (event) {
		var isVisible = event.active;
		console.log("Received large video state from presenter", isVisible);
		setLargeVideoVisible(isVisible);
	}

	function onSpectatorUserAudioMuteChanged (event) {
		var userId = event.userId;
		var isMuted = event.isMuted;
		console.log("Presenter muted spectator", userId, isMuted);

		if (isMuted && that.mutedAudioUserIds.indexOf(userId) < 0)
			that.mutedAudioUserIds.push(userId);
		else if (that.mutedAudioUserIds.indexOf(userId) >= 0)
			that.mutedAudioUserIds.splice(that.mutedAudioUserIds.indexOf(userId), 1);

		$(that).trigger($.Event(TabeebPresenterManager.Events.userAudioMutedChanged, {userId: userId, isMuted: isMuted}));
	}

	function unbindSpectatorEvents () {
		for (var eventName in TabeebSpectatorEvent)
		{
			if (TabeebSpectatorEvent.hasOwnProperty(eventName))
				$player.off(eventName);
		}
	}

	function bindSpectatorEvents () {
		// Incoming events

		// Audio Events
		$player.unbind(TabeebSpectatorEvent.audioStart).on(TabeebSpectatorEvent.audioStart, onSpectatorAudioStarted);
		$player.unbind(TabeebSpectatorEvent.audioPaused).on(TabeebSpectatorEvent.audioPaused, onSpectatorAudioPaused);
		$player.unbind(TabeebSpectatorEvent.audioSeeked).on(TabeebSpectatorEvent.audioSeeked, onSpectatorAudioSeeked);

		// Video Events
		$player.unbind(TabeebSpectatorEvent.videoPaused).on(TabeebSpectatorEvent.videoPaused, onSpectatorVideoPaused);
		$player.unbind(TabeebSpectatorEvent.videoStart).on(TabeebSpectatorEvent.videoStart, onSpectatorVideoStart);
		$player.unbind(TabeebSpectatorEvent.videoSeeked).on(TabeebSpectatorEvent.videoSeeked, onSpectatorVideoSeeked);

		// Navigation Events
		$player.unbind(TabeebSpectatorEvent.setMediaIndex).on(TabeebSpectatorEvent.setMediaIndex, onSpectatorSetMediaIndex);
		$player.unbind(TabeebSpectatorEvent.presenterState).on(TabeebSpectatorEvent.presenterState, onSpectatorPresenterState);
		$player.unbind(TabeebSpectatorEvent.galleryPressed).on(TabeebSpectatorEvent.galleryPressed, onSpectatorGalleryPressed);

		$player.unbind(TabeebSpectatorEvent.muteChanged).on(TabeebSpectatorEvent.muteChanged, onSpectatorMuteChanged);
		$player.unbind(TabeebSpectatorEvent.volumeChanged).on(TabeebSpectatorEvent.volumeChanged, onSpectatorVolumeChanged);

		$player.unbind(TabeebSpectatorEvent.hotspotAudioEvent).on(TabeebSpectatorEvent.hotspotAudioEvent, onSpectatorHotspotAudioEvent);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogOpened).on(TabeebSpectatorEvent.hotspotDialogOpened, onSpectatorHotspotDialogOpened);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogClosed).on(TabeebSpectatorEvent.hotspotDialogClosed, onSpectatorHotspotDialogClosed);
		$player.unbind(TabeebSpectatorEvent.hotspotDialogCommentClicked).on(TabeebSpectatorEvent.hotspotDialogCommentClicked, onSpectatorHotspotDialogCommentClicked);

		$player.unbind(TabeebSpectatorEvent.laserPointerMoved).on(TabeebSpectatorEvent.laserPointerMoved, onSpectatorLaserPointerMoved);
		$player.unbind(TabeebSpectatorEvent.largeVideoToggled).on(TabeebSpectatorEvent.largeVideoToggled, onSpectatorLargeVideoToggled);
		$player.unbind(TabeebSpectatorEvent.userAudioMutedChanged).on(TabeebSpectatorEvent.userAudioMutedChanged, onSpectatorUserAudioMuteChanged);
	}

	// </editor-fold>
}

TabeebPresenterManager.Events = {
	spectatorModeChanged: "spectatorModeChanged",
	presenterModeChanged: "presenterModeChanged",
	presentationStarted: "presentationStarted",
	presentationEnded: "presentationEnded",
	presenterChanged: "presenterChanged",
	participantOnlineStatusChanged: "participantOnlineStatusChanged",
	participantStartedSpeaking: "participantStartedSpeaking",
	participantEndedSpeaking: "participantEndedSpeaking",
	participantVideoMuteChange: "participantVideoMuteChange",
	participantAudioMuteChange: "participantAudioMuteChange",
	largeVideoToggled: "largeVideoToggled",
	userAudioMutedChanged: "userAudioMutedChanged"
};/**
 * Created by cody on 6/18/15.
 */

'use strict';

var TabeebAnnotationOptions = {
    highlightedColor: "blue",
    selectedColor: "yellow",
    selectedAndHighlightedColor: "gold"
};

var TabeebAnnotationPermissionType = {
    fullAccess: 0,
    readOnly: 1,
    replyOnly: 2
};

Function.prototype.inheritsFrom = function (parentClassOrObject) {
    if (parentClassOrObject.constructor == Function) {
        //Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

function setDashedLine(context, a1, a2) {
    if (context.setLineDash !== undefined) context.setLineDash([a1, a1]);
    else if (context.mozDash !== undefined) context.mozDash = [a1, a2];
}

/**
 * @class
 * @property {String} layerId
 * @property {Number} timeStamp
 * @property {String} id
 * @property {String} parentId
 * @property {boolean} filled
 * @property {boolean} selected
 * @property {boolean} highlighted
 * @property {boolean} locked
 * @property {Date} dateCreated
 * @property {{color:string, fontSize:number, point:{x:number,y:number,text:string}}} textInfo
 * @property {{color:string, width:number}} stroke
 * @property {TabeebAnnotationType} type
 * @property {Boolean} hidden
 * @property {Boolean} canDelete
 * @property {TabeebAnnotationPermissionType | Number} permission
 * @property {Array.<TabeebAnnotation>} children
 * @property {TabeebAnnotation} parent
 */
function TabeebAnnotation() {
    this.finalizeStrokePolicy = TabeebFinalizeStrokePolicy.AllStrokes;
    this.filled = false;
    this.selected = false;
    this.dimmed = false;
    this.dimColor = "#000000";
    this.dimOpacity = 0.5;
    this.init = function (data, filled) {
        $.extend(this, data);
        this.filled = filled;
    };
    /**
	 * @param {CanvasRenderingContext2D} context
	 * @param {number} panX
	 * @param {number} panY
	 * @param {number} scaleFactor
	 * @param {string} fontFamily
	 */
    this.draw = function (context, panX, panY, scaleFactor, fontFamily) { console.error("Not implemented", this); };
    /**
	 * @param {CanvasRenderingContext2D} context
	 * @param pointsInStroke
	 * @param {Number} panX
	 * @param {Number} panY
	 * @param {Number} scaleFactor
	 * @param {String} fontFamily
	 */
    this.preview = function (context, pointsInStroke, panX, panY, scaleFactor, fontFamily) { console.error("Not implemented", this); };
    /**
	 * @param {Number} x
	 * @param {Number} y
	 */
    this.translate = function (x, y) { console.error("Not implemented", this); };
    this.getColor = function () {

        if (this.type == TabeebAnnotationType.ErasedStroke)
            return null;

        if (this.textInfo)
            return this.textInfo.color;
        else
            return this.stroke.color;
    };

    /**
	 * @returns {{color: string, width: number}}
	 */
    this.getStrokeAttributes = function () {
        if (this.textInfo != null) {
            return {
                color: this.textInfo.color,
                width: this.textInfo.fontSize
            };
        }
        else {
            return {
                color: this.stroke.color,
                width: this.stroke.width
            };
        }
    };
    /**
	 * @param {{color: string, width: number}} attributes
	 */
    this.setStrokeAttributes = function (attributes) {
        if (this.textInfo) {
            this.textInfo.color = attributes.color;
            this.textInfo.fontSize = attributes.width * 4;
        }
        else {
            this.stroke.color = attributes.color;
            this.stroke.width = attributes.width;
        }
    };

    /**
	 * @param {CanvasRenderingContext2D} context
	 * @param {string} color
	 * @param {number} width
	 * @param {number} scaleFactor
	 */
    this.startStroke = function startStroke(context, color, width, scaleFactor) {
        context.globalCompositeOperation = (color == null ? "destination-out" : "source-over");
        context.lineJoin = "round";
        context.lineCap = "round";

        var strokeColor = (color == null ? "#ffffff" : color);
        context.strokeStyle = !this.selected && this.dimmed ? TabeebPlayerUtil.mixColors(strokeColor, this.dimColor, this.dimOpacity) : strokeColor;

        if (this.filled)
            context.fillStyle = context.strokeStyle;
        context.lineWidth = width * scaleFactor;

        context.beginPath();
    };
    // Called when the stroke is about to be sent up to the server
    this.finalizeStrokes = function (strokes) {
        switch (this.finalizeStrokePolicy) {
            case TabeebFinalizeStrokePolicy.AllStrokes:
                return strokes;
            case TabeebFinalizeStrokePolicy.FirstAndLastStroke:
                return [strokes[0], strokes[strokes.length - 1]];

        }
        return strokes;
    };
    this.canvasToImageCoordX = function (x, panX, scaleFactor) { return (panX + x) / scaleFactor; };
    this.canvasToImageCoordY = function (y, panY, scaleFactor) { return (panY + y) / scaleFactor; };
    this.imageToCanvasCoordX = function (x, panX, scaleFactor) { return x * scaleFactor - panX; };
    this.imageToCanvasCoordY = function (y, panY, scaleFactor) { return y * scaleFactor - panY; };
    this.imageToCanvasFontSize = function (size, scaleFactor) { return size * scaleFactor; };
    /**
	 * @param {{x: number, y: number, width: number, height: number}} rectangle
	 * @param {CanvasRenderingContext2D} context
	 */
    this.collidesWithRectangle = function (rectangle, context) { console.log("Not implemented", this); };
    /**
	 * @param {{x: number, y: number}} point
	 * @returns {boolean}
	 */
    this.collidesWithPoint = function (point) {
        console.log("Not implemented");
        return false;
    };
    this.createPayload = function (inputMode, strokeColor, strokeWidth, scaledPoints, type) {
        return {
            mode: inputMode,
            color: inputMode == TabeebCanvasService.CanvasInputMode.Eraser ? "white" : strokeColor,
            width: strokeWidth,
            endpoints: scaledPoints,
            type: type
        }
    };
    /**
	 * @returns {{x: number, y: number, width: number, height: number}}
	 */
    this.getRectangle = function () {
        var lowestX = 9999;
        var lowestY = 9999;
        var highestX = 0;
        var highestY = 0;
        $.each(this.stroke.endpoints, function (index, endpoint) {
            lowestX = Math.min(lowestX, Math.min(endpoint.start.x, endpoint.end.x));
            lowestY = Math.min(lowestY, Math.min(endpoint.start.y, endpoint.end.y));
            highestX = Math.max(highestX, Math.max(endpoint.start.x, endpoint.end.x));
            highestY = Math.max(highestY, Math.max(endpoint.start.y, endpoint.end.y));
        });
        return {
            x: lowestX - this.stroke.width / 2 - 1,
            y: lowestY - this.stroke.width / 2 - 1,
            width: highestX - lowestX + this.stroke.width + 2,
            height: highestY - lowestY + this.stroke.width + 2
        }
    };

    this.getAnchoredAnnotationPosition = function () {
        var rect = this.getRectangle();
        return {
            x: rect.x + rect.width,
            y: rect.y
        };
    };

    function rectangleImageToCanvas(rect, panX, panY, scaleFactor) {
        return {
            x: this.imageToCanvasCoordX(rect.x, panX, scaleFactor),
            y: this.imageToCanvasCoordY(rect.y, panY, scaleFactor),
            width: rect.width * scaleFactor,
            height: rect.height * scaleFactor
        };
    }

    /**
	 *
	 * @param {CanvasRenderingContext2D} context
	 * @param {Number} panX
	 * @param {Number} panY
	 * @param {Number} scaleFactor
	 */
    this.drawHighlighted = function (context, panX, panY, scaleFactor, fontFamily) {
        context.save();
        context.beginPath();
        context.strokeStyle = this.selected == true ? (this.highlighted == true ? TabeebAnnotationOptions.selectedAndHighlightedColor : TabeebAnnotationOptions.selectedColor) : TabeebAnnotationOptions.highlightedColor;
        context.lineWidth = 2;
        setDashedLine(context, 5, 5);
        var rectangle = rectangleImageToCanvas.call(this, this.getRectangle(context), panX, panY, scaleFactor);
        if (rectangle)
            context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        context.stroke();
        context.closePath();

        if (this.selected == true && this.type != TabeebAnnotationType.Stroke)
            this.drawResizeOverlay(context, rectangle, panX, panY, scaleFactor);

        context.restore();
    };

    /**
	 * @param {{x:number,y:number}} point
	 * @param {CanvasRenderingContext2D} context
	 * @returns {(string|number)}
	 */
    this.isRectOverResizeRectangle = function (point, context) {
        if (this.type == TabeebAnnotationType.Stroke)
            return false;

        var rect = this.getRectangle(context);
        var topLeftRect = { x: rect.x - 5, y: rect.y, width: 10, height: 10 };
        var topRect = { x: rect.x - 5 + rect.width / 2, y: rect.y - 5, width: 10, height: 10 };
        var topRightRect = { x: rect.x + rect.width, y: rect.y - 3, width: 10, height: 10 };
        var rightRect = { x: rect.x + rect.width, y: rect.y + rect.height / 2 - 3, width: 10, height: 10 };
        var bottomRightRect = { x: rect.x + rect.width, y: rect.y + rect.height, width: 10, height: 10 };
        var bottomRect = { x: rect.x + rect.width / 2 - 5, y: rect.y + rect.height, width: 10, height: 10 };
        var bottomLeftRect = { x: rect.x - 5, y: rect.y + rect.height, width: 10, height: 10 };
        var leftRect = { x: rect.x - 5, y: rect.y + rect.height / 2, width: 10, height: 10 };
        if (ShapeCollisions.rectangleRectangle(point, topLeftRect))
            return "nw";
        else if (ShapeCollisions.rectangleRectangle(point, topRect))
            return "n";
        else if (ShapeCollisions.rectangleRectangle(point, topRightRect))
            return "ne";
        else if (ShapeCollisions.rectangleRectangle(point, rightRect))
            return "e";
        else if (ShapeCollisions.rectangleRectangle(point, bottomRightRect))
            return "se";
        else if (ShapeCollisions.rectangleRectangle(point, bottomRect))
            return "s";
        else if (ShapeCollisions.rectangleRectangle(point, bottomLeftRect))
            return "sw";
        else if (ShapeCollisions.rectangleRectangle(point, leftRect))
            return "w";

        return -1;
    };

    this.resize = function (direction, x, y) {
        var stroke = this.stroke.endpoints[0];
        if (direction.indexOf("e") >= 0) {
            if (stroke.end.x > stroke.start.x)
                stroke.end.x += x;
            else
                stroke.start.x += x;
        }
        if (direction.indexOf("w") >= 0) {
            if (stroke.start.x < stroke.end.x)
                stroke.start.x += x;
            else
                stroke.end.x += x;
        }
        if (direction.indexOf("n") >= 0) {
            if (stroke.start.y < stroke.end.y)
                stroke.start.y += y;
            else
                stroke.end.y += y;
        }
        if (direction.indexOf("s") >= 0) {
            if (stroke.end.y > stroke.start.y)
                stroke.end.y += y;
            else
                stroke.start.y += y;
        }
    };

    this.drawResizeOverlay = function (context, rect) {
        context.beginPath();
        setDashedLine(context, 0, 0);
        context.lineWidth = 1;
        context.strokeStyle = 'blue';
        context.rect(rect.x - 5, rect.y - 5, 5, 5);
        context.rect(rect.x - 5 + rect.width / 2, rect.y - 5, 5, 5);
        context.rect(rect.x + rect.width, rect.y - 3, 5, 5);
        context.rect(rect.x + rect.width, rect.y + rect.height / 2 - 3, 5, 5);
        context.rect(rect.x + rect.width, rect.y + rect.height, 5, 5);
        context.rect(rect.x + rect.width / 2 - 5, rect.y + rect.height, 5, 5);
        context.rect(rect.x - 5, rect.y + rect.height, 5, 5);
        context.rect(rect.x - 5, rect.y + rect.height / 2, 5, 5);
        context.stroke();
        context.closePath();
    };

    this.getCoordinates = function () { console.error("Not implemented", this); };
    this.setCoordinates = function (value) { console.error("Not implemented", this); };
}

/**
 * @returns {Boolean}
 */
TabeebAnnotation.prototype.canBeSelected = function () {
    if (this.locked === true || this.hidden === true || this.permission == TabeebAnnotationPermissionType.readOnly) {
        return false;
    }
    return true;
};/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @constructor
 * @extends TabeebAnnotation
 */
function ShapeAnnotation(data) {
	this.translate = function (x, y) {
		var endpoints = this.stroke.endpoints;
		for (var i = 0; i < endpoints.length; i++)
		{
			endpoints[i].start.x += x;
			endpoints[i].start.y += y;
			endpoints[i].end.x += x;
			endpoints[i].end.y += y;
		}
	};
	this.getCoordinates = function () { return $.extend(true, {}, this.stroke); };
	this.setCoordinates = function (stroke) { this.stroke = stroke; };
}

ShapeAnnotation.inheritsFrom(TabeebAnnotation);
/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @class
 * @extends ShapeAnnotation
 */
function StrokeAnnotation(data) {
	this.init(data);
	this.draw = function (context, panX, panY, scaleFactor) {
		draw.call(this, context, panX, panY, scaleFactor, this.stroke.endpoints);
	};

	function draw(context, panX, panY, scaleFactor) {
		var endpoints = this.stroke.endpoints;
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		var point = {
			x: this.imageToCanvasCoordX(endpoints[0].start.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(endpoints[0].start.y, panY, scaleFactor)
		};
		context.moveTo(point.x, point.y);
		for (var iPoint = 0; iPoint < endpoints.length; iPoint++)
		{
			point = {
				x: this.imageToCanvasCoordX(this.stroke.endpoints[iPoint].end.x, panX, scaleFactor),
				y: this.imageToCanvasCoordY(endpoints[iPoint].end.y, panY, scaleFactor)
			};
			context.lineTo(point.x, point.y);
		}
		context.stroke();
		context.closePath();
	}

	this.drawHighlighted = function (context, panX, panY, scaleFactor, fontFamily) {
		context.save();
		context.beginPath();
		context.lineWidth = 1;
		context.strokeStyle = TabeebAnnotationOptions.highlightedColor;
		var endpoints = this.stroke.endpoints;
		var point = {
			x: this.imageToCanvasCoordX(endpoints[0].start.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(endpoints[0].start.y, panY, scaleFactor)
		};

		context.moveTo(point.x, point.y);
		TabeebDrawingExtensions.drawHighlighSquare(context, point.x, point.y, scaleFactor, this);
		for (var iPoint = 0; iPoint < endpoints.length; iPoint++)
		{
			point = {
				x: this.imageToCanvasCoordX(this.stroke.endpoints[iPoint].end.x, panX, scaleFactor),
				y: this.imageToCanvasCoordY(endpoints[iPoint].end.y, panY, scaleFactor)
			};
			context.lineTo(point.x, point.y);
			TabeebDrawingExtensions.drawHighlighSquare(context, point.x, point.y, scaleFactor, this);
		}
		context.stroke();
		context.closePath();
		context.restore();
	};

	this.preview = function (context, endpoints, panX, panY, scaleFactor) {
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		context.moveTo(endpoints[0].x, endpoints[0].y);
		for (var i = 0; i < endpoints.length; i++)
		{
			context.lineTo(endpoints[i].x, endpoints[i].y);
		}
		context.lineTo(endpoints[endpoints.length - 1].x, endpoints[endpoints.length - 1].y);
		context.stroke();
		context.closePath();
	};

	this.collidesWithRectangle = function (rect) {
		if (this.type == TabeebAnnotationType.ErasedStroke)
			return false;

		var endpoint = null;
		for (var i = 0; i < this.stroke.endpoints.length; i++)
		{
			endpoint = this.stroke.endpoints[i];
			var point = {x: rect.x, y: rect.y};
			var line = {
				startX: endpoint.start.x,
				startY: endpoint.start.y,
				endX: endpoint.end.x,
				endY: endpoint.end.y
			};
			if (ShapeCollisions.pointLine(point, line, Math.max(10, this.stroke.width)))
				return true;
		}
		return false;
	};

	this.getCoordinates = function () { return $.extend(true, {}, this.stroke); };
	this.setCoordinates = function (stroke) { this.stroke = stroke; };

	this.getAnchoredAnnotationPosition = function () {
		return {
			x: this.stroke.endpoints[this.stroke.endpoints.length-1].end.x,
			y: this.stroke.endpoints[this.stroke.endpoints.length-1].end.y
		};
	}
}

StrokeAnnotation.inheritsFrom(ShapeAnnotation);
/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @class
 * @property {{text:string,fontSize:number,point:{x:number,y:number}, color:string}} textInfo
 * @extends TabeebAnnotation
 */
function TextAnnotation(data) {
    this.init(data);
    this.draw = function (context, panX, panY, scaleFactor, fontFamily) {
        this.drawText(context, panX, panY, scaleFactor, fontFamily);
    };

    this.getColor = function () { return this.textInfo.color; };

    this.drawText = function (context, panX, panY, scaleFactor, fontFamily) {
        var point = {
            x: this.imageToCanvasCoordX(this.textInfo.point.x, panX, scaleFactor),
            y: this.imageToCanvasCoordY(this.textInfo.point.y, panY, scaleFactor)
        };
        var fontSize = this.imageToCanvasFontSize(this.textInfo.fontSize, scaleFactor);
        context.globalCompositeOperation = (this.textInfo.color == null ? "destination-out" : "source-over");
        //noinspection JSValidateTypes
        context.strokeStyle = this.textInfo.color;
        //noinspection JSValidateTypes
        context.fillStyle = !this.selected && this.dimmed ? TabeebPlayerUtil.mixColors(this.textInfo.color, this.dimColor, this.dimOpacity) : this.textInfo.color;
        context.textBaseline = "top";
        context.font = fontSize + "px " + fontFamily;
        var displayOffset = this.textInfo.fontSize / 16;

        var lines = this.textInfo.text.split("\n");

        for (var i = 0; i < lines.length; i++) {
            context.fillText(lines[i], point.x + displayOffset, point.y + displayOffset * 2 + fontSize * i);
        }
    };

    this.drawHighlighted = function (context, panX, panY, scaleFactor, fontFamily) {
        context.save();

        var point = {
            x: this.imageToCanvasCoordX(this.textInfo.point.x, panX, scaleFactor),
            y: this.imageToCanvasCoordY(this.textInfo.point.y, panY, scaleFactor)
        };

        context.lineWidth = 1;
        context.strokeStyle = TabeebAnnotationOptions.highlightedColor;

        var size = TabeebDrawingExtensions.getSizeOfText(context, this.textInfo.fontSize, fontFamily, this.textInfo.text, scaleFactor);

        TabeebDrawingExtensions.drawHighlighSquare(context, point.x, point.y, scaleFactor, this);

        TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width / 2, point.y, scaleFactor, this);
        TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width, point.y, scaleFactor, this);

        TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width, point.y + size.height, scaleFactor, this);
        TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width / 2, point.y + size.height, scaleFactor, this);

        TabeebDrawingExtensions.drawHighlighSquare(context, point.x, point.y + size.height, scaleFactor, this);
        TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width, point.y + size.height / 2, scaleFactor, this);

        context.restore();
    };

    this.getHeight = function () {
        return this.textInfo.text.split("\n").length * this.textInfo.fontSize;
    };

    this.getHeightScaled = function (scaleFactor) {
        return this.textInfo.text.split("\n").length * this.imageToCanvasFontSize(this.textInfo.fontSize, scaleFactor);
    };

    /**
	 * @param {CanvasRenderingContext2D} context
	 * @param {String} fontFamily
	 */
    this.getWidth = function (context, fontFamily) {
        if (fontFamily == null)
            fontFamily = $("body").css('font-family');

        context.save();
        context.font = this.textInfo.fontSize + 'px ' + fontFamily;
        var lines = this.textInfo.text.split("\n");
        var width = 0;
        for (var i = 0; i < lines.length; i++) {
            var lineWidth = context.measureText(lines[i]).width;
            if (lineWidth > width)
                width = lineWidth;
        }
        context.restore();
        return width;
    };

    this.getWidthScaled = function (context, fontFamily, scaleFactor) {
        context.save();
        context.font = this.imageToCanvasFontSize(this.textInfo.fontSize, scaleFactor) + 'px ' + fontFamily;
        var lines = this.textInfo.text.split("\n");
        var width = 0;
        for (var i = 0; i < lines.length; i++) {
            var lineWidth = context.measureText(lines[i]).width;
            if (lineWidth > width)
                width = lineWidth;
        }
        context.restore();
        return width;
    };

    this.collidesWithRectangle = function (rect, context, fontFamily) {
        var size = TabeebDrawingExtensions.getSizeOfText(context, this.textInfo.fontSize, fontFamily, this.textInfo.text, 1);
        var bodyRect = {
            x: this.textInfo.point.x,
            y: this.textInfo.point.y,
            width: size.width,
            height: size.height
        };

        return ShapeCollisions.rectangleRectangle(rect, bodyRect);
    };

    this.translate = function (x, y) {
        this.textInfo.point.x += x;
        this.textInfo.point.y += y;
    };

    this.getRectangle = function (context) {
        return {
            x: this.textInfo.point.x,
            y: this.textInfo.point.y,
            width: this.getWidth(context, $("canvas").css('font-family')),
            height: this.getHeight()
        };
    };

    this.drawResizeOverlay = function () { };

    this.getCoordinates = function () {
        //console.info("(x: " + this.textInfo.point.x+", y: "+this.textInfo.point.y+")");
        return $.extend({}, this.textInfo.point);
    };

    this.setCoordinates = function (point) {
        this.textInfo.point = point;
        //console.info("(x: " + this.textInfo.point.x+", y: "+this.textInfo.point.y+")");
    };

    this.isRectOverResizeRectangle = function (rect) {
        return false;
    };

    this.resize = function () { };

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @returns {{x: *, y: *}}
     */
    this.getAnchoredAnnotationPosition = function (ctx) {
        var width = this.getWidth(ctx);

        return {
            x: this.textInfo.point.x + width + 10,
            y: this.textInfo.point.y
        };
    }
}

TextAnnotation.inheritsFrom(TabeebAnnotation);
/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @constructor
 * @extends StrokeAnnotation
 */
function LineAnnotation(data) {
	this.finalizeStrokePolicy = TabeebFinalizeStrokePolicy.FirstAndLastStroke;
	this.init(data);
	this.preview = function (context, endpoints, panX, panY, scaleFactor) {
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		context.moveTo(endpoints[0].x, endpoints[0].y);
		context.lineTo(endpoints[endpoints.length - 1].x, endpoints[endpoints.length - 1].y);
		context.stroke();
		context.closePath();
	};

	this.drawResizeOverlay = function (context, rect, panX, panY, scaleFactor) {
		context.beginPath();
		context.strokeStyle = "pink";
		context.lineWidth = 1;
		setDashedLine(context, 0, 0);
		context.arc(this.imageToCanvasCoordX(this.stroke.endpoints[0].start.x, panX, scaleFactor), this.imageToCanvasCoordY(this.stroke.endpoints[0].start.y, panY, scaleFactor), 5 * scaleFactor, 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
		context.beginPath();
		context.arc(this.imageToCanvasCoordX(this.stroke.endpoints[0].end.x, panX, scaleFactor), this.imageToCanvasCoordY(this.stroke.endpoints[0].end.y, panY, scaleFactor), 5 * scaleFactor, 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
	};

	this.isRectOverResizeRectangle = function (point, context) {
		var rect = this.getRectangle(context);

		var circ1 = {x: this.stroke.endpoints[0].start.x, y: this.stroke.endpoints[0].start.y, width: 10, height: 10};
		var circ2 = {x: this.stroke.endpoints[0].end.x, y: this.stroke.endpoints[0].end.y, width: 10, height: 10};

		if (ShapeCollisions.pointEllipse(point, circ1))
			return "nesw";
		else if (ShapeCollisions.pointEllipse(point, circ2))
			return "nwse";

		return -1;
	};

	this.resize = function (direction, x, y) {
		if (direction == "nesw")
		{
			this.stroke.endpoints[0].start.x += x;
			this.stroke.endpoints[0].start.y += y;
		}
		else if (direction == "nwse")
		{
			this.stroke.endpoints[0].end.x += x;
			this.stroke.endpoints[0].end.y += y;
		}

	};
}

LineAnnotation.inheritsFrom(StrokeAnnotation);/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @param bothSides:boolean
 * @constructor
 * @extends LineAnnotation
 */
function ArrowLineAnnotation(data, bothSides) {
	this.finalizeStrokePolicy = TabeebFinalizeStrokePolicy.FirstAndLastStroke;
	this.init(data);
	this.draw = function (context, panX, panY, scaleFactor) {
		var endpoints = this.stroke.endpoints;
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);

		var pointA = {
			x: this.imageToCanvasCoordX(endpoints[0].start.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(endpoints[0].start.y, panY, scaleFactor)
		};
		var pointB = {
			x: this.imageToCanvasCoordX(endpoints[0].end.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(endpoints[0].end.y, panY, scaleFactor)
		};
		if (bothSides)
			drawArrow(context, pointA.x, pointA.y, pointB.x, pointB.y, 2, 2 | 1, Math.PI / 8, this.stroke.width * scaleFactor * 3);
		else
			drawArrow(context, pointA.x, pointA.y, pointB.x, pointB.y, 2, 1, Math.PI / 8, this.stroke.width * scaleFactor * 3);
		context.closePath();
	};

	this.preview = function (context, endpoints, panX, panY, scaleFactor) {
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		var pointA = {x: endpoints[0].x, y: endpoints[0].y};
		var pointB = {x: endpoints[endpoints.length - 1].x, y: endpoints[endpoints.length - 1].y};
		if (bothSides)
			drawArrow(context, pointA.x, pointA.y, pointB.x, pointB.y, 2, 2 | 1, Math.PI / 8, this.stroke.width * scaleFactor * 3);
		else
			drawArrow(context, pointA.x, pointA.y, pointB.x, pointB.y, 2, 1, Math.PI / 8, this.stroke.width * scaleFactor * 3);
		context.closePath();
	};

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param x0
	 * @param y0
	 * @param x1
	 * @param y1
	 * @param x2
	 * @param y2
	 */
	var drawHead = function (ctx, x0, y0, x1, y1, x2, y2) {
		var radius = 3;
		var twoPI = 2 * Math.PI;

		// all cases do this.
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	};

	function drawArrow(ctx, x1, y1, x2, y2, style, which, angle, d) {
		// default to using drawHead to draw the head, but if the style
		// argument is a function, use it instead
		var toDrawHead = typeof(style) != 'function' ? drawHead : style;

		// For ends with arrow we actually want to stop before we get to the arrow
		// so that wide lines won't put a flat end on the arrow.
		//
		var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
		var ratio = (dist - d / 3) / dist;
		var tox, toy, fromx, fromy;
		if (which & 1)
		{
			tox = Math.round(x1 + (x2 - x1) * ratio);
			toy = Math.round(y1 + (y2 - y1) * ratio);
		}
		else
		{
			tox = x2;
			toy = y2;
		}
		if (which & 2)
		{
			fromx = x1 + (x2 - x1) * (1 - ratio);
			fromy = y1 + (y2 - y1) * (1 - ratio);
		}
		else
		{
			fromx = x1;
			fromy = y1;
		}

		// Draw the shaft of the arrow
		ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();

		// calculate the angle of the line
		var lineangle = Math.atan2(y2 - y1, x2 - x1);
		// h is the line length of a side of the arrow head
		var h = Math.abs(d / Math.cos(angle));

		if (which & 1)
		{	// handle far end arrow head
			var angle1 = lineangle + Math.PI + angle;
			var topx = x2 + Math.cos(angle1) * h;
			var topy = y2 + Math.sin(angle1) * h;
			var angle2 = lineangle + Math.PI - angle;
			var botx = x2 + Math.cos(angle2) * h;
			var boty = y2 + Math.sin(angle2) * h;
			toDrawHead(ctx, topx, topy, x2, y2, botx, boty, style);
		}
		if (which & 2)
		{ // handle near end arrow head
			var angle1 = lineangle + angle;
			var topx = x1 + Math.cos(angle1) * h;
			var topy = y1 + Math.sin(angle1) * h;
			var angle2 = lineangle - angle;
			var botx = x1 + Math.cos(angle2) * h;
			var boty = y1 + Math.sin(angle2) * h;
			toDrawHead(ctx, topx, topy, x1, y1, botx, boty, style);
		}
	}
}

ArrowLineAnnotation.inheritsFrom(LineAnnotation);
/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @class
 * @property {{x:number, y:number}} anchor
 * @extends TextAnnotation
 */
function CalloutAnnotation(data) {
	this.init(data);

	this.drawHighlighted = function (context, panX, panY, scaleFactor, fontFamily) {
		context.save();

		var point = {
			x: this.imageToCanvasCoordX(this.textInfo.point.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.textInfo.point.y, panY, scaleFactor)
		};
		var shaftPoint = {
			x: this.imageToCanvasCoordX(this.anchor.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.anchor.y, panY, scaleFactor)
		};

		context.lineWidth = 1;
		context.strokeStyle = TabeebAnnotationOptions.highlightedColor;

		var size = TabeebDrawingExtensions.getSizeOfText(context, this.textInfo.fontSize, fontFamily, this.textInfo.text, scaleFactor);

		context.beginPath();
		context.moveTo(point.x + 15 * scaleFactor, point.y + size.height);
		context.lineTo(shaftPoint.x, shaftPoint.y);
		context.stroke();
		context.closePath();


		TabeebDrawingExtensions.drawHighlighSquare(context, shaftPoint.x, shaftPoint.y, scaleFactor, this);

		TabeebDrawingExtensions.drawHighlighSquare(context, point.x, point.y, scaleFactor, this);

		TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width/2, point.y, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width, point.y, scaleFactor, this);

		TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width, point.y + size.height, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width/2, point.y + size.height, scaleFactor, this);

		TabeebDrawingExtensions.drawHighlighSquare(context, point.x, point.y + size.height, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, point.x + size.width, point.y + size.height/2, scaleFactor, this);

		context.restore();
	};

	/**
	 * @param {CanvasRenderingContext2D} context
	 * @param {Number} panX
	 * @param {Number} panY
	 * @param {Number} scaleFactor
	 * @param {Number} rectWidth
	 * @param {Number} rectHeight
	 */
	this.drawBox = function (context, panX, panY, scaleFactor, rectWidth, rectHeight) {
		context.save();
		var point = {
			x: this.imageToCanvasCoordX(this.textInfo.point.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.textInfo.point.y, panY, scaleFactor)
		};
		context.fillStyle = this.textInfo.color;
		context.fillStyle = "white";
		context.fillRect(point.x, point.y, rectWidth, rectHeight);
		context.strokeRect(point.x, point.y, rectWidth, rectHeight);
		context.stroke();
		context.closePath();
		context.restore();
	};

	this.draw = function (context, panX, panY, scaleFactor, fontFamily) {
		var point = {
			x: this.imageToCanvasCoordX(this.textInfo.point.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.textInfo.point.y, panY, scaleFactor)
		};
		var shaftPoint = {
			x: this.imageToCanvasCoordX(this.anchor.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.anchor.y, panY, scaleFactor)
		};

		var size = TabeebDrawingExtensions.getSizeOfText(context, this.textInfo.fontSize, fontFamily, this.textInfo.text, scaleFactor);

		this.startStroke(context, this.getColor(), 3, scaleFactor);
		context.moveTo(point.x + 15 * scaleFactor, point.y + size.height);
		context.lineTo(shaftPoint.x, shaftPoint.y);
		context.stroke();
		context.closePath();

		context.beginPath();
		this.drawBox(context, panX, panY, scaleFactor, size.width, size.height);

		this.drawText(context, panX, panY, scaleFactor, fontFamily);
		context.closePath();
	};

	this.getCoordinates = function () {
		var data = {
			point: this.textInfo.point,
			anchor: this.anchor
		};
		console.log("Coordinate data for callout", data);
		return data;
	};

	this.setCoordinates = function (data) {
		this.textInfo.point = data.point;
		this.anchor = data.anchor;
	};

	this.preview = function (context, pointsInStroke, panX, panY, scaleFactor, fontFamily) {
		var point = {
			x: this.imageToCanvasCoordX(this.textInfo.point.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.textInfo.point.y, panY, scaleFactor)
		};
		var fontSize = this.imageToCanvasFontSize(this.textInfo.fontSize, scaleFactor);
		var lastStroke = pointsInStroke[pointsInStroke.length - 1];
		var rectWidth = this.getWidthScaled(context, fontFamily, scaleFactor);
		var rectHeight = this.getHeightScaled(scaleFactor);

		this.startStroke(context, this.getColor(), 3, scaleFactor);

		context.moveTo(point.x + 15 * scaleFactor, point.y + this.getHeightScaled(scaleFactor));
		context.lineTo(lastStroke.x, lastStroke.y);
		context.stroke();
		context.closePath();
		context.beginPath();
		this.drawBox(context, panX, panY, scaleFactor, rectWidth, rectHeight);
		this.drawText(context, panX, panY, scaleFactor, fontFamily);
	};

	this.createPayload = function (inputMode, strokeColor, strokeWidth, scaledPoints, type) {
		return {
			mode: inputMode,
			color: inputMode == TabeebCanvasService.CanvasInputMode.Eraser ? "white" : strokeColor,
			width: strokeWidth,
			endpoints: scaledPoints,
			type: type,
			textInfo: this.textInfo
		}
	};

	this.collidesWithRectangle = function (rect, context, fontFamily) {
		var size = TabeebDrawingExtensions.getSizeOfText(context, this.textInfo.fontSize, fontFamily, this.textInfo.text, 1);
		var bodyRect = {
			x: this.textInfo.point.x,
			y: this.textInfo.point.y,
			width: size.width,
			height: size.height
		};
		var line = {
			startX: this.textInfo.point.x + 15,
			startY: this.textInfo.point.y + this.getHeight(),
			endX: this.anchor.x,
			endY: this.anchor.y
		};

		if (ShapeCollisions.rectangleRectangle(rect, bodyRect))
		{
			this.selectedPart = 0;
			return true;
		}
		else if (ShapeCollisions.pointLine(rect, line, 5))
		{
			this.selectedPart = 1;
			return true;
		}
		return false;
	};

	this.translate = function (x, y) {
		if (this.selectedPart == 0)
		{
			this.textInfo.point.x += x;
			this.textInfo.point.y += y;
		}
		else if (this.selectedPart == 1)
		{
			this.anchor.x += x;
			this.anchor.y += y;
		}
	};

	this.drawResizeOverlay = function (context, rect, panX, panY, scaleFactor) {
		context.beginPath();
		context.strokeStyle = "pink";
		context.lineWidth = 1;
		setDashedLine(context, 0, 0);
		context.arc(this.imageToCanvasCoordX(this.anchor.x, panX, scaleFactor), this.imageToCanvasCoordY(this.anchor.y, panY, scaleFactor), 5 * scaleFactor, 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
	};
}

CalloutAnnotation.inheritsFrom(TextAnnotation);
/**
 * Created by cody on 9/18/15.
 */

/**
 * @constructor
 * @extends TabeebAnnotation
 */
function HotspotAnnotation(data) {
	this.finalizeStrokePolicy = TabeebFinalizeStrokePolicy.FirstAndLastStroke;
	this.init(data);

	this.getWidth = function () {
		return this.highlighted === true ? 36 : 32;
	};

	/**
	 * @param {CanvasRenderingContext2D} context
	 */
	function setFontStyling (context) {
		context.font = (HotspotAnnotation.variables.width - 6) + "px Verdana";
		context.textBaseline = "bottom";
		context.fillStyle = "white";
		context.strokeStyle = "white";
	}

	this.draw = function (context, panX, panY, scaleFactor) {
		context.save();

		var position = {
			x: this.imageToCanvasCoordX(this.anchor.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.anchor.y, panY, scaleFactor)
		};

		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		//context.fillStyle = this.getColor();
		context.fillStyle = !this.selected && this.dimmed ? TabeebPlayerUtil.mixColors(this.getColor(), this.dimColor, this.dimOpacity) : this.getColor();
		var width = HotspotAnnotation.variables.width;


		var h = width*2;

		if (this.parent && this.parent.type) {
			context.beginPath();
			context.lineWidth = 1;
			context.strokeStyle = this.parent.getColor();

			var parentPosition = this.parent.getAnchoredAnnotationPosition();

			parentPosition.x = this.imageToCanvasCoordX(parentPosition.x, panX, scaleFactor);
			parentPosition.y = this.imageToCanvasCoordY(parentPosition.y, panY, scaleFactor);

			context.moveTo(parentPosition.x, parentPosition.y);
			context.lineTo(position.x - width + 20, position.y + width - 14);
			context.stroke();
			context.closePath();
		}

		context.translate(position.x - width + 8, position.y - width - 14);
		context.beginPath();
		context.moveTo(width / 2, h);
		context.bezierCurveTo(-width * 2, -h/3, width * 3, -h/3, width / 2, h);
		context.closePath();
		context.fill();

		setFontStyling(context);

		var str = this.hotspotCount;
		var strWidth = context.measureText(str).width;

		context.fillText(str, width/2 - strWidth/2, h/2 + 4);
		context.fillStyle = "white";
		context.restore();
	};

	this.drawHighlighted = function (context, panX, panY, scaleFactor) {
	};

	this.preview = function (context, endpoints, panX, panY, scaleFactor) {
		context.save();

		var position = {x: endpoints[endpoints.length-1].x, y: endpoints[endpoints.length-1].y};
		setFontStyling(context);

		context.beginPath();
		context.strokeStyle = this.stroke.color;
		context.fillStyle = this.stroke.color;
		var width = HotspotAnnotation.variables.width;


		var h = width*2;

		context.translate(position.x - width + 8, position.y - width - 14);
		context.moveTo(width/2,0);
		context.bezierCurveTo(width*2 + 5, h/8, width/2, h, width/2, h);
		context.moveTo(width/2,0);
		context.bezierCurveTo(-width - 5, h/8, width/2, h, width/2, h);
		context.fill();

		setFontStyling(context);

		var str = "?";
		var strWidth = context.measureText(str).width;

		context.fillStyle = "white";
		context.fillText(str, width/2 - strWidth/2, h/2 + 4);

		context.restore();
	};

	this.getColor = function () {
		if (this.highlighted === true)
			return "green";
		else
			return this.color;
	};

	this.getRectangle = function () {
		return {
			x: this.anchor.x - 20,
			y: this.anchor.y - 40,
			width: HotspotAnnotation.variables.width,
			height: HotspotAnnotation.variables.width
		};
	};

	this.collidesWithRectangle = function (rectangle, context, fontFamily, scaleFactor) {
		var rect = {
			x: this.anchor.x,
			y: this.anchor.y,
			width: (HotspotAnnotation.variables.width/2) + (HotspotAnnotation.variables.width * (1/scaleFactor)),
			height: (HotspotAnnotation.variables.width/2)  + (HotspotAnnotation.variables.width * (1/scaleFactor))
		};

		rect.x -= rect.width/2;
		rect.y -= rect.height;

		return ShapeCollisions.rectangleRectangle(rect, rectangle);
	};

	this.getCoordinates = function () {
		return $.extend({}, this.anchor);
	};

	this.setCoordinates = function (data) {
		this.anchor = data;
	};

	this.translate = function (x, y) {
		this.anchor.x += x;
		this.anchor.y += y;
	};

	this.isRectOverResizeRectangle = function () { return false; };

	this.canBeSelected = function () {
		return true;
	};
}

HotspotAnnotation.variables = {
	width: 24
};

HotspotAnnotation.inheritsFrom(TextAnnotation);/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @param {boolean} filled
 * @constructor
 * @extends ShapeAnnotation
 */
function CircleAnnotation(data, filled) {
	this.finalizeStrokePolicy = TabeebFinalizeStrokePolicy.FirstAndLastStroke;
	this.init(data, filled);

	this.draw = function (context, panX, panY, scaleFactor) {
	    this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		var endpoint = this.stroke.endpoints[0];
		var pointA = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].start.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].start.y, panY, scaleFactor)
		};
		var pointB = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].end.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].end.y, panY, scaleFactor)
		};
		var width = pointB.x - pointA.x;
		var height = pointB.y - pointA.y;
		drawEllipse(context, pointA.x, pointA.y, width, height, this.filled);
	};

	this.drawHighlighted = function (context, panX, panY, scaleFactor) {
	    context.save();
		var pointA = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].start.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].start.y, panY, scaleFactor)
		};
		var pointB = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].end.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].end.y, panY, scaleFactor)
		};
		var w = pointB.x - pointA.x;
		var h = pointB.y - pointA.y;

		var xe = pointA.x + w,           // x-end
			ye = pointA.y + h,           // y-end
			xm = pointA.x + w / 2,       // x-middle
			ym = pointA.y + h / 2;       // y-middle

		context.beginPath();

		context.strokeStyle = TabeebAnnotationOptions.highlightedColor;
		context.lineWidth = 1;

		var strokeWidth = this.filled === true ? 0 : this.stroke.width * scaleFactor;
		pointA.x -= strokeWidth/2;
		pointA.y -= strokeWidth/2;
		w += strokeWidth;
		h += strokeWidth;

		var a = w/2;
		var b = h/2;

		drawEllipse(context, pointA.x, pointA.y, w, h, false);
		context.strokeRect(pointA.x, pointA.y, w, h);

		context.stroke();
		context.closePath();
		for (var angle = 0; angle <= Math.PI*8; angle += Math.PI/2) {
			var x = (a * b) / (Math.sqrt( Math.pow(b, 2) + Math.pow(a, 2)*Math.pow(Math.tan(angle), 2) ));
			var y = Math.tan(angle) * x;
			TabeebDrawingExtensions.drawHighlighSquare(context, xm + x, ym + y, scaleFactor, this);
			TabeebDrawingExtensions.drawHighlighSquare(context, xm - x, ym + y, scaleFactor, this);
		}

		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x, pointA.y, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x + w, pointA.y, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x + w, pointA.y + h, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x, pointA.y + h, scaleFactor, this);

		context.restore();
	};

	this.preview = function (context, endpoints, panX, panY, scaleFactor) {
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		var width = endpoints[endpoints.length - 1].x - endpoints[0].x;
		var height = endpoints[endpoints.length - 1].y - endpoints[0].y;
		var x = endpoints[0].x;
		var y = endpoints[0].y;
		drawEllipse(context, x, y, width, height, this.filled);
		context.closePath();
	};

	function drawEllipse(ctx, x, y, w, h, filled) {
		var kappa = .5522848,
			ox = (w / 2) * kappa, // control point offset horizontal
			oy = (h / 2) * kappa, // control point offset vertical
			xe = x + w,           // x-end
			ye = y + h,           // y-end
			xm = x + w / 2,       // x-middle
			ym = y + h / 2;       // y-middle

		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.strokeStyle = null;
		ctx.strokeWidth = 0;
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		if (filled == true)
			ctx.fill();
		else
			ctx.stroke();
	}

	this.collidesWithRectangle = function (rect, context) {
		var pointA = {x: this.stroke.endpoints[0].start.x, y: this.stroke.endpoints[0].start.y};
		var pointB = {x: this.stroke.endpoints[0].end.x, y: this.stroke.endpoints[0].end.y};

		if (!this.filled)
		{
			pointA.x -= this.stroke.width;
			pointA.y -= this.stroke.width;
			pointB.x += this.stroke.width;
			pointB.y += this.stroke.width;
		}
		var width = pointA.x - pointB.x;
		var height = pointA.y - pointB.y;

		var ellipse = {
			x: pointA.x - width / 2,
			y: pointA.y - height / 2,
			width: width,
			height: height
		};

		if (this.filled)
			return ShapeCollisions.pointEllipse(rect, ellipse);
		else
		{
			pointA.x += this.stroke.width;
			pointA.y += this.stroke.width;
			pointB.x -= this.stroke.width*2;
			pointB.y -= this.stroke.width*2;
			width = pointA.x - pointB.x;
			height = pointA.y - pointB.y;

			var innerEllipse = {
				x: pointA.x - width / 2,
				y: pointA.y - height / 2,
				width: width,
				height: height
			};


			return ShapeCollisions.pointEllipse(rect, ellipse) && !ShapeCollisions.pointEllipse(rect, innerEllipse);
		}
	};

	this.getAnchoredAnnotationPosition = function () {
		var pointA = {
			x: (this.stroke.endpoints[0].start.x),
			y: (this.stroke.endpoints[0].start.y)
		};
		var pointB = {
			x: (this.stroke.endpoints[0].end.x),
			y: (this.stroke.endpoints[0].end.y)
		};
		var w = pointB.x - pointA.x;
		var h = pointB.y - pointA.y;

		var xe = pointA.x + w,           // x-end
			ye = pointA.y + h,           // y-end
			xm = pointA.x + w / 2,       // x-middle
			ym = pointA.y + h / 2;       // y-middle

		var strokeWidth = this.filled === true ? 0 : this.stroke.width;
		pointA.x -= strokeWidth/2;
		pointA.y -= strokeWidth/2;
		w += strokeWidth;
		h += strokeWidth;

		var a = w/2;
		var b = h/2;


		var angle = -Math.PI/4;
		var x = (a * b) / (Math.sqrt( Math.pow(b, 2) + Math.pow(a, 2)*Math.pow(Math.tan(angle), 2) ));
		var y = Math.tan(angle) * x;

		return {x: x+xm, y: y+ym};
	};
}

CircleAnnotation.inheritsFrom(ShapeAnnotation);
/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @param filled
 * @constructor
 * @extends ShapeAnnotation
 */
function RectangleAnnotation(data, filled) {
	this.finalizeStrokePolicy = TabeebFinalizeStrokePolicy.FirstAndLastStroke;
	this.init(data, filled);

	validateStrokes.call(this);

	function validateStrokes() {
		if (!this.stroke || !this.stroke.endpoints) return;
		var pointA = {x: this.stroke.endpoints[0].start.x, y: this.stroke.endpoints[0].start.y};
		var pointB = {x: this.stroke.endpoints[0].end.x, y: this.stroke.endpoints[0].end.y};
		var rect = {
			x: Math.min(pointA.x, pointB.x),
			y: Math.min(pointA.y, pointB.y),
			width: Math.abs(pointB.x - pointA.x),
			height: Math.abs(pointB.y - pointA.y)
		};
		this.stroke.endpoints[0] = {
			start: {
				x: rect.x,
				y: rect.y
			},
			end: {
				x: rect.x + rect.width,
				y: rect.y + rect.height
			}
		};
	}

	this.draw = function (context, panX, panY, scaleFactor) {
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		var pointA = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].start.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].start.y, panY, scaleFactor)
		};
		var pointB = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].end.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].end.y, panY, scaleFactor)
		};
		var width = pointB.x - pointA.x;
		var height = pointB.y - pointA.y;
		if (!this.filled)
			context.rect(pointA.x, pointA.y, width, height);
		else
			context.fillRect(pointA.x, pointA.y, width, height);
		context.stroke();

		context.closePath();
	};

	this.drawHighlighted = function (context, panX, panY, scaleFactor) {
		var pointA = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].start.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].start.y, panY, scaleFactor)
		};
		var pointB = {
			x: this.imageToCanvasCoordX(this.stroke.endpoints[0].end.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.stroke.endpoints[0].end.y, panY, scaleFactor)
		};
		var width = pointB.x - pointA.x;
		var height = pointB.y - pointA.y;

		context.save();
		context.beginPath();
		context.lineWidth = 1;
		context.strokeStyle = TabeebAnnotationOptions.highlightedColor;
		context.strokeRect(pointA.x, pointA.y, width, height);
		context.closePath();
		context.restore();

		var strokeWidth = this.stroke.width * scaleFactor;

		pointA.x -= strokeWidth/2;
		pointA.y -= strokeWidth/2;
		width += strokeWidth;
		height += strokeWidth;

		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x, pointA.y, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x + width, pointA.y, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x + width, pointA.y + height/2, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x + width/2, pointA.y, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x + width, pointA.y + height, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x + width/2, pointA.y + height, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x, pointA.y + height, scaleFactor, this);
		TabeebDrawingExtensions.drawHighlighSquare(context, pointA.x, pointA.y + height/2, scaleFactor, this);
	};

	this.preview = function (context, endpoints, panX, panY, scaleFactor) {
		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		var width = endpoints[endpoints.length - 1].x - endpoints[0].x;
		var height = endpoints[endpoints.length - 1].y - endpoints[0].y;
		if (!this.filled)
			context.rect(endpoints[0].x, endpoints[0].y, width, height);
		else
			context.fillRect(endpoints[0].x, endpoints[0].y, width, height);
		context.stroke();
		context.closePath();
	};

	// Collision items
	this.collidesWithRectangle = function (rect, context) {
		var pointA = {x: this.stroke.endpoints[0].start.x, y: this.stroke.endpoints[0].start.y};
		var pointB = {x: this.stroke.endpoints[0].end.x, y: this.stroke.endpoints[0].end.y};
		var rect2 = {
			x: Math.min(pointA.x, pointB.x),
			y: Math.min(pointA.y, pointB.y),
			width: Math.abs(pointB.x - pointA.x),
			height: Math.abs(pointB.y - pointA.y)
		};
		if (this.filled === true)
			return (ShapeCollisions.rectangleRectangle(rect, rect2));
		else
			return (ShapeCollisions.rectangleRectangle(rect, {
					x: rect2.x,
					y: rect2.y,
					width: this.stroke.width,
					height: rect2.height
				}) ||
				ShapeCollisions.rectangleRectangle(rect, {
					x: rect2.x + rect2.width,
					y: rect2.y,
					width: this.stroke.width,
					height: rect2.height
				})) ||
				ShapeCollisions.rectangleRectangle(rect, {
					x: rect2.x,
					y: rect2.y,
					width: rect2.width,
					height: this.stroke.width
				}) ||
				ShapeCollisions.rectangleRectangle(rect, {
					x: rect2.x,
					y: rect2.y + rect2.height,
					width: rect2.width,
					height: this.stroke.width
				});
	};

	this.getAnchoredAnnotationPosition = function () {
		var rect = this.getRectangle();
		var anchor = {
			x: rect.x + rect.width,
			y: rect.y
		};
		if (this.filled !== true) {
			anchor.x -= this.stroke.width;
			anchor.y += this.stroke.width;
		}
		return anchor;
	}
}

RectangleAnnotation.inheritsFrom(ShapeAnnotation);
/**
 * Created by cody on 6/23/15.
 */

/**
 * Handles the graphical side of the tabeebPlayerCanvas
 * @param canvas - HTML5 Canvas
 * @constructor
 */
function TabeebCanvasDrawManager(canvas, width, height, options)
{
    var opts = $.extend({
        // Default options
        autoRepaint: true
    }, options);

    var context = canvas.getContext("2d");
    var $canvas = $(canvas);
    var panX = 50;
    var panY = 50;
    var scaleFactor = 1.0;

    var backgroundColor = null;
    var backgroundImage = null;

    var annotations = [
    ];

    draw();

    var functions = {
        draw: draw,
        setPan: setPan,
        setBackgroundImage: setBackgroundImage,
        translatePan: translatePan,
        setScale: setScale,
        translateScale: translateScale
    };

    return functions;

    function setPan (newPanX, newPanY) {
        $canvas.css("background-size", (width * scaleFactor) + "px " + (height * scaleFactor) + "px");
        panX = Math.max(Math.min(width * scaleFactor - $canvas.innerWidth(), newPanX), 0);
        panY = Math.max(Math.min(height * scaleFactor - $canvas.innerHeight(), newPanY), 0);
        console.log("Pan X", panX);
        if (opts.autoRepaint)
            draw();
    }

    function translateScale (translateScaleFactor) {
        setScale(scaleFactor + translateScaleFactor);
    }

    function setScale (newScaleFactor) {
        scaleFactor = Math.max(getMinScaleFactor(), newScaleFactor);
        if (opts.autoRepaint)
            draw();
        console.log("New Scale Factor", scaleFactor);
    }

    function getMinScaleFactor () {
        var minXScaleFactor = $canvas.width() / width;
        var minYScaleFactor = $canvas.height() / height;
        var minScaleFactor = Math.min(minXScaleFactor, minYScaleFactor);
        console.log("MinX: " + minXScaleFactor+" , MinY: " + minYScaleFactor);
        return minScaleFactor;
    }

    function translatePan (tX, tY) {
        setPan(panX + tX, panY + tY);
    }

    function setBackgroundImage (imgUrl)
    {
        $canvas.css("background-image", "url('" + imgUrl + "')");
    }

    function keepInBounds () {
        scaleFactor = Math.max(scaleFactor, getMinScaleFactor());
        panX = Math.max(Math.min(width * scaleFactor - $canvas.innerWidth(), panX), 0);
        panY = Math.max(Math.min(height * scaleFactor - $canvas.innerHeight(), panY), 0);
    }

    function draw() {
        keepInBounds();

        context.clearRect(0, 0, canvas.width, canvas.height);
        $canvas.css("background-position", -panX+"px " + -panY+"px");
        $canvas.css("background-size", (width * scaleFactor) + "px " + (height * scaleFactor) + "px");

        context.beginPath();

            context.fillStyle = "white";
            context.fillRect(100, 100, 50, 50);
            context.closePath();

        for (var i = 0; i < annotations.length; i++)
        {
            annotations[i].draw(context, panX, panY, scaleFactor, fontFamily);
        }
        context.translate(panX, panY);
        context.scale(scaleFactor, scaleFactor);
    }
}/**
 * Created by cody on 9/18/15.
 */

var TabeebDrawingExtensions = {
	/**
	 * @param {CanvasRenderingContext2D} context
	 * @param x
	 * @param y
	 * @param scaleFactor
	 * @param {TabeebAnnotation} annotation
	 */
	drawHighlighSquare: function (context, x, y, scaleFactor, annotation) {
		var width = 5 * scaleFactor;
		x -= width/4;
		y -= width/4;

		var color = annotation.selected == true ? (annotation.highlighted == true ? TabeebAnnotationOptions.selectedAndHighlightedColor : TabeebAnnotationOptions.selectedColor) : TabeebAnnotationOptions.highlightedColor;

		color = TabeebAnnotationOptions.highlightedColor;

		context.strokeStyle = color;
		context.lineWidth = 1;
		context.fillStyle = "white";

		context.fillRect(x, y, width, width);
		context.strokeRect(x, y, width, width);
	},

	/**
	 * @param {CanvasRenderingContext2D} context
	 * @param {Number} fontSize
	 * @param {String} fontFamily
	 * @param {String} text
	 * @param {Number} [scaleFactor]
	 */
	getSizeOfText: function (context, fontSize, fontFamily, text, scaleFactor) {
		if (!scaleFactor)
			scaleFactor = 1;

		context.save();

		context.textBaseline = "top";
		context.font = (fontSize * scaleFactor) + 'px' + fontFamily;

		var lines = text.split("\n");
		var width = 0;
		lines.forEach(function (line) {
			line += " ";
			width = Math.max(width, context.measureText(line).width);
		});
		context.restore();

		return {
			width: width,
			height: (fontSize * lines.length * 1.5) * scaleFactor
		};
	}
};/**
 * Created by cody on 7/2/15.
 */

/**
 * @type {{rectangleRectangle: Function, pointEllipse: Function, pointLine: Function, lineInCircle: Function}}
 */
var ShapeCollisions =
{
    /**
     * @param {{x:number, y:number, width: number, height: number}} rect1
     * @param {{x:number, y:number, width: number, height: number}} rect2
     * @returns {boolean}
     */
    rectangleRectangle: function (rect1, rect2)
    {
        if (rect1.width < 0 || rect1.height < 0 || rect2.width < 0 || rect2.height < 0)
            console.error("Negative width or height values will return false.");
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y
    },
    /**
     * @param {{x:number, y:number}} point
     * @param {{x:number, y:number, width:number, height:number}} ellipse
     * @returns {boolean}
     */
    pointEllipse: function (point, ellipse)
    {
        var xRadius = ellipse.width / 2;
        var yRadius = ellipse.height / 2;
        var leftSide = Math.pow(point.x - ellipse.x, 2) / Math.pow(xRadius,2);
        var rightSide = Math.pow(point.y - ellipse.y, 2) / Math.pow(yRadius, 2);
        var x = leftSide + rightSide;
        return x <= 1;
    },
    /**
     * @param {{x:number, y:number}} point
     * @param {{startX:number, startY:number, endX:number, endY:number}} line
     * @param {number} lineWidth (used for rectangle width)
     * @returns {boolean}
     */
    pointLine: function (point, line, lineWidth)
    {
        return this.lineInCircle(line.startX, line.startY, line.endX, line.endY, point.x, point.y, lineWidth);
    },

    /**
     * @param {number} sx
     * @param {number} sy
     * @param {number} x
     * @param {number} y
     * @param {number} cx
     * @param {number} cy
     * @param {number} radius
     * @returns {boolean}
     */
    lineInCircle: function (sx, sy, x, y, cx, cy, radius) {
        if (sx > cx + radius && x > cx + radius || x < cx - radius && sx < cx - radius) {return false;}
        if (sy > cy + radius && y > cy + radius || y < cy - radius && sy < cy - radius) {return false;}
        var k = ((y - sy) * (cx - sx) - (x - sx) * (cy - sy)) / ((y - sy) * (y - sy) + (x - sx) * (x - sx));
        var ncx = k * (y - sy);
        var ncy = k * (x - sx);
        var xx = Math.sqrt(ncx * ncx + ncy * ncy);
        return radius >= xx;
    }
};
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
};"use strict";

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
};'use strict';

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
};/**
 * Created by cody on 9/21/15.
 */

/**
 * @param {TabeebHUDService.defaults} options
 * @param {jQuery} $triggerElement
 * @param {jQuery} $pluginContainer
 * @param {TabeebAudioService} audioService
 * @constructor
 */
function TabeebAudioRecordingBar (options, $triggerElement, $pluginContainer, audioService) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $audioBar = null;
	/**@type {jQuery}*/
	var $volumeIndicator = null;
	/**@type {jQuery}*/
	var $recordingTime = null;
	/**@type {jQuery}*/
	var $navigationBar = null;
	/**@type {jQuery}*/
	var $micButton = null;
	/**@type {jQuery}*/
	var $drawModeButton = null;

	//</editor-fold>

	var service = {
		resize: resize
	};

	init();

	return service;

	///////////////////////////

	function init () {
		$audioBar = $pluginContainer.find(".tabeebAudioRecordingBar");
		$volumeIndicator = $audioBar.find(".tabeebVolumeIndicator");
		$recordingTime = $audioBar.find(".tabeebAudioRecordingTimer");
		$navigationBar = $pluginContainer.find(".tabeebNavigationBar");
		$micButton = $pluginContainer.find(".tabeebRecordingButton, .tabeebActivateRecordingBar");
		$drawModeButton = $pluginContainer.find(".tabeebDrawModeButton");

		resize();

		bindAudioEvents();
	}

	function bindAudioEvents () {
		var $audioService = $(audioService);

		$audioService.on(TabeebAudioService.AudioEvent.recordingVolumeChanged, onRecordingVolumeChanged);
		$audioService.on(TabeebAudioService.AudioEvent.recordingStarted, onRecordingStarted);
		$audioService.on(TabeebAudioService.AudioEvent.recordingFinished, onRecordingEnded);
		$audioService.on(TabeebAudioService.AudioEvent.recordingTimeUpdated, onRecordingTimeUpdated);
	}

	//<editor-fold name="Public Functions">

	function resize () {
		var $mediaContainer = $(".tabeebPluginMainArea");

		$audioBar.css({
			left: $mediaContainer.outerWidth() / 2 - $audioBar.outerWidth() / 2,
			bottom: "15px",
			width: $navigationBar.width()
		});

		if (!TabeebInputService.isTouchDevice())
		{
			//if ($pluginContainer.width() < 575)
			//{
			//	$micButton.css('left', $drawModeButton.css('left')).css('bottom', '');
			//}
			//
			//if ($pluginContainer.width() < 425)
			//{
			//	$micButton.css('bottom', 30 + $drawModeButton.height());
			//}
			//
			//if ($pluginContainer.width() >= 575)
			//{
			//	$micButton.css('left', '').css('bottom', '');
			//}
		}
	}

	//</editor-fold>

	//<editor-fold name="Audio Events">

	function onRecordingVolumeChanged (event) {
		var perc = event.volume;
		$volumeIndicator.css('width', perc + '%');
	}

	function onRecordingStarted (event) {
		if ($(".ui-dialog").is(":visible"))
			return;

		$micButton.addClass("active");

		$pluginContainer.addClass('tabeebRecording');
		resize();
	}

	function onRecordingEnded (event) {
		resize();
		$micButton.removeClass("active");
		$pluginContainer.removeClass('tabeebRecording');
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

	function onRecordingTimeUpdated (event) {
		var duration = event.currentTime;

		if (audioService.getState() == TabeebAudioService.RecordingState.Recording)
			$recordingTime.text(msToTime(duration * 1000));
		else
			$recordingTime.text('');
	}

	//</editor-fold>
}/**
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
}/**
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
};/**
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

}/**
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
}/**
 * Created by cody on 7/7/15.
 */

/**
 * @param {jQuery} $triggerElement
 * @param {TabeebCanvasService} canvasService
 * @param {TabeebAnnotationManager} annotationMgr
 * @param {jQuery} $undoButton
 * @param {jQuery} $redoButton
 * @class
 */
function TabeebUndoManager($triggerElement, canvasService, annotationMgr, $undoButton, $redoButton) {

    var operations = [];
    var operationIndex = -1;

    init();

    this.undo = function () {
        clickedUndoButton();
    };

    this.redo = function () {
        clickedRedoButton();
    };

    /**
     * Clears all operations.
     */
    this.clearBuffer = function () {
        operations = [];
        operationIndex = -1;
        updateButtonStates();
    };

    /** @param {number} annotationId */
    this.getLastOperationWithAnnotationId = function (annotationId) {
        for (var i = operations.length - 1; i >= 0; i--)
        {
            if(operations[i].annotation.id == annotationId)
                return operations[i];
        }
        return null;
    };

    /**
     * @returns {TabeebOperation}
     */
    this.getLastOperation = function () { console.log(operations); return operations[operationIndex]; };

    /**
     * @returns {Number}
     */
    this.getOperationCount = function () { return operations.length; };

    function init () {
        $triggerElement.on(TabeebOperationEvent.annotationAdded, onAnnotationAdded);
        $triggerElement.on(TabeebOperationEvent.annotationDeleted, onAnnotationDeleted);
        $triggerElement.on(TabeebOperationEvent.annotationUpdated, onAnnotationUpdated);
    }

    /** @param {Number} index */
    function setOperationIndex (index)
    {
        operationIndex = index;
    }

    /** @param {{oldAnnotationData:TabeebAnnotation,newAnnotationData:TabeebAnnotation}} e */
    function onAnnotationUpdated (e) {
        if (e.oldAnnotationData.type == TabeebAnnotationType.Audio && annotation.parentId == null)
            return;

        addOperation(new TabeebUpdateAnnotationOperation(e.oldAnnotationData, e.newAnnotationData));
        updateButtonStates();
    }

    /** @param {{annotation:TabeebAnnotation}} e */
    function onAnnotationAdded (e) {
        var annotation = e.annotation;
        if (annotation.type != TabeebAnnotationType.Audio && annotation.parentId == null)
            addOperation(new TabeebAddAnnotationOperation(annotation));
        updateButtonStates();
    }

    /** @param {{annotation:TabeebAnnotation}} e */
    function onAnnotationDeleted (e) {
        var annotation = e.annotation;

        if (!annotation)
            console.warn("Unable to find annotation");

        if (annotation.type != TabeebAnnotationType.Audio && annotation.parentId == null)
            addOperation(new TabeebDeleteAnnotationOperation(annotation));
        updateButtonStates();
    }

    /** @param {{annotation:TabeebAnnotation, oldLocation:Object, newLocation:Object}} e */
    function onAnnotationPositionUpdated (e) {
        var annotation = e.annotation;
        var oldLocation = e.oldLocation;
        var newLocation = e.newLocation;
        addOperation(new TabeebMoveAnnotationOperation(annotation, oldLocation, newLocation));
        updateButtonStates();
    }

    /** @param {TabeebOperation} operation */
    function addOperation (operation)
    {
        var lastOperation = operations[operationIndex];
        // Don't add operation if it is exactly the same as the previous
        if (lastOperation != null && lastOperation.equals(operation))
        {
            console.info("Not Adding Duplicate Operation");
            return;
        }

        setOperationIndex(operationIndex+1);
        operations.splice(operationIndex, operations.length);
        operations.push(operation);
        updateButtonStates();
    }

    /** @param {number} index */
    function callUndoOperation (index)
    {
        if (index == null) index = operationIndex;
        operations[index].undo($triggerElement, canvasService, annotationMgr);
        canvasService.redrawAnnotations();
    }

    /** @param {number} index */
    function callRedoOperation (index)
    {
        if (index == null) index = operationIndex;
        operations[index].redo($triggerElement, canvasService, annotationMgr);
        canvasService.redrawAnnotations();
    }

    function clickedUndoButton () {
        if ($undoButton.hasClass("disabled")) return;

        callUndoOperation();
        setOperationIndex(operationIndex-1);
        updateButtonStates();
    }

    function clickedRedoButton () {
        if ($redoButton.hasClass("disabled")) return;

        setOperationIndex(operationIndex+1);
        callRedoOperation();
        updateButtonStates();
    }

    function updateButtonStates () {
        if (operationIndex + 1 < operations.length)
            $redoButton.removeClass("disabled");
        else
            $redoButton.addClass("disabled");

        if (operationIndex >= 0)
            $undoButton.removeClass("disabled");
        else
            $undoButton.addClass("disabled");
    }

    updateButtonStates();
}

/**
 * @param {TabeebAnnotation} annotation
 * @class
 * @property {string} action
 * @property {TabeebAnnotation} annotation
 */
function TabeebOperation(annotation) {
    this.action = null;
    /**
     * @param {TabeebAnnotation} annotation
     */
    this.init = function (annotation) {
        if (annotation == null)
        {
            console.error("Null annotation was passed through.");
        }
        // Used as data, not reference
        this.annotation = $.extend(true, {}, annotation);
        this.data = {};
    };
    /**
     * @param {jQuery} $triggerElement
     * @param {TabeebCanvasService} canvasService
     * @param {TabeebAnnotationManager} annotationMgr
     */
    this.redo = function ($triggerElement, canvasService, annotationMgr) { console.error("Not implemented.", this); };
    /**
     * @param $triggerElement
     * @param {TabeebCanvasService} canvasService
     * @param {TabeebAnnotationManager} annotationMgr
     */
    this.undo = function ($triggerElement, canvasService, annotationMgr) { console.error("Not implemented", this); };
    /**
     * @param {TabeebOperation} operation
     * @returns {boolean}
     */
    this.equals = function (operation) {
        return this.action == operation.action && this.annotation.id == operation.annotation.id && JSON.stringify(this.data) === JSON.stringify(operation.data);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @constructor
 * @extends TabeebOperation
 */
function TabeebAddAnnotationOperation(annotation) {
    this.init(annotation);
    this.action = "add";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.remove(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationDeleted, this.annotation);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.add(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationRestored, this.annotation);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @constructor
 * @extends TabeebOperation
 */
function TabeebDeleteAnnotationOperation(annotation) {
    this.init(annotation);
    this.action = "delete";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.add(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationRestored, this.annotation);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        annotationMgr.remove(this.annotation);
        $triggerElement.trigger(TabeebEvent.annotationDeleted, this.annotation);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @param {object} oldLocation
 * @param {object} newLocation
 * @constructor
 * @extends TabeebOperation
 */
function TabeebMoveAnnotationOperation(annotation, oldLocation, newLocation) {
    this.init(annotation);
    this.data = {
        oldLocation: $.extend({}, oldLocation),
        newLocation: $.extend({}, newLocation)
    };
    console.log("CREATIGN");
    this.printDebugMessage = function () {
        console.log("Old Location", JSON.stringify(this.data.oldLocation));
        console.log("New Location", JSON.stringify(this.data.newLocation));
    };
    this.printDebugMessage();
    this.action = "move";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setCoordinates(this.data.oldLocation);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
        this.printDebugMessage();
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setCoordinates(this.data.newLocation);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
        this.printDebugMessage();
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @param {{color:string,width:number}} newAttribute
 * @param {{color:string,width:number}} oldAttribute
 * @constructor
 * @extends TabeebOperation
 */
function TabeebEditAnnotationStrokeOperation(annotation, newAttribute, oldAttribute) {
    this.init(annotation);
    this.action = "edit";
    this.annotation.setStrokeAttributes(this.data);
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setStrokeAttributes(oldAttribute);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.setStrokeAttributes(newAttribute);
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [this.annotation]});
        $triggerElement.trigger(event);
    };
}

/**
 * @param {TabeebAnnotation} annotation
 * @param {string} oldText
 * @param {string} newText
 * @constructor
 * @extends TabeebOperation
 */
function TabeebEditTextAnnotation(annotation, oldText, newText) {
    this.init(annotation);
    this.action = "textedit";
    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.textInfo.text = oldText;
        annotationMgr.find(this.annotation).textInfo.text = oldText;
        console.info("Changing text to: " + oldText);
        triggerEvent($triggerElement, annotation);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        this.annotation.textInfo.text = newText;
        annotationMgr.find(this.annotation).textInfo.text = newText;
        console.info("Changing text to: " + newText);
        triggerEvent($triggerElement, annotation);
    };
}

/**
 * @param {TabeebAnnotation} oldAnnotationData
 * @param {TabeebAnnotation} newAnnotationData
 * @constructor
 * @extends TabeebOperation
 */
function TabeebUpdateAnnotationOperation (oldAnnotationData, newAnnotationData) {
    this.annotation = {};
    this.action = "update";

    this.undo = function ($triggerElement, canvasService, annotationMgr) {
        var annotation = annotationMgr.find(oldAnnotationData.id);
        $.extend(annotation, oldAnnotationData);
        triggerEvent($triggerElement, oldAnnotationData);
    };
    this.redo = function ($triggerElement, canvasService, annotationMgr) {
        var annotation = annotationMgr.find(oldAnnotationData.id);
        $.extend(annotation, newAnnotationData);
        triggerEvent($triggerElement, newAnnotationData);
    };
    /**
     * @param {jQuery} $triggerElement
     * @param {TabeebAnnotation} annotation
     */
    function triggerEvent ($triggerElement, annotation)
    {
        var event = $.Event(TabeebEvent.annotationsUpdated, {annotations: [annotation]});
        $triggerElement.trigger(event);
    }
    this.equals = function (operation) {
        return false;
    }
}

TabeebAddAnnotationOperation.inheritsFrom(TabeebOperation);
TabeebDeleteAnnotationOperation.inheritsFrom(TabeebOperation);
TabeebMoveAnnotationOperation.inheritsFrom(TabeebOperation);
TabeebEditTextAnnotation.inheritsFrom(TabeebOperation);
TabeebEditAnnotationStrokeOperation.inheritsFrom(TabeebOperation);
TabeebUpdateAnnotationOperation.inheritsFrom(TabeebOperation);

/**
 * @readonly
 * @enum {string}
 */
var TabeebOperationEvent = {
    annotationAdded: "annotationAddedUM",
    annotationDeleted: "annotationDeletedUM",
    annotationMoved: "annotationMovedUM",
    annotationEdited: "annotationEditedUM",
    annotationUpdated: "annotationUpdatedUM"
};
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
/**
 * Created by cody on 9/25/15.
 */

/**
 * @param {String} pluginBaseUrl
 * @param {jQuery} $pluginContainer
 * @param {jQuery} $pluginTriggerElement
 * @param {TabeebModules} modules
 * @param {TabeebSidebarService.defaults} optionsIn
 * @constructor
 */
function TabeebSidebarService (pluginBaseUrl, $pluginContainer, $pluginTriggerElement, modules, optionsIn) {

	//<editor-fold name="Variables">

	/**@type {TabeebSidebarService.defaults}*/
	var options = $.extend(TabeebSidebarService.defaults, optionsIn.sidebarOptions); // Make own (deep) copy
	/**@type {jQuery}*/
	var $sidebar = null;
	var selectedTab = options.defaultTab;

	var socialTab = null;
	var activitiesPanel = null;

	var loaded = false;

	//</editor-fold>

	var service = {
		resize: resize,
		getWidth: getWidth,
		setSelectedTab: setSelectedTab,
		dispose: dispose,
		toggle: toggle,
		isActive: shouldBeSideBySideWithCanvas
	};

	init();

	return service;

	//<editor-fold name="Initialization">

	function init () {
		$sidebar = $pluginContainer.find(".tabeebSidebarContainer");

		if (TabeebInputService.isTouchDevice())
		{
			options.width = options.mobileWidth;
		}

		$sidebar.load(pluginBaseUrl + 'sidebar/tabeebSidebar.html', onHTMLLoaded);

		if (options.enabled === false)
			return;

		bindEvents();
	}

	function onHTMLLoaded () {
		loaded = true;
		socialTab = new TabeebSocialTab($sidebar, $pluginTriggerElement, modules);
		activitiesPanel = new TabeebActivitesPanel($sidebar, $pluginTriggerElement, modules);
		modules.socialTab = socialTab;
		modules.activitiesService = activitiesPanel;
		setSelectedTab(options.defaultTab);

		$sidebar.find("[data-tab-change]").on("click", onTabChangeClick);
	}

	function bindEvents () {
		$(modules.presenterManager).on(TabeebPresenterManager.Events.presentationStarted + ' ' + TabeebPresenterManager.Events.presentationEnded, onPresentationEvent);
	}

	//<//editor-fold>

	//<editor-fold name="Public Methods">

	function toggle () {
		if (shouldBeSideBySideWithCanvas())
		{
			$pluginContainer.removeClass("sidebar");
		}
		else
		{
			$pluginContainer.toggleClass("sidebar");
		}
		resize();
	}

	function dispose () {
		if (socialTab)
			socialTab.dispose();
	}

	function resize () {
		if (!loaded)
			return;

		$sidebar.css({
			'min-width': options.minWidth + 'px',
			'width': options.width + 'px'
		});

		if (shouldBeSideBySideWithCanvas())
		{
			$pluginContainer.removeClass("sidebar");
			$sidebar.show();
		}
		else
		{
			$sidebar.hide();
		}
		if (socialTab)
			socialTab.resize();
		if (activitiesPanel)
			activitiesPanel.resize();
	}

	function getWidth () {
		if (options.enabled && $sidebar.is(":visible"))
			return parseFloat($sidebar.width());
		else
			return 0;
	}

	function setSelectedTab (tab) {
		var oldSelectedTab = selectedTab;
		selectedTab = tab;
		$sidebar.attr('data-tab', tab);
		var $tab = $sidebar.find(".tabeebSidebarTab[data-tab-name='" + tab + "']");
		if ($tab.length == 0)
		{
			console.warn("Unable to find tab", tab);
			return
		}
		$sidebar.find(".tabeebSidebarTab").hide();
		$tab.show();
		resize();
	}

	//</editor-fold>

	//<editor-fold name="Events">

	function onTabChangeClick (event) {
		var $this = $(this);
		var tabName = $this.attr("data-tab-change");
		setSelectedTab(tabName);
	}

	function onPresentationEvent () {
		resize();
		setSelectedTab("social");
	}

	//</editor-fold>

	/**
	 * @returns {boolean}
	 */
	function shouldBeSideBySideWithCanvas () {
		var pluginContainerWidth = parseInt($pluginContainer.width());
		var requiredPluginWidth = options.width * options.widthRatioRequiredToBeVisible;
		return (pluginContainerWidth >= requiredPluginWidth);
	}
}

TabeebSidebarService.defaults = {
	//defaultTab: 'activities',
	defaultTab: 'social',
	enabled: true,
	width: 400,
	mobileWidth: 350, //will usually apply to ipad landscape
	minWidth: 300,
	widthRatioRequiredToBeVisible: 2.5 // 3 * defaults.width
};

TabeebSidebarService.Events = {
	selectedTabChanged: "tabchange"
};/**
 * Created by cody on 10/13/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebModules} modules
 * @constructor
 */
function TabeebActivitesPanel ($sideBar, $triggerElement, modules) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $header = null;
	/**@type {jQuery}*/
	var $userFilter = null;
	/**@type {jQuery}*/
	var $userFilterList = null;

	//</editor-fold>

	var service = {
		resize: resize,
		focusOnAnnotation: focusOnAnnotation
	};

	init();

	return service;

	/////////////////////

	function init () {
		$panel = $sideBar.find(".tabeebActivitiesPanel");
		$header = $sideBar.find(".tabeebActivitiesHeader");
		$userFilter = $header.find(".tabeebActivitiesUserFilter");
		$userFilterList = $userFilter.find(".tabeebActivitiesFilterList");

		bindEvents();
	}

	function bindEvents () {
		var $annotationMgr = $(modules.globalAnnotationManager);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationAdded, onAnnotationAdded);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationRemoved, onAnnotationRemoved);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationsCleared, onAnnotationsCleared);
		$annotationMgr.on(TabeebAnnotationManager.Events.annotationUpdated, onAnnotationUpdated);
		$triggerElement.on(TabeebEvent.contentDisplayed, onContentDisplayed);

		var $userMgr = $(modules.userManager);
		$userMgr.on(TabeebUserManager.Events.userAdded, onUserAdded);

		$panel.on("click", ".tabeebActivityItem", onActivityItemClicked);
		$header.find(".tabeebCurrentPageButton").on("click", onCurrentPageButtonClicked);
		$header.find(".tabeebAllPagesButton").on("click", onAllPageButtonClicked);
		$userFilterList.on("click", "li", onUserFilterItemClicked);
		$panel.on("input click", ".tabeebActivitiesLockedControls *", onAnnotationLockInputClicked);
		$panel.on("click", ".tabeebToggleHiddenControls input", onToggleHiddenButtonClicked);
	}

	//<editor-fold name="Public Methods">

	function resize () {
		var maxHeight = $sideBar.parent().height();
		maxHeight -= $header.height();
		maxHeight -= 5;
		$panel.css("max-height", maxHeight);
	}

	function focusOnAnnotation (annotationId) {
		onActivityItemClicked(null, annotationId);
	}

	//</editor-fold>

	//<editor-fold name="Events">

	function onContentDisplayed (event) {
		applyFilter();
	}

	function onAnnotationLockInputClicked (event) {
		var $this = $(this);
		console.log("Locking ann");
		var annotationId = $this.parents(".tabeebActivityItem").attr("data-annotation-id");
		modules.annotationManager.setAnnotationLocked(annotationId, $this.is(":checked"));
		modules.globalAnnotationManager.setAnnotationLocked(annotationId, $this.is(":checked"));
		event.stopPropagation();
	}

	function onToggleHiddenButtonClicked () {
		var $this = $(this);

		var isChecked = $this.is(":checked");
		console.log("Hiding annotation", isChecked);
		var annotationId = $this.parents(".tabeebActivityItem").attr("data-annotation-id");
		modules.annotationManager.setAnnotationHidden(annotationId, isChecked);
		modules.globalAnnotationManager.setAnnotationHidden(annotationId, isChecked);
		event.stopPropagation();
	}

	function onUserFilterItemClicked () {
		var $this = $(this);
		var userId = $this.attr("data-userid");

		var $button = $userFilter.find("button");
		$button.html($this.text()).append(' <span class="caret"></span>');
		if (!userId)
			$button.removeAttr("data-userid");
		else
			$button.attr("data-userid", userId);
		applyFilter();
	}

	function onUserAdded (event) {
		/**@type {TabeebUser}*/
		var user = event.user;

		$userFilterList.append('<li data-userid="' + user.id + '"><a>' + user.displayName + '</a></li>');
	}

	function hideOtherPageActivities () {
		$panel.find(".tabeebActivityItem").each(function (index, item) {
			var $item = $(item);
			var annotationId = $item.attr("data-annotation-id");
			var annotation = modules.globalAnnotationManager.find(annotationId);
			var currentPage = modules.player.currentSlideIndex + 1;
			if (annotation.pageNumber != currentPage)
				$item.hide();
			else
				$item.show();
		});
	}

	function onCurrentPageButtonClicked () {
		if ($(this).hasClass("active")) return;
		$header.find(".tabeebAllPagesButton").removeClass("active");
		$(this).addClass("active");
		applyFilter();
	}

	function onAllPageButtonClicked () {
		if ($(this).hasClass("active")) return;
		$header.find(".tabeebCurrentPageButton").removeClass("active");
		$(this).addClass("active");
		applyFilter();
	}

	function onActivityItemClicked (event, annId) {
		var annotationId = annId == null ? $(this).attr("data-annotation-id") : annId;
		var annotation = modules.annotationManager.find(annotationId);
		if (annotation.hidden === true)
		{
			modules.player.selectAnnotation(annotationId);
		}
		else
		{
			modules.annotationManager.setAnnotationHidden(annotationId, true);
		}
	}

	//</editor-fold>

	//<editor-fold name="Annotation Events">

	function onAnnotationUpdated (event) {
		var annotation = event.annotation;
		var $container = getContainerByAnnotationId(annotation.id);
		$container.find(".tabeebActivitiesPageNumber").text("Page " + annotation.pageNumber);
		applyFilter();
	}

	function onAnnotationsCleared () {
		$panel.children().remove();
	}

	function onAnnotationAdded (event) {
		var annotation = event.annotation;
		var $html = $(createHTMLForAnnotation(annotation));
		$html.css("display", "none");
		$panel.prepend($html);
		applyFilter();
		if ($html.is(":visible"))
			$html.hide().show("blind");
	}

	function onAnnotationRemoved (event) {
		var annotation = event.annotation;

		var $container = getContainerByAnnotationId(annotation.id);
		if ($container.is(":visible"))
		{
			$container.hide("blind", null, function () {
				$container.remove();
			});
		}
		else
		{
			$container.remove();
		}
	}

	//</editor-fold>

	/**
	 * @param {String} annotationId
	 * @returns {jQuery}
	 */
	function getContainerByAnnotationId (annotationId) {
		return $panel.find("[data-annotation-id='" + annotationId + "']");
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @returns {string}
	 */
	function createHotspotCommentHTML (annotation) {
		var html = '';
		html += '<div class="tabeebActivitiesAlignWithAvatar tabeebPreviewMessage">';
		if (annotation.type == TabeebAnnotationType.Text)
		{
			/**@type {String}*/
			var text = TabeebPlayerUtil.escapeHtml(annotation.textInfo.text);
			if (text.length > 150)
				html += text.substring(0, 150) + "...";
			else
				html += text;
		}
		else if (annotation.type == TabeebAnnotationType.Audio)
		{
			html += createAudioPlayButtonHTML(annotation);
		}
		html += '</div>';
		return html;
	}

	function createAudioPlayButtonHTML (annotation) {
		return '<span class="tabeebActivitiesPlayButton icon-play"></span>' + '<span style="color: white;">' + formatSeconds(annotation.duration / 1000) + '</span>';
	}

	function isHotspotComment (annotation) {
		return annotation.parentId && (annotation.type == TabeebAnnotationType.Text || annotation.type == TabeebAnnotationType.Audio);
	}

	function formatSeconds (seconds) {
		var date = new Date(1970, 0, 1);
		date.setSeconds(seconds);
		return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
	}

	function getUserIdFilter () {
		return $userFilter.find("button").attr("data-userid");
	}

	function applyFilter () {
		var userId = getUserIdFilter();
		var $items = $panel.find(".tabeebActivityItem");
		var allPages = $header.find(".tabeebAllPagesButton").hasClass("active");

		if (!userId)
		{
			$items.show();
			if (!allPages)
				hideOtherPageActivities();
		}
		else
		{
			$items.each(function (index, item) {
				var $item = $(item);
				var userId2 = $item.attr("data-userid");

				if (userId2 == userId)
				{
					if (allPages)
						$item.show();
					else
					{
						var annotationId = $item.attr("data-annotation-id");
						var annotation = modules.globalAnnotationManager.find(annotationId);
						if (annotation.pageNumber == modules.player.currentSlideIndex + 1)
							$item.show();
						else
							$item.hide();
					}
				}
				else
					$item.hide();
			});
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @returns {string}
	 */
	function getMessageForAnnotation (annotation) {
		if (annotation.type == TabeebAnnotationType.Hotspot)
		{
			if (annotation.timestamp >= 0)
				return 'added a Hotspot.<br>@' + formatSeconds(annotation.timestamp);
			else
				return 'added a Hotspot.';
		}
		if (isHotspotComment(annotation))
		{
			if (annotation.type == TabeebAnnotationType.Text)
				return 'commented on a Hotspot.';
			else if (annotation.type == TabeebAnnotationType.Audio)
				return 'left a voice message on a Hotspot.';
		}
		else if (annotation.type == TabeebAnnotationType.Audio)
			return 'added an audio annotation.';
		else
		{
			if (annotation.timestamp >= 0)
				return 'added a timed annotation.<br>@' + formatSeconds(annotation.timestamp);
			else
				return 'added an annotation.';
		}
	}

	/**
	 * @param {TabeebAnnotation} annotation
	 * @returns {string}
	 */
	function createHTMLForAnnotation (annotation) {
		var user = modules.userManager.find(annotation.layerId);

		if (annotation.type == TabeebAnnotationType.ErasedStroke)
			return '';

		var html = '<li class="tabeebActivityItem" data-userid="' + user.id + '" data-annotation-id="' + annotation.id + '">';

		html += '<div class="tabeebActivitiesMessage">';
		html += '<div class="tabeebFlex">';

		if (user.avatarUrl && user.avatarUrl.length > 0)
			html += '<img class="tabeebRoundedUserAvatar" src="' + user.avatarUrl + '" />';
		else
			html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).addClass("tabeebRoundedUSerAvatar")[0].outerHTML;

		html += user.displayName + ' ' + getMessageForAnnotation(annotation);
		html += '</div>';

		if (isHotspotComment(annotation))
		{
			html += createHotspotCommentHTML(annotation)
		}
		else if (annotation.type == TabeebAnnotationType.Audio)
		{
			html += '<div class="tabeebActivitiesAlignWithAvatar">';
			html += createAudioPlayButtonHTML(annotation);
			html += '</div>';
		}

		html += '</div>';

		//TODO: Implement this when timing is appropriate
		var color = annotation.getColor ? annotation.getColor() : null;
		if (color && color.length > 0)
		{
			// Not currently a requested feature, but makes it easier to find the annotation you want
			//html += '<div class="tabeebActivitiesLockedControls"><div class="tabeebPaletteColor" style="background-color: ' + color + ';"></div><input type="checkbox" /><span class="glyphicon glyphicon-lock"></span></div>';
			//html += '<div>' + annotation.id + '</div>';
			//html += '<div class="tabeebToggleHiddenControls"><input type="checkbox" /><span class="glyphicon glyphicon-eye-open"></span></div>';

			html += '<div class="tabeebActivitiesLockedControls"><input type="checkbox" /><span class="glyphicon glyphicon-lock"></span></div>';
		}

		html += '<div class="tabeebActivitiesPageNumber">' + 'Page ' + annotation.pageNumber + '</div>';

		var date = TabeebPlayerUtil.convertDateToString(annotation.dateCreated);

		function isToday (date) {
			var d = new Date();
			return date.getDate() == d.getDate() && date.getMonth() == d.getMonth() && date.getFullYear() == d.getFullYear();
		}

		if (isToday(annotation.dateCreated))
			html += '<div class="tabeebDateTime">' + date + '<span class="tabeebTodayIndicator"></span>';
		else
			html += '<div class="tabeebDateTime">' + date + '</div>';

		html += '</li>';
		return html;
	}
}/**
 * Created by cody on 9/28/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebChatManager} chatMgr
 * @param {TabeebUserManager} userMgr
 * @constructor
 */
function TabeebChatPanel ($sideBar, $triggerElement, userMgr, chatMgr) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $chatMessageContainer = null;
	/**@type {jQuery}*/
	var $textInput = null;
	var $header = null;

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	function init () {
		$panel = $sideBar.find(".tabeebChatPanel");
		$chatMessageContainer = $sideBar.find(".tabeebChatMessagesContainer");
		$textInput = $sideBar.find(".chatMessageInput");
		$header = $panel.find(".tabeebChatPanelHeader");
		$(chatMgr).on(TabeebChatManager.Events.messageAdded, onChatMessageAdded);
		$(chatMgr).on(TabeebChatManager.Events.messagesAdded, onChatMessagesAdded);
		$(chatMgr).on(TabeebChatManager.Events.messagesCleared, onChatMessagesCleared);
		$textInput.on('keypress', onKeyPress);
		resize();
	}

	//<editor-fold name="Public Methods">

	function dispose () {

	}

	function resize () {
		var availableHeight = parseFloat($chatMessageContainer.parent().height()) - parseFloat($textInput.outerHeight()) - 12;
		var headerHeight = parseFloat($header.outerHeight());
		availableHeight -= headerHeight;

		$chatMessageContainer.css('max-height', availableHeight);
	}

	//</editor-fold>

	function onKeyPress (event) {
		if (event.which == 13)
		{ // ENTER key
			$triggerElement.trigger($.Event(TabeebChatPanel.Events.sendChatMessage, {text: $textInput.val()}));
			$textInput.val('');
			event.preventDefault();
		}
	}

	function scrollToBottom () {
		$chatMessageContainer.animate({'scroll-top': $chatMessageContainer[0].scrollHeight}, 'fast');
	}

	function removeDuplicateDates () {
		var $dates = $chatMessageContainer.find(".tabeebDateTime");
		if ($dates.length >= 2)
		{
			var $date1 = $($dates[$dates.length - 1]);
			var $date2 = $($dates[$dates.length - 2]);

			if ($date1.text() == $date2.text())
				$date1.remove();
		}
	}

	/**
	 * @param {TabeebChatMessage} chatMessage
	 */
	function addChatMessage (chatMessage) {
		var $message = $(createHTMLForChatMessage(chatMessage));
		$chatMessageContainer.append($message);
		removeDuplicateDates();
	}

	function onChatMessageAdded (event) {
		/**@type {TabeebChatMessage}*/
		var chatMessage = event.message;
		addChatMessage(chatMessage);

		removeDuplicateDates();
		scrollToBottom();
	}

	function onChatMessagesAdded (event) {
		/**@type {Array.<TabeebChatMessage>}*/
		var chatMessages = event.messages;
		chatMessages.forEach(function (msg) { addChatMessage(msg); });

		removeDuplicateDates();
		setTimeout(function () {
			scrollToBottom();
		}, 150);
	}

	function onChatMessagesCleared () {
		$chatMessageContainer.children().remove();
	}

	/**
	 * @param {Date} date
	 */
	function convertDateToString (date) {
		if (typeof(date) === 'string')
			date = new Date(date);

		var now = new Date();
		if (now.toDateString() == date.toDateString())
		{
			return date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute: '2-digit'}) + ", today";
		}
		else
		{
			return date.toLocaleDateString();
		}
	}

	/**
	 * @param {TabeebChatMessage} chatMessage
	 */
	function createHTMLForChatMessage (chatMessage) {
		var html = '';
		var dateString = convertDateToString(chatMessage.timeStamp);
		html += '<li class="tabeebDateTime">' + dateString + '</li>';
		html += '<li class="tabeebChatMessage">';
		var user = userMgr.find(chatMessage.userId);
		var avatarUrl = user.avatarUrl;
		if (avatarUrl && avatarUrl.length > 0)
			html += '<div class="tabeebAvatar"><img src="' + avatarUrl + '" /></div>';
		else
			html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).addClass("tabeebAvatar")[0].outerHTML;
		html += '<div class="tabeebChatMessageText"> ' + TabeebPlayerUtil.escapeHtml(chatMessage.message) + '<br><div class="tabeebChatName">- ' + user.displayName + '</div></div>';
		html += '</li>';
		return html;
	}
}

TabeebChatPanel.Events = {
	sendChatMessage: "sendChatMessage"
};/**
 * Created by cody on 9/28/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebUserManager} userMgr
 * @param {TabeebPresenterManager} presentationMgr
 * @constructor
 */
function TabeebPresentationPanel ($sideBar, $triggerElement, userMgr, presentationMgr) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $presenterContainer = null;
	/**@type {jQuery}*/
	var $presenterName = null;

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	////////////////////////////

	function init () {
		$panel = $sideBar.find(".tabeebPresentationPanel");
		$presenterContainer = $panel.find(".tabeebPresenterUserContainer");
		$presenterName = $panel.find(".tabeebPresenterName");

		if (presentationMgr.currentlyInPresentation())
			onPresentationStarted();

		bindEvents();

		var $indicators = $panel.find(".tabeebAudioIndicator, .tabeebVideoIndicator");
		$indicators.hide();
	}

	function bindEvents () {
		$(presentationMgr).on(TabeebPresenterManager.Events.presentationStarted, onPresentationStarted);
		$(presentationMgr).on(TabeebPresenterManager.Events.presentationEnded, onPresentationEnded);
		$(presentationMgr).on(TabeebPresenterManager.Events.presenterChanged, onPresenterChanged);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantVideoMuteChange, onVideoMuteChange);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantAudioMuteChange, onAudioMuteChange);
		$(presentationMgr).on(TabeebPresenterManager.Events.largeVideoToggled, onLargeVideoToggled);

		$(userMgr).on(TabeebUserManager.Events.userMuteChanged, onUserMuteChanged);

		$sideBar.on("click", ".tabeebCallButton", onConnectButtonClicked);
		$sideBar.on("click", ".tabeebChangePresenterButton", onChangePresenterButtonClicked);
		$panel.find(".tabeebEndCallButton").on("click", onEndCallButtonClicked);
		$panel.find(".tabeebToggleAudioButton").on("click", onToggleAudioButtonClicked);
		$panel.find(".tabeebToggleVideoButton").on("click", onToggleVideoButtonClicked);
		$panel.find(".tabeebMuteAllAudio").on("click", onMuteAllAudioClicked);
		$panel.find(".tabeebMuteAllVideo").on("click", onMuteAllVideoClicked);
		$panel.find(".tabeebShareScreenButton").on("click", presentationMgr.toggleScreenShare);
		$panel.find(".tabeebToggleMuteButton").on("click", onPresenterToggleOwnStrokesClicked);
		$sideBar.on("click", ".tabeebToggleMuteAudioButton", onTabeebToggleMuteAudioButtonClicked);
	}

	//<editor-fold name="Public Methods">

	function dispose () {

	}

	function resize () {
		var availableHeight = parseFloat($panel.innerHeight());
		availableHeight -= parseFloat($panel.find(".tabeebControls").outerHeight());
		availableHeight -= parseFloat($panel.find(".tabeebPresenterBottomControls").innerHeight());
		availableHeight -= 15; //padding
		$presenterContainer.height(availableHeight);
		positionPresenterName();
	}

	//</editor-fold>

	function positionPresenterName () {
		var $presenterVideo = getPresenterVideo();

		var videoWidth = $presenterVideo.innerWidth();
		var videoHeight = $presenterVideo.innerHeight();
		var bottom = 0;

		if (videoWidth * (9 / 16) > videoHeight) //constrained by height
		{
			videoWidth = videoHeight * (16 / 9);
			$presenterName.css("top", videoHeight - 4);
		}
		else //constrained by width
		{
			if ($presenterVideo.is("object"))
			{
				videoHeight = videoWidth * (9/16);
				var top = videoHeight - 4;
				top += ($presenterVideo.height() - videoHeight)/2;
				$presenterName.css("top", top);
			}
			else
			{
				$presenterName.css("bottom", "");
			}
		}

		var containerWidth = $presenterName.parent().innerWidth();
		$presenterName.css({
			"left": (containerWidth - videoWidth)/2
		});
	}

	function getDisplayName (displayName) {
		return displayName.length <= 9 ? displayName : displayName.substring(0, 6) + '...';
	}

	function getUserContainerById (userId) {
		if (presentationMgr.getPresenterId() == userId)
			return $panel;
		else
			return $sideBar.find(".tabeebUserContainer[data-id='" + userId + "']")
	}

	//<editor-fold name="Events">

	function onMuteAllAudioClicked () {
		userMgr.users.forEach(function (user) {
			if (user.id == presentationMgr.getPresenterId())
				return;

			var $container = getUserContainerById(user.id);
			if ($container.hasClass("audioMuted"))
				return;

			$container.find(".tabeebToggleMuteAudioButton").click();
		});
	}

	function onMuteAllVideoClicked () {
		console.warn("Not implemented");
	}

	function onPresenterToggleOwnStrokesClicked () {
		userMgr.setMuted(presentationMgr.getPresenterId(), !$(this).hasClass("disabled"))
	}

	function getAvatarElement ($container) {
		var imgSrc = $container.find(".tabeebUserAvatar").attr("src");
		if (imgSrc == null || imgSrc.length == 0)
		{
			return $container.find(".tabeebBlankAvatar");
		}
		else
		{
			return $container.find(".tabeebUserAvatar");
		}
	}

	function onVideoMuteChange (event) {
		var userId = event.userId;
		var videoOn = event.videoOn;

		if (!TabeebConnect.clientCanConnect())
		{
			console.warn("Not adding video class since they can't connect");
			videoOn = false;
		}

		var $container = getUserContainerById(userId);
		var $video = $container.find("video, object");
		var $avatar = getAvatarElement($container);


		console.log("Video Mute Change", event);

		if (videoOn === true)
		{
			$avatar.hide().css("height", $video.height());
			$container.addClass("video");
			$container.find("video, object").show();
			$container.find(".tabeebVideoIndicator").css({
				"background": "",
				"color": ""
			});
			console.log("Settings to normal", $avatar);
		}
		else
		{
			$container.removeClass("video");
			if ($video.height() > 0)
				$avatar.show().css("height", $video.height());
			$container.find("video, object").hide();

			console.log("Settings to gray and white", $avatar);

			$container.find(".tabeebVideoIndicator").css({
				"background": "gray",
				"color": "white"
			});
		}
		$container.find(".tabeebBlankAvatar").css("height", "");

		var user = userMgr.find(userId);
		console.log(user.displayName + " turned their video to", videoOn);
		positionPresenterName();
	}

	function onLargeVideoToggled (event) {
		var isVisible = event.active;
		if (isVisible)
		{
			$panel.find(".tabeebVideoIndicator").hide();
			$panel.find(".tabeebShareIndicatorText").text("Share Document");
		}
		else
		{
			$panel.find(".tabeebVideoIndicator").show();
			$panel.find(".tabeebShareIndicatorText").text("Share Screen");
		}
		positionPresenterName();
	}

	function onAudioMuteChange (event) {
		var userId = event.userId;
		var audioOn = event.audioOn;
		var $container = getUserContainerById(userId);
		if (audioOn)
		{
			$container.addClass("audio");
			$container.find(".tabeebAudioIndicator").css({
				"background": "",
				"color": ""
			});
		}
		else
		{
			$container.removeClass("audio");
			$container.find(".tabeebAudioIndicator").css({
				"background": "gray",
				"color": "white"
			});
		}

		var user = userMgr.find(userId);
		console.log(user.displayName + " turned their audio to", audioOn);
	}

	function togglePresenterAvatarVisibile (flag) {
		$presenterContainer.find("img, .tabeebBlankAvatar").hide();
		if (flag === true) {

		}
		else if (flag === false) {

		}
		else {

		}
	}

	function onPresenterChanged (event) {
		var userId = event.presenterId;
		var videoOn = event.presenterVideoOn;

		if (userId && userId.length > 0)
		{
			onAudioMuteChange({userId: userId, audioOn: true});
			onVideoMuteChange({userId: userId, videoOn: !presentationMgr.isVideoMuted(userId)});

			var user = userMgr.find(userId);

			if (user.avatarUrl && user.avatarUrl.length > 0)
			{
				$presenterContainer.find("img").attr("src", user.avatarUrl);
				$presenterContainer.find(".tabeebBlankAvatar").hide();
			}
			else
			{
				if (presentationMgr.isVideoMuted(userId))
				{
					$presenterContainer.find(".tabeebBlankAvatar").show().find("span").text(TabeebPlayerUtil.getInitials(user.displayName));
					$presenterContainer.find("img").hide();
				}
			}

			$presenterName.text(user.displayName);
			positionPresenterName();
		}

		AdapterJS.webRTCReady(function() {
			var $indicators = $panel.find(".tabeebAudioIndicator, .tabeebVideoIndicator");
			$indicators.show();
		});

		if (videoOn === false) {
			togglePresenterAvatarVisibile(false);
		}
	}

	function onToggleAudioButtonClicked () {
		presentationMgr.toggleThisUsersAudio();
	}

	function onToggleVideoButtonClicked () {
		presentationMgr.toggleThisUsersVideo();
	}

	function onEndCallButtonClicked () {
		$triggerElement.trigger(TabeebEvent.disconnectFromPresentation);
	}

	function onUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var $toggleMuteButton = $panel.find(".tabeebToggleMuteButton");
		if (user.thisUser === true) {
			$toggleMuteButton.removeClass("disabled");
			if (user.annotationsMuted)
				$toggleMuteButton.addClass("disabled");
		}
	}

	function onConnectButtonClicked () {
		$triggerElement.trigger(TabeebEvent.connectToPresentation);
	}

	function onChangePresenterButtonClicked () {
		var $this = $(this);
		var $userContainer = $this.parents(".tabeebUserContainer");
		var userId = $userContainer.attr("data-id");
		console.log("Requesting change of presenter", userId);
		presentationMgr.changePresenter(userId);
	}

	function onTabeebToggleMuteAudioButtonClicked () {
		var $this = $(this);
		var $userContainer = $this.parents(".tabeebUserContainer");
		var userId = $userContainer.attr("data-id");
		if (!$userContainer.hasClass("audioMuted"))
		{
			presentationMgr.setUserMuted(userId, true);
			$userContainer.addClass("audioMuted");
			$this.css("background", "red");
		}
		else
		{
			presentationMgr.setUserMuted(userId, false);
			$userContainer.removeClass("audioMuted");
			if (presentationMgr.isAudioMuted(userId))
				$this.css("background", "gray");
			else
				$this.css("background", "");
		}
	}

	function onPresentationStarted () {
		console.log("onPresentationStarted");
		$panel.show();
	}

	function onPresentationEnded () {
		$panel.hide();
	}

	//</editor-fold>


	/**
	 * @returns {jQuery|*}
	 */
	function getPresenterVideo () {
		return $presenterContainer.find("video, object");
	}
}/**
 * Created by cody on 9/25/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebModules} modules
 * @constructor
 */
function TabeebSocialTab ($sideBar, $triggerElement, modules) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $userTab = null;
	/**@type {TabeebChatPanel}*/
	var chatPanel = null;
	/**@type {TabeebUsersPanel}*/
	var userPanel = null;
	/**@type {TabeebPresentationPanel}*/
	var presentationPanel = null;

	/**@type {TabeebUser}*/
	var thisUser = null;

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	function init () {
		$userTab = $sideBar.find(".tabeebSidebarUsersTab");
		presentationPanel = new TabeebPresentationPanel($sideBar, $triggerElement, modules.userManager, modules.presenterManager);
		chatPanel = new TabeebChatPanel($sideBar, $triggerElement, modules.userManager, modules.chatManager);
		userPanel = new TabeebUsersPanel($sideBar, $triggerElement, modules.inviteDialog, modules.userManager, modules.presenterManager);
	}

	//<editor-fold name="Public Methods">

	function dispose () {
		chatPanel.dispose();
		userPanel.dispose();
		presentationPanel.dispose();
	}

	function resize () {
		thisUser = modules.userManager.getThisUser();

		if (thisUser && modules.presenterManager && modules.presenterManager.getPresenterId() && modules.presenterManager.getPresenterId().length > 0 && modules.presenterManager.getPresenterId() != thisUser.id)
		{
			var $presentationPanel = $userTab.find(".tabeebPresentationPanel");
			var totalHeight = parseFloat($sideBar.innerHeight()) - 5;
			totalHeight -= getHeightOfNonPanelItems();
			var presentationPanelHeight = totalHeight * (1/5);
			var otherPanelHeights = totalHeight * (2/5) - 5;
			$presentationPanel.css({
				"height": presentationPanelHeight,
				"max-height": presentationPanelHeight
			});
			var $otherItems = $userTab.find(".tabeebSidebarPanel:not(.tabeebPresentationPanel)");
			$otherItems.css({
				"height": otherPanelHeights,
				"max-height": otherPanelHeights
			});
		}
		else
		{

			var $visibleItems = $userTab.find(".tabeebSidebarPanel:visible");
			var availableHeight = parseFloat($sideBar.innerHeight());
			availableHeight -= getHeightOfNonPanelItems();
			var height = availableHeight / $visibleItems.length;
			if ($visibleItems.length >= 3)
				height -= 5;
			$visibleItems.css({
				"height": height,
				"max-height": height
			});
		}

		presentationPanel.resize();
		userPanel.resize();
		chatPanel.resize();
	}

	//</editor-fold>

	function getHeightOfNonPanelItems () {
		var $notPanels = $userTab.children().first().find("> :not(.tabeebSidebarPanel):visible");
		var height = 0;
		for (var i = 0; i < $notPanels.length; i++) {
			var $item = $notPanels.eq(i);
			height += $item.height();
		}
		return height;
	}
}/**
 * Created by cody on 9/28/15.
 */

/**
 * @param {jQuery} $sideBar
 * @param {jQuery} $triggerElement
 * @param {TabeebUserManager} userMgr
 * @param {TabeebInviteDialog} inviteDialog
 * @param {TabeebPresenterManager} presentationMgr
 * @constructor
 */
function TabeebUsersPanel ($sideBar, $triggerElement, inviteDialog, userMgr, presentationMgr) {
	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $panel = null;
	/**@type {jQuery}*/
	var $speakingIndicator = null;

	/**@type {Array.<String>}*/
	var namesTalking = [];

	//</editor-fold>

	var service = {
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	////////////////////////////

	function init () {
		$panel = $sideBar.find(".tabeebUsersPanel");
		$speakingIndicator = $panel.find(".tabeebCurrentlySpeaking");
		bindEvents();
	}

	function bindEvents () {
		for (var i = 0; i < userMgr.users.length; i++) {
			onUserAdded({user: userMgr.users[i]});
		}

		$(userMgr).on(TabeebUserManager.Events.userAdded, onUserAdded);
		$(userMgr).on(TabeebUserManager.Events.userRemoved, onUserRemoved);
		$(userMgr).on(TabeebUserManager.Events.userMuteChanged, onUserMuteChanged);

		$(presentationMgr).on(TabeebPresenterManager.Events.participantEndedSpeaking, onUserStoppedTalking);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantStartedSpeaking, onUserStartedTalking);
		$(presentationMgr).on(TabeebPresenterManager.Events.participantOnlineStatusChanged, onOnlineStatusChange);
		$(presentationMgr).on(TabeebPresenterManager.Events.userAudioMutedChanged, onUserAudioMutedChanged);
		$(presentationMgr).on(TabeebPresenterManager.Events.presenterChanged, onPresenterChanged);

		$panel.on("click", ".tabeebToggleMuteButton", onToggleMuteButtonClicked);
		$panel.on("click", ".tabeebToggleVideoButton", onToggleVideoButton);
		$panel.on("click", ".tabeebToggleAudioButton", onToggleAudioButtonClicked);
		$panel.on("click", ".tabeebInviteUser", onInviteButtonClicked);
		//$panel.on("click", ".tabeebInviteUser", onInviteButtonClicked)

	}

	//<editor-fold name="Public Methods">

	function dispose () {
		inviteDialog.dispose();
	}

	function resize () {
		var $tabeebUsers = $panel.find("> .tabeebUserContainer:not(.disabled):visible");

		var height = parseFloat($tabeebUsers.width()) * 9/16;
		$tabeebUsers.height(height);
	}

	//</editor-fold>

	function sort () {
		var thisUser = userMgr.getThisUser();

		var sortedItems = $panel.find("> div").sort(function (a, b) {

			if ($(a).hasClass("disabled") || $(b).hasClass("disabled")) return;

			var id = $(a).attr('data-id');
			var id2 = $(b).attr('data-id');
			var userA = userMgr.find(id);
			var userB = userMgr.find(id2);
			//var userB = userMgr.find($(b).attr('data-id'));

			if (!userA)
				return 1;
			if (!userB)
				return -1;

			if (thisUser && id == thisUser.id)
				return -1;
			if (thisUser && id2 == thisUser.id)
				return 1;

			if ($(a).hasClass("offline"))
				return 1;
			if ($(b).hasClass("offline"))
				return -1;

			if (userA && userB)
				return 0;
		});
		$panel.find("> div").detach();
		$panel.append(sortedItems);
		resize();
	}

	function onUserStoppedTalking (event) {
		var user = userMgr.find(event.userId);
		var index = namesTalking.indexOf(user.displayName);
		setTimeout(function () {
			if (index >= 0)
				namesTalking.splice(index, 1);
			updateNamesTalking();
		}, 1000);
	}

	function onUserStartedTalking (event) {
		var user = userMgr.find(event.userId);
		var index = namesTalking.indexOf(user.displayName);
		if (index < 0)
			namesTalking.push(user.displayName);
		updateNamesTalking();
	}

	function onOnlineStatusChange (event) {
		var userId = event.userId;
		var isOnline = event.isConnected;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);

		$container.removeClass("audioMuted");

		onUserStoppedTalking({userId: userId});

		if (isOnline) {
			$container.addClass("online").removeClass("offline");
		}
		else
		{
			$container.addClass("offline").removeClass("online audio video");
		}

		sort();
		updateNamesTalking();
	}

	function onUserAudioMutedChanged (event) {
		var userId = event.userId;
		var isMuted = event.isMuted;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);
		var $audioIndicator = $container.find(".tabeebAudioIndicator");
		$container.removeClass("audioMuted");

		if (presentationMgr.isAudioMuted(userId))
			$audioIndicator.css("background", "gray");
		else
			$audioIndicator.css("background", "");
		if (isMuted)
		{
			$container.addClass("audioMuted");
			$audioIndicator.css("background", "red");
		}
	}

	function onVideoMuteChange (event) {
		var userId = event.userId;
		var videoOn = event.videoOn;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);
		if (videoOn)
			$container.addClass("video");
		else
			$container.removeClass("video");

		console.log(user.displayName + " turned their video to", videoOn);
	}

	function onAudioMuteChange (event) {
		var userId = event.userId;
		var audioOn = event.audioOn;
		var user = userMgr.find(userId);
		var $container = getElementForUser(user);
		if (audioOn)
			$container.addClass("audio");
		else
			$container.removeClass("audio");
	}

	function onPresenterChanged (event) {
		var presenterId = event.presenterId;

		$panel.find(".tabeebUserContainer").show();

		if (!presenterId || presenterId.length == 0)
			return;

		var user = userMgr.find(presenterId);
		var $container = getElementForUser(user);
		$container.hide();
		resize();
	}

	function updateNamesTalking () {
		if (namesTalking.length == 0)
			$speakingIndicator.html('<span class="tabeebSpeakingIndicator icon-speaking" style="opacity: 0;"></span>');
		else if (namesTalking.length == 1)
			$speakingIndicator.html('<span class="tabeebSpeakingIndicator icon-speaking"></span>' + namesTalking[0] + ' is speaking ...');
		else
		{
			var text = '<span class="icon-speaking"></span>';
			for (var i = 0; i < namesTalking.length; i++) {
				if (i + 1 == namesTalking.length)
					text += ' and ' + namesTalking[i];
				else if (i + 2 == namesTalking.length)
					text += namesTalking[i];
				else
					text += namesTalking[i] + ', ';
			}
			text += ' are speaking ...';
			$speakingIndicator.html(text);
		}
	}

	function onUserAdded (event) {
		var user = event.user;
		var $element = createElementForUser(user);
		user.$videoElement = $element.find("video");
		$panel.append($element);
		sort();
	}

	function onUserRemoved (event) {
		var user = event.user;
		getElementForUser(user).remove();
	}

	function onUserMuteChanged (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		var $container = getElementForUser(user);
		var $toggleMuteButton = $container.find(".tabeebToggleMuteButton");
		$toggleMuteButton.removeClass("disabled");
		if (user.annotationsMuted)
			$toggleMuteButton.addClass("disabled");
	}

	function onInviteButtonClicked (event) {
		inviteDialog.show();
	}

	function onToggleMuteButtonClicked (event) {
		var userId = $(this).parents(".tabeebUserContainer").attr('data-id');
		userMgr.setMuted(userId);
	}

	function onToggleVideoButton () {
		var user = userMgr.getThisUser();
		var $container = getElementForUser(user);
		presentationMgr.toggleThisUsersVideo();
	}

	function onToggleAudioButtonClicked () {
		var user = userMgr.getThisUser();
		var $container = getElementForUser(user);
		if ($container.hasClass("audioMuted"))
			return;
		presentationMgr.toggleThisUsersAudio();
	}

	/**
	 * @param {TabeebUser} user
	 * @returns {jQuery}
	 */
	function getElementForUser (user) {
		return $panel.find(".tabeebUserContainer[data-id='" + user.id + "']")
	}

	//<editor-fold name="HTML Methods">

	/**
	 * @param {TabeebUser} user
	 */
	function createElementForUser (user) {
		var html = '';

		if (user.id == presentationMgr.getPresenterId())
			html += '<div class="tabeebUserContainer offline col-xs-6" data-id="' + user.id + '" style="display: none;">';
		else
			html += '<div class="tabeebUserContainer offline col-xs-6" data-id="' + user.id + '">';

		html += '<div class="tabeebUser">';

		if (user.avatarUrl && user.avatarUrl.length > 0)
			html += '<img src="' + user.avatarUrl + '" class="tabeebUserAvatar img-responsive" />';
		else
			html += TabeebPlayerUtil.createHTMLForBlankAvatar(user.displayName).css("margin", "auto")[0].outerHTML;

		html += '<video autoplay oncontextmenu="return false;"></video>';

		if (user != userMgr.getThisUser())
			html += '<audio autoplay oncontextmenu="return false;" style="display: none;"></audio>';

		if (user.displayName.length > 11)
		{
			html += '<span>' + user.displayName.substr(0, 8) + '...</span>';
		}
		else
		{
			html += '<span>' + user.displayName + '</span>';
		}

		html += '<div class="tabeebOnlineIndicator">(Offline)</div>';

		html += createHTMLForUserControls(user);

		html += '</div>';

		html += '</div>';

		return $(html);
	}

	function createHTMLForUserControls (user) {
		var thisClientCanConnect = TabeebConnect.clientCanConnect();

		var html = '';

		html += '<div class="tabeebPanelControls">';

		html += '<div class="tabeebPresenterModeButton tabeebChangePresenterButton tabeebUserOnlineButton icon-desktop" style="font-size: 12px; line-height: 28px;"></div>';

		var thisUser = userMgr.getThisUser();

		if (thisClientCanConnect && user == thisUser)
			html += '<div class="tabeebSpectatorModeButton tabeebVideoIndicator tabeebToggleVideoButton icon-videocam"></div>';

		html += '<div class="tabeebHideOnPresentationMode tabeebToggleMuteButton icon-draw-mode"></div>';
		html += '<div class="tabeebPresenterModeButton tabeebToggleMuteButton icon-draw-mode"></div>';

		if (thisClientCanConnect && user == thisUser)
			html += '<div class="tabeebSpectatorModeButton tabeebAudioIndicator tabeebToggleAudioButton icon-mic"></div>';

		html += '<div class="tabeebPresenterModeButton tabeebAudioIndicator tabeebToggleMuteAudioButton icon-mic"></div>';
		//html += '<div class="icon-draw-mode"></div>';

		html += '</div>';

		return html;
	}

	//</editor-fold>

	function bindTest () {
	}

}
/**
 * Created by cody on 9/25/15.
 */

function TabeebChatManager () {
	/**
	 * @type {Array.<TabeebChatMessage>}
	 */
	this.messages = [];
}

TabeebChatManager.prototype.find = function (msgOrId) {
	var id = msgOrId.hasOwnProperty("id") ? msgOrId.id : msgOrId;

	for (var i = 0; i < this.messages.length; i++) {
		var msg = this.messages[i];
		if (msg.id == id)
			return msg;
	}
	return null;
};

/**
 * @param {TabeebChatMessage} chatMessage
 * @returns {TabeebChatManager}
 */
TabeebChatManager.prototype.addChatMessage = function (chatMessage) {
	if (this.find(chatMessage))
		return;

	this.messages.push(chatMessage);
	$(this).trigger($.Event(TabeebChatManager.Events.messageAdded, {message: chatMessage}));
	return this;
};

/**
 * @param {Array.<TabeebChatMessage>} chatMessages
 * @returns {TabeebChatManager}
 */
TabeebChatManager.prototype.addChatMessages = function (chatMessages) {
	var self = this;
	chatMessages.forEach(function(msg) { self.messages.push(msg); });
	$(this).trigger($.Event(TabeebChatManager.Events.messagesAdded, {messages: chatMessages}));
	return this;
};

TabeebChatManager.prototype.clear = function () {
	this.messages.length = 0;
	$(this).trigger($.Event(TabeebChatManager.Events.messagesCleared, {}));
	return this;
};

TabeebChatManager.prototype.last = function () {
	if (this.messages.length == 0)
		return null;

	return this.messages[this.messages.length - 1];
};

TabeebChatManager.Events = {
	messageAdded: "messageAdded",
	messagesAdded: "messagesAdded",
	messagesCleared: "messagesCleared"
};/**
 * Created by cody on 9/29/15.
 */

/**
 * @param {jQuery} $triggerElement
 * @param {TabeebUserManager} userMgr
 * @param {$.fn.tabeebPlayer.defaults} options
 * @returns {{show: show, hide: hide}}
 * @constructor
 */
function TabeebInviteDialog ($triggerElement, userMgr, options) {

	//<editor-fold name="Variables">

	/**@type {jQuery}*/
	var $popup = null;
	/**@type {jQuery}*/
	var $textInput = null;
	/**@type {jQuery}*/
	var $userResults = null;
	/**@type {jQuery}*/
	var $closeButton = null;

	var userResults = new TabeebUserManager();

	//</editor-fold>

	var service = {
		show: show,
		hide: hide,
		resize: resize,
		dispose: dispose
	};

	init();

	return service;

	//////////////////////////

	function init () {
		$.get(TabeebPlayerUtil.getPluginBaseUrl() + "users/tabeebInviteDialog.html", onHTMLLoaded);
	}

	function onHTMLLoaded (data) {
		$popup = $(data);
		$userResults = $popup.find(".tabeebUserList");
		$textInput = $popup.find(".userSearchInput");
		$closeButton = $popup.find(".tabeebCloseDialogButton");

		var $body = $("body");

		var dialogOptions = {
			dialogClass: "tabeebDialog",
			autoOpen: false,
			draggable: true,
			height: 300,
			width: 340,
			resizable: false,
			title: "Invite Users",
			maxHeight: Math.min(500, $body.innerHeight()),
			open: function () {
				resize();
				$(".tabeebDialog .ui-dialog-titlebar").remove();
			},
			close: function () {
				$textInput.val("");
			},
			resize: resize
		};

		$popup.dialog(dialogOptions);
		$popup.parent().draggable({
			containment: $body
		});

		bindEvents();
	}

	function bindEvents () {
		$textInput.on('input', onTextInputChanged);
		$(userResults).on(TabeebUserManager.Events.usersCleared, onUsersCleared);
		$(userResults).on(TabeebUserManager.Events.userAdded, onUserAdded);
		$closeButton.on('click', hide);
		$userResults.on('click', '.tabeebInviteUserButton', onInviteButtonClicked);
		$popup.find(".tabeebClearSearchButton").on('click', onClearButtonClicked);
	}

	//<editor-fold name="User Manager Events">

	function onUsersCleared () {
		$userResults.children().remove();
	}

	function onUserAdded (event) {
		/**@type {TabeebUser}*/
		var user = event.user;
		$userResults.append(createHTMLForUser(user));
	}

	//</editor-fold>

	function onInviteButtonClicked (event) {
		var $this = $(this);

		if ($this.attr("data-email") && $this.attr("data-email").length > 0)
		{
			var email = $this.attr("data-email");
			$triggerElement.trigger($.Event(TabeebEvent.inviteExternalUser, {email: email}));
			$this.parents('.tabeebUserResult').remove();
		}
		else
		{
			var userId = $this.attr('data-id');
			var user = userResults.find(userId);
			var displayName = user.displayName;
			$triggerElement.trigger($.Event(TabeebEvent.inviteUser, {userId: userId, displayName: displayName}));
			$this.parents('.tabeebUserResult').remove();
		}

		$textInput.val("");
	}

	function onClearButtonClicked () {
		$textInput.val('');
		userResults.clear();
	}

	//<editor-fold name="Public Methods">
	function dispose () {
		$popup.dialog('destroy');
	}

	function show () {
		$popup.dialog('open');
	}

	function hide () {
		$popup.dialog('close');
	}

	function resize () {
		$userResults.css({
			'max-height': parseFloat($popup.innerHeight()) - parseFloat($textInput.height()) - 50
		});
	}

	//</editor-fold>

	function search (searchText) {
		options.callbacks.searchUser(searchText).then(
			function (users) {
				if (users.length == 0)
				{
					if (TabeebPlayerUtil.validateEmail(searchText))
					{
						$userResults.append(createExternalInviteHTML(searchText));
					}
				}

				users.forEach(
					function (user) {
						var existingUsersInSession = userMgr.find(user.id);
						if (!existingUsersInSession)
							userResults.addUser(user);
					}
				);
			}
		);
	}

	function onTextInputChanged (event) {

		var searchText = $textInput.val();
		setTimeout(function () {
			if ($textInput.val() == searchText)
			{
				userResults.clear();
				var splits = searchText.split(",");
				splits.forEach(function (text) {
					search(text);
				});
			}
		}, 1000);
	}

	//<editor-fold name="HTML Helper Methods">

	function createExternalInviteHTML (email) {
		var html = '';

		html += '<div class="tabeebUserResult">';
		html += '<img src="' + options.defaultUserAvatarUrl + '" />';
		html += email;
		html += '<span class="tabeebInviteUserButton btn btn-sm btn-default" data-email="' + email + '">Invite</span>';
		html += '</div>';

		return html;
	}

	/**
	 * @param {TabeebUser} user
	 */
	function createHTMLForUser (user) {
		var html = '';

		html += '<div class="tabeebUserResult">';

		html += '<img src="' + user.avatarUrl + '" />';
		html += user.displayName;
		html += '<span class="tabeebInviteUserButton btn btn-sm btn-default" data-id="' + user.id + '">Invite</span>';

		html += '</div>';

		return html;
	}

	//</editor-fold>
}/**
 * Created by cody on 9/25/15.
 */

function TabeebUserManager () {
	/**@type {Array.<TabeebUser>}*/
	this.users = [];
}

/**
 * @param {String} id
 * @returns {TabeebUser}
 */
TabeebUserManager.prototype.find = function (id) {
	for (var i = 0; i < this.users.length; i++)
	{
		var user = this.users[i];
		if (user.id == id)
			return user;
	}
	return null;
};

/**
 * @param {TabeebUser} user
 */
TabeebUserManager.prototype.addUser = function (user) {

	if (!user.hasOwnProperty('id'))
		console.warn("Adding user without id", user);

	var existingUser = this.find(user.id);
	if (existingUser != null) {
		$.extend(existingUser, user);
		$(this).trigger($.Event(TabeebUserManager.Events.userUpdated, {user: user}));
	}
	else
	{
		this.users.push(user);
		$(this).trigger($.Event(TabeebUserManager.Events.userAdded, {user: user}));
	}
};

TabeebUserManager.prototype.removeUser = function (idOrUser) {
	var id = idOrUser.hasOwnProperty('id') ? idOrUser.id : idOrUser;
	var user = this.find(id);
	var index = this.users.indexOf(user);
	if (index >= 0)
	{
		this.users.splice(index, 1);
		$(this).trigger($.Event(TabeebUserManager.Events.userRemoved, {user: user}));
	}
};

TabeebUserManager.prototype.setMuted = function (idOrUser, isMuted) {
	var id = idOrUser.hasOwnProperty('id') ? idOrUser.id : idOrUser;
	var user = this.find(id);
	if (isMuted == null)
		isMuted = !user.annotationsMuted;

	user.annotationsMuted = isMuted;
	$(this).trigger($.Event(TabeebUserManager.Events.userMuteChanged, {user: user, isMuted: isMuted}));
};

TabeebUserManager.prototype.clear = function () {
	this.users.length = 0;
	$(this).trigger($.Event(TabeebUserManager.Events.usersCleared));
};

/**
 * @returns {TabeebUser}
 */
TabeebUserManager.prototype.getThisUser = function () {
	for (var i = 0; i < this.users.length; i++)
	{
		var user = this.users[i];
		if (user.thisUser === true)
			return user;
	}
	return null;
};

TabeebUserManager.Events = {
	userAdded: "userAdded",
	userRemoved: "userRemoved",
	userUpdated: "userUpdated",
	userMuteChanged: "userMuteChange",
	usersCleared: "usersCleared"
};﻿var TabeebAnnotationManager = null;

(function () {
	'use strict';

	/**
	 * Used to organize plugin annotations into one manageable array.
	 * Checks for duplicates when adding annotations and updates instead of adding two of the same entry
	 * @constructor
	 */
	TabeebAnnotationManager = function TabeebAnnotationManager () {
		var self = this;
		var $self = $(this);
		/**@type {Array.<TabeebAnnotation>}*/
		var annotations = [];
		/**@type {Array.<TabeebAnnotation>}*/
		var selectedAnnotations = [];

		/**
		 * Adds the annotation to the array, or updates if exists
		 * @param {TabeebAnnotation} annotation
		 * @param {Boolean} [doNotSort]
		 * @returns {TabeebAnnotation}
		 */
		self.add = function (annotation, doNotSort) {
			var existingAnnotation = findAnnotation(annotation);
			if (existingAnnotation)
			{
				$.extend(existingAnnotation, annotation);
				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationUpdated, annotation));
				if (doNotSort !== true)
					sortByDate();

				return existingAnnotation;
			}
			else
			{
				if (annotation.constructor == Object)
					annotation = convertToTabeebAnnotation(annotation);
				clearSelection();
				annotations.push(annotation);

				annotation.children = self.getChildAnnotations(annotation);

				if (annotation.parentId && annotation.parentId.length > 0) {
					var parentAnnotation = findAnnotation(annotation.parentId);

					if (parentAnnotation)
					{
						parentAnnotation.children.push(annotation);
						annotation.parent = parentAnnotation;
					}
				}

				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationAdded, annotation));

				if (doNotSort !== true)
					sortByDate();

				return annotation;
			}
		};

		/**
		 * @param {TabeebAnnotation|String} annotationOrAnnotationId
		 * @param {Boolean} isLocked
		 */
		self.setAnnotationLocked = function (annotationOrAnnotationId, isLocked) {
			var ann = findAnnotation(annotationOrAnnotationId);
			ann.locked = isLocked;
			$self.trigger($.Event(TabeebAnnotationManager.Events.annotationLockedChanged, { annotation: ann, isLocked: isLocked}));
		};

		/**
		 * @param {TabeebAnnotation|String} annotationOrAnnotationId
		 * @param {Boolean} isHidden
		 * @param {Boolean} [applyToChildren]
		 */
		self.setAnnotationHidden = function (annotationOrAnnotationId, isHidden, applyToChildren) {
			var ann = findAnnotation(annotationOrAnnotationId);

            if (ann == null)
                return;

			if (ann.hidden === true && isHidden === false && ann.parentId && ann.parentId.length > 0) {
				var parentAnn = findAnnotation(ann.parentId);
				self.setAnnotationHidden(parentAnn, isHidden, false);
			}

			if (isHidden === true && ann.selected === true) {
				self.unselectAnnotation(ann);
			}

			ann.hidden = isHidden;
			$self.trigger($.Event(TabeebAnnotationManager.Events.annotationHiddenChanged, { annotation: ann, isHidden: isHidden}));



			if (applyToChildren !== false)
			{
				var childAnnotations = self.getChildAnnotations(ann);
				childAnnotations.forEach(function (ann) { self.setAnnotationHidden(ann, isHidden, false); });
			}
		};

		/**
		 * @returns {Number}
		 */
		self.count = function () {
			return annotations.length;
		};

		/**
		 * @returns {Array.<TabeebAnnotation>}
		 */
		self.getAll = function () {
			return annotations;
		};

		/**
		 * @param {Array} annotations
		 */
		self.addAll = function (annotations) {
			for (var i = 0; i < annotations.length; i++)
			{
				self.add(annotations[i], true);
			}
			sortByDate();
		};

		/**
		 * @returns {Array.<TabeebAnnotation>}
		 */
		self.getSelectedAnnotations = function () {
			return selectedAnnotations;
		};

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 * @param {Boolean} [clearSelectedAnnotations]
		 * @param {Boolean} [selectParent]
		 */
		self.selectAnnotation = function (annotationOrAnnotationId, clearSelectedAnnotations, selectParent) {
			var annotation = findAnnotation(annotationOrAnnotationId);

			if (annotation.canBeSelected() === false) return;

			if (clearSelectedAnnotations === true) {
				self.getSelectedAnnotations().forEach(function (a) {
					self.unselectAnnotation(a);
				});
			}

			if (annotation.selected !== true)
			{
				annotation.selected = true;
				selectedAnnotations.push(annotation);
				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationSelected, annotation));

				if (selectParent === true && annotation.parentId && annotation.parentId.length > 0) {
					self.selectAnnotation(annotation.parentId, false, false);
				}

				if (annotation.type != TabeebAnnotationType.Hotspot) {
					var childAnnotations = self.getChildAnnotations(annotation);
					childAnnotations.forEach(function (a) { self.selectAnnotation(a); });
				}
			}
		};

		self.clearSelectedAnnotations = function () {
			var count = selectedAnnotations.length;
			for (var i = 0; i < count; i ++) {
				var a = selectedAnnotations[0];
				self.unselectAnnotation(a);
			}
		};

		self.unselectAnnotation = function (annotationOrAnnotationId) {
			var annotation = findAnnotation(annotationOrAnnotationId);
			annotation.selected = false;

			var index = selectedAnnotations.indexOf(annotation);
			if (index >= 0)
			{
				selectedAnnotations.splice(index, 1);
				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationUnselected, annotation));
			}
			else
			{
				console.warn("Annotation is not selected", annotation);
			}
		};

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 */
		self.remove = function (annotationOrAnnotationId) {
			var annotationToRemove = findAnnotation(annotationOrAnnotationId);
			var index = annotations.indexOf(annotationToRemove);
			if (index >= 0)
			{
				if (annotationToRemove.selected === true)
					self.unselectAnnotation(annotationToRemove);

				var childrenAnnotations = self.getChildAnnotations(annotationOrAnnotationId);
				annotations.splice(index, 1);
				childrenAnnotations.forEach(function (ann) {
					self.remove(ann);
				});

				if (annotationToRemove.parent && annotationToRemove.parent.children) {
					var idx = annotationToRemove.parent.children.indexOf(annotationToRemove);
					if (idx >= 0)
					{
						annotationToRemove.parent.children.splice(idx, 1);
					}
				}

				$self.trigger(createAnnotationManagerEvent(TabeebAnnotationManager.Events.annotationRemoved, annotationToRemove));
			}
		};

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 * @returns {TabeebAnnotation}
		 */
		self.find = function (annotationOrAnnotationId) { return findAnnotation(annotationOrAnnotationId); };

		/**
		 * @param {TabeebAnnotationType} annotationType
		 * @returns {TabeebAnnotation}
		 */
		self.getAnnotationsByType = function (annotationType) {
			return $.grep(annotations, function (a) {
				return a.type == annotationType && a.parentId == null;
			});
		};

		/**
		 * @param {TabeebAnnotation | String} parentAnnotationOrAnnotationId
		 * @returns {TabeebAnnotation[]}
		 */
		self.getChildAnnotations = function (parentAnnotationOrAnnotationId) {
			var parentAnnotation = findAnnotation(parentAnnotationOrAnnotationId);
			if (parentAnnotation)
			{
				return $.grep(annotations, function (a) {
					return a.parentId == parentAnnotation.id;
				});
			}
			return [];
		};

		self.clear = function () {
			annotations.splice(0, annotations.length);
			$self.trigger($.Event(TabeebAnnotationManager.Events.annotationsCleared));
		};

		/**
		 * @param timestampBegin - Time
		 * @param interval - Length of time
		 * @param {String} parentId
		 * @returns {Array}
		 */
		self.getAnnotationsByTime = function (timestampBegin, interval, parentId) {
			return $.grep(annotations, function (a) {
				if (a == null) return false;
				if (a.hidden === true) return false;
				//if (!parentId && a.parentId != null) return false;
				if (parentId && a.parentId != parentId) return false;
				if (a.type == TabeebAnnotationType.Audio) return false;
				return a.timestamp == -1 || (timestampBegin >= a.timestamp && timestampBegin - interval <= a.timestamp);
			});
		};

		self.setDimmedExcept = function (annotation) {
			for (var i = 0; i < annotations.length; i++)
			{
				annotations[i].dimmed = annotation && (annotations[i].id !== annotation.id || annotations[i].parentId !== annotation.id);
			}
		};

		function sortByDate () {
			annotations.sort(function (a, b) {
				return a.dateCreated - b.dateCreated;
			});
		}

		/**
		 * @param annotation
		 * @returns {TabeebAnnotation}
		 */
		function convertToTabeebAnnotation (annotation) {
			switch (annotation.type)
			{
				case TabeebAnnotationType.Stroke:
					return new StrokeAnnotation(annotation);
				case TabeebAnnotationType.ErasedStroke:
					return new StrokeAnnotation(annotation);
				case TabeebAnnotationType.LaserStroke:
					return new StrokeAnnotation(annotation);
				case TabeebAnnotationType.Text:
					return new TextAnnotation(annotation);
				case TabeebAnnotationType.Audio:
					return annotation;
				case TabeebAnnotationType.Callout:
					return new CalloutAnnotation(annotation);
				case TabeebAnnotationType.Line:
					return new LineAnnotation(annotation);
				case TabeebAnnotationType.Rectangle:
					return new RectangleAnnotation(annotation, false);
				case TabeebAnnotationType.Rectangle_Filled:
					return new RectangleAnnotation(annotation, true);
				case TabeebAnnotationType.Ellipse:
					return new CircleAnnotation(annotation, false);
				case TabeebAnnotationType.Ellipse_Filled:
					return new CircleAnnotation(annotation, true);
				case TabeebAnnotationType.ArrowEnd:
					return new ArrowLineAnnotation(annotation, false);
				case TabeebAnnotationType.ArrowBoth:
					return new ArrowLineAnnotation(annotation, true);
				case TabeebAnnotationType.Hotspot:
					return new HotspotAnnotation(annotation);
				default:
					console.error("Unknown annotation type", annotation.type);
			}
		}

		/**
		 * @param {TabeebAnnotation | String} annotationOrAnnotationId
		 * @returns {TabeebAnnotation}
		 */
		function findAnnotation (annotationOrAnnotationId) {
			var annotationId = typeof annotationOrAnnotationId != 'string' ? annotationOrAnnotationId.id : annotationOrAnnotationId;
			for (var i = 0; i < annotations.length; i++)
			{
				if (annotations[i].id == annotationId)
					return annotations[i];
			}
			return null;
		}

		function clearSelection () {
			for (var i = 0; i < annotations.length; i++)
			{
				annotations[i].selected = false;
			}
		}

		function createAnnotationManagerEvent (type, annotation) {
			return $.Event(type, {
				annotation: annotation
			});
		}
	};

	TabeebAnnotationManager.Events = {
		annotationAdded: "annMgrAnnotationAdded",
		annotationUpdated: "annMgrAnnotationUpdated",
		annotationRemoved: "annMgrAnnotationRemoved",
		annotationsCleared: "annMgrAnnotationsCleared",
		annotationLockedChanged: "annMgrAnnotationLockedChanged",
		annotationHiddenChanged: "annMgrAnnotationHiddenChanged",
		annotationSelected: "annMgrAnnotationSelected",
		annotationUnselected: "annMgrAnnotationUnselected"
	};
})();
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
})();/**
 * Created by cody on 11/10/15.
 */

$.fn.tabeebPlayer.defaults.autoLoadCSS = false;