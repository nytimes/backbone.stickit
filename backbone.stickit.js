(function($) {

	var evaluatePath, applyViewFn, updateViewBindEl, getFormElVal, updateVisibleBindEl;

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
			var self = this, observeModelEvent,
				model = optionalModel || this.model,
				bindings = optionalBindingsConfig || this.bindings || {},
				props = ['autofocus', 'autoplay', 'async', 'checked', 'controls', 'defer', 'disabled', 'hidden', 'loop', 'multiple', 'open', 'readonly', 'required', 'scoped', 'selected'];

			this._modelBindings || (this._modelBindings = []);
			this.unstickModel(model);

			this.events || (this.events = {});

			// Setup a model event binding with the given function, and track the event in this._modelBindings.
			observeModelEvent = function(event, fn) {
				model.on(event, fn, self);
				self._modelBindings.push({model:model, event:event, fn:fn});
			};

			// Iterate through the selectors in the bindings configuration and configure
			// the various options for each field.
			_.each(_.keys(bindings), function(selector) {
				var $el, getVal, modelEvents, eventCallback, format, modelAttr, attributes, visibleCb,
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
		
				// Allow shorthand setting of model attributes
				if (typeof config === 'string') config = {modelAttr:config};

				format = config.format;
				modelAttr = config.modelAttr;
				attributes = config.attributes || [];
				
				// Returns the given `field`'s value from the model, escaping and formatting if necessary.
				getVal = function(field) {
					var val = config.escape ? model.escape(field) : model.get(field);
					if (_.isUndefined(val)) val = '';
					return format ? applyViewFn(self, format, val, modelAttr) : val;
				};

				// Setup the attributes configuration - a list that maps an attribute or
				// property `name`, to an `observe`d model attribute, using an optional
				// `format`ter.
				//
				//   [{
				//     name: 'attributeOrPropertyName',
				//     observe: 'modelAttrName'
				//     format: function(modelAttrVal, modelAttrName) { ... }
				//   }, ...]
				//
				_.each(attributes, function(attrConfig) {
					var lastClass = '',
						observed = attrConfig.observe || modelAttr,
						updateAttr = function() {
							var val, updateType = _.indexOf(props, attrConfig.name, true) > -1 ? 'prop' : 'attr';
							if (attrConfig.format) val = applyViewFn(self, attrConfig.format, model.get(observed), observed);
							else val = model.get(observed);
							// If it is a class then we need to remove the last value and add the new.
							if (attrConfig.name == 'class') {
								$el.removeClass(lastClass).addClass(val);
								lastClass = val;
							}
							else $el[updateType](attrConfig.name, val);
						};
					observeModelEvent('bind:' + observed, updateAttr);
					updateAttr();
				});

				// If the `visible` config is configured, then the view element will be
				// shown/hidden based on the truthiness of the modelattr's value or the
				// result of the given callback. If a `visibleFn` is also supplied, then
				// that callback will be executed to manually handle showing/hiding the
				// view element.
				if (config.visible) {
					visibleCb = function() {
						updateVisibleBindEl($el, getVal(modelAttr), modelAttr, config, this);
					};
					observeModelEvent('bind:' + modelAttr, visibleCb);
					visibleCb();
					return false;
				}

				if (modelAttr) {
					// If the bind element is a form element, then configure `this.events` bindings
					// so that the model stays in sync with user input/changes.
					eventCallback = function() {
						var options = _.extend({bindKey:bindKey}, config.setOptions || {});
						model.set(modelAttr, getFormElVal($el), options);
					};
					if ($el.is('input[type=radio]') || $el.is('input[type=checkbox]') || $el.is('select'))
						self.events['change '+selector] =  eventCallback;
					else if ($el.is('input') || $el.is('textarea')) {
						self.events['keyup '+selector] =  eventCallback;
						self.events['change '+selector] =  eventCallback;
					}

					// Setup a `bind:modelAttr` observer for the model to keep the view element in sync.
					observeModelEvent('bind:'+modelAttr, function(val, options) {
						if (options && options.bindKey != bindKey)
							updateViewBindEl(self, $el, config, getVal(modelAttr), model);
					});

					updateViewBindEl(self, $el, config, getVal(modelAttr), model, true);
				}
			});
			
			// We added to `this.events` so we need to re-delegate.
			this.delegateEvents();

			// Wrap remove so that we can remove model events when this view is removed.
			this.remove = _.wrap(this.remove, function(oldRemove) {
				self.unstickModel();
				oldRemove && oldRemove.call(self);
			});
		}
	});

	// Backbone.Model.set Wrapper
	// --------------------------

	// Wrap set and fire a `bind:[attribute_name]` for each changed attribute,
	// unless there is a {bind:false} option.
	Backbone.Model.prototype.set = _.wrap(Backbone.Model.prototype.set, function(oldSet, key, value, oldOptions) {
		var attrs, attr, val, ret,
			options = oldOptions && _.clone(oldOptions) || {},
			now = this.attributes;
		
		// Use the parameters to get the `attrs` and `options` objects.
		if (_.isObject(key) || key == null) {
			attrs = key;
			options = value;
		} else {
			attrs = {};
			attrs[key] = value;
		}
		options || (options = {});

		// Delegating to Backbone's model.set().
		ret = oldSet.call(this, attrs, options);

		// Iterate through the attributes that were just set.
		_.each(_.keys(attrs || {}), _.bind(function(attr) {
			// Trigger a custom "bind" event for each attribute that has changed, unless {bind:false} option.
			if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr)))
				this.trigger('bind:' + attr, attrs[attr], options);
		}, this));

		return ret;
	});

	// Utilities
	// ---------

	// Evaluates the given `path` (in object/dot-notation) relative to the given `obj`.
	evaluatePath = function(obj, path) {
		var pathParts = (path || '').split('.');
		return _.reduce(pathParts, function(memo, i) { return memo[i]; }, obj) || obj;
	};

	// If the given `fn` is a string, then view[fn] is called, otherwise it is a function
	// that should be executed.
	applyViewFn = function(view, fn) {
		if (fn) return (_.isString(fn) ? view[fn] : fn).apply(view, _.toArray(arguments).slice(2));
	};

	// Gets the value from the given form element.
	getFormElVal = function($el) {
		var val;
		if ($el.is('input[type=checkbox]')) val = $el.prop('checked');
		else if ($el.is('select')) val = $el.find('option:selected').data('stickit_bind_val');
		else if ($el.is('input[type=number]')) val = Number($el.val());
		else if ($el.is('input[type="radio"]')) val = $el.filter(':checked').val();
		else val = $el.val();
		return val;
	};

	updateVisibleBindEl = function($el, val, attrName, config, context) {
		var visible = config.visible, visibleFn = config.visibleFn, isVisible = !!val;
		if (_.isFunction(visible))
			isVisible = applyViewFn(context, visible, val, attrName);
		if (visibleFn)
			applyViewFn(context, visibleFn, $el, isVisible, attrName);
		else {
			if (isVisible) $el.show();
			else $el.hide();
		}
	};

	// Update the value of `$el` in `view` using the given configuration.
	updateViewBindEl = function(view, $el, config, val, model, isInitializing) {
		var originalVal, radioEl,
			modelAttr = config.modelAttr,
			afterUpdate = config.afterUpdate,
			selectConfig = config.selectOptions,
			updateMethod = config.updateMethod || 'text';

		if ($el.is('input[type=radio]')) {
			radioEl = $el.filter('[value='+val+']');
			originalVal = radioEl.prop('checked');
			radioEl.prop('checked', true);
		} else if ($el.is('input[type=checkbox]')) {
			originalVal = $el.prop('checked');
			$el.prop('checked', val === true);
		} else if ($el.is('input') || $el.is('textarea')) {
			originalVal = $el.val();
			if (originalVal !== val) $el.val(val);
		} else if ($el.is('select')) {
			var optList, list = selectConfig.collection, fieldVal = model.get(modelAttr);

			// Get the current selected option value if the select options exist.
			if ($el[0].options.length && $el[0].selectedIndex >= 0)
				originalVal = $($el[0].options[$el[0].selectedIndex]).data('stickit_bind_val');
			
			$el.html('');

			// The `list` configuration is a function that returns the options list or a string
			// which represents the path to the list relative to `window`.
			optList = _.isFunction(list) ? list.call(view) : evaluatePath(window, list);

			// Add an empty default option if the current model attribute isn't defined.
			if (fieldVal == null)
				$el.append('<option/>').find('option').prop('selected', true).data('stickit_bind_val', fieldVal);

			_.each(optList, function(obj) {
				var option = $('<option/>'), optionVal = obj;

				// If the list contains a null/undefined value, then an empty option should
				// be appended in the list; otherwise, fill the option with text and value.
				if (obj != null) {
					option.text(obj[selectConfig.labelPath]);
					optionVal = evaluatePath(obj, selectConfig.valuePath);
				}

				// Save the option value so that we can reference it later.
				option.data('stickit_bind_val', optionVal);

				// Determine if this option is selected.
				if (optionVal != null && fieldVal != null && optionVal == fieldVal || (_.isObject(fieldVal) && _.isEqual(optionVal, fieldVal)))
					option.prop('selected', true);

				$el.append(option);
			});
		} else {
			originalVal = $el[updateMethod]();
			$el[updateMethod](val);
		}

		// Execute the `afterUpdate` callback from the `bindings` config.
		if (!isInitializing) applyViewFn(view, afterUpdate, $el, val, originalVal);
	};

})(window.jQuery || window.Zepto);
