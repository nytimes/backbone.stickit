[-> **Documentation for current/stable release: 0.9.2**](http://nytimes.github.com/backbone.stickit/)

**The following is documentation for the code in master/edge version...**

## Introduction

Backbone's philosophy is for a View, the display of a Model's state, to re-render after any changes have been made to the Model. This works beautifully for simple apps, but rich apps often need to render, respond, and synchronize changes with finer granularity.

Stickit is a Backbone data binding plugin that binds Model attributes to View elements with a myriad of options for fine-tuning a rich app experience. Unlike most model binding plugins, Stickit does not require any extra markup in your html; in fact, Stickit will clean up your templates, as you will need to interpolate fewer variables (if any at all) while rendering. In Backbone style, Stickit has a simple and flexible api which plugs in nicely to a View's lifecycle.

## Download + Source

[download v0.9.2](http://nytimes.github.com/backbone.stickit/downloads/backbone.stickit_0.9.2.zip)

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

Uses `view.bindings` and `view.model` to setup bindings. Optionally, you can pass in a model and bindings hash. Note, it is safe to re-render or call stickit multiple times, as stickit will match any previously bound selectors and their associated models and unbind them before reinitializing.

```javascript
  render: function() {
    this.$el.html(/* ... */);
    // Initialize stickit with view.bindings and view.model
    this.stickit();
    // In addition to, or instead, call stickit with a different model and bindings configuration.
    this.stickit(this.otherModel, this.otherBindings);
  }
```

### addBinding
`view.addBinding(optionalModel, selector, configuration)`

Adds a single binding to the view, using the given model, or `view.model`, and the given `selector` and `configuration`. It's also possible to pass in a bindings hash as the second parameter. If you use a selector that was already used for a binding, then the old binding will be destroyed before initializing the new binding.

```javascript
  // Short-form selector.
  this.addBinding(null, '#author', 'author');
  // With configuration.
  this.addBinding(null, '#author', {observe:'author', onGet: function() {/* ... */}});
  // Or, with a bindings hash.
  this.addBinding(null, {
    '#author': {
      observe: 'author',
      onGet: function() {/* ... */}
  });
```

### unstickit
`view.unstickit(optionalModel, optionalSelector)`

Removes event bindings from all models. Optionally, a model can be passed in which will remove events for the given model and its corresponding bindings configuration only. Another option is to pass in a binding selector or bindings hash to granularly remove any bindings that are associated with `this.model` or the given model. Note, Stickit is setup to automatically unbind all bindings associated with a view on `view.remove()`.

For each model that is unbound, a `stickit:unstuck` event will be triggered, and for each binding that is unbound the `destroy` callback will be executed.

## Bindings

The `view.bindings` is a hash of jQuery or Zepto selector keys with binding configuration values. Similar to the callback definitions configured in `view.events`, bindings callbacks can be defined as the name of a method on the view or a direct function body. `view.bindings` may also be defined as a function.

Once you are familiarized with the bindings callbacks, use [this reference](#binding-callbacks-flowchart) for a better idea of when they are called.

### observe

A string, function, or array which is used to map a model attribute to a view element. If binding to `observe` is the only configuration needed, then it can be written in short form where the attribute name is the value of the whole binding configuration.

Notes on binding to an array of attributes: when binding from model->view, this configuration should be paired with an `onGet` callback that can unpack/format the values. When binding from view->model, then `onSet` or `getVal` should be defined and should return an array of values that stickit will set into the model.

```javascript
  bindings: {
    // Short form binding
    '#author': 'author',

    // Normal binding
    '#title': {
      observe: 'title'
    },

    // Bind to multiple model attributes
    '#header': {
      observe: ['title', 'author'],
      onGet: function(values) {
        // onGet called after title *or* author model attributes change.
        return values[0] + '-' + values[1];
      },
      onSet: function(value) {
        return value.split('-');
      }
    }
  }

  // Defined bindings as a function.
  bindings: function() {
    return {
      '#title': {
        observe: 'title'
      }
    };
  }
 ```

### :el (selector)

A special selector value that binds to the view delegate (view.$el).

```javascript
  tagName: 'form',
  bindings: {
    ':el': {
      observe: 'title'
      onGet: function(value) { /* ... */ }
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
  formatHeader: function(value, options) {
    return options.observe + ': ' + value;
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
  addByline: function(val, options) {
    return 'by ' + val;
  }
```

### getVal

A callback which overrides stickit's default handling for retrieving the value from the bound view element. Use `onSet` to format values - this is better used in [handlers](#custom-handlers) or when extra/different dom operations need to be handled.

```javascript
  bindings: {
    '#author': {
      observe: 'author',
      getVal: function($el, event, options) { return $el.val(); }
    }
  }
```

### update

A callback which overrides stickit's default handling for updating the value of a bound view element. Use `onGet` to format model values - this is better used in [handlers](#custom-handlers) or when extra/different dom operations need to be handled .

```javascript
  bindings: {
    '#author': {
      observe: 'author',
      update: function($el, val, model, options) { $el.val(val); }
    }
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
  confirmFormat: function(val, event, options) {
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

Called after a value is updated in the dom.

```javascript
  bindings: {
    '#warning': {
      observe: 'warningMessage',
      afterUpdate: 'highlight'
    }
  },
  highlight: function($el, val, options) {
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

### initialize

Called for each binding after it is configured in the initial call to `stickit()`. Useful for setting up third-party plugins, see the handlers section for examples.

```javascript
  bindings: {
    '#album': {
      observe: 'exai',
      initialize: function($el, model, options) {
        // Setup a Chosen or thirdy-party plugin for this bound element.
      }
    }
  }
```

### destroy

Called for each binding after it is unstuck from the model and view. Useful for tearing down third-party plugins or events that were configured in `initialze`.

```javascript
  bindings: {
    '#album': {
      observe: 'Tomorrow\'s Harvest',
      destroy: function($el, model, options) {
        // Tear down any events or clean up.
      }
    }
  }
```

### visible and visibleFn

When true, `visible` shows or hides the view element based on the model attribute's truthiness. `visible` may also be defined with a callback which should return a truthy value.
The `updateView` option defaults to `false` when using `visible`. You must opt-in to `updateView` in order to have both view element visibility and value changes bound to the observed attribute.

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
      visible: function(val, options) { return val == 'Mille Plateaux'; },
      updateView: true
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
  slideFast: function($el, isVisible, options) {
    if (isVisible) $el.slideDown('fast');
    else $el.slideUp('fast');
  }
```

## Form Element Bindings and Contenteditable

By default, form and contenteditable elements will be configured with two-way bindings, syncing changes in the view elements with model attributes. Optionally, one-way bindings can be configured with `updateView` or `updateModel`. With the `events`, you can specify a different set of events to use for reflecting changes to the model.

The following is a list of the supported form elements, their binding details, and the default events used for binding:

 - input, textarea, and contenteditable
   - element value synced with model attribute value
   - `propertychange`, `input`, `change` events are used for handling
 - input[type=checkbox]
   - `checked` property determined by the truthiness of the model attribute or if the checkbox "value" attribute is defined, then its value is used to match against the model. If a binding selector matches multiple checkboxes then it is expected that the observed model attribute will be an array of values to match against the checkbox value attributes.
   - `change` event is used for handling
 - input[type=radio]
   - model attribute value matched to a radio group `value` attribute
   - `change` event is used for handling
 - select
   - (recommended) specify `selectOptions` to have Stickit handle the rendering and option bindings of your select (see `selectOptions`)
   - if you choose to pre-render your select-options (not recommended) then there are two ways of configuring the bindings:
     - "data-stickit-bind-val" attributes in the DOM. This allows for binding non-string values from a prerendered &lt;select&gt;, assuming that you are using jQuery or a build of Zepto that includes the "data" module.
     - "option[value]" attributes in the DOM (used if no data-stickit-bind-val is present)
   - `change` event is used for handling

### events

Specify a list of events which will override stickit's default events for a form element. Bound events control when the model is updated with changes in the view element.

```javascript
  bindings: {
    'input#title': {
      observe: 'title',
      // Normally, stickit would bind `keyup`, `change`, `cut`, and `paste` events
      // to an input:text element. The following will override these events and only
      // update/set the model after the input#title element is blur'ed.
      events: ['blur']
    }
  }
```

### selectOptions

With the given `collection`, creates `<option>`s for the bound `<select>`, and binds their selected values to the observed model attribute. It is recommended to use `selectOptions` instead of pre-rendering select-options since Stickit will render them and can bind Objects, Arrays, and non-String values as data to the `<option>` values. The following are configuration options for binding:

 - `collection`: an object path of a collection relative to `window` or `view`/`this`, or a string function reference which returns a collection of objects. A collection should be an array of objects, a Backbone.Collection or a value/label map.
 - `labelPath`: the path to the label value for select options within the collection of objects. Default value when undefined is `label`.
 - `valuePath`: the path to the values for select options within the collection of objects. When an options is selected, the value that is defined for the given option is set in the model. Leave this undefined if the whole object is the value or to use the default `value`.
 - `defaultOption`: an object or method that returns an object with `label` and `value` keys, used to define a default option value. A common use case would be something like the following: `{label: "Choose one...", value: null}`.

When bindings are initialized, Stickit will build the `<select>` element with the `<option>`s and bindings configured. `selectOptions` are not required - if left undefined, then Stickit will expect that the `<option>`s are pre-rendered and build the collection from the DOM.

**Note:** if you are using Zepto and referencing object values for your select options, like in the second example, then you will need to also include the Zepto data module. Also, `<select>` bindings are two-way bindings only - `updateView:false` will be ignored.

The following example references a collection of stooges at `window.app.stooges` and uses the `age` attribute for labels and the `name` attribute for option values:

```javascript
  window.app.stooges = [{name:'moe', age:40}, {name:'larry', age:50}, {name:'curly', age:60}];
```

```javascript
  bindings: {
    'select#stooges': {
      observe: 'stooge',
      selectOptions: {
        // Alternatively, `this` can be used to reference anything in the view's scope.
        // For example: `collection:'this.stooges'` would reference `view.stooges`.
        collection: 'window.app.stooges',
        labelPath: 'age',
        valuePath: 'name'
    }
  }
```
The following is an example where the default `label` and `value` are used along with a `defaultOption`:
```javascript
  bindings: {
    'select#stooges': {
      observe: 'stooge',
      selectOptions: {
        collection: function() {
          // No need for `labelPath` or `valuePath` since the defaults
          // `label` and `value` are used in the collection.
          return [{value:1, label:'OH'}, {value:2, label:{name:'IN'}}];
        },
        defaultOption: {
          label: 'Choose one...',
          value: null
        }
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
          return [{id:1, data:{name:'OH'}}, {id:2, data:{name:'IN'}}];
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

It is often useful to have a lookup table for converting between underlying values which are actually stored and transmitted and the human-readable labels that represent them. Such a lookup table (an object like `{ value1: label1, value2: label2 }`) can be used to populate a select directly. By default, the options will be sorted alphabetically by label; pass a `comparator`function or property name string to override this ordering (which delegates to `_.sortBy`).

```javascript
  bindings: {
    'select#sounds': {
      observe: 'sound',
      selectOptions: {
        collection: {
          moo: 'cow',
          baa: 'sheep',
          oink: 'pig'
        }
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
    onGet: function(val) {
      // Return an array of the ids so that stickit can match them to select options.
      return _.map(val.split('-'), Number);
    },
    onSet: function(vals) {
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

### stickitChange

A property that is passed into the set options when stickit changes a model attribute. The value of this property is assigned to the binding configuration.

```javascript
model.on('change:observed', function(m, v, options) {
  if (options.stickitChange) {
    ...
  } else {
    ...
  }
});

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
  formatWings: function(val) {
    return val ? 'has-wings' : 'no-wings';
  }
 ```

## Custom Handlers

### addHandler
`Backbone.Stickit.addHandler(handler_s)`

Adds the given handler or array of handlers to Stickit. A handler is a binding configuration, with an additional `selector` key, that is used to customize or override any of Stickit's default binding handling. To derive a binding configuration, the `selector`s are used to match against a bound element, and any matching handlers  are mixed/extended in the order that they were added.

Internally, Stickit uses `addHandler` to add configuration for its default handling. For example, the following is the internal handler that matches against `textarea` elements:

```javascript
Backbone.Stickit.addHandler({
  selector: 'textarea',
  events: ['keyup', 'change', 'paste', 'cut'],
  update: function($el, val) { $el.val(val); },
  getVal: function($el) { return $el.val(); }
})

```
Except for the `selector`, those keys should look familiar since they belong to the binding configuration api. If unspecified, the following keys are defaulted for handlers: `updateModel:true`, `updateView:true`, `updateMethod:'text'`.

By adding your own `selector:'textarea'` handler, you can override any or all of Stickit's default `textarea` handling. Since binding configurations are derived from handlers with matching selectors, another customization trick would be to add a handler that matches textareas with a specific class name. For example:

```javascript
Backbone.Stickit.addHandler({
  selector: 'textarea.trim',
  getVal: function($el) { return $.trim($el.val()); }
})

```
With this handler in place, anytime you bind to a `textarea`, if the `textarea` contains a `trim` class then this handler will be mixed into the default `textarea` handler and `getVal` will be overridden.

Another good use for handlers is setup code for third-party plugins. At the end of `View.render`, it is common to include boilerplate third-party initialization code. For example the following sets up a [Chosen](http://harvesthq.github.com/chosen/) multiselect,

```javascript
render: function() {
  this.$el.html(this.template());
  this.setupChosenSelect(this.$('.friends'), 'friends');
  this.setupChosenSelect(this.$('.albums'), 'albums');
}

setupChosenSelect: function($el, modelAttr) { /* initialize Chosen for the el and map to model */ }
```

Instead, a handler could be setup to match bound elements that have a `chosen` class and initialize a [Chosen](http://harvesthq.github.com/chosen/) multiselect for the element:

```javascript
// Setup a generic, global handler for the Chosen plugin.
Backbone.Stickit.addHandler({
  selector: 'select.chosen',
  initialize: function($el, model, options) {
    $el.chosen();
    var up = function(m, v, opt) {
      if (!opt.bindKey) $el.trigger('liszt:updated');
    };
    this.listenTo(model, 'change:' + options.observe, up)
  }
});
```

```html
<!-- A template for the View, marked with the chosen class -->
<select class="friends chosen" multiple="multiple"></select>
```

```javascript
// In a View ...
bindings: {
  '.friends': {
    observe: 'friends',
    selectOptions: {
      collection: 'this.friendsCollection'
    }
  }
},
render: function() {
  this.$el.html(this.template());
  this.stickit(); // Chosen is initialized.
}
```

## Binding Callbacks Flowchart

The following image demonstrates the order in which bindings callbacks are called after stickit is initialized, a bound model attribute changes, and a bound view element changes.

![alt tag](https://raw.github.com/nytimes/backbone.stickit/gh-pages/flow.png)

## F.A.Q.

### Why Stickit?

JavaScript frameworks seem to be headed in the wrong direction - controller callbacks/directives, configuration, and special tags are being forced into the template/presentation layer. Who wants to program and debug templates?

If you are writing a custom frontend, then you're going to need to write custom JavaScript. Backbone helps you organize with a strong focus on the model, but stays the hell out of your presentation. Configuration and callbacks should only be in one place - the View/JavaScript.

### Dependencies

 Backbone 1.0, underscore.js, and jQuery or Zepto (with data module; see `selectOptions`)

### License

MIT

## Change Log

#### Master

#### 0.9.2
Bumped allowed underscore and Backbone versions.

#### 0.9.0
- **Breaking Change**: Classes are now treated separately from other attribute bindings. Use the new `classes` hash to bind element classes to your attributes.
- `defaultOption` can be defined as a function.
- Passing a Backbone Collection to `selectOptions` will keep the select dropdown in sync with add, remove, and sort events on the collection.
- `view#stickit` returns `this` for easier chaining.
- Non-string values can be bound to a pre-rendered `<select>` dropdown by setting `data-stickit-bind-val` on `<option>` elements.

#### 0.8.0

- **Breaking Change**: Calling `view#stickit` a second time with the same model, will no longer unbind all previously bound bindings associated with that model; instead, it will unbind any duplicate bindings (selectors) found in the given bindings hash (or whatever's in `view.bindings`) before initializing.
- Added an `view#addBinding` which will initiate a single, or hash, of bindings.
- `view#unstickit` now takes a second, optional, parameter which gives you the control to granularly remove a single, or hash, of bindings.

#### 0.7.0

- **Breaking Change**: the `bindKey` that was passed into the Backbone `change:attr` (undocumented) options was changed to `stickitChange` which is assigned the binding options which have a unique `bindId`.
- **Breaking Change**: the default events for input, textarea, and contenteditable form elements changed from [`keyup`, `cut`, `paste`, `change`] to [`propertychange`, `input`, `change`].
- **Breaking Change**: removed support for `input[type="number"]`. Instead, use `onSet` to format Number values, if needed.
- **Breaking Change**: The `updateModel` method parameters changed so the `event` is now passed as the second parameter. `updateModel(val, options)` -> `updateModel(val, event, options)`
- Stickit will now load using the UMD pattern so it is compatible with AMD, Node.js, and CommonJS.
- A view's `bindings` configuration can be defined as a function.
- When observing an array, if `onSet` or `getVal` return an array of values, Stickit will match the values to their respective attributes defined in `observe` and set them in the model. If you don't desire this change, then you can override this behavior with the following change:
- Added a `set` callback which by default calls `model#set`
- Added the `destroy` binding callback to compliment `initialize`.
- Trigger `stickit:unstick` for each model that is unbound in `unstickit` (or `view.remove`).
- Added handling for `observe` in function form.
- When binding with `visible` the `{updateView:false}` property is defaulted.
- Stickit will no longer sanitize (convert a `null`/`undefined` model attribute value to empty string) values if `onGet` is defined.
- Added support for the use of dot-notation in binding callbacks that are defined with a string that names a method on the view. For example - `onGet: "myObj.myCallback"`.
- Added Backbone.Stickit.getConfiguration which exposes the method of deriving configurations from handlers.
- Fixed a bug where "null" would show in Chrome when binding `attribute:null` to an element value.
- Fixed a bug where optgroup `<select>` handlers were rendering multiple `collection.defaultOptions`.

#### 0.6.3

- Added `Backbone.Stickit.addHandler()`, useful for defining a custom configuration for any bindings that match the `handler.selector`.
- **Breaking Change**: `eventsOverride` was changed to `events`.
- **Breaking Change**: removed the third param (original value) from the `afterUpdate` parameters.
- **Breaking Change**: replaced `unstickModel` with `unstickit`.
- **Breaking Change**: removed deprecated `modelAttr` from bindings api.
- **Breaking Change**: removed deprecated `format` from bindings api.
- **Breaking Change**: removed support for null value default/empty options in selectOptions.collection.
- Added `defaultOption` to the `selectOptions`.
- Added `initialize` to the bindings api which is called for each binding after it is initialized.
- Fixed a bug introduced in 0.6.2 where re-rendering/re-sticking wasn't unbinding view events [#66](https://github.com/NYTimes/backbone.stickit/issues/66).
- Added `update` to the bindings api which is an override for handling how the View element gets updated with Model changes.
- Added `getVal` to the bindings api which is an override for retrieving the value of the View element.
- Added support for passing in Backbone.Collection's into `selectOptions.collection`.
- Added support for referencing the view's scope with a String `selectOptions.collection` reference. For example: `collection:'this.viewCollection'`.

#### 0.6.2

- **Breaking Change**: Changed the last parameter from the model attribute name to the bindings hash in most of the binding callbacks. Note the model attribute name can still be gleaned from the bindings hash - `options.observe`. The following are the callbacks that were affected and their parameters (`options` are the bindings hash):
    `onGet(value, options)`
    `onSet(value, options)`
    `updateModel(value, options)`
    `updateView(value, options)`
    `afterUpdate($el, value, originalVal, options)`
    `visible(value, options)`
    `visibleFn($el, isVisible, options)`
- Added support for handling multiple checkboxes with one binding/selector and using the `value` attribute, if present, for checkboxes.
- Added default values for `labelPath` and `valuePath` in selectOptions: `label` and `value` respectively.
- Refactored event registration to use `$.on` and `$.off` instead of delegating through Backbone which fixed the following bugs:
    - `view.events` selectors and binding selectors that are equal were overriding [#49](https://github.com/NYTimes/backbone.stickit/issues/49)
    - `view.events` declared as a function was not supported [#51](https://github.com/NYTimes/backbone.stickit/pull/51)
- Fixed some bugs and added support requirements for zepto.js; [#58](https://github.com/NYTimes/backbone.stickit/pull/58).
- Bug Fixes: [#38](https://github.com/NYTimes/backbone.stickit/pull/38), [#42](https://github.com/NYTimes/backbone.stickit/pull/42),

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
