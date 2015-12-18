/**
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
