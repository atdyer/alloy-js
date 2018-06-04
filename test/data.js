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

    let atoms = data.atoms();

    console.log(data.atoms());
    console.log(data.tuples());

    atoms.find(a => a.id === 'Eve$0').x = 123.345;

    console.log('Projecting: this/Man: Man$0');
    data.set_projection('this/Man', 'Man$0');

    console.log(data.atoms());
    console.log(data.tuples());

    // data.remove_projection('this/Man');
    //
    // console.log(data.atoms());
    // console.log(data.tuples());

}