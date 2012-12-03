(function($) {

	var evaluatePath, applyViewFn, updateViewBindEl, getElVal, updateVisibleBindEl,
		getVal, isFormEl, isInput, isTextarea, isNumber, isCheckbox, isRadio, isSelect;

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
				props = ['autofocus', 'autoplay', 'async', 'checked', 'controls', 'defer', 'disabled', 'hidden', 'loop', 'multiple', 'open', 'readonly', 'required', 'scoped', 'selected'],
				bindingsKeys = ['afterUpdate', 'attributes', 'escape', 'format', 'modelAttr', 'oneWay', 'setOptions', 'selectOptions', 'updateMethod', 'visible', 'visibleFn'];

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
				var $el, modelEvents, eventCallback, modelAttr, visibleCb,
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
		
				// Allow shorthand setting of model attributes - `'selector':'modelAttr'`.
				if (typeof config === 'string') config = {modelAttr:config};

				modelAttr = config.modelAttr;

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
				_.each(config.attributes || [], function(attrConfig) {
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
					observeModelEvent('change:' + observed, updateAttr);
					updateAttr();
				});

				// If the `visible` config is configured, then the view element will be
				// shown/hidden based on the truthiness of the modelattr's value or the
				// result of the given callback. If a `visibleFn` is also supplied, then
				// that callback will be executed to manually handle showing/hiding the
				// view element.
				if (config.visible) {
					visibleCb = function() {
						updateVisibleBindEl($el, getVal(model, modelAttr, config, self), modelAttr, config, this);
					};
					observeModelEvent('change:' + modelAttr, visibleCb);
					visibleCb();
					return false;
				}

				if (modelAttr) {
					// By default, form elements are bound two-way unless `oneWay:true` is configured.
					if (!config.oneWay && isFormEl($el)) {
						if (_.isArray(modelAttr)) throw new Error("Form elements with two-way bindings can only be bound to one model attribute.");

						// Wire up two-way bindings for form elements.
						eventCallback = function() {
							// Send a unique `bindKey` option so that we can avoid
							// double-binding in the `change:attribute` event handler.
							var options = _.extend({bindKey:bindKey}, config.setOptions || {});
							model.set(modelAttr, getElVal($el), options);
						};
						if (isRadio($el) || isCheckbox($el) || isSelect($el))
							self.events['change '+selector] =  eventCallback;
						else if (isInput($el) || isTextarea($el)) {
							self.events['keyup '+selector] =  eventCallback;
							self.events['change '+selector] =  eventCallback;
						}
					}

					// Setup a `change:modelAttr` observer to keep the view element in sync.
					// `modelAttr` may be an array of attributes or a single string value.
					_.each(_.flatten([modelAttr]), function(attr) {
						observeModelEvent('change:'+attr, function(model, val, options) {
							if (options && options.bindKey != bindKey)
								updateViewBindEl(self, $el, config, getVal(model, modelAttr, config, self), model);
						});
					});

					updateViewBindEl(self, $el, config, getVal(model, modelAttr, config, self), model, true);
				}

				// Any key in the configuration that is outside of the api is
				// considered an event and is wired up in `view.events`.
				_.each(_.difference(_.keys(config), bindingsKeys), function(event) {
					self.events[event+' '+selector] = function(e) {
						return applyViewFn(self, config[event], $el, e);
					};
				});
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

	isFormEl = function($el) {
		return _.indexOf(['CHECKBOX', 'INPUT', 'SELECT', 'TEXTAREA'], $el[0].nodeName, true) > -1;
	};

	isCheckbox = function($el) { return $el.is('input[type=checkbox]'); };

	isRadio = function($el) { return $el.is('input[type="radio"]'); };

	isNumber = function($el) { return $el.is('input[type=number]'); };

	isSelect = function($el) { return $el.is('select'); };

	isTextarea = function($el) { return $el.is('textarea'); };

	isInput = function($el) { return $el.is('input'); };

	// Returns the given `field`'s value from the `model`, escaping and formatting if necessary.
	// If `field` is an array, then an array of respective values will be returned.
	getVal = function(model, field, config, context) {
		var val, retrieveVal = function(attr) {
			var retrieved = config.escape ? model.escape(attr) : model.get(attr);
			return _.isUndefined(retrieved) ? '' : retrieved;
		};
		val = _.isArray(field) ? _.map(field, retrieveVal) : retrieveVal(field);
		return config.format ? applyViewFn(context, config.format, val, field) : val;
	};

	// Gets the value from the given element, with the optional hint that the value is html.
	getElVal = function($el, isHTML) {
		var val;
		if (isFormEl($el)) {
			if (isCheckbox($el)) val = $el.prop('checked');
			else if (isSelect($el)) val = $el.find('option:selected').data('stickit_bind_val');
			else if (isNumber($el)) val = Number($el.val());
			else if (isRadio($el)) val = $el.filter(':checked').val();
			else val = $el.val();
		} else {
			if (isHTML) val = $el.html();
			else val = $el.text();
		}
		return val;
	};

	// Updates the given element according to the rules for the `visible` api key.
	updateVisibleBindEl = function($el, val, attrName, config, context) {
		var visible = config.visible, visibleFn = config.visibleFn, isVisible = !!val;

		// If `visible` is a function then it should return a boolean result to show/hide.
		if (_.isFunction(visible)) isVisible = applyViewFn(context, visible, val, attrName);
		
		// Either use the custom `visibleFn`, if provided, or execute a standard jQuery show/hide.
		if (visibleFn) applyViewFn(context, visibleFn, $el, isVisible, attrName);
		else {
			if (isVisible) $el.show();
			else $el.hide();
		}
	};

	// Update the value of `$el` in `view` using the given configuration.
	updateViewBindEl = function(view, $el, config, val, model, isInitializing) {
		var modelAttr = config.modelAttr,
			afterUpdate = config.afterUpdate,
			selectConfig = config.selectOptions,
			updateMethod = config.updateMethod || 'text',
			originalVal = getElVal($el, config.updateMethod == 'html');

		if (isRadio($el)) $el.filter('[value='+val+']').prop('checked', true);
		else if (isCheckbox($el)) $el.prop('checked', !!val);
		else if (isInput($el) || isTextarea($el)) $el.val(val);
		else if (isSelect($el)) {
			var optList, list = selectConfig.collection, fieldVal = model.get(modelAttr);

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
					option.text(evaluatePath(obj, selectConfig.labelPath));
					optionVal = evaluatePath(obj, selectConfig.valuePath);
				} else if ($el.find('option').length && $el.find('option:eq(0)').data('stickit_bind_val') == null) return false;

				// Save the option value so that we can reference it later.
				option.data('stickit_bind_val', optionVal);

				// Determine if this option is selected.
				if (optionVal != null && fieldVal != null && optionVal == fieldVal || (_.isObject(fieldVal) && _.isEqual(optionVal, fieldVal)))
					option.prop('selected', true);

				$el.append(option);
			});
		} else {
			$el[updateMethod](val);
		}

		// Execute the `afterUpdate` callback from the `bindings` config.
		if (!isInitializing) applyViewFn(view, afterUpdate, $el, val, originalVal);
	};

})(window.jQuery || window.Zepto);

