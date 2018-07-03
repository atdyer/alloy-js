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
