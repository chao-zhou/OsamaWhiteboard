/**
 * Created by cody on 9/18/15.
 */

var TabeebDrawingExtensions = {
	/**
	 * @param {CanvasRenderingContext2D} context
	 * @param x
	 * @param y
	 * @param scaleFactor
	 * @param {TabeebAnnotation} annotation
	 */
	drawHighlighSquare: function (context, x, y, scaleFactor, annotation) {
		var width = 5 * scaleFactor;
		x -= width/4;
		y -= width/4;

		var color = annotation.selected == true ? (annotation.highlighted == true ? TabeebAnnotationOptions.selectedAndHighlightedColor : TabeebAnnotationOptions.selectedColor) : TabeebAnnotationOptions.highlightedColor;

		color = TabeebAnnotationOptions.highlightedColor;

		context.strokeStyle = color;
		context.lineWidth = 1;
		context.fillStyle = "white";

		context.fillRect(x, y, width, width);
		context.strokeRect(x, y, width, width);
	},

	/**
	 * @param {CanvasRenderingContext2D} context
	 * @param {Number} fontSize
	 * @param {String} fontFamily
	 * @param {String} text
	 * @param {Number} [scaleFactor]
	 */
	getSizeOfText: function (context, fontSize, fontFamily, text, scaleFactor) {
		if (!scaleFactor)
			scaleFactor = 1;

		context.save();

		context.textBaseline = "top";
		context.font = (fontSize * scaleFactor) + 'px' + fontFamily;

		var lines = text.split("\n");
		var width = 0;
		lines.forEach(function (line) {
			line += " ";
			width = Math.max(width, context.measureText(line).width);
		});
		context.restore();

		return {
			width: width,
			height: (fontSize * lines.length * 1.5) * scaleFactor
		};
	}
};