import * as d3 from "d3";

export {render};

function render (svg, data, style) {

    data.clear_projections();

    if (style && style['projections']) {

        d3.entries(style['projections']).forEach(function (p) {

            const sig = p.key;
            const atm = p.value;
            data.set_projection(sig, atm);

        });

    }

    const atoms = data.atoms();
    const tuples = data.tuples();

    console.log(atoms);
    console.log(tuples);

    layout(svg, atoms, tuples);

    let t = svg
        .selectAll('.tuple')
        .data(tuples, function (d) { return d.id; });

    t
        .exit()
        .remove();

    t = t
        .enter()
        .append('path')
        .merge(t)
        .attr('class', 'tuple')
        .attr('id', function (d) { return d.id; })
        .attr('d', line)
        .style('stroke', 'black');

    let a = svg
        .selectAll('.atom')
        .data(atoms, function (d) { return d.id; });

    a
        .exit()
        .remove();

    a = a
        .enter()
        .append('circle')
        .merge(a)
        .attr('class', 'atom')
        .attr('id', function (d) { return d.id; })
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 42)
        .style('stroke', 'black');

    let l = svg
        .selectAll('text')
        .data(atoms, function (d) { return d.id; });

    l
        .exit()
        .remove();

    l = l
        .enter()
        .append('text')
        .merge(l)
        .attr('x', function (d) { return d.x; })
        .attr('y', function (d) { return d.y; })
        .text(function (d) { return d.id; });

    if (style && style['groups']) {

        d3.entries(style['groups']).forEach(function (g) {

            const grp = g.value;
            const gid = g.key;
            const d = grp.data === 'atoms' ? a : t;

            d3.entries(grp.attributes).forEach(function (attr) {
                d.attr(attr.key, attr.value);
            });

            d3.entries(grp.style).forEach(function (style) {
                d.style(style.key, style.value);
            });

        });

    }


}

function line (d) {
    const line = d3.line();
    return line([
        [d.source.x || 0, d.source.y || 0],
        [d.target.x || 0, d.target.y || 0]
    ]);
}

function layout (svg, atoms, tuples) {

    let cx = parseInt(svg.style('width')) / 2;
    let cy = parseInt(svg.style('height')) / 2;

    atoms.forEach(function (a) {
        if ('x' in a) a.fx = a.x;
        if ('y' in a) a.fy = a.y;
    });

    let simulation = d3.forceSimulation(atoms)
        .force('center', d3.forceCenter(cx, cy))
        .force('collide', d3.forceCollide(65))
        .force('charge', d3.forceManyBody().strength(-80))
        .force('links', d3.forceLink(tuples).distance(150))
        .force('x', d3.forceX(cx))
        .force('y', d3.forceY(cy))
        .stop();

    let i = 0;
    const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
    for (; i < n; ++i) {
        simulation.tick();
    }

    atoms.forEach(function (a) {
        if ('fx' in a) delete a.fx;
        if ('fy' in a) delete a.fy;
    });

}