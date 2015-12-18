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
