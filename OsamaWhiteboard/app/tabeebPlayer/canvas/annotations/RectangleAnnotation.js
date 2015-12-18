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
