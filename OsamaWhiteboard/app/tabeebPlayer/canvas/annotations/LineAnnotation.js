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

LineAnnotation.inheritsFrom(StrokeAnnotation);