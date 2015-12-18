function TabeebPlayerUtil()
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
};