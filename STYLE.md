The `instance.yaml` file controls how an instance is presented using Alloy Instances. [YAML](https://en.wikipedia.org/wiki/YAML) is a simple, human-readable language that is often used for configuration files. In Alloy Instances, we use it to describe how an instance should be displayed. If you've never used YAML before, do not fret. It is practically self-explanatory, and only a small subset of the language is needed for Alloy Instances. You should be able to pick it up just by reading through this guide and looking at examples. Alternatively, the [YAML spec](http://yaml.org/spec/1.2/spec.html) is comprehensive should you need a language reference.

Alloy Instance configurations make heavy use of [YAML mappings](http://yaml.org/spec/1.2/spec.html#mapping//), which are essentially just `key: value` pairs. The `value` in a pair can be just about anything... a number, a string, a list, even a set of mappings. Take a look at the following YAML file, which is used as the default style in an Alloy Instance when none is provided.
 
```yaml
groups:
  edges:
    index: 0
    shape: line
    data: tuples
  nodes:
    index: 1
    shape: rectangle
    data: atoms
```
 
At the top level we have a key `groups` which maps to a pair of mappings: `edges` and `nodes`. Each of these keys then maps to a set of three mappings: `index`, `shape`, and `data`. The `index` key then maps to a number, and the `shape` and `data` keys map to strings. This should feel very familiar to anybody who has ever used an [associative array](https://en.wikipedia.org/wiki/Associative_array) data type in another language (Javascript: [Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), Python: [dicts](https://docs.python.org/3/library/stdtypes.html#typesmapping), Java: [HashMap](https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html), etc.).
 
The groups section of the `instance.yaml` file defines how the instance data is represented visually by binding data elements to shapes. In an Alloy instance, there are two data types: `atoms` and `tuples`. These data types are essentially analagous to atoms and relations in Alloy, with a few minor exceptions that aid in creating nice visualizations. Each group is a binding of a set of data to a visual element, such as a circle or line.
 
<aside>The labels are used as ids for actual SVG groups, which can be useful for debugging purposes. Right-click on the instance visualization and click 'Inspect Element' (or similar, depending on your browser).</aside>
 
Each group is defined by a label that maps to a set of values. In the default style shown above, `edges` and `nodes` are the labels given to each of the two groups. The label names are completely arbitrary; feel free to name them as you please, although they must be unique.
 
Because groups are used to map data to shapes, each group must have, at a minimum, the `shape` and `data` keys. The `index` is used to determine rendering order; lower values are rendered before higher values. If you were to change the index of `edges` to 2, for example, you'd see the `edges` lines rendered on top of the `nodes` rectangles.

The following API reference gives a complete specification of all options available for use in the `instance.yaml` file.

## API Reference

* [`aliases`](#aliases)
* [`groups`](#groups)
  * [`data`](#groups-data)
  * [`shape`](#groups-shape)
  * [`anchor`](#groups-anchor)
  * [`index`](#groups-index)
  * [`label`](#groups-label)
* [`functions`](#functions)
* [`layout`](#layout)
  * [`positions`](#layout-positions)
  * [`zoom`](#layout-zoom)
* [`projections`](#projections)

### <a name='aliases' class='anchor' href='#aliases'>#</a> **`aliases:`** _mapping_

A _mapping_ of key, value pairs of aliases for atoms. The key must be the atom name used by Alloy, and the value must be a _string_. Any time an atom name appears in a label, the alias name defined here will be used.

### <a name='groups' class='anchor' href='#groups'>#</a> **`groups:`** _mapping_
 
A _mapping_ of key, value pairs of groups, where keys are group labels and values are _mappings_ that describe each group.

<a name="groups-data" href="#groups-data">#</a> **`data`:** _string_ | _sequence_ | _mapping_
 
A string, sequence, or mapping describing the data used in the group. The following _strings_ are valid:

* `atoms` - The set of all atoms in the instance
* `tuples` - The set of all tuples in the instance
* Any signature name from the Alloy model
* Any relation name from the Alloy model

A _sequence_ can be any combination of these valid _strings_.

If `data` is a _mapping_, the following must be provided:

<div class='subsection'>

<a name="groups-data-source" href="#groups-data-source">#</a> **`source`:** _string_ | _sequence_

A string or sequence describing the data used in the group. Any string or sequence that is valid for the [data](#groups-data) field is valid here.

<a name="groups-data-filters" href="#groups-data-filters">#</a> **`filters`:** _sequence_

(Optional) If filters are provided, the data from [source](#groups-data-source) is filtered using each filter in the _sequence_. Filters are applied in the order in which they appear in _sequence_, each receiving as input the output of the previous filter. The following items are valid entries in the _sequence_:

<div class='subsection'>

<a name='groups-data-filter-atom' href='#groups-data-filter-atom'>#</a> **`atom:`** _string_ | _sequence_

Only include the atom _string_ or atoms that are members of _sequence_. Each member of _sequence_ must be a _string_.

<a name='groups-data-filter-field' href='#groups-data-filter-field'>#</a> **`field:`** _string_ | _sequence_

Only include tuples that are a member of the field _string_. If a _sequence_ is used, it must consist of only strings. Only tuples that are a member of any field specified in the _sequence_ will be included.

<a name='groups-data-filter-function' href='#groups-data-filter-function'>#</a> **`function:`** [_function_](#functions)

Only include data for which _function_ evaluates to `true`. The _function_ must take a single item as an argument and must return `true` to keep the item, `false` otherwise. The _function_ is used as the callback for [`Array.filter()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) on the current list of items (i.e. the output of the previous filter, or the data from [`source`](#groups-data-source) if it is the first filter).

<a name='groups-data-filter-signature' href='#groups-data-filter-signature'>#</a> **`signature:`** _string_ | _sequence_

Only include atoms that are a member of the signature _string_. If a _sequence_ is used, it must consist of only strings. Only atoms that are a member of any signature specified in the _sequence_ will be included.

<a name='groups-data-filter-tuple' href='#groups-data-filter-tuple'>#</a> **`tuple:`** _string_ | _sequence_

Only include the tuple _string_ or tuples that are members of _sequence_. Each member of _sequence_ must be a _string_. Tuples are identified by the field name followed by each atom that comprises the tuple in a comma separated list surrounded by square brackets, e.g., `near[State$0,Chicken$0]`.

</div>

</div>

> **A word of warning**: the default `instance.yaml` displays all atoms and tuples for a reason. When building a visualization from the ground up, it is practically guaranteed that you will unintentionally forget to include an atom or relation in all but the most simple instances. This can lead to an incomplete graphical representation of the instance, and thus an incorrect understanding of the underlying model. Therefore, it is recommended that you begin building a visualization with all atoms and tuples displayed, gradually filtering items down in to more specific and specialized groupings and stylings.

<a name='groups-shape' href='#groups-shape'>#</a> **`shape:`** _string_ | _mapping_

A string or mapping describing the shape used in the group. The following _strings_ are valid:

* `circle`
* `line`
* `rectangle`

Typically, circles and rectangles are used to represent atoms, while lines are used to represent tuples. However, Alloy Instances does not enforce these representations, as there are use cases for, e.g., [using a circle to represent a property of a tuple](../atdyer/8de4b7211a23cc620001577ec4da65cd).

Visualizations are created as SVGs, and so shapes are created using SVG objects; `circle` creates an [SVG circle](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle), `line` creates an [SVG path](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path), and `rectangle` creates an [SVG rect](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect).

If a mapping is used, the following must be provided:

<div class='subsection'>

<a name='shape-type' href='#shape-type'>#</a> **`type:`** _string_

Any valid string, as listed above, describing the shape used in the group.

<a name='shape-attr' href='#shape-attr'>#</a> **`attr:`** _mapping_

(Optional) A _mapping_ of key, value pairs of [SVG attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute). Note that, depending on the shape, some attributes may or may not apply. For example, [cx](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/cx) and [cy](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/cy) can be used to place the center of a circle, but will have no effect on a rectangle or line.

Attributes are applied using [D3 selections](https://github.com/d3/d3-selection#selection_attr), so [functions](#functions) are valid values. The function will be passed, in order, the current datum (i.e., the atom or tuple), the current index (_i_), and the current group (_elements_), with `this` as the current SVG element (_elements_[_i_]). Note that D3 is exposed globally and can therefore be used inside of functions.

<a name='shape-style' href='#shape-style'>#</a> **`style:`** _mapping_

<aside>

Typical styles include [fill](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill), [stroke](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke), and [stroke-width](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width).

</aside>

(Optional) A _mapping_ of key, value pairs of [CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference). Properties are applied using [D3 selections](https://github.com/d3/d3-selection#selection_style), so [functions](#functions) are valid values. The function will be passed, in order, the current datum (i.e., the atom or tuple), the current index (_i_), and the current group (_elements_), with `this` as the current SVG element (_elements_[_i_]). Note that D3 is exposed globally and can therefore be used inside of functions.

</div>

<a name='groups-anchor' href='#groups-anchor'>#</a> **`anchor:`** _[group]_

(Optional) Anchor this group to _group_, where _group_ is the label of another group. Anchoring a group to another group is useful for [representing properties of relations using shapes](../atdyer/8de4b7211a23cc620001577ec4da65cd). 

The data in this group will be filtered to include only items that appear in the projected data of both groups. The position of each visual element in this group will then be anchored to the position of the corresponding element in the anchor group, matched by data point.

<a name="groups-index" href="#groups-index">#</a> **`index:`** _number_

(Optional) A numeric value indicating rendering order relative to all other groups. Default is 0.

<a name='groups-label' href='#groups-label'>#</a> **`label:`** _string_ | _mapping_

(Optional) The string `none` to remove labels from this group. If a mapping is provided, the following may be included:

<div class='subsection'>

<a name='groups-label-attr' href='#groups-label-attr'>#</a> **`attr:`** _mapping_

(Optional) A _mapping_ of key, value pairs of [SVG attributes](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute). Labels are implemented as [SVG text elements](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text), so only applicable attributes should be used.

Attributes are applied using [D3 selections](https://github.com/d3/d3-selection#selection_attr), so [functions](#functions) are valid values. The function will be passed, in order, the current datum (i.e., the atom or tuple), the current index (_i_), and the current group (_elements_), with `this` as the current SVG element (_elements_[_i_]). Note that D3 is exposed globally and can therefore be used inside of functions.

<a name='groups-label-style' href='#groups-label-style'>#</a> **`style:`** _mapping_

(Optional) A _mapping_ of key, value pairs of [CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference). Properties are applied using [D3 selections](https://github.com/d3/d3-selection#selection_style), so [functions](#functions) are valid values. The function will be passed, in order, the current datum (i.e., the atom or tuple), the current index (_i_), and the current group (_elements_), this `this` as the current SVG element (_elements_[_i_]). Note that D3 is exposed globally and can therefore be used inside of functions.

</div>

### <a name='functions' class='anchor' href='#functions'>#</a>**`functions:`** _mapping_

Javascript functions can be used in a number of places in the `instance.yaml` file (e.g., [filters](#groups-data-filter-function), [styles](#shape-style), [attributes](#shape-attr)). If a function can be used, a description of the parameters (and possibly [`this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)) will be given in the description.

Functions are created internally by passing the code in to the [Function constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function). All functions are created in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) by default.

Functions are defined in YAML as strings, which can either be single- or multi-line. If supported by your browser, you may use [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) in addition to regular Javascript functions. However, note that [`this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) is not defined for arrow functions, so for functions passed to, e.g., [styles](#shape-style) and [attributes](#shape-attr), be aware that it will be missing from the context. 

In the following snippet, the shape is styled using both arrow functions and regular Javascript functions:

```YAML
groups:
  ...
    style:
      fill: d => d.fields.full ? 'red' : 'green'
      stroke: |
        function (d) {
          if (d.fields.full) {
            return 'red';
          } else {
              return 'green';
          }
        }
```

Functions can be defined either directly in the location they are being used or in this section. Functions defined in this section can be referenced elsewhere in the `instance.yaml` file by prepending the name of the function with a `+` symbol. For example, to style the shape in the previous snippet, the following could be used:

```YAML
groups:
  ...
    style:
      fill: +redOrGreen
      stroke: +redOrGreen
functions:
  redOrGreen: d => d.fields.full ? 'red' : 'green'
```

### <a name='layout' class='anchor' href='#layout'>#</a>**`layout:`** _mapping_

The layout section of the `instance.yaml` file is used to control the positioning of visual elements of the instance.

<a name='layout-method' href='#layout-method'>#</a> **`method:`** dagre | force | row



<a name='layout-positions' href='#layout-positions'>#</a> **`positions:`** _mapping_

A mapping that can be used to describe the position of individual atoms. Keys are atom names and values are mappings that consist of an `x` and/or a `y` key, value pair.

<div class='subsection'>

<a name='layout-positions-atom' href='#layout-positions-atom'>#</a> **_`[atom]:`_**

<div class='subsection'>

<a name='layout-positions-atom-x' href='#layout-positions-atom-x'>#</a> **`x:`** _number_ | [_function_](#functions)
<a name='layout-positions-atom-y' href='#layout-positions-atom-y'>#</a> **`y:`** _number_ | [_function_](#functions)

If a [function](#functions) is used for either `x` or `y`, it will be passed, in order, the width of the SVG in pixels, the height of the SVG in pixels, and the datum associated with `[atom]`, with `this` as the SVG. Functions can be used as a convenient tool for [reflecting state using position](../atdyer/fdee1d777042b60cfa4d1612d659c853).

</div>

</div>

Positions defined in the [positions](#layout-positions) section are applied to atoms before Alloy Instances performs the layout of visual elements.

Atoms that do not have a position defined in the [positions](#layout-positions) section will be assigned a position using a [velocity Verlet numerical integrator](https://github.com/d3/d3-force) for simulating forces on particles. All atoms are part of the simulation, but only those that do not have a position defined will be free to move.

This process is repeated any time a reprojection occurs. Positions defined in the [positions](#layout-positions) section will be reapplied. All others, having been assigned positions during the initial layout, will be held static.

<a name='layout-zoom' href='#layout-zoom'>#</a> **`zoom:`** yes | no

Set `zoom` to the string 'yes' to enable panning and zooming of the instance visualization. Pan by click + dragging the background of the visualization and zoom using the scroll wheel. Default is 'no'.

### <a name='projections' class='anchor' href='#projections'>#</a> **`projections:`** _mapping_

A _mapping_ of projections. Keys are signature names and values are atom names.

<div class='subsection'>

<a name='projections-signature' href='#projections-signature'>#</a> **_`[signature]:`_** _`[atom]`_ 

</div>
