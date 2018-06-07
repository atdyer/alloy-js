import * as d3 from 'd3';

export {arc_straight};

function arc_straight (d) {
    const line = d3.line();
    return line([
        [d.source.x || 0, d.source.y || 0],
        [d.target.x || 0, d.target.y || 0]
    ]);
}