function projection_display (data) {

    let all_sig_atoms = data;
    let on_change;
    let style;

    const arrow_data_right = 'M32,16.009c0-0.267-0.11-0.522-0.293-0.714  l-9.899-9.999c-0.391-0.395-1.024-0.394-1.414,0c-0.391,0.394-0.391,1.034,0,1.428l8.193,8.275H1c-0.552,0-1,0.452-1,1.01  s0.448,1.01,1,1.01h27.586l-8.192,8.275c-0.391,0.394-0.39,1.034,0,1.428c0.391,0.394,1.024,0.394,1.414,0l9.899-9.999  C31.894,16.534,31.997,16.274,32,16.009z';
    const arrow_data_left = 'M31.106,15H3.278l8.325-8.293  c0.391-0.391,0.391-1.024,0-1.414c-0.391-0.391-1.024-0.391-1.414,0l-9.9,9.899c-0.385,0.385-0.385,1.029,0,1.414l9.9,9.9  c0.391,0.391,1.024,0.391,1.414,0c0.391-0.391,0.391-1.024,0-1.414L3.278,17h27.828c0.552,0,1-0.448,1-1  C32.106,15.448,31.658,15,31.106,15z';

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

                        let left = d3.select(this)
                            .selectAll('div')
                            .data([signature]);

                        left
                            .exit()
                            .remove();

                        left = left
                            .enter()
                            .append('div')
                            .merge(left)
                            .classed('projection-button', true)
                            .on('click', previous);

                        const icon = left
                            .selectAll('svg')
                            .data([signature]);

                        icon
                            .exit()
                            .remove();

                        icon
                            .enter()
                            .append('svg')
                            .attr('viewBox', '0 0 32 32')
                            .attr('width', 32)
                            .attr('height', 32)
                            .append('path')
                            .attr('d', arrow_data_left)
                            .attr('transform', 'translate(0 0.5)')
                            .attr('fill', 'black')
                            .attr('fill-rule', 'evenodd')
                            .attr('clip-rule', 'evenodd');

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

                        let right = d3.select(this)
                            .selectAll('div')
                            .data([signature]);

                        right
                            .exit()
                            .remove();

                        right = right
                            .enter()
                            .append('div')
                            .merge(right)
                            .classed('projection-button', true)
                            .on('click', next);

                        const icon = right
                            .selectAll('svg')
                            .data([signature]);

                        icon
                            .exit()
                            .remove();

                        icon
                            .enter()
                            .append('svg')
                            .attr('viewBox', '0 0 32 32')
                            .attr('width', 32)
                            .attr('height', 32)
                            .append('path')
                            .attr('d', arrow_data_right)
                            .attr('transform', 'translate(0 0.5)')
                            .attr('fill', 'black')
                            .attr('fill-rule', 'evenodd')
                            .attr('clip-rule', 'evenodd');

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