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
}