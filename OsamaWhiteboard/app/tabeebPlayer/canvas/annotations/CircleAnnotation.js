/**
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
