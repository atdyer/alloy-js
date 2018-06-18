function projection_display (data) {

    let all_sig_atoms = data;
    let on_change;
    let style;

    function _projection_display (div) {

        if (div) {

            div.classed('projections', true);

            let selection = div
                .selectAll('div.projection')
                .data(all_sig_atoms);

            selection
                .exit()
                .remove();

            selection = selection
                .enter()
                .append('div')
                .merge(selection)
                .classed('projection', true)
                .classed('active', function (d) { return d.projected; })
                .classed('inactive', function (d) { return !d.projected; });

            selection.each(function (signature) {

                const data = [signature, signature, signature];

                let sections = d3.select(this)
                    .selectAll('a')
                    .data(data);

                sections
                    .exit()
                    .remove();

                sections = sections
                    .enter()
                    .append('a')
                    .merge(sections)
                    .classed('section', true)
                    .attr('title', function (d, i) {
                        return i === 0
                            ? 'Previous atom'
                            : i === 1
                                ? (d.projected ? 'Unproject ' : 'Project over ') + d.signature
                                : i === 2
                                    ? 'Next atom'
                                    : null;
                    });

                sections.each(function (signature, index) {

                    if (index === 0) {

                        const left = d3.select(this)
                            .selectAll('div')
                            .data([signature]);

                        left
                            .exit()
                            .remove();

                        left
                            .enter()
                            .append('div')
                            .merge(left)
                            .classed('projection-button', true)
                            .text('<')
                            .on('click', previous);

                    }

                    if (index === 1) {

                        const middle = d3.select(this)
                            .on('click', toggle)
                            .selectAll('div')
                            .data([signature, signature]);

                        middle
                            .exit()
                            .remove();

                        middle
                            .enter()
                            .append('div')
                            .merge(middle)
                            .each(function (d, i) {

                            if (i === 0) {

                                d3.select(this)
                                    .classed('signature', true)
                                    .text(d.signature);

                            }

                            if (i === 1) {

                                d3.select(this)
                                    .classed('atom', true)
                                    .text(d.projected ? d.current : null);

                            }

                        });

                    }

                    if (index === 2) {

                        const right = d3.select(this)
                            .selectAll('div')
                            .data([signature]);

                        right
                            .exit()
                            .remove();

                        right
                            .enter()
                            .append('div')
                            .merge(right)
                            .classed('projection-button', true)
                            .text('>')
                            .on('click', next);

                    }

                })

            });

        }

    }

    _projection_display.on_change = function (callback) {
        return arguments.length ? (on_change = callback, _projection_display) : on_change;
    };

    _projection_display.style = function (json) {
        return arguments.length ? (style = json, update_from_style(style)) : style;
    };


    function fire_change_callback () {
        if (typeof on_change === 'function') {
            on_change(style);
        }
    }

    function next (d) {

        if (d.projected && style && style['projections'] && style['projections'][d.signature]) {

            const index = d.atoms.indexOf(d.current);
            const next_index = index + 1 < d.atoms.length ? index + 1 : 0;
            style['projections'][d.signature] = d.atoms[next_index];

            update_from_style(style);
            fire_change_callback();

        }

    }

    function previous (d) {

        if (d.projected && style && style['projections'] && style['projections'][d.signature]) {

            const index = d.atoms.indexOf(d.current);
            const prev_index = index - 1 >= 0 ? index - 1 : d.atoms.length - 1;
            style['projections'][d.signature] = d.atoms[prev_index];

            update_from_style(style);
            fire_change_callback();

        }

    }

    function toggle (d) {

        if (d.projected) {

            if (style && style['projections']) {

                if (d.signature in style['projections']) {

                    delete style['projections'][d.signature];
                    if (d3.keys(style['projections']).length === 0) delete style['projections'];

                }

            }

        } else {

            if (style) {

                if (!style['projections']) style['projections'] = {};
                style['projections'][d.signature] = d.current ? d.current : d.atoms[0];

            }

        }

        update_from_style(style);
        fire_change_callback();

    }

    function update_from_style (style) {

        const projections = style['projections'];

        if (projections) {

            all_sig_atoms.forEach(function (s) {

                if (s.signature in projections) {

                    const projected_atom = projections[s.signature];

                    if (s.atoms.includes(projected_atom)) {

                        s.current = projected_atom;
                        s.projected = true;

                    }

                } else {

                    s.projected = false;

                }

            });

        } else {

            all_sig_atoms.forEach(function (s) {

                s.projected = false;

            });

        }

        return _projection_display;

    }


    return _projection_display;

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