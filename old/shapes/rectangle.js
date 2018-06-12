import * as d3 from 'd3';
import {find_angle, find_intersection} from "../util/arrow-util";
import {label} from "./label";

export {rectangle};

function rectangle () {

    let selection;

    let x = x_center,
        y = y_center,
        anchor = anchor_center;

    let draggable = true,
        drag = d3.drag()
            .on('drag.circle', dragged);

    let labelled = true,
        labels;

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('width', 100)
        .set('height', 60);

    styles
        .set('fill', '#304148')
        .set('stroke', '#f8f8f2')
        .set('stroke-width', 2);

    function _rectangle (g, data) {

        data.forEach(function (d) {
            d._shape = _rectangle;
        });

        // selection = g
        //     .selectAll('rect')
        //     .data(data);
        //
        // selection
        //     .exit()
        //     .remove();
        //
        // selection = selection
        //     .enter()
        //     .append('rect')
        //     .merge(selection);
        selection = g
            .selectAll('g')
            .data(data, function (d) { return d.id; });

        selection
            .selectAll('*')
            .remove();

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('g')
            .attr('id', function (d) { return d.id; })
            .merge(selection)
            .append('rect');

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.call(drag);

        if (labelled) {
            labels = label();
            labels(g, selection);
        }

        return selection;

    }

    _rectangle.anchor = function (_) {
        return arguments.length ? (anchor = _, _rectangle) : anchor;
    };

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

    _rectangle.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _rectangle) : draggable;
    };

    _rectangle.intersection = function (element, path) {

        const target_rect = d3.select(element);
        const s = parseInt(target_rect.style('stroke-width')) || 0;
        const w = parseInt(target_rect.attr('width')) + 2 * s;
        const h = parseInt(target_rect.attr('height')) + 2 * s;
        const x = parseInt(target_rect.attr('x')) - s;
        const y = parseInt(target_rect.attr('y')) - s;
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

    _rectangle.labelled = function (_) {
        return arguments.length ? (labelled = !!_, _rectangle) : labelled;
    };

    _rectangle.reposition = function () {
        if (selection)
            selection
                .attr('x', x)
                .attr('y', y);
        if (labels)
            labels.reposition();
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


    function anchor_center (d) {
        return d;
    }

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

    function x_center (d) {
        const width = +d3.select(this).attr('width') || 0;
        return d.x - width / 2;
    }

    function y_center (d) {
        const height = +d3.select(this).attr('height') || 0;
        return d.y - height / 2;
    }

    return _rectangle;

}