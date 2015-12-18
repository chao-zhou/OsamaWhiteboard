/**
 * Created by cody on 9/18/15.
 */

/**
 * @param data
 * @constructor
 * @extends TabeebAnnotation
 */
function ShapeAnnotation(data) {
	this.translate = function (x, y) {
		var endpoints = this.stroke.endpoints;
		for (var i = 0; i < endpoints.length; i++)
		{
			endpoints[i].start.x += x;
			endpoints[i].start.y += y;
			endpoints[i].end.x += x;
			endpoints[i].end.y += y;
		}
	};
	this.getCoordinates = function () { return $.extend(true, {}, this.stroke); };
	this.setCoordinates = function (stroke) { this.stroke = stroke; };
}

ShapeAnnotation.inheritsFrom(TabeebAnnotation);
