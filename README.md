[DOCUMENTATION](http://nytimes.github.com/backbone.stickit/)

## Introduction

Backbone.stickit is yet another model-view binding plugin for Backbone. Like the other plugins, Stickit will wire up bindings that will keep form elements, innerHTML, text, and attribute values bound with events and/or model attributes. 

Stickit differs, however, in that it is a more natural fit with Backbone's style and functionality. Stickit has a simple and intuitive configuration, which, like Backbone, stays out of the view html; in fact, Stickit will clean up your templates, as you will need to interpolate fewer variables (if any at all) while rendering. Also, stickit internally leverages the `view.events` object so delegating, undelegating, and removing bindings will be seamless in the lifetime of a Backbone view. 

## Download + Source

[download v0.6.0](http://nytimes.github.com/backbone.stickit/downloads/backbone.stickit_0.6.0.zip)

[view annotated source](http://nytimes.github.com/backbone.stickit/docs/annotated/)

## Usage

Similar to `view.events`, you can define `view.bindings` to map selectors to model and/or event configurations. The following bindings configuration will bind the `view.$('#header')` element to the `headerName` model attribute, and bind a `click` event to the `view.$('#search')` element:

```javascript
  bindings: {
    '#header': {
      modelAttr: 'headerName'
    },
    '#search': {
      click: function($searchButton, event) { /* ... */ }
    }
  }
```

When the view's html is rendered, usually the last call will be to stickit. By convention, and in the following example, stickit will use `view.model` and the `view.bindings` configuration to initialize:

```javascript  
  render: function() {
    this.$el.html('<div id="header"/> <button id="search"/>');
    this.stickit();
  }
```

On the initial call, stickit will initialize the innerHTML of `view.$('#header')` with the value of the `headerName` model attribute, and will setup a one-way binding (model->view) so that any time a model `change:headerName` event is triggered, the `view.$('#header')` element will reflect those changes. By default, bound form elements will be configured with two-way bindings (model<->view), connecting and reflecting changes in view elements with changes in bound model attributes.

## API

### stickit
`view.stickit(optionalModel, optionalBindingsConfig)`

Uses `view.bindings`, or the given bindings, and `this.model`, or the given model, to setup model and event bindings. Stickit can be called more than once with different models and binding configurations. Note: multiple models can be bound to a view, but any subsequent attempts to bind a previously bound model will delete the previous bindings for (only) that model.

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

The `view.bindings` is a hash of jQuery or Zepto selector keys with binding configuration values. Bindings can be configured with events - see the `events` section - and/or model attributes. Similar to the callback definitions configured in `view.events`, an actual function or a string function name may be configured. 

### modelAttr

A string or array which is used to map a model attribute to a view element. If binding to a `modelAttr` is the only configuration needed, then it can be written in short form where the attribute name is the value of the whole binding configuration.

Note, binding to multiple model attributes using an array configuration only applies to one-way bindings (model->view), and should be paired with a `format` callback.

```javascript  
  bindings: {
    // Short form binding
    '#name': 'name',
    // Normal binding
    '#style': {
      modelAttr: 'style'
    }
    // Bind to multiple model attributes
    '#header': {
      modelAttr: ['title', 'author'],
      format: function(values, attrNames) {
        // Format called after title *or* author model attributes change.
        return values[0] + ', by ' + values[1];
      }
    }
  }
 ```

### events

Any binding key that is outside of the known bindings configurations will be wired up as an event for the bound view element. jQuery/Zepto event names, like the following, can be used for binding along with any custom event names:  

`change`, `click`, `dblclick`, `focusin`, `focusout`, `keydown`, `keypress`, `keyup`, `mousedown`, `mouseenter`, `mouseleave`, `mousemove`, `mouseup`, `submit`, ...

Since form elements are two-way bindings by default, you can override any of the event bindings that stickit uses by defining your own handler. Review the form element bindings to find out what events are used and can be overriden.

```javascript  
  bindings: {
    '#header': {
      modelAttr: 'headerName',
      click: function($header, event) { /* ... */ },
      customEvent: function($header, event) { /* ... */ }
    },
    'form': {
      submit: function($form, event) { /* ... */ }
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

### format

A callback which returns a formatted version of the model attribute value that is passed in before setting it in the bound view element.

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

Method used to update the inner value of the view element. Defaults to 'text', but 'html' may also be used to update the dom element's innerHTML.

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

### visible and visibleFn

When true, `visible` shows or hides the view element based on the model attribute's truthiness. `visible` may also be defined with a callback which should return a truthy value.

If more than the standard jQuery show/hide is required, then you can manually take control by defining `visibleFn` with a callback. 

```javascript  
  bindings: {
    '#author': {
      modelAttr: 'isDeleuze',
      visible: true
    }
  }
```

```javascript  
  bindings: {
    '#title': {
      modelAttr: 'title',
      visible: function(val, attrName) { return val == 'Mille Plateaux'; }
    }
  }
```

```javascript  
  bindings: {
    '#body': {
      modelAttr: 'isWithoutOrgans',
      visible: true,
      visibleFn: 'slideFast'
    }
  },
  slideFast: function($el, isVisible, attrName) {
    if (isVisible) $el.slideDown('fast');
    else $el.slideUp('fast');
  }
```

## Form Element Bindings

By default, form elements will be configured with two-way bindings, syncing changes in the view elements and model attributes. Optionally, one-way bindings can be configured with the `oneWay` key so that only changes to model attributes will be synced to view elements. Using the manual event bindings, you can override default event handlers or add other custom event handlers.

The following is a list of the supported form elements, their binding details, and the default events used for syncing:  

 - input and textarea
   - element value synced with model attribute value
   - input[type=number] will update the model with a Number value 
   - both `keyup` and `change` events are used for handling
 - input[type=checkbox]
   - `checked` property determined by the truthiness of the model attribute or the result of `format`
   - `change` event is used for handling
 - input[type=radio]
   - model attribute value matched to a radio group `value` attribute
   - `change` event is used for handling
 - select
   - see the `selectOptions` configuration
   - `change` event is used for handling

### oneWay

Opt to bind form elements in one direction - model attribute changes will be reflected in the view, but changes to the view will not update the model.

```javascript  
  bindings: {
    '#header': {
      modelAttr: 'headerName',
      oneWay: true
    }
  }
```

### selectOptions

Binds an object collection, html select box, and a model attribute value. The following are configuration options for binding:

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

Another example where a collection is returned by callback and the collection objects are used as option values:

```javascript  
  bindings: {
    'select#states': {
      modelAttr: 'state',
      selectOptions: {
        collection: function() {
          // Prepend null or undefined for an empty select option and value.
          return [null, {id:1, data:{name:'OH'}}, {id:2, data:{name:'IN'}}];
        },
        labelPath: 'data.name'
        // Leaving `valuePath` undefined so that the collection objects are used as option values.
    }
  }
```

### setOptions

An object which is used as the set options when setting values in the model. This is only used when binding to form elements, as their changes would update the model.

```javascript  
  bindings: {
    'input#name': {
      modelAttr: 'name',
      setOptions: {silent:true}
    }
  }
```

## Attribute and Property Bindings

### attributes

Binds element attributes and properties with observed model attributes, using the following options:

 - `name`: attribute or property name.
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

If you are writing a custom frontend, then you're going to need to write custom JavaScript. Backbone helps you organize, but then gets the hell out of your way, especially when it comes to your presentation. Stickit tries to stay true to Backbone's style; where most frameworks or other Backbone plugins muck up the presentation layer with obtrusive JavaScript, stickit defines configuration and callbacks in the place that they should be - in the view/controller/JavaScript.

### Dependencies

 Backbone 0.9, underscore.js, and jQuery or Zepto

### License

MIT

## Change Log

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
