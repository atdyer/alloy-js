import * as d3 from 'd3';
import {find_angle} from "../../old/util/arrow-util";

export {circle};

function circle () {

    let circles;

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('r', 80);

    function _circle (selection) {

        selection
            .selectAll('.shape')
            .remove();

        circles = selection
            .insert('circle', ':first-child')
            .attr('class', 'shape')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', r)
            .on('click', function (d) {
                console.log(d);
            });

        circles.each(function (d) {
            d._shape = _circle;
            d._element = this;
        });

        attributes.each(function (value, key) {
            circles.attr(key, value);
        });

        styles.each(function (value, key) {
            circles.style(key, value);
        });

        return circles;

    }

    _circle.attr = function (name, value) {
        return arguments.length > 1
            ? (circles
                ? circles.attr(name, value)
                : attributes.set(name, value),
                _circle)
            : circles
                ? circles.attr(name)
                : attributes.get(name);
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
        if (circles)
            circles
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', r)
                .each(anchor);
        return _circle;
    };

    _circle.style = function (name, value) {
        return arguments.length > 1
            ? (circles
                ? circles.style(name, value)
                : styles.set(name, value),
                _circle)
            : circles
                ? circles.style(name)
                : styles.get(name);
    };

    return _circle;

}


function cx (d) {
    return d.x || 0;
}

function cy (d) {
    return d.y || 0;
}

function r () {
    return d3.select(this).attr('r') || 0;
}

function anchor (d) {
    d.anchor = {
        x: d.x,
        y: d.y
    };
}