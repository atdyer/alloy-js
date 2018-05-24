import * as d3 from 'd3';

export { arrow };

function arrow () {

    let selection;

    let link,
        target;

    let draggable = false,
        drag = d3.drag();

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('d', 'M -10 -5 L 0 0 L -10 5 z');

    styles
        .set('fill', '#555')
        .set('stroke', '#555')
        .set('stroke-width', 2);

    function _arrow (g, data) {

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

    _arrow.link = function (_) {
        return arguments.length ? (link = _, _arrow) : link;
    };

    _arrow.reposition = function () {

        selection.attr('transform', function (datum) {

            // Get the visual element of the link (will be a path)
            const link_element = link.element(datum);

            // Get the visual element the arrow will be pointing to (e.g. circle, rect)
            const target_element = target.element(datum.target);

            // Calculate intersection point and angle
            if (link_element && target_element) {
                const intersection = target.intersection(target_element, link_element);
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

    _arrow.target = function (_) {
        return arguments.length ? (target = _, _arrow) : target;
    };

    _arrow.type = function () {
        return 'arrow';
    };

    return _arrow;

}