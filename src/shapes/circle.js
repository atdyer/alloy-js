import * as d3 from 'd3';
import {find_angle} from "../util/arrow-util";

export {circle};

function circle () {

    let selection;

    let x = function (d) {
            return d.x;
        },
        y = function (d) {
            return d.y;
        };

    let draggable = true,
        drag = d3.drag()
            .on('drag.circle', dragged);

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('r', 32);

    styles
        .set('fill', 'steelblue')
        .set('stroke', 'white')
        .set('stroke-width', 2);

    function _circle (g, data) {

        selection = g
            .selectAll('circle')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 0)
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

    _circle.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _circle)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _circle.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3.select(element).datum() === datum;
            });
    };

    _circle.drag = function () {
        return drag;
    };

    _circle.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _circle) : draggable;
    };

    _circle.intersection = function (element, path) {

        const target_circle = d3.select(element);
        const length = path.getTotalLength();
        const stroke = +target_circle.style('stroke-width') || 0;
        let radius = +target_circle.attr('r') || 0;
        radius += stroke / 2;
        if (length) {
            const endpoint = path.getPointAtLength(length);
            const intersect = path.getPointAtLength(length - (radius + 1));
            const angle = find_angle(endpoint, intersect);
            return {
                x: intersect.x,
                y: intersect.y,
                angle: angle || 0
            }
        }
        return {
            x: target_circle.attr('cx'),
            y: target_circle.attr('cy'),
            angle: 0
        }

    };

    _circle.reposition = function () {
        if (selection)
            selection
                .attr('cx', x)
                .attr('cy', y);
        return _circle;
    };

    _circle.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _circle)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _circle.type = function () {
        return 'circle';
    };


    function dragged(d) {
        if (draggable) {
            d.x = d3.event.x;
            d.y = d3.event.y;
        }
    }


    return _circle;

}