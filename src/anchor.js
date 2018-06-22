import * as d3 from 'd3';

export {place_group_anchors, place_tuple_anchors};

function place_tuple_anchors (tuples) {

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

function place_group_anchors (groups) {

    const g = d3.map(groups, g => g.id());

    groups.forEach(function (group) {
        const anchor = g.get(group.anchor());
        if (anchor) {

            // Set the anchor to be the actual group
            group.anchor(anchor);

            // Filter the data to only include anchored items
            const group_data = group.data();
            const anchor_data = anchor.data();

            group.data(group_data.filter(function (d) {

                return ~anchor_data.findIndex(function (datum) {
                    return array_equal(d.projection, datum.projection);
                });

            }));

        }
    });

}

function key_function (tuple) {
    return tuple.source.id + tuple.target.id;
}

function calculate_anchor (index, count) {
    return 0.15 + 0.7 * (index + 1) * (1 / (count+1));
}

function array_equal (a, b) {
    return Array.isArray(a) && Array.isArray(b)
        ? a.length === b.length
            ? a.every((v, i) => b[i] === v)
            : false
        : false;
}