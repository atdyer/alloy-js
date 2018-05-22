import * as d3 from 'd3';
import {arc_straight} from "../arcs/straight";

export {line};

function line () {

    let selection;

    let curve_function = arc_straight;

    let draggable = false,
        drag = d3.drag();

    let attributes = d3.map(),
        styles = d3.map();

    styles
        .set('fill', 'none')
        .set('stroke', '#555')
        .set('stroke-width', 1);

    function _line (g, data) {

        selection = g
            .selectAll('path')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('path')
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


    _line.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _line)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _line.curve = function (_) {
        return arguments.length ? (curve_function = _, _line) : curve_function;
    };

    _line.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3.select(element).datum() === datum;
            });
    };

    _line.drag = function () {
        return drag;
    };

    _line.reposition = function () {

        if (selection)
            selection
                .attr('d', curve_function);

        return _line;

    };

    _line.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _line)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _line.type = function () {
        return 'line';
    };


    return _line;

}