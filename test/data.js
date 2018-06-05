d3.select('#input')
    .on('change', function () {

        let file = d3.event.target.files[0];
        let reader = new FileReader();

        reader.onload = function () {

            let text = reader.result;
            let p = new DOMParser();
            let doc = p.parseFromString(text, 'application/xml');
            test(doc);

        };

        reader.readAsText(file);

    });

function test (doc) {

    let instance = alloy.instance(doc);
    let data = alloy.data(instance);

    let atoms = alloy.group()
        .id('atoms')
        .data(data.atoms())
        .shape(default_circle());

    let tuples = alloy.group()
        .id('tuples')
        .data(data.tuples())
        .shape(default_circle());

    // Some layout is performed on the data
    atoms.data()[0].x = 100;

    let g = [atoms, tuples];
    let t = d3.select('#test');
    render(t, g);

    // The user moves some things around
    atoms.data()[0].y = 100;

    atoms = alloy.group()
        .id('atoms')
        .data(data.atoms())
        .shape(default_rectangle());

    render(t, [atoms]);



}

function render (svg, groups) {

    let selection = svg
        .selectAll('.alloy-group')
        .data(groups, function (d) { return d.id(); });

    selection
        .exit()
        .remove();

    selection = selection
        .enter()
        .append('g')
        .attr('class', 'alloy-group')
        .attr('id', function (d) { return d.id(); })
        .merge(selection);

    selection.each(function (group) {

        d3.select(this).call(group);

    });

}

function _render (svg, groups) {

    let selection = svg
        .selectAll('.alloy-group')
        .data(groups, function (d) { return d.id(); });

    selection
        .exit()
        .remove();

    selection = selection
        .enter()
        .append('g')
        .attr('class', 'alloy-group')
        .attr('id', function (d) { return d.id(); })
        .merge(selection);

    selection.each(function (data) {

        let svg_group = d3.select(this);
        let all_group = data;
        let shape = all_group.shape();

        let selection = svg_group.selectAll('.alloy-shape')
            .data(all_group.data(), function (d) { return d.id; });

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('g')
            .attr('class', 'alloy-shape')
            .attr('id', function (d) { return d.id; })
            .merge(selection)
            .call(shape);

    });

}

function default_circle () {
    return alloy.circle()
        .attr('r', 42)
        .style('fill', '#304148')
        .style('stroke', '#f8f8f8')
        .style('stroke-width', 2);
}

function default_rectangle () {
    return alloy.rectangle()
        .attr('width', 250)
        .attr('height', 150)
        .style('fill', '#304148')
        .style('stroke', '#f8f8f8')
        .style('stroke-width', 2);
}