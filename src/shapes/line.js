import * as d3 from 'd3';
import {arc_straight} from "../arcs";

export {line};

function line () {

    let lines,
        arrows;

    let curve_function = arc_straight;

    let attributes = d3.map(),
        styles = d3.map();

    styles
        .set('fill', 'none');

    function _line (selection) {

        selection
            .selectAll('.shape')
            .remove();

        selection
            .selectAll('.arrow')
            .remove();

        lines = selection
            .insert('path', ':first-child')
            .attr('class', 'shape')
            .on('click', function (d) {
                console.log(d);
            });

        arrows = selection
            .append('g')
            .attr('class', 'arrow');

        arrows.append('rect')
            .attr('x', -10)
            .attr('y', -5)
            .attr('width', 20)
            .attr('height', 10)
            .style('stroke', 'none')
            .style('fill', 'white');

        arrows
            .append('path')
            .attr('d', 'M -10 -5 L 0 0 L -10 5 z')
            .style('stroke-width', 0);

        lines.each(function (d) {
            d._shape = _line;
            d._element = this;
        });

        attributes.each(function (value, key) {
            _line.attr(key, value);
        });

        styles.each(function (value, key) {
            _line.style(key, value);
        });

        _line.reposition();

        return lines;

    }

    _line.attr = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? apply_attribute(name, value)
                : attributes.set(name, value),
                _line)
            : lines
                ? lines.attr(name)
                : attributes.get(name);
    };

    _line.curve = function (_) {
        return arguments.length ? (curve_function = _, _line) : curve_function;
    };

    _line.reposition = function () {
        if (lines)
            lines
                .attr('d', curve_function)
                .each(anchor)
                .each(arrow);
        return _line;
    };

    _line.style = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? apply_style(name, value)
                : styles.set(name, value),
                _line)
            : lines
                ? lines.style(name)
                : styles.get(name);
    };

    function apply_attribute (name, value) {
        if (lines) lines.attr(name, value);
        if (arrows) arrows.attr(name, value);
    }

    function apply_style (name, value) {
        if (lines) lines.attr(name, value);
        if (arrows) {
            if (name !== 'fill' && name !== 'stroke-width') arrows.style(name, value);
            if (name === 'stroke') arrows.style('fill', value);
        }
    }

    return _line;

}

function anchor (d) {
    let l = this.getTotalLength();
    if (d.anchor && d.anchor.percent) {
        let p = this.getPointAtLength(d.anchor.percent * l);
        d.anchor.x = p.x;
        d.anchor.y = p.y;
    } else {
        this.getPointAtLength(0.5 * l);
    }
}

function arrow (d) {

    const target = d.target;

    if (target && target._shape && target._element) {

        const arrow = d3.select(this.parentNode).select('.arrow');
        const shape = target._shape;
        const element = target._element;

        const intersection = typeof shape.intersection === 'function'
            ? shape.intersection(element, this)
            : arrow_anchor_fallback(target);

        arrow.attr('transform', 'translate(' + intersection.x + ',' + intersection.y + ') rotate(' + intersection.angle + ')');

    }
}

function arrow_anchor_fallback (shape) {
    return {
        x: shape.anchor ? shape.anchor.x : shape.x,
        y: shape.anchor ? shape.anchor.y : shape.y,
        angle: 0
    };
}