import * as d3 from 'd3';

export {circle};

function circle () {

    let circles;

    let attributes = d3.map(),
        styles = d3.map();

    function _circle (selection) {

        selection
            .selectAll('*')
            .remove();

        circles = selection
            .append('circle')
            .attr('cx', function (d) { return d.x || 0; })
            .attr('cy', function (d) { return d.y || 0; })
            .attr('r', function (d) { return d.r || 0; });

        circles.each(function (d) {
            d._shape = _circle;
        });

        attributes.each(function (value, key) {
            circles.attr(key, value);
        });

        styles.each(function (value, key) {
            circles.style(key, value);
        });

        return circles;

    }

    _circle.attr = function (name, value) {
        return arguments.length > 1
            ? (circles
                ? circles.attr(name, value)
                : attributes.set(name, value),
                _circle)
            : circles
                ? circles.attr(name)
                : attributes.get(name);
    };

    _circle.style = function (name, value) {
        return arguments.length > 1
            ? (circles
                ? circles.style(name, value)
                : styles.set(name, value),
                _circle)
            : circles
                ? circles.style(name)
                : styles.get(name);
    };

    return _circle;

}