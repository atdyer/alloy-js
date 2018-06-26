import * as d3 from 'd3';

export {aliases, label};

const aliases = d3.map();

function label () {

    let labels;

    let attributes = d3.map(),
        styles = d3.map();

    function _label (selection) {

        labels = selection
            .selectAll('.label')
            .data(lines);

        labels
            .exit()
            .remove();

        labels = labels
            .enter()
            .insert('text')
            .attr('class', 'label')
            .merge(labels)
            .attr('x', x)
            .attr('y', y)
            .attr('dy', dy)
            .text(function (d) { return d.text; });

        attributes.each(function (value, key) {
            labels.attr(key, value);
        });

        styles.each(function (value, key) {
            labels.style(key, value);
        });

        return labels;

    }

    _label.alias = function (name, alias) {
        return arguments.length > 1
            ? aliases.set(name, alias)
            : aliases.get(name);
    };

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
                .attr('y', y)
                .style('display', styles.get('display') || null);
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
            let intermediate = d.projection.slice(1, -1);
            return intermediate.length
                ? [label + ' [' + intermediate.map(a => aliases.get(a.id) || a.id) + ']']
                : [label];
        }
        if (d.type === 'atom') {
            let label = aliases.get(d.id) || d.id;
            if (d.fields) {
                let sets = d3.entries(d.fields).reduce((acc, o) => o.value.length ? acc : (acc.push(o.key), acc), []);
                if (sets.length) {
                    let set_str = '(' + sets.join(', ') + ')';
                    return [label, set_str];
                }
            }
            return [label];
        }
    }

    function lines (d) {

        return alias(d).map(function (line, index) {
            return {
                dy: index > 0 ? 1.2 : 0,
                parent: d,
                text: line
            }
        });

    }


    return _label;

}


function x (d) {
    return d.parent.anchor ? d.parent.anchor.x : d.parent.x;
}

function y (d) {
    return d.parent.anchor ? d.parent.anchor.y : d.parent.y;
}

function dy (d, i, g) {
    return i - 0.5 * (g.length - 1) + 'em';
}