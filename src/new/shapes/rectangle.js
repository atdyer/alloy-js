import * as d3 from 'd3';

export {rectangle};

function rectangle () {

    let rectangles;

    let attributes = d3.map(),
        styles = d3.map();

    function _rectangle (selection) {

        selection
            .selectAll('*')
            .remove();

        rectangles = selection
            .append('rect')
            .attr('x', function (d) { return d.x || 0; })
            .attr('y', function (d) { return d.y || 0; })
            .attr('width', function (d) { return d.width || 0; })
            .attr('height', function (d) { return d.height || 0;});

        rectangles.each(function (d) {
            d._shape = _rectangle;
        });

        attributes.each(function (value, key) {
            rectangles.attr(key, value);
        });

        styles.each(function (value, key) {
            rectangles.style(key, value);
        });

        return rectangles;

    }

    _rectangle.attr = function (name, value) {
        return arguments.length > 1
            ? (rectangles
                ? rectangles.attr(name, value)
                : attributes.set(name, value),
                _rectangle)
            : rectangles
                ? rectangles.attr(name)
                : attributes.get(name);
    };

    _rectangle.style = function (name, value) {
        return arguments.length > 1
            ? (rectangles
                ? rectangles.style(name, value)
                : styles.set(name, value),
                _rectangle)
            : rectangles
                ? rectangles.style(name)
                : styles.get(name);
    };

    return _rectangle;

}