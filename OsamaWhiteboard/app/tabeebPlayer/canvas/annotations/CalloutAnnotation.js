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
