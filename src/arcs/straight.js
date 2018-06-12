import * as d3 from 'd3';

export {arc_straight};

function arc_straight (d) {
    const line = d3.line();
    return line([
        [d.source.x, d.source.y],
        [d.target.x, d.target.y]
    ]);
}