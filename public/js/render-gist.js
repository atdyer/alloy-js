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
                let data = alloy.graph_data(instance);
                let layout = alloy.parse_json(style);
                let renderer = layout(data);
                renderer(svg);

            });

    }

}