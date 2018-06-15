function render (gist, inst) {

    let files = d3.values(gist.files);

    d3.select('.gist-readme')
        .data(files, function (d) { return d ? d.filename : this.getAttribute('data-key'); })
        .each(function (d) {
            let readme = d3.select(this);
            d3.text(d.raw_url)
                .then(function (text) {
                    readme.html(new showdown.Converter().makeHtml(text));
                });
        });

    d3.select('.gist-source')
        .data(files, function (d) { return d ? d.filename : this.getAttribute('data-key'); })
        .select('code')
        .attr('class', function(d) {
            return d.language && (d.language === "JSON" ? "javascript" : d.language.toLowerCase());
        })
        .each(function (d) {
            let code = d3.select(this);
            d3.text(d.raw_url)
                .then(function (text) {
                    code.text(text);
                    hljs.highlightBlock(code.node());
                });
        });

    if (!gist.files['instance.yaml']) {
        gist.files['instance.yaml'] = {
            raw_url: '/defaults/instance.yaml'
        }
    }

    if (gist.files[inst] && gist.files['instance.yaml']) {

        let instance_promise = d3.text(gist.files[inst].raw_url);

        let style_promise = d3.text(gist.files['instance.yaml'].raw_url)
            .then(jsyaml.safeLoad);

        Promise.all([instance_promise, style_promise])
            .then(function (results) {

                let doc = results[0];
                let style = results[1];

                let p = new DOMParser();
                let xml = p.parseFromString(doc, 'application/xml');
                let instance = alloy.instance(xml);

                let src = instance.sources().entries()[0];
                d3.select('.instance-source')
                    .select('h2')
                    .text(src.key)
                    .append('a')
                    .attr('class', 'anchor')
                    .attr('name', src.key)
                    .attr('href', '#' + src.key)
                    .text('#');

                d3.select('.instance-source')
                    .select('code')
                    .attr('class', 'alloy')
                    .text(src.value)
                    .each(function () {
                        hljs.highlightBlock(this);
                    });

                let svg = d3.select('svg');
                let graph = alloy.graph(instance);
                let display = alloy.display(graph);
                display.style(style);
                display(svg);

                let all_sig_atoms = signature_atoms(instance);
                let projections = projection_display(all_sig_atoms);
                projections.on_change(function (style) {
                    display.style(style)(svg);
                    projections(d3.select('#projections'));
                })
                    .style(style);


            });

    }

}

function signature_atoms (instance) {

    function all_atoms (signature) {
        const atoms = signature
            .children()
            .map(c => all_atoms(c))
            .reduce((a, b) => a.concat(b), []);
        return atoms.concat(signature.atoms());
    }

    const data = [];
    const signatures = instance.signatures();

    signatures.forEach(function (sig) {
        const atoms = all_atoms(sig);
        if (atoms.length > 1 && sig.label() !== 'univ') {
            data.push({
                signature: sig.label(),
                atoms: atoms.map(a => a.label())
            });
        }
    });

    return data;

}

function display_projections(svg, instance, graph, style, display) {

    const all_sigs_atoms = signature_atoms(instance);
    console.log(all_sigs_atoms);

}

// function _display_projections (svg, instance, graph, style, display) {
//
//     let adder = d3.select('#add-projection');
//     let projections = d3.select('#projections');
//
//     let p = graph.projections().entries().map(function (e) {
//         return {
//             atom: e.value,
//             signature: e.key
//         }
//     });
//
//     update_projections(p);
//
//     function update_projections (data) {
//
//         let selection = projections
//             .selectAll('div.projection')
//             .data(data);
//
//         selection
//             .exit()
//             .remove();
//
//         selection
//             .enter()
//             .append('div')
//             .attr('class', 'projection')
//             .merge(selection)
//             .each(function (d) {
//
//                 let sig = d3.select(this)
//                     .selectAll('div.projection-signature')
//                     .data([d]);
//
//                 sig
//                     .exit()
//                     .remove();
//
//                 sig
//                     .enter()
//                     .append('div')
//                     .attr('class', 'projection-signature')
//                     .merge(sig)
//                     .text(function (d) { return d.signature; });
//
//                 let atm = d3.select(this)
//                     .selectAll('div.projection-atom')
//                     .data([d]);
//
//                 atm
//                     .exit()
//                     .remove();
//
//                 atm
//                     .enter()
//                     .append('div')
//                     .attr('class', 'projection-atom')
//                     .merge(atm)
//                     .text(function (d) { return d.atom; });
//
//                 d3.select(this)
//                     .append('div')
//                     .attr('class', 'projection-button right')
//                     .text('>');
//
//                 d3.select(this)
//                     .append('div')
//                     .attr('class', 'projection-button left')
//                     .text('<');
//
//             });
//
//     }
//
//
// }