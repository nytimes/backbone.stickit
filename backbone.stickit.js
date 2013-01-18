(function($) {

	// Backbone.View Mixins
	// --------------------

	_.extend(Backbone.View.prototype, {

		// Collection of model event bindings.
		//   [{model,event,fn}, ...]
		_modelBindings: null,

		// Unbind the model bindings that are referenced in `this._modelBindings`. If
		// the optional `model` parameter is defined, then only delete bindings for
		// the given `model`.
		unstickModel: function(model) {
			_.each(this._modelBindings, _.bind(function(binding, i) {
				if (model && binding.model !== model) return false;
				binding.model.off(binding.event, binding.fn);
				delete this._modelBindings[i];
			}, this));
			this._modelBindings = _.compact(this._modelBindings);
		},

		// Using `this.bindings` configuration or the `optionalBindingsConfig`, binds `this.model`
		// or the `optionalModel` to elements in the view.
		stickit: function(optionalModel, optionalBindingsConfig) {
			var self = this,
				model = optionalModel || this.model,
				bindings = optionalBindingsConfig || this.bindings || {},
				props = ['autofocus', 'autoplay', 'async', 'checked', 'controls', 'defer', 'disabled', 'hidden', 'loop', 'multiple', 'open', 'readonly', 'required', 'scoped', 'selected'];

			this._modelBindings || (this._modelBindings = []);
			this.unstickModel(model);

			// Since `this.events` may be a function or hash, we'll create a stickitEvents
			// property where we can mix in our own set of events. We also need to support
			// multiple calls to `stickit()` in a single Backbone View.
			this._stickitEvents = _(_.result(this, 'events') || {}).extend(this._stickitEvents);

			// Iterate through the selectors in the bindings configuration and configure
			// the various options for each field.
			_.each(_.keys(bindings), function(selector) {
				var $el, options, modelAttr, visibleCb,
					config = bindings[selector] || {},
					bindKey = _.uniqueId();
				
				// Support ':el' selector - special case selector for the view managed delegate.
				if (selector != ':el') $el = self.$(selector);
				else {
					$el = self.$el;
					selector = '';
				}

				// Fail fast if the selector didn't match an element.
				if (!$el.length) return false;
		
				// Allow shorthand setting of model attributes - `'selector':'observe'`.
				if (_.isString(config)) config = {observe:config};

				// Keep backward-compatibility for `modelAttr` which was renamed `observe`.
				modelAttr = config.observe || config.modelAttr;

				if (config.updateModel == null) config.updateModel = true;
				if (config.updateView == null) config.updateView = true;

				// Keep backward-compatibility for `format` which was renamed `onGet`.
				if (config.format && !config.onGet) config.onGet = config.format;

				// Create the model set options with a unique `bindKey` so that we
				// can avoid double-binding in the `change:attribute` event handler.
				options = _.extend({bindKey:bindKey}, config.setOptions || {});

				// Setup the attributes configuration - a list that maps an attribute or
				// property `name`, to an `observe`d model attribute, using an optional
				// `onGet` formatter.
				//
				//     [{
				//       name: 'attributeOrPropertyName',
				//       observe: 'modelAttrName'
				//       onGet: function(modelAttrVal, modelAttrName) { ... }
				//     }, ...]
				//
				_.each(config.attributes || [], function(attrConfig) {
					var lastClass = '',
						observed = attrConfig.observe || modelAttr,
						updateAttr = function() {
							var updateType = _.indexOf(props, attrConfig.name, true) > -1 ? 'prop' : 'attr',
								val = getVal(model, observed, attrConfig, self);
							// If it is a class then we need to remove the last value and add the new.
							if (attrConfig.name == 'class') {
								$el.removeClass(lastClass).addClass(val);
								lastClass = val;
							}
							else $el[updateType](attrConfig.name, val);
						};
					// Keep backward-compatibility for `format` which is now `onGet`.
					if (attrConfig.format && !attrConfig.onGet) attrConfig.onGet = attrConfig.format;
					_.each(_.flatten([observed]), function(attr) {
						observeModelEvent(model, self, 'change:' + attr, updateAttr);
					});
					updateAttr();
				});

				// If `visible` is configured, then the view element will be shown/hidden
				// based on the truthiness of the modelattr's value or the result of the
				// given callback. If a `visibleFn` is also supplied, then that callback
				// will be executed to manually handle showing/hiding the view element.
				if (config.visible != null) {
					visibleCb = function() {
						updateVisibleBindEl($el, getVal(model, modelAttr, config, self), modelAttr, config, self);
					};
					observeModelEvent(model, self, 'change:' + modelAttr, visibleCb);
					visibleCb();
					return false;
				}

				if (modelAttr) {
					if (isFormEl($el) || isContenteditable($el)) {
						// Bind events to the element which will update the model with changes.
						_.each(config.eventsOverride || getModelEvents($el), function(type) {
							self._stickitEvents[type+'.stickit '+selector] = function() {
								var val = getElVal($el, isContenteditable($el));
								// Don't update the model if false is returned from the `updateModel` configuration.
								if (evaluateBoolean(self, config.updateModel, val, modelAttr))
								setVal(model, modelAttr, val, options, config.onSet, self);
							};
						});
					}

					// Setup a `change:modelAttr` observer to keep the view element in sync.
					// `modelAttr` may be an array of attributes or a single string value.
					_.each(_.flatten([modelAttr]), function(attr) {
						observeModelEvent(model, self, 'change:'+attr, function(model, val, options) {
							if (options == null || options.bindKey != bindKey)
								updateViewBindEl(self, $el, config, getVal(model, modelAttr, config, self), model);
						});
					});

					updateViewBindEl(self, $el, config, getVal(model, modelAttr, config, self), model, true);
				}
			});

			// Have Backbone delegate any newly added events in `_stickitEvents`.
			this.delegateEvents(this._stickitEvents);

			// Wrap remove so that we can remove model events when this view is removed.
			this.remove = _.wrap(this.remove, function(oldRemove) {
				self.unstickModel();
				if (oldRemove) oldRemove.call(self);
			});
		}
	});

	// Helpers
	// -------

	// Evaluates the given `path` (in object/dot-notation) relative to the given `obj`.
	// If the path is null/undefined, then the given `obj` is returned.
	var evaluatePath = function(obj, path) {
		var parts = (path || '').split('.');
		var result = _.reduce(parts, function(memo, i) { return memo[i]; }, obj);
		return result == null ? obj : result;
	};

	// If the given `fn` is a string, then view[fn] is called, otherwise it is a function
	// that should be executed.
	var applyViewFn = function(view, fn) {
		if (fn) return (_.isString(fn) ? view[fn] : fn).apply(view, _.toArray(arguments).slice(2));
	};

	var isFormEl = function($el) {
		return _.indexOf(['CHECKBOX', 'INPUT', 'SELECT', 'TEXTAREA'], $el[0].nodeName, true) > -1;
	};

	var isCheckbox = function($el) { return $el.is('input[type=checkbox]'); };

	var isRadio = function($el) { return $el.is('input[type="radio"]'); };

	var isNumber = function($el) { return $el.is('input[type=number]'); };

	var isSelect = function($el) { return $el.is('select'); };

	var isTextarea = function($el) { return $el.is('textarea'); };

	var isInput = function($el) { return $el.is('input'); };

	var isContenteditable = function($el) { return $el.is('[contenteditable="true"]'); };

	// Given a function, string (view function reference), or a boolean
	// value, returns the truthy result. Any other types evaluate as false.
	var evaluateBoolean = function(view, reference) {
		if (_.isBoolean(reference)) return reference;
		else if (_.isFunction(reference) || _.isString(reference))
			return applyViewFn.apply(this, _.toArray(arguments));
		return false;
	};

	// Setup a model event binding with the given function, and track the
	// event in the view's _modelBindings.
	var observeModelEvent = function(model, view, event, fn) {
		model.on(event, fn, view);
		view._modelBindings.push({model:model, event:event, fn:fn});
	};

	// Prepares the given value and sets it into the model.
	var setVal = function(model, attr, val, options, onSet, context) {
		if (onSet) val = applyViewFn(context, onSet, val, attr);
		model.set(attr, val, options);
	};

	// Returns the given `field`'s value from the `model`, escaping and formatting if necessary.
	// If `field` is an array, then an array of respective values will be returned.
	var getVal = function(model, field, config, context) {
		var val, retrieveVal = function(attr) {
			var retrieved = config.escape ? model.escape(attr) : model.get(attr);
			return _.isUndefined(retrieved) ? '' : retrieved;
		};
		val = _.isArray(field) ? _.map(field, retrieveVal) : retrieveVal(field);
		return config.onGet ? applyViewFn(context, config.onGet, val, field) : val;
	};

	// Returns the list of events needed to bind to the given form element.
	var getModelEvents = function($el) {
		// Binding to `oninput` is off the table since IE9- has buggy to no support, and
		// using feature detection doesn't work because it is hard to sniff in Firefox.
		if (isInput($el) || isTextarea($el) || isContenteditable($el))
			return ['keyup', 'change', 'paste', 'cut'];
		else return ['change'];
	};

	// Gets the value from the given element, with the optional hint that the value is html.
	var getElVal = function($el, isHTML) {
		var val;
		if (isFormEl($el)) {
			if (isNumber($el)) val = Number($el.val());
			else if (isRadio($el)) val = $el.filter(':checked').val();
			else if (isCheckbox($el)) {
				if ($el.length > 1) {
					val = _.reduce($el, function(memo, el) {
						if ($(el).prop('checked')) memo.push($(el).val());
						return memo;
					}, []);
				} else {
					val = $el.prop('checked');
					// If the checkbox has a value attribute defined, then
					// use that value. Most browsers use "on" as a default.
					var boxval = $el.val();
					if (boxval != 'on' && boxval != null) {
						if (val) val = $el.val();
						else val = null;
					}
				}
			} else if (isSelect($el)) {
				if ($el.prop('multiple')) {
					val = $el.find('option:selected').map(function() {
						return $(this).data('stickit_bind_val');
					}).get();
				} else {
					val = $el.find('option:selected').data('stickit_bind_val');
				}
			}
			else val = $el.val();
		} else {
			if (isHTML) val = $el.html();
			else val = $el.text();
		}
		return val;
	};

	// Updates the given element according to the rules for the `visible` api key.
	var updateVisibleBindEl = function($el, val, attrName, config, context) {
		var visible = config.visible, visibleFn = config.visibleFn, isVisible = !!val;

		// If `visible` is a function then it should return a boolean result to show/hide.
		if (_.isFunction(visible) || _.isString(visible)) isVisible = applyViewFn(context, visible, val, attrName);
		
		// Either use the custom `visibleFn`, if provided, or execute a standard jQuery show/hide.
		if (visibleFn) applyViewFn(context, visibleFn, $el, isVisible, attrName);
		else {
			if (isVisible) $el.show();
			else $el.hide();
		}
	};

	// Update the value of `$el` in `view` using the given configuration.
	var updateViewBindEl = function(view, $el, config, val, model, isInitializing) {
		var modelAttr = config.observe || config.modelAttr,
			afterUpdate = config.afterUpdate,
			selectConfig = config.selectOptions,
			updateMethod = config.updateMethod || 'text',
			originalVal = getElVal($el, (config.updateMethod == 'html' || isContenteditable($el)));

		// Don't update the view if `updateView` returns false.
		if (!evaluateBoolean(view, config.updateView, val)) return;

		if (isRadio($el)) $el.filter('[value="'+val+'"]').prop('checked', true);
		else if (isCheckbox($el)) {
			if ($el.length > 1) {
				// There are multiple checkboxes so we need to go through them and check
				// any that have value attributes that match what's in the array of `val`s.
				val || (val = []);
				_.each($el, function(el) {
					if (_.indexOf(val, $(el).val()) > -1) $(el).prop('checked', true);
					else $(el).prop('checked', false);
				});
			} else {
				if (_.isBoolean(val)) $el.prop('checked', val);
				else $el.prop('checked', val == $el.val());
			}
		} else if (isInput($el) || isTextarea($el)) $el.val(val);
		else if (isContenteditable($el)) $el.html(val);
		else if (isSelect($el)) {
			var optList, list = selectConfig.collection, isMultiple = $el.prop('multiple');

			$el.html('');

			// The `list` configuration is a function that returns the options list or a string
			// which represents the path to the list relative to `window`.
			optList = _.isFunction(list) ? applyViewFn(view, list) : evaluatePath(window, list);

			// Add an empty default option if the current model attribute isn't defined.
			if (val == null)
				$el.append('<option/>').find('option').prop('selected', true).data('stickit_bind_val', val);

			if (_.isArray(optList)) {
				addSelectOptions(optList, $el, selectConfig, val, isMultiple);
			} else {
				// If the optList is an object, then it should be used to define an optgroup. An
				// optgroup object configuration looks like the following:
				//
				//     {
				//       'opt_labels': ['Looney Tunes', 'Three Stooges'],
				//       'Looney Tunes': [{id: 1, name: 'Bugs Bunny'}, {id: 2, name: 'Donald Duck'}],
				//       'Three Stooges': [{id: 3, name : 'moe'}, {id: 4, name : 'larry'}, {id: 5, name : 'curly'}]
				//     }
				//
				_.each(optList.opt_labels, function(label) {
					var $group = $('<optgroup/>').attr('label', label);
					addSelectOptions(optList[label], $group, selectConfig, val, isMultiple);
					$el.append($group);
				});
			}
		} else {
			$el[updateMethod](val);
		}

		// Execute the `afterUpdate` callback from the `bindings` config.
		if (!isInitializing) applyViewFn(view, afterUpdate, $el, val, originalVal);
	};

	var addSelectOptions = function(optList, $el, selectConfig, fieldVal, isMultiple) {
		_.each(optList, function(obj) {
			var option = $('<option/>'), optionVal = obj;

			// If the list contains a null/undefined value, then an empty option should
			// be appended in the list; otherwise, fill the option with text and value.
			if (obj != null) {
				option.text(evaluatePath(obj, selectConfig.labelPath || "label"));
				optionVal = evaluatePath(obj, selectConfig.valuePath || "value");
			} else if ($el.find('option').length && $el.find('option:eq(0)').data('stickit_bind_val') == null) return false;

			// Save the option value so that we can reference it later.
			option.data('stickit_bind_val', optionVal);

			// Determine if this option is selected.
			if (!isMultiple && optionVal != null && fieldVal != null && optionVal == fieldVal || (_.isObject(fieldVal) && _.isEqual(optionVal, fieldVal)))
				option.prop('selected', true);
			else if (isMultiple && _.isArray(fieldVal)) {
				_.each(fieldVal, function(val) {
					if (_.isObject(val)) val = evaluatePath(val, selectConfig.valuePath);
					if (val == optionVal || (_.isObject(val) && _.isEqual(optionVal, val)))
						option.prop('selected', true);
				});
			}

			$el.append(option);
		});
	};

})(Backbone.$);
