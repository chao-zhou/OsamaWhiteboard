/**
 * Created by cody on 7/2/15.
 */

/**
 * @type {{rectangleRectangle: Function, pointEllipse: Function, pointLine: Function, lineInCircle: Function}}
 */
var ShapeCollisions =
{
    /**
     * @param {{x:number, y:number, width: number, height: number}} rect1
     * @param {{x:number, y:number, width: number, height: number}} rect2
     * @returns {boolean}
     */
    rectangleRectangle: function (rect1, rect2)
    {
        if (rect1.width < 0 || rect1.height < 0 || rect2.width < 0 || rect2.height < 0)
            console.error("Negative width or height values will return false.");
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y
    },
    /**
     * @param {{x:number, y:number}} point
     * @param {{x:number, y:number, width:number, height:number}} ellipse
     * @returns {boolean}
     */
    pointEllipse: function (point, ellipse)
    {
        var xRadius = ellipse.width / 2;
        var yRadius = ellipse.height / 2;
        var leftSide = Math.pow(point.x - ellipse.x, 2) / Math.pow(xRadius,2);
        var rightSide = Math.pow(point.y - ellipse.y, 2) / Math.pow(yRadius, 2);
        var x = leftSide + rightSide;
        return x <= 1;
    },
    /**
     * @param {{x:number, y:number}} point
     * @param {{startX:number, startY:number, endX:number, endY:number}} line
     * @param {number} lineWidth (used for rectangle width)
     * @returns {boolean}
     */
    pointLine: function (point, line, lineWidth)
    {
        return this.lineInCircle(line.startX, line.startY, line.endX, line.endY, point.x, point.y, lineWidth);
    },

    /**
     * @param {number} sx
     * @param {number} sy
     * @param {number} x
     * @param {number} y
     * @param {number} cx
     * @param {number} cy
     * @param {number} radius
     * @returns {boolean}
     */
    lineInCircle: function (sx, sy, x, y, cx, cy, radius) {
        if (sx > cx + radius && x > cx + radius || x < cx - radius && sx < cx - radius) {return false;}
        if (sy > cy + radius && y > cy + radius || y < cy - radius && sy < cy - radius) {return false;}
        var k = ((y - sy) * (cx - sx) - (x - sx) * (cy - sy)) / ((y - sy) * (y - sy) + (x - sx) * (x - sx));
        var ncx = k * (y - sy);
        var ncy = k * (x - sx);
        var xx = Math.sqrt(ncx * ncx + ncy * ncy);
        return radius >= xx;
    }
};
