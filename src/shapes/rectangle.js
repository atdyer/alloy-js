import * as d3 from 'd3';
import {find_angle, find_intersection} from "../util/arrow-util";

export {rectangle};

function rectangle () {

    let selection;

    let x = function (d) {
        const width = +d3.select(this).attr('width') || 0;
        return d.x - width / 2;
    };

    let y = function (d) {
        const height = +d3.select(this).attr('height') || 0;
        return d.y - height / 2;
    };

    let draggable = true,
        drag = d3.drag()
            .on('drag.circle', dragged);

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('width', 100)
        .set('height', 60);

    styles
        .set('fill', 'steelblue')
        .set('stroke', 'white')
        .set('stroke-width', 2);

    function _rectangle (g, data) {

        selection = g
            .selectAll('rect')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('rect')
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.call(drag);

        return selection;

    }

    _rectangle.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _rectangle)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _rectangle.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3.select(element).datum() === datum;
            });
    };

    _rectangle.drag = function () {
        return drag;
    };

    _rectangle.intersection = function (element, path) {

        const target_rect = d3.select(element);
        const w = parseInt(target_rect.attr('width'));
        const h = parseInt(target_rect.attr('height'));
        const x = parseInt(target_rect.attr('x'));
        const y = parseInt(target_rect.attr('y'));
        const center = {
            x: x + w / 2,
            y: y + h / 2
        };
        let intersection = find_intersection(path, is_inside(x, y, w, h));
        if (intersection) {
            intersection = snap_to_edge(intersection, x, y, w, h);
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
        if (selection)
            selection
                .attr('x', x)
                .attr('y', y);
        return _rectangle;
    };

    _rectangle.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _rectangle)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _rectangle.type = function () {
        return 'rectangle';
    };


    function dragged(d) {
        if (draggable) {
            d.x = d3.event.x;
            d.y = d3.event.y;
        }
    }

    function is_inside(x, y, w, h) {

        const f = function (pt) {
            return pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
        };

        f.x = x;
        f.y = y;
        f.w = w;
        f.h = h;

        return f;

    }

    function snap_to_edge (pt, x, y, w, h) {

        const tol = 1;
        let xp = pt.x;
        let yp = pt.y;
        if (Math.abs(xp - x) < tol) xp = x;
        if (Math.abs(xp - (x + w)) < tol) xp = x + w;
        if (Math.abs(yp - y) < tol) yp = y;
        if (Math.abs(yp - (y + h)) < tol) yp = y + h;
        return {
            x: xp,
            y: yp
        };

    }

    return _rectangle;

}