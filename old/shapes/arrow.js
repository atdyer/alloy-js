import * as d3 from 'd3';

export {arrow};

function arrow (l) {

    let selection;

    let draggable = false,
        drag = d3.drag();

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('d', 'M -10 -5 L 0 0 L -10 5 z');

    styles
        .set('fill', '##304148')
        .set('stroke', '##304148')
        .set('stroke-width', 2);

    function _arrow (g, data) {

        selection = g
            .selectAll('.arrow')
            .data(data);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('path')
            .attr('class', 'arrow')
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

    _arrow.attr = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.attr(name, value)
                : attributes.set(name, value),
                _arrow)
            : selection
                ? selection.attr(name)
                : attributes.get(name);
    };

    _arrow.drag = function () {
        return drag;
    };

    _arrow.draggable = function (_) {
        return arguments.length ? (draggable = !!_, _arrow) : draggable;
    };

    _arrow.reposition = function () {

        selection.attr('transform', function (datum) {

            // Get the visual element of the link (will be a path)
            const path = l.element(datum);

            if (path && datum.target._shape) {

                // Get the visual element the arrow will be pointing to (e.g. circle, rect)
                const target_element = datum.target._shape.element(datum.target);

                // Calculate intersection point and angle
                const intersection = datum.target._shape.intersection(target_element, path);

                // Create tranlate/rotate string
                return 'translate(' + intersection.x + ',' + intersection.y + ') rotate(' + intersection.angle + ')';
            }

        });

    };

    _arrow.style = function (name, value) {
        return arguments.length > 1
            ? (selection
                ? selection.style(name, value)
                : styles.set(name, value),
                _arrow)
            : selection
                ? selection.style(name)
                : styles.get(name);
    };

    _arrow.type = function () {
        return 'arrow';
    };

    return _arrow;

}