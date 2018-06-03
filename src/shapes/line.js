import * as d3 from 'd3';
import {arc_straight} from "../arcs/straight";
import {label} from "./label";
import {arrow} from "./arrow";

export {line};

function line () {

    let selection;

    let arr = arrow(_line);
    let curve_function = arc_straight;

    let draggable = false,
        drag = d3.drag();

    let labeller = label()
        .style('fill', '#121e25')
        .style('font-weight', 'lighter')
        .style('font-size', '10px');

    let attributes = d3.map(),
        styles = d3.map();

    styles
        .set('fill', 'none')
        .set('stroke', '#304148')
        .set('stroke-width', 1);

    function _line (g, data) {

        selection = g
            .selectAll('.line')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('path')
            .attr('class', 'line')
            .attr('id', t => t.id())
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.call(drag);

        if (arr)
            arr(g, data);

        if (labeller)
            labeller(g, selection);

        return selection;

    }


    _line.attr = function (name, value) {
        arr.attr(name, value);
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

    _line.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _line) : draggable;
    };

    _line.label = function (_) {
        return arguments.length ? (labeller = !!_, _line) : labeller;
    };

    _line.reposition = function () {

        if (selection)
            selection
                .attr('d', curve_function);

        if (arr)
            arr.reposition();

        if (labeller)
            labeller.reposition();

        return _line;

    };

    _line.style = function (name, value) {
        arr.style(name, value);
        if (name === 'stroke') arr.style('fill', value);
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