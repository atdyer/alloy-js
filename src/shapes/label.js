import * as d3 from 'd3';
import {constant} from "../util/graph-util";

export {label};

function label () {

    let selection;

    let accessor = label_accessor;
    let aliases = d3.map();

    let x = function (d) {
            return d.x;
        },
        y = function (d) {
            return d.y;
        };

    let draggable = false,
        drag = d3.drag();

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('dy', '0.35em');

    styles
        .set('fill', '#fff')
        .set('font-family', 'monospace')
        .set('font-size', 18)
        .set('font-weight', 'bold')
        .set('pointer-events', 'none')
        .set('text-anchor', 'middle')
        .set('-webkit-user-select', 'none')
        .set('-moz-user-select', 'none')
        .set('-ms-user-select', 'none')
        .set('user-select', 'none');

    function _label (g, data) {

        selection = g
            .selectAll('text')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('text')
            .merge(selection);

        attributes.each(function (value, key) {
            selection.attr(key, value);
        });

        styles.each(function (value, key) {
            selection.style(key, value);
        });

        selection.text(alias);
        selection.call(drag);

        return selection;

    }

    _label.accessor = function (_) {
        return arguments.length ? (accessor = _, _label) : accessor;
    };

    _label.alias = function (_) {
        if (arguments.length === 1) return aliases.get(arguments[0]);
        if (arguments.length === 2) {
            arguments[1] === null ?
                aliases.remove(arguments[0]) :
                aliases.set(arguments[0], arguments[1]);
        }
        return _label;
    };

    _label.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _label)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _label.element = function (datum) {
        if (selection)
            return selection.nodes().find(function (element) {
                return d3.select(element).datum() === datum;
            });
    };

    _label.drag = function () {
        return drag;
    };

    _label.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _label) : draggable;
    };

    _label.reposition = function () {
        if (selection)
            selection
                .attr('x', x)
                .attr('y', y);
        return _label;
    };

    _label.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _label)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _label.text = function (_) {
        if (arguments.length) {
            typeof _ === 'function'
                ? accessor = _
                : accessor = constant(_);
            if (selection)
                selection.text(alias);
            return _label;
        }
        return accessor;
    };

    _label.type = function (_) {
        return 'label';
    };

    _label.x = function (_) {
        if (arguments.length) {
            if (typeof _ === 'function') {
                x = _;
            } else {
                x = constant(_);
            }
            return _label;
        }
        return x;
    };

    _label.y = function (_) {
        if (arguments.length) {
            if (typeof _ === 'function') {
                y = _;
            } else {
                y = constant(_);
            }
            return _label;
        }
        return y;
    };


    function alias (d) {
        return aliases.get(accessor(d)) || accessor(d);
    }

    function label_accessor (d) {
        return d.label();
    }


    return _label;

}