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
