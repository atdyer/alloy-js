import * as d3 from 'd3';

export {place_anchors};

function place_anchors (tuples) {

    const counts = d3.map();
    const indices = d3.map();

    tuples.forEach(function (tuple) {

        if (tuple.source && tuple.target) {

            const key = key_function(tuple);

            if (!counts.has(key)) {
                counts.set(key, 0);
                indices.set(key, 0);
            }

            counts.set(key, counts.get(key) + 1);

        }

    });

    tuples.forEach(function (tuple) {

        if (tuple.source && tuple.target) {

            const key = key_function(tuple);

            if (counts.has(key)) {

                const count = counts.get(key);
                const index = indices.get(key);
                indices.set(key, index + 1);

                if (!tuple.anchor) {
                    tuple.anchor = {};
                }

                tuple.anchor.percent = calculate_anchor(index, count);

            }

        }

    });

}

function key_function (tuple) {
    return tuple.source.id + tuple.target.id;
}

function calculate_anchor (index, count) {
    return 0.15 + 0.7 * (index + 1) * (1 / (count+1));
}