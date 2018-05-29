d3.text('test.yaml')
    .then(function (text) {

        d3.select('.gist-source')
            .select('code')
            .text(text)
            .attr('class', 'yaml')
            .each(function () {
                hljs.highlightBlock(this);
            });

        let style = jsyaml.safeLoad(text);

        d3.select('#input')
            .on('change', function () {

                let file = d3.event.target.files[0];

                let reader = new FileReader();
                reader.onerror = console.log;
                reader.onload = function () {

                    let text = reader.result;
                    let p = new DOMParser();
                    let doc = p.parseFromString(text, 'application/xml');
                    render(doc, style);

                };

                reader.readAsText(file);

            });

    });

function render(xml, style) {

    let svg = d3.select('svg');
    let instance = alloy.instance(xml);
    let data = alloy.graph_data(instance);
    let layout = alloy.parse_json(style);
    let renderer = layout(data);

    renderer(svg);

}