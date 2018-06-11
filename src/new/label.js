import * as d3 from 'd3';

export {label};

function label () {

    let labels;

    let aliases = d3.map(),
        attributes = d3.map(),
        styles = d3.map();

    function _label (selection) {

        selection
            .selectAll('.label')
            .remove();

        labels = selection
            .append('text')
            .attr('class', 'label')
            .attr('x', x)
            .attr('y', y)
            .text(alias);

        attributes.each(function (value, key) {
            labels.attr(key, value);
        });

        styles.each(function (value, key) {
            labels.style(key, value);
        });

        return labels;

    }

    _label.attr = function (name, value) {
        return arguments.length > 1
            ? (labels
                ? labels.attr(name, value)
                : attributes.set(name, value),
                _label)
            : labels
                ? labels.attr(name)
                : attributes.get(name);
    };

    _label.reposition = function () {
        if (labels)
            labels
                .attr('x', x)
                .attr('y', y);
        return _label;
    };

    _label.style = function (name, value) {
        return arguments.length > 1
            ? (labels
                ? labels.style(name, value)
                : styles.set(name, value),
                _label)
            : labels
                ? labels.style(name)
                : styles.get(name);
    };


    function alias (d) {
        if (d.type === 'tuple') {
            let label = d.field;
            let intermediate = d.atoms.slice(1, -1);
            return intermediate.length
                ? label + ' [' + intermediate.map(a => a.id) + ']'
                : label;
        }
        if (d.type === 'atom') {
            return aliases.get(d.id) || d.id;
        }
    }


    return _label;

}


function x (d) {
    return d.anchor ? d.anchor.x : d.x;
}

function y (d) {
    return d.anchor ? d.anchor.y : d.y;
}