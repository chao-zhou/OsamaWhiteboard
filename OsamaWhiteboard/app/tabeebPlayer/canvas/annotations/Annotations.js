/**
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
};