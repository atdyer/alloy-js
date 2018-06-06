import * as d3 from 'd3';

export {circle};

function circle () {

    let circles;

    let attributes = d3.map(),
        styles = d3.map();

    attributes
        .set('r', 80);

    function _circle (selection) {

        selection
            .selectAll('.shape')
            .remove();

        circles = selection
            .append('circle')
            .attr('class', 'shape')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', r);

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

    _circle.reposition = function () {
        if (circles)
            circles
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('r', r);
        return _circle;
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


function cx (d) {
    return d.x || 0;
}

function cy (d) {
    return d.y || 0;
}

function r () {
    return d3.select(this).attr('r') || 0;
}