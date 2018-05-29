import * as d3 from 'd3';

export {label};

function label () {

    let selection;

    let anchor_accessor,
        text_accessor;

    let aliases = d3.map(),
        attributes = d3.map(),
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


    function _label (g, s) {

        // Labels are attached to visual elements
        let data = s.nodes();

        // Attempt to set the accessors based on the
        // type of visual element
        if (data.length) {
            guess_defaults(data[0]);
        }

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

        return selection;

    }


    _label.anchor = function (_) {
        return arguments.length ? (anchor_accessor = _, _label) : anchor_accessor;
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

    _label.reposition = function () {
        if (selection) {
            selection.each(function (d) {
                let s = d3.select(d);
                let p = anchor_accessor.call(d, s.datum());
                d3.select(this)
                    .attr('x', p.x)
                    .attr('y', p.y);
            });
        }
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
        return arguments.length ? (text_accessor = _, _label) : text_accessor;
    };

    _label.type = function () {
        return 'label';
    };


    function alias (d) {
        let s = d3.select(d);
        let text = text_accessor.call(d, s.datum());
        return aliases.get(text) || text;
    }

    function guess_defaults (node) {

        if (node.tagName.toLowerCase() === 'path') {

            anchor_accessor = anchor_accessor || path_anchor_accessor;
            text_accessor = text_accessor || path_text_accessor;

        } else {

            anchor_accessor = anchor_accessor || shape_anchor_accessor;
            text_accessor = text_accessor || shape_text_accessor;

        }

    }


    return _label;

}


//
// For anchor and text accessors:
// - d: the datum associated with the shape being labeled (e.g. atom, tuple)
// - this: the DOM element of the shape being labeled (e.g. path, rect)
//

function path_anchor_accessor (d) {
    let l = this.getTotalLength();
    return this.getPointAtLength(0.5 * l);
}

function path_text_accessor (d) {
    // return d.id();
    let label = d.field().label();
    let intermediate = d.atoms().slice(1, -1);
    return intermediate.length ? label + ' [' + intermediate.map(a => a.label()) + ']' : label;
}

function shape_anchor_accessor (d) {
    return d;   // Note: each datum should have an x and y value already
}

function shape_text_accessor (d) {
    return d.label();
}