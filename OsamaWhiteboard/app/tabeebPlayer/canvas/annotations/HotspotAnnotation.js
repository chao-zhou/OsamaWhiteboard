/**
 * Created by cody on 9/18/15.
 */

/**
 * @constructor
 * @extends TabeebAnnotation
 */
function HotspotAnnotation(data) {
	this.finalizeStrokePolicy = TabeebFinalizeStrokePolicy.FirstAndLastStroke;
	this.init(data);

	this.getWidth = function () {
		return this.highlighted === true ? 36 : 32;
	};

	/**
	 * @param {CanvasRenderingContext2D} context
	 */
	function setFontStyling (context) {
		context.font = (HotspotAnnotation.variables.width - 6) + "px Verdana";
		context.textBaseline = "bottom";
		context.fillStyle = "white";
		context.strokeStyle = "white";
	}

	this.draw = function (context, panX, panY, scaleFactor) {
		context.save();

		var position = {
			x: this.imageToCanvasCoordX(this.anchor.x, panX, scaleFactor),
			y: this.imageToCanvasCoordY(this.anchor.y, panY, scaleFactor)
		};

		this.startStroke(context, this.getColor(), this.stroke.width, scaleFactor);
		//context.fillStyle = this.getColor();
		context.fillStyle = !this.selected && this.dimmed ? TabeebPlayerUtil.mixColors(this.getColor(), this.dimColor, this.dimOpacity) : this.getColor();
		var width = HotspotAnnotation.variables.width;


		var h = width*2;

		if (this.parent && this.parent.type) {
			context.beginPath();
			context.lineWidth = 1;
			context.strokeStyle = this.parent.getColor();

			var parentPosition = this.parent.getAnchoredAnnotationPosition();

			parentPosition.x = this.imageToCanvasCoordX(parentPosition.x, panX, scaleFactor);
			parentPosition.y = this.imageToCanvasCoordY(parentPosition.y, panY, scaleFactor);

			context.moveTo(parentPosition.x, parentPosition.y);
			context.lineTo(position.x - width + 20, position.y + width - 14);
			context.stroke();
			context.closePath();
		}

		context.translate(position.x - width + 8, position.y - width - 14);
		context.beginPath();
		context.moveTo(width / 2, h);
		context.bezierCurveTo(-width * 2, -h/3, width * 3, -h/3, width / 2, h);
		context.closePath();
		context.fill();

		setFontStyling(context);

		var str = this.hotspotCount;
		var strWidth = context.measureText(str).width;

		context.fillText(str, width/2 - strWidth/2, h/2 + 4);
		context.fillStyle = "white";
		context.restore();
	};

	this.drawHighlighted = function (context, panX, panY, scaleFactor) {
	};

	this.preview = function (context, endpoints, panX, panY, scaleFactor) {
		context.save();

		var position = {x: endpoints[endpoints.length-1].x, y: endpoints[endpoints.length-1].y};
		setFontStyling(context);

		context.beginPath();
		context.strokeStyle = this.stroke.color;
		context.fillStyle = this.stroke.color;
		var width = HotspotAnnotation.variables.width;


		var h = width*2;

		context.translate(position.x - width + 8, position.y - width - 14);
		context.moveTo(width/2,0);
		context.bezierCurveTo(width*2 + 5, h/8, width/2, h, width/2, h);
		context.moveTo(width/2,0);
		context.bezierCurveTo(-width - 5, h/8, width/2, h, width/2, h);
		context.fill();

		setFontStyling(context);

		var str = "?";
		var strWidth = context.measureText(str).width;

		context.fillStyle = "white";
		context.fillText(str, width/2 - strWidth/2, h/2 + 4);

		context.restore();
	};

	this.getColor = function () {
		if (this.highlighted === true)
			return "green";
		else
			return this.color;
	};

	this.getRectangle = function () {
		return {
			x: this.anchor.x - 20,
			y: this.anchor.y - 40,
			width: HotspotAnnotation.variables.width,
			height: HotspotAnnotation.variables.width
		};
	};

	this.collidesWithRectangle = function (rectangle, context, fontFamily, scaleFactor) {
		var rect = {
			x: this.anchor.x,
			y: this.anchor.y,
			width: (HotspotAnnotation.variables.width/2) + (HotspotAnnotation.variables.width * (1/scaleFactor)),
			height: (HotspotAnnotation.variables.width/2)  + (HotspotAnnotation.variables.width * (1/scaleFactor))
		};

		rect.x -= rect.width/2;
		rect.y -= rect.height;

		return ShapeCollisions.rectangleRectangle(rect, rectangle);
	};

	this.getCoordinates = function () {
		return $.extend({}, this.anchor);
	};

	this.setCoordinates = function (data) {
		this.anchor = data;
	};

	this.translate = function (x, y) {
		this.anchor.x += x;
		this.anchor.y += y;
	};

	this.isRectOverResizeRectangle = function () { return false; };

	this.canBeSelected = function () {
		return true;
	};
}

HotspotAnnotation.variables = {
	width: 24
};

HotspotAnnotation.inheritsFrom(TextAnnotation);