[-> **Documentation for current/stable release: 0.6.1**](http://nytimes.github.com/backbone.stickit/)

**The following is documentation for the code in master/edge version...**

## Introduction

Backbone.stickit is yet another model-view binding plugin for Backbone. Like the other plugins, Stickit will wire up bindings that will keep form elements, innerHTML, text, and attribute values bound with model attributes. 

Stickit differs, however, in that it is a more natural fit with Backbone's style and functionality. Stickit has a simple and intuitive configuration, which, like Backbone, stays out of the view html; in fact, Stickit will clean up your templates, as you will need to interpolate fewer variables (if any at all) while rendering. Also, stickit internally leverages the `view.events` object so delegating, undelegating, and removing bindings will be seamless in the lifetime of a Backbone view. 

## Download + Source

[download v0.6.1](http://nytimes.github.com/backbone.stickit/downloads/backbone.stickit_0.6.1.zip)

[download master/edge](https://raw.github.com/NYTimes/backbone.stickit/master/backbone.stickit.js)

[view annotated source](http://nytimes.github.com/backbone.stickit/docs/annotated/)

## Usage

Similar to `view.events`, you can define `view.bindings` to map selectors to binding configurations. The following bindings configuration will bind the `view.$('#title')` element to the `title` model attribute and the `view.$('#author')` element to the `authorName` model attribute:

```javascript
  bindings: {
    '#title': 'title',
    '#author': 'authorName'
  }
```

When the view's html is rendered, usually the last call will be to stickit. By convention, and in the following example, stickit will use `view.model` and the `view.bindings` configuration to initialize:

```javascript  
  render: function() {
    this.$el.html('<div id="title"/> <input id="author" type="text">');
    this.stickit();
  }
```

On the initial call, stickit will initialize the innerHTML of `view.$('#title')` with the value of the `title` model attribute, and will setup a one-way binding (model->view) so that any time a model `change:title` event is triggered, the `view.$('#title')` element will reflect those changes. For form elements, like `view.$('#author')`, stickit will configure a two-way binding (model<->view), connecting and reflecting changes in the view elements with changes in bound model attributes.

## API

### stickit
`view.stickit(optionalModel, optionalBindingsConfig)`

Uses `view.bindings` or the given bindings, and `this.model` or the given model, to setup bindings. Stickit can be called more than once with different models and binding configurations. Note: multiple models can be bound to a view, but any subsequent attempts to bind a previously bound model will delete the previous bindings for (only) that model.

```javascript  
  render: function() {
    this.$el.html(/* ... */);
    // Initialize stickit with view.bindings and view.model
    this.stickit();
    // In addition to, or instead, call stickit with a different model and bindings configuration.
    this.stickit(this.otherModel, this.otherBindings);
  }
```

### unstickModel
`view.unstickModel(optionalModel)`

Removes event bindings from all models, or (only) the given model, used by stickit in the view. Removing model events will be taken care of in `view.remove()`, but if you want to unbind a model early, use this.

## Bindings

The `view.bindings` is a hash of jQuery or Zepto selector keys with binding configuration values. Similar to the callback definitions configured in `view.events`, an actual function or a string function name may be configured. 

### observe

A string or array which is used to map a model attribute to a view element. If binding to `observe` is the only configuration needed, then it can be written in short form where the attribute name is the value of the whole binding configuration.

Note, binding to multiple model attributes using an array configuration only applies to one-way bindings (model->view), and should be paired with an `onGet` callback.

```javascript  
  bindings: {
    // Short form binding
    '#author': 'author',
    // Normal binding
    '#title': {
      observe: 'title'
    }
    // Bind to multiple model attributes
    '#header': {
      observe: ['title', 'author'],
      onGet: function(values, attrNames) {
        // onGet called after title *or* author model attributes change.
        return values[0] + ', by ' + values[1];
      }
    }
  }
 ```

### :el (selector)

A special selector value that binds to the view delegate (view.$el).

```javascript  
  tagName: 'form',
  bindings: {
    ':el': {
      submit: function($el, event) { /* ... */ }
    }
  }
```

### onGet

A callback which returns a formatted version of the model attribute value that is passed in before setting it in the bound view element.

```javascript  
  bindings: {
    '#header': {
      observe: 'headerName',
      onGet: 'formatHeader'
    }
  },
  formatHeader: function(val, attrName) {
    return attrName + ': ' + val;
  }
 ```

### onSet

A callback which prepares a formatted version of the view value before setting it in the model.

```javascript  
  bindings: {
    '#author': {
      observe: 'author',
      onSet: 'addByline'
    }
  },
  addByline: function(val, attrName) {
    return 'by ' + val;
  }
```

### updateModel

A boolean value or a function that returns a boolean value which controls whether or not the model gets changes/updates from the view (model<-view). This is only relevant to form elements, as they have two-way bindings with changes that can be reflected into the model. Defaults to true.

```javascript  
  bindings: {
    '#title': {
      observe: 'title',
      updateModel: 'confirmFormat'
    }
  },
  confirmFormat: function(val, attrName) {
    // Only update the title attribute if the value starts with "by".
    return val.startsWith('by ');
  }
```

### updateView

A boolean value or a function that returns a boolean value which controls whether or not the bound view element gets changes/updates from the model (view<-model). Defaults to true.

```javascript  
bindings: {
  '#title': {
    observe: 'title',
    // Any changes to the model will not be reflected to the view.
    updateView: false
  }
}
```

### afterUpdate

A string function reference or function which is called after a value is updated in the dom.

```javascript  
  bindings: {
    '#warning': {
      observe: 'warningMessage',
      afterUpdate: 'highlight'
    }
  },
  highlight: function($el, val) {
    $el.fadeOut(500, function() { $(this).fadeIn(500); });
  }
```

### updateMethod

Method used to update the inner value of the view element. Defaults to 'text', but 'html' may also be used to update the dom element's innerHTML.

```javascript  
  bindings: {
    '#header': {
      observe: 'headerName',
      updateMethod: 'html',
      onGet: function(val) { return '<div id="headerVal">' + val + '</div>'; }
    }
  }
```

### escape

A boolean which when true escapes the model before setting it in the view - internally, gets the attribute value by calling `model.escape('attribute')`. This is only useful when `updateMethod` is "html".

```javascript  
  bindings: {
    '#header': {
      observe: 'headerName',
      updateMethod: 'html',
      escape: true
    }
  }
```

### visible and visibleFn

When true, `visible` shows or hides the view element based on the model attribute's truthiness. `visible` may also be defined with a callback which should return a truthy value.

If more than the standard jQuery show/hide is required, then you can manually take control by defining `visibleFn` with a callback. 

```javascript  
  bindings: {
    '#author': {
      observe: 'isDeleuze',
      visible: true
    }
  }
```

```javascript  
  bindings: {
    '#title': {
      observe: 'title',
      visible: function(val, attrName) { return val == 'Mille Plateaux'; }
    }
  }
```

```javascript  
  bindings: {
    '#body': {
      observe: 'isWithoutOrgans',
      visible: true,
      visibleFn: 'slideFast'
    }
  },
  slideFast: function($el, isVisible, attrName) {
    if (isVisible) $el.slideDown('fast');
    else $el.slideUp('fast');
  }
```

## Form Element Bindings and Contenteditable

By default, form and contenteditable elements will be configured with two-way bindings, syncing changes in the view elements with model attributes. Optionally, one-way bindings can be configured with `updateView` or `updateModel`. With the `eventsOverride`, you can specify a different set of events to use for reflecting changes to the model.

The following is a list of the supported form elements, their binding details, and the default events used for binding:  

 - input, textarea, and contenteditable
   - element value synced with model attribute value
   - input[type=number] will update the model with a Number value 
   - `keyup`, `change`, `cut`, and `paste` events are used for handling
 - input[type=checkbox]
   - `checked` property determined by the truthiness of the model attribute or if the checkbox "value" attribute is defined, then its value is used to match against the model. If a binding selector matches multiple checkboxes then it is expected that the observed model attribute will be an array of values to match against the checkbox value attributes.
   - `change` event is used for handling
 - input[type=radio]
   - model attribute value matched to a radio group `value` attribute
   - `change` event is used for handling
 - select
   - see the `selectOptions` configuration
   - `change` event is used for handling

### eventsOverride

Specify a list of events which will override stickit's default events for a form element. Bound events control when the model is updated with changes in the view element.

```javascript  
  bindings: {
    'input#title': {
      observe: 'title',
      // Normally, stickit would bind `keyup`, `change`, `cut`, and `paste` events
      // to an input:text element. The following will override these events and only 
      // update/set the model after the input#title element is blur'ed.
      eventsOverride: ['blur']
    }
  }
```

### selectOptions

Binds an object collection, html select box, and a model attribute value. The following are configuration options for binding:

 - `collection`: an object path of a collection relative to `window` or a string function reference which returns a collection.
 - `labelPath`: the path to the label value for select options within the collection of objects. Default value when undefined is `label`.
 - `valuePath`: the path to the values for select options within the collection of objects. When an options is selected, the value that is defined for the given option is set in the model. Leave this undefined if the whole object is the value or to use the default `value`.

When bindings are initialized, Stickit will build the `select` element with the options and bindings configured. 

The following example references a collection of stooges at `window.app.stooges` and uses the `age` attribute for labels and the `name` attribute for option values:  

```javascript  
  window.app.stooges = [{name:'moe', age:40}, {name:'larry', age:50}, {name:'curly', age:60}];
```

```javascript  
  bindings: {
    'select#stooges': {
      observe: 'stooge',
      selectOptions: {
        collection: 'app.stooges',
        labelPath: 'age',
        valuePath: 'name'
    }
  }
```

The following is an example where a collection is returned by callback and the collection objects are used as option values:

```javascript  
  bindings: {
    'select#states': {
      observe: 'state',
      selectOptions: {
        collection: function() {
          // Prepend null or undefined for an empty select option and value.
          return [null, {id:1, data:{name:'OH'}}, {id:2, data:{name:'IN'}}];
        },
        labelPath: 'data.name'
        // Leaving `valuePath` undefined so that the collection objects are used 
        // as option values. For example, if the "OH" option was selected, then the 
        // following value would be set into the model: `model.set('state', {id:1, data:{name:'OH'}});`
    }
  }
```

Optgroups are supported, where the collection is formatted into an object with an `opt_labels` key that specifies the opt label names and order.

```javascript
  bindings: {
    'select#tv-characters': {
      observe: 'character',
      selectOptions: {
        collection: function() {
          return {
            'opt_labels': ['Looney Tunes', 'Three Stooges'],
            'Looney Tunes': [{id: 1, name: 'Bugs Bunny'}, {id: 2, name: 'Donald Duck'}],
            'Three Stooges': [{id: 3, name: 'moe'}, {id: 4, name: 'larry'}, {id: 5, name: 'curly'}]
          };
        },
        labelPath: 'name',
        valuePath: 'id'
      }
    }
  }
```

Finally, multiselects are supported if the select element contains the [multiple="true"] attribute. By default stickit will expect that the model attribute is an array of values, but if your model has a formatted value, you can use `onGet` and `onSet` to format attribute values (this applies to any select bindings).

```javascript
//
// model.get('books') returns a dash-delimited list of book ids: "1-2-4"

bindings: {
  '#books': {
    observe: 'books',
    onGet: function(val, attr) {
      // Return an array of the ids so that stickit can match them to select options.
      return _.map(val.split('-'), Number);
    },
    onSet: function(vals, attr) {
      // Format the array of ids into a dash-delimited String before setting.
      return vals.join('-');
    },
    selectOptions: {
      collection: 'app.books',
      labelPath: 'name',
      valuePath: 'id'
    }
  }
}
```

### setOptions

An object which is used as the set options when setting values in the model. This is only used when binding to form elements, as their changes would update the model.

```javascript  
  bindings: {
    'input#name': {
      observe: 'name',
      setOptions: {silent:true}
    }
  }
```

## Attribute and Property Bindings

### attributes

Binds element attributes and properties with observed model attributes, using the following options:

 - `name`: attribute or property name.
 - `observe`: observes the given model attribute. If left undefined, then the main configuration `observe` is observed.
 - `onGet`: formats the observed model attribute value before it is set in the matched element.

```javascript  
  bindings: {
    '#header': {
      attributes: [{
        name: 'class',
        observe: 'hasWings',
        onGet: 'formatWings'
      }, {
        name: 'readonly',
        observe: 'isLocked'
      }]
    }
  },
  formatWings: function(val, attrName) {
    return val ? 'has-wings' : 'no-wings';
  }
 ```

## F.A.Q.

### Why Stickit?

JavaScript frameworks seem to be headed in the wrong direction - controller callbacks/directives, configuration, and special tags are being forced into the template/presentation layer. Who wants to program and debug templates? 

If you are writing a custom frontend, then you're going to need to write custom JavaScript. Backbone helps you organize with a strong focus on the model/data, but stays the hell out of your presentation. Where most frameworks or other Backbone plugins muck up the presentation layer with obtrusive JavaScript, stickit defines configuration and callbacks in the place that they should be - in the view/controller/JavaScript.

### Dependencies

 Backbone 0.9, underscore.js, and jQuery or Zepto

### License

MIT

## Change Log

#### 0.6.1

- Added `observe` in place of `modelAttr` (**deprecated** `modelAttr` but maintained for backward-compatibility).
- Added `onGet` in place of `format` (**deprecated** `format` but maintained for backward-compatibility).
- Added `onSet` binding for formatting values before setting into the model.
- Added `updateModel`, a boolean to control changes being reflected from view to model.
- Added `updateView`, a boolean to control changes being reflected from model to view.
- Added `eventsOverride` which can be used to specify events for form elements that update the model.
- **Breaking Change**: Removed manual event configuration/handling (no `keyup`, `submit`, etc, in binding configurations).
- Added support for multiselect select elements.
- Added support for optgroups within a select element.
- Bug Fixes: [#29](https://github.com/NYTimes/backbone.stickit/pull/29), [#31](https://github.com/NYTimes/backbone.stickit/pull/31)

#### 0.6.0

- **Breaking Change**: Removed `readonly` configurtion option.
- Element properties (like `readonly`, `disabled`, etc.) can be configured in `attributes`.
- Added custom event handling to the api - see events section in docs.
- Added support for binding multiple model attributes in `modelAttr` configuration.
- Added the `visible` and `visibleFn` binding configurations.
- Added support for `:el` selector for selecting the view delegate.
- Bug Fixes: [#10](https://github.com/NYTimes/backbone.stickit/issues/1), [#11](https://github.com/NYTimes/backbone.stickit/issues/1), [#16](https://github.com/NYTimes/backbone.stickit/issues/16)

#### 0.5.2

 - Fix IE7/8 select options bug ([issue #9](https://github.com/NYTimes/backbone.stickit/pull/9))

#### 0.5.1

 - Shorthand binding for model attributes: `'#selector':attrName`.
 - Added support for input[type=number] where values will be bound to model attributes as the Number type.
 - Attribute name is passed in as the second parameter of `format` callbacks.
 - Bug fixes: issue [#1](https://github.com/NYTimes/backbone.stickit/issues/1), [#2](https://github.com/NYTimes/backbone.stickit/issues/2), [#4](https://github.com/NYTimes/backbone.stickit/issues/4), [#6](https://github.com/NYTimes/backbone.stickit/issues/6), [#8](https://github.com/NYTimes/backbone.stickit/issues/8)

#### 0.5.0

 - Initial release (extracted and cleaned up from the backend of cn.nytimes.com).
