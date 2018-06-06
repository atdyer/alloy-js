import * as d3 from 'd3';

export {rectangle};

function rectangle () {

    let rectangles;

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('width', 250)
        .set('height', 150);

    function _rectangle (selection) {

        selection
            .selectAll('.shape')
            .remove();

        rectangles = selection
            .append('rect')
            .attr('class', 'shape');

        rectangles.each(function (d) {
            d._shape = _rectangle;
        });

        attributes.each(function (value, key) {
            rectangles.attr(key, value);
        });

        styles.each(function (value, key) {
            rectangles.style(key, value);
        });

        _rectangle.reposition();

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

    _rectangle.reposition = function () {
        if (rectangles)
            rectangles
                .attr('x', x)
                .attr('y', y)
                .attr('width', width)
                .attr('height', height)
                .each(anchor);
        return _rectangle;
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

function x (d) {
    const _x = d.x || 0;
    const _w = width.call(this);
    return _x - _w / 2;
}

function y (d) {
    const _y = d.y || 0;
    const _h = height.call(this);
    return _y - _h / 2;
}

function width () {
    return +d3.select(this).attr('width') || 0;
}

function height () {
    return +d3.select(this).attr('height') || 0;
}

function anchor (d) {
    d.anchor = {
        x: d.x,
        y: d.y
    }
}