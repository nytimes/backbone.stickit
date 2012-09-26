[DOCUMENTATION](http://nytimes.github.com/backbone.stickit/)

## Introduction

Backbone.stickit is yet another model-view binding plugin for Backbone. Like the other plugins, Stickit will wire up a two-way binding that will keep form elements, innerHTML, text, and attribute values bound with model attributes. 

Stickit differs, however, in that it is a more natural fit with Backbone's style and functionality. In Backbone fashion, stickit leaves rendering up to you, with no special attributes, configuration, or markup needed in the template; in fact, stickit will clean up your templates, as you will need to interpolate fewer variables while rendering. Similar to `view.events`, stickit is configured with a `view.bindings` object, which is like events on steroids. Lastly, stickit leverages the `view.events` object so delegating, undelegating, and removing bindings will be seamless in the lifetime of a Backbone view. 

## Download + Source

[download v0.5.1](http://nytimes.github.com/backbone.stickit/downloads/backbone.stickit_0.5.1.zip)

[view annotated source](http://nytimes.github.com/backbone.stickit/docs/annotated/)

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
`view.stickit(optionalModel, optionalBindingsConfig)`

Uses `view.bindings` to bind elements in `view.el` with attributes in `view.model`. Stickit can be called more than once with different models or binding configurations.

```javascript  
  render: function() {
    // render this.$el.html()
    // Use this.bindings and this.model to bind this.$el
    this.stickit();
    // In addition to, or instead, pass in a different model and bindings configuration.
    this.stickit(this.otherModel, this.otherBindings);
  }
```

### unstickModel
`view.unstickModel()`

Removes event bindings from any models used by stickit. Removing model events will be taken care of in `view.remove()`, but if you want to unbind the model early, use this.

## Bindings

The `view.bindings` is a hash of jQuery or Zepto selector keys with binding configuration values. When stickit is initialized, bound elements will update with their respective model attribute values.

### modelAttr

A string value which is used to map a model attribute value to the selected view element. If `modelAttr` is the only configuration, then it can be written in short form where the attribute name is the value of the whole binding configuration.

```javascript  
  bindings: {
    '#header': {
      modelAttr: 'headerName'
      ...
    },
    // Short form...
    '#body': 'body'
  }
 ```

### format

A string function reference or function which returns a formatted version of the value that is passed in before setting it in the bound view element.

```javascript  
  bindings: {
    '#header': {
        modelAttr: 'headerName',
        format: 'formatHeader'
    }
  },
  formatHeader: function(val, attrName) {
    return attrName + ': ' + val;
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

### escape

A boolean which when true escapes the model before setting it in the view - internally, gets the attribute value by calling `model.escape('attribute')`. This is only useful when `updateMethod` is "html".

```javascript  
  bindings: {
    '#header': {
        modelAttr: 'headerName',
        updateMethod: 'html',
        escape: true
    }
  }
 ```

## Form Element Bindings

Form elements will be configured with two-way bindings, connecting user input/changes and model attribute values. The following form elements are supported:  

 - input and textarea - `modelAttr` value bound with form element value
 - input[type=number] - `modelAttr` will be updated with number value.
 - input[type=checkbox] - `checked` property determined by `modelAttr` truthiness, or use `format` to return boolean
 - input[type=radio] - `modelAttr` value matches a radio group `value` attribute
 - select - see the `selectOptions` configuration

### readonly

Sets the matched form element to readonly when readonly is `true` or, if in the case that it is a function reference, the function returns true.

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

When bindings are initialized, Stickit will build the `select` element with the options and bindings configured. 

The following example references a collection of stooges at `window.app.stooges` with the following value:  

```javascript  
  [{name : 'moe', age : 40}, {name : 'larry', age : 50}, {name : 'curly', age : 60}]
```

```javascript  
  bindings: {
    'select#stooges': {
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
  formatWings: function(val, attrName) {
    return val ? 'has-wings' : 'no-wings';
  }
 ```

## F.A.Q.

### Why Stickit?

JavaScript frameworks seem to be headed in the wrong direction - controller callbacks, configuration, and special tags are being forced into the template/presentation layer. Who wants to program and debug templates? 

If you are writing a custom frontend, then you're going to need to write custom JavaScript. Backbone helps you organize, but then gets the hell out of your way, especially when it comes to your presentation. Stickit tries to stay true to Backbone's style; where most frameworks or other Backbone plugins muck up the presentation layer with obtrusive JavaScript, stickit defines configuration and callbacks in the place that they should be - in the view/controller/JavaScript.

### Dependencies

 Backbone 0.9, underscore.js, and jQuery or Zepto

### License

MIT

## Change Log

#### 0.5.1

 - Shorthand binding for model attributes: `'#selector':attrName`.
 - Added support for input[type=number] where values will be bound to model attributes as the Number type.
 - Attribute name is passed in as the second parameter of `format` callbacks.
 - Bug fixes: issue [#1](https://github.com/NYTimes/backbone.stickit/issues/1), [#2](https://github.com/NYTimes/backbone.stickit/issues/2), [#4](https://github.com/NYTimes/backbone.stickit/issues/4), [#6](https://github.com/NYTimes/backbone.stickit/issues/6), [#8](https://github.com/NYTimes/backbone.stickit/issues/8)

#### 0.5.0

 - Initial release (extracted and cleaned up from the backend of cn.nytimes.com).
