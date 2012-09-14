# Backbone.stickit

Model binding in Backbone style.

## Introduction

Backbone.stickit is yet another model-view binding extension for Backbone. Like the other extensions, Stickit will wire up a two-way binding that will keep form elements, innerHTML, text, and attribute values bound with model attributes. 

Stickit differs, however, in that it is a more natural fit with Backbone's style and functionality. In Backbone fashion, stickit leaves rendering up to you, with no special attributes, configuration, or markup needed in the DOM; in fact, stickit will probably clean up your templates, as you will need to interpolate less variables while rendering. Similar to `view.events`, stickit is configured with a `view.bindings` object, which is like `events` on steroids. Lastly, stickit leverages the `view.events` object so delegating, undelegating, and removing bindings will be seamless in the lifetime of a Backbone view. 

## Usage

Similar to `view.events`, you can use `view.bindings` to map selectors to binding configurations. The following bindings configuration will map the view's dom element with [id="header"] to the `view.model`'s `headerName` attribute:

```javascript
  bindings: {
    '#header': {
      modelAttr: 'headerName'
    }
  }
```

After the view's html is rendered, usually the last call will be to stickit:

```javascript  
  render: function() {
    this.$el.html('<div id="header"/>');
    this.stickit();
  }
```

On the initial call, stickit will initialize bound elements with their values so you don't need to interpolate model attributes when rendering templates. Form elements will be configured with a two-way binding, connecting user input/changes and model attribute values.

## API

### stickit
`view.stickit(optionalModel, optionalBindingsConfig)` - uses `view.bindings` to bind elements in `view.el` with attributes in `view.model`. `stickit()` can be called more than once with different models or binding configurations.

```javascript  
  render: function() {
    // render this.$el.html()
    // Use this.bindings and this.model to bind this.$el
    this.stickit();
    // Optionally, in addition to, or instead, pass in a different model and bindings configuration.
    this.stickit(this.otherModel, this.otherBindings);
  }
```

### unstickModel
`view.unstickModel()` - Removes event bindings from any models used by stickit. Removing model events will be taken care of in `view.remove()`, but if you want to unbind the model early, use this.

## bindings

The `view.bindings` is a hash of jQuery or Zepto selector keys with binding configuration values. When stickit is initialized, bound elements will update with their respective model attribute values.

### modelAttr

A string value which is used to map a model attribute value to the selected view element.

```javascript  
  bindings: {
    '#header': {
      modelAttr: 'headerName'
    }
  }
 ```

The value of `view.model.get('headerName')` is bound to `view.$('#header')`.

### format

A string function reference or function which returns a formatted version of the value that is passed in before setting it in the bound view element.

```javascript  
  bindings: {
    '#header': {
        modelAttr: 'headerName',
        format: 'formatHeader'
    }
  },
  formatHeader: function(val) {
    return 'Header: ' + val;
  }
 ```

### escape

A boolean which when true escapes the model before setting it in the view - internally, gets the attribute value by calling `model.escape('attribute')`.

```javascript  
  bindings: {
    '#header': {
        modelAttr: 'headerName',
        escape: true
    }
  }
 ```

### afterUpdate

A string function reference or function which is called after a value is updated in the dom.

```javascript  
  bindings: {
    '#header': {
        modelAttr: 'headerName',
        afterUpdate: 'highlight'
    }
  },
  highlight: function($el, val) {
    $el.fadeOut(500, function() { $(this).fadeIn(500); });
  }
 ```

### updateMethod

Method used to update the matched dom element value. Defaults to 'text', but 'html' may also be used to update the dom element's innerHTML.


```javascript  
  bindings: {
    '#header': {
        modelAttr: 'headerName',
        updateMethod: 'html',
        format: function(val) { return '<div id="headerVal">' + val + '</div>'; }
    }
  }
 ```

## Form Element Bindings

Form elements will be configured with two-way bindings, connecting user input/changes and model attribute values. The following form elements are supported:  

 - input[text|password] and textarea - `modelAttr` value bound with form element value
 - input[checkbox] - `checked` property determined by `modelAttr` truthiness, or use `format` to return boolean
 - input[radio] - `modelAttr` value matches a radio group `value` attribute
 - select - see the `selectOptions` configuration

### readonly

Sets the matched form element to disabled/readonly when readonly is `true` or, if in the case that it is a function reference, the function returns true.

```javascript  
  bindings: {
    'input#header': {
        modelAttr: 'headerName',
        readonly: true
    },
    'textarea#body': {
      modelAttr: 'body',
      readonly: 'isBodyReadonly'
    }
  },
  isBodyReadonly: function(modelAttr) {
    return this.model.get(modelAttr).length > 200;
  }
 ```
### selectOptions

The following are the configuration options for `selectOptions` which binds an object collection, html select box, and a model attribute value:

 - `collection`: an object path of a collection relative to `window` or a string function reference which returns a collection.
 - `labelPath`: the path to the label value for select options within the collection of objects.
 - `valuePath`: the path to the values for select options within the collection of objects. When an options is selected, the value that is defined for the given option is set in the model. Leave this undefined if the whole object is the value.

The following example references a collection of stooges at `window.app.stooges` with the following value:  

```javascript  
  [{name : 'moe', age : 40}, {name : 'larry', age : 50}, {name : 'curly', age : 60}]
```

```javascript  
  bindings: {
    '#header': {
        modelAttr: 'stooge',
        selectOptions: {
          collection: 'app.stooges',
          labelPath: 'age',
          valuePath: 'name'
    }
  }
 ```

### setOptions

An object which is used as the set options when setting values in the model. This is only used when binding to form elements, as their changes would update the model.

```javascript  
  bindings: {
    '#header': {
        modelAttr: 'headerName',
        setOptions: {silent:true, customOption:false}
    }
  }
 ```

## Attribute Bindings

### attributes

Binds element attributes with observed model attributes, using the following options:

 - `name`: element attribute name.
 - `observe`: observes the given model attribute. If left undefined, then the main configuration `modelAttr` is observed.
 - `format`: formats the observed model attribute value before it is set in the matched element.

```javascript  
  bindings: {
    '#header': {
      attributes: [{
        name: 'class',
        observe: 'hasWings',
        format: 'formatWings'
      }, {
        name: 'data-lang',
        observe: 'language'
      }]
    }
  },
  formatWings: function(val) {
    return val ? 'has-wings' : 'no-wings';
  }
 ```

## F.A.Q.

### Why Stickit?

JavaScript frameworks seem to be headed in the wrong direction - controller callbacks, configuration, and special tags are being forced into the template/presentation layer. Who wants to program and debug templates? 

If you are writing a custom frontend, then you're going to need to write custom JavaScript. Backbone can help you organize, but gets the hell out of your way, especially when it comes to your templates. Stickit tries to stay true to Backbone's style; where most template libraries muck up the presentation layer with obtrusive JavaScript, stickit defines your configuration and callbacks in the place that it should be - in the view/controller/JavaScript.

### Dependencies

 Backbone 0.9, underscore.js, and jQuery or Zepto

### License

MIT
