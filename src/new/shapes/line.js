import * as d3 from 'd3';
import {arc_straight} from "../arcs";

export {line};

function line () {

    let lines;

    let curve_function = arc_straight;

    let attributes = d3.map(),
        styles = d3.map();

    styles
        .set('fill', 'none');

    function _line (selection) {

        selection
            .selectAll('.shape')
            .remove();

        lines = selection
            .append('path')
            .attr('class', 'shape');

        lines.each(function (d) {
            d._shape = _line;
        });

        attributes.each(function (value, key) {
            lines.attr(key, value);
        });

        styles.each(function (value, key) {
            lines.style(key, value);
        });

        _line.reposition();

        return lines;

    }

    _line.attr = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? lines.attr(name, value)
                : attributes.set(name, value),
                _line)
            : lines
                ? lines.attr(name)
                : attributes.get(name);
    };

    _line.reposition = function () {
        if (lines)
            lines
                .attr('d', curve_function)
                .each(anchor);
        return _line;
    };

    _line.style = function (name, value) {
        return arguments.length > 1
            ? (lines
                ? lines.style(name, value)
                : styles.set(name, value),
                _line)
            : lines
                ? lines.style(name)
                : styles.get(name);
    };

    return _line;

}


function anchor (d) {
    let l = this.getTotalLength();
    d.anchor = this.getPointAtLength(0.5 * l);
}