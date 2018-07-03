import * as d3 from 'd3';
import {find_angle, find_intersection} from "../util";

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
            .insert('rect', ':first-child')
            .attr('class', 'shape')
            .on('click', function (d) {
                if (typeof d.print === 'function') d.print(d);
            });

        rectangles.each(function (d) {
            d._shape = _rectangle;
            d._element = this;
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

    _rectangle.intersection = function (element, path) {
        const target_rect = d3.select(element);
        const s = parseFloat(target_rect.style('stroke-width')) || 0;
        console.log(target_rect.style('stroke-width'));
        const w = parseFloat(target_rect.attr('width')) + s;
        const h = parseFloat(target_rect.attr('height')) + s;
        const x = parseFloat(target_rect.attr('x')) - 0.5 * s;
        const y = parseFloat(target_rect.attr('y')) - 0.5 * s;
        const l = path.getTotalLength();
        const center = path.getPointAtLength(l);
        let intersection = find_intersection(path, is_inside(x, y, w, h));
        if (intersection) {
            intersection.angle = find_angle(center, intersection);
            return intersection;
        }
        return {
            x: center.x,
            y: center.y,
            angle: 0
        };
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

function is_inside(x, y, w, h) {

    return function (pt) {
        return pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
    };

}