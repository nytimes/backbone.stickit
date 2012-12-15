$(document).ready(function() {

	module("view.stickit");

	test('input:text', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				modelAttr: 'water'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test1').val(), 'fountain');

		model.set('water', 'evian');
		equal(view.$('#test1').val(), 'evian');
		
		view.$('#test1').val('dasina').keyup();
		equal(model.get('water'), 'dasina');
	});

	test('textarea', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst2';
		view.bindings = {
			'#test2': {
				modelAttr: 'water'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test2').val(), 'fountain');

		model.set('water', 'evian');
		equal(view.$('#test2').val(), 'evian');
		
		view.$('#test2').val('dasina').keyup();
		equal(model.get('water'), 'dasina');
	});

	test('contenteditable', function() {
		
		model.set({'water':'<span>fountain</span>'});
		view.model = model;
		view.templateId = 'jst17';
		view.bindings = {
			'#test17': {
				modelAttr: 'water'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test17').html(), '<span>fountain</span>');

		model.set('water', '<span>evian</span>');
		equal(view.$('#test17').html(), '<span>evian</span>');
		
		view.$('#test17').html('<span>dasina</span>').keyup();
		equal(model.get('water'), '<span>dasina</span>');
	});

	test('checkbox', function() {
		
		model.set({'water':true});
		view.model = model;
		view.templateId = 'jst3';
		view.bindings = {
			'#test3': {
				modelAttr: 'water'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test3').prop('checked'), true);

		model.set('water', false);
		equal(view.$('#test3').prop('checked'), false);
		
		view.$('#test3').prop('checked', true).change();
		equal(model.get('water'), true);
	});

	test('radio', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst4';
		view.bindings = {
			'.test4': {
				modelAttr: 'water'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('.test4:checked').val(), 'fountain');

		model.set('water', 'evian');
		equal(view.$('.test4:checked').val(), 'evian');
		
		view.$('.test4[value=fountain]').prop('checked', true).change();
		equal(model.get('water'), 'fountain');
	});

	test('div', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: 'water'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), 'fountain');

		model.set('water', 'evian');
		equal(view.$('#test5').text(), 'evian');
	});

	test(':el selector', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			':el': {
				modelAttr: 'water'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$el.text(), 'fountain');

		model.set('water', 'evian');
		equal(view.$el.text(), 'evian');
	});

	test('stickit (shorthand bindings)', function() {
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': 'water'
		};
		$('#qunit-fixture').html(view.render().el);
		
		equal(view.$('#test5').text(), 'fountain');

		model.set('water', 'evian');

		equal(view.$('#test5').text(), 'evian');

	});

	test('stickit (multiple models and bindings)', function() {
	
		// Test sticking two times to two different models and configs.
		var model1, model2, testView;
		
		model1 = new (Backbone.Model)({id:1, water:'fountain', candy:'twix'});
		model2 = new (Backbone.Model)({id:2, water:'evian', candy:'snickers'});
		
		testView = new (Backbone.View.extend({
			initialize: function() {
				this.model = model1;
				this.otherModel = model2;
			},
			bindings: {
				'#test0-div': {
					modelAttr: 'water'
				},
				'#test0-textarea': {
					modelAttr: 'candy'
				}
			},
			otherBindings: {
				'#test0-span': {
					modelAttr: 'water'
				},
				'#test0-input': {
					modelAttr: 'candy'
				}
			},
			render: function() {
				var html = document.getElementById('jst0').innerHTML;
				this.$el.html(_.template(html)());
				this.stickit();
				this.stickit(this.otherModel, this.otherBindings);
				return this;
			}
		}))();

		$('#qunit-fixture').html(testView.render().el);

		equal(testView.$('#test0-div').text(), 'fountain');
		equal(testView.$('#test0-textarea').val(), 'twix');
		equal(testView.$('#test0-span').text(), 'evian');
		equal(testView.$('#test0-input').val(), 'snickers');

		model1.set({water:'dasina', candy: 'mounds'});
		model2.set({water:'poland springs', candy: 'almond joy'});

		equal(testView.$('#test0-div').text(), 'dasina');
		equal(testView.$('#test0-textarea').val(), 'mounds');
		equal(testView.$('#test0-span').text(), 'poland springs');
		equal(testView.$('#test0-input').val(), 'almond joy');

		testView.$('#test0-textarea').val('kit kat').keyup();
		testView.$('#test0-input').val('butterfinger').keyup();

		equal(model1.get('candy'), 'kit kat');
		equal(model2.get('candy'), 'butterfinger');
	});

	test('bindings:setOptions', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				modelAttr: 'water',
				setOptions: {silent:true}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test1').val(), 'fountain');
		
		view.$('#test1').val('dasina').keyup();
		equal(model.get('water'), 'dasina');
		equal(model.changedAttributes().water, 'dasina');
	});

	test('bindings:updateMethod', function() {
		
		model.set({'water':'<a href="www.test.com">river</a>'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: 'water',
				updateMethod: 'html'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), 'river');
	});

	test('bindings:escape', function() {
		
		model.set({'water':'<a href="www.test.com">river</a>'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: 'water',
				updateMethod: 'html',
				escape: true
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), '<a href="www.test.com">river</a>');
	});

	test('bindings:format', 3, function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: 'water',
				format: function(val, modelAttr) {
					equal(val, this.model.get('water'));
					equal(modelAttr, 'water');
					return '_' + val + '_' + modelAttr;
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), '_fountain_water');
	});

	test('bindings:afterUpdate', function() {
		
		model.set({'water':'fountain', 'candy':true});
		view.model = model;
		view.templateId = 'jst15';
		view.bindings = {
			'#test15-1': {
				modelAttr: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal($el.text(), model.get('water'));
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-2': {
				modelAttr: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal($el.val(), model.get('water'));
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-3': {
				modelAttr: 'candy',
				afterUpdate: function($el, val, originalVal) {
					equal(val, false);
					equal(originalVal, true);
				}
			},
			'.test15-4': {
				modelAttr: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-6': {
				modelAttr: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-7': {
				modelAttr: 'water',
				selectOptions: {
					collection: function() { return [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]; },
					labelPath: 'name',
					valuePath: 'name'
				},
				afterUpdate: function($el, val, originalVal) {
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		model.set('water', 'evian');
		model.set('candy', false);
	});

	test('bindings:selectOptions', function() {

		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst8';
		view.bindings = {
			'#test8': {
				modelAttr: 'water',
				selectOptions: {
					collection: function() { return [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]; },
					labelPath: 'name',
					valuePath: 'name'
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test8 option:selected').data('stickit_bind_val'), 'fountain');

		model.set('water', 'evian');
		equal(view.$('#test8 option:selected').data('stickit_bind_val'), 'evian');
		
		view.$('#test8 option:eq(2)').prop('selected', true).change();
		equal(model.get('water'), 'dasina');
	});
	
	test('bindings:selectOptions (empty valuePath)', function() {
	
		model.set({'water':{id:1, name:'fountain'}});
		window.test = {
			collection: [null, {id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]
		};
		view.model = model;
		view.templateId = 'jst8';
		view.bindings = {
			'#test8': {
				modelAttr: 'water',
				selectOptions: {
					collection: 'test.collection',
					labelPath: 'name'
				}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test8 option:selected').data('stickit_bind_val').id, 1);

		model.set('water', {id:2, name:'evian'});
		equal(view.$('#test8 option:selected').data('stickit_bind_val').id, 2);

		view.$('#test8 option:eq(3)').prop('selected', true).change();
		equal(model.get('water').id, 3);
	});
	
	test('bindings:selectOptions (null model val - empty option)', function() {
	
		model.set({'water':null});
		window.test = {
			collection: [null, {id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]
		};
		view.model = model;
		view.templateId = 'jst8';
		view.bindings = {
			'#test8': {
				modelAttr: 'water',
				selectOptions: {
					collection: 'test.collection',
					labelPath: 'name'
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test8 option:selected').data('stickit_bind_val'), null);

		model.set('water', {id:2, name:'evian'});
		equal(view.$('#test8 option:selected').data('stickit_bind_val').id, 2);
		
		view.$('#test8 option:eq(0)').prop('selected', true).change();
		equal(model.get('water'), null);
	});

	test('bindings:selectOptions (multi-select without valuePath)', function() {

		var collection = [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}, {id:4,name:'aquafina'}];
		
		model.set({'water': [{id:1,name:'fountain'}, {id:3,name:'dasina'}] });
		view.model = model;
		view.templateId = 'jst16';
		view.bindings = {
			'#test16': {
				modelAttr: 'water',
				selectOptions: {
					collection: function() { return collection; },
					labelPath: 'name'
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test16 option:selected:eq(0)').data('stickit_bind_val').name, 'fountain');
		equal(view.$('#test16 option:selected:eq(1)').data('stickit_bind_val').name, 'dasina');

		var field = _.clone(model.get('water'));
		field.push({id:2,name:'evian'});

		model.set({'water':field});
		equal(view.$('#test16 option:selected:eq(1)').data('stickit_bind_val').name, 'evian');

		view.$('#test16 option:eq(3)').prop('selected', true).change();

		equal(model.get('water').length, 4);

	});

	test('bindings:selectOptions (multi-select with valuePath)', function() {

		var collection = [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}, {id:4,name:'aquafina'}];
		
		model.set({'water': [1, 3]});
		view.model = model;
		view.templateId = 'jst16';
		view.bindings = {
			'#test16': {
				modelAttr: 'water',
				selectOptions: {
					collection: function() { return collection; },
					labelPath: 'name',
					valuePath: 'id'
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test16 option:selected:eq(0)').data('stickit_bind_val'), 1);
		equal(view.$('#test16 option:selected:eq(1)').data('stickit_bind_val'), 3);

		var field = _.clone(model.get('water'));
		field.push(2);

		model.set({'water':field});
		equal(view.$('#test16 option:selected:eq(1)').data('stickit_bind_val'), 2);

		view.$('#test16 option:eq(3)').prop('selected', true).change();

		equal(model.get('water').length, 4);

	});

	test('bindings:attributes:name', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: 'water',
				attributes: [{
					name: 'data-name'

				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').attr('data-name'), 'fountain');

		model.set('water', 'evian');
		equal(view.$('#test5').attr('data-name'), 'evian');
	});

	test('bindings:attributes:name:class', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst9';
		view.bindings = {
			'#test9': {
				modelAttr: 'water',
				attributes: [{
					name: 'class'
				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		ok(view.$('#test9').hasClass('test') && view.$('#test9').hasClass('fountain'));

		model.set('water', 'evian');
		ok(view.$('#test9').hasClass('test') && view.$('#test9').hasClass('evian'));
	});

	test('bindings:attributes:format', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: 'water',
				attributes: [{
					name: 'data-name',
					format: function(val, modelAttr) { return '_' + val + '_' + modelAttr; }
				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').attr('data-name'), '_fountain_water');

		model.set('water', 'evian');
		equal(view.$('#test5').attr('data-name'), '_evian_water');
	});

	test('bindings:attributes:observe', function() {
		
		model.set({'water':'fountain', 'candy':'twix'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				attributes: [{
					name: 'data-name',
					observe: 'candy',
					format: function(val) {
						equal(val, this.model.get('candy'));
						return this.model.get('water') + '-' + this.model.get('candy');
					}
				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').attr('data-name'), 'fountain-twix');

		model.set({'water':'evian', 'candy':'snickers'});
		equal(view.$('#test5').attr('data-name'), 'evian-snickers');
	});

	test('bindings:attributes:observe (array)', 11, function() {
		
		model.set({'water':'fountain', 'candy':'twix'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				attributes: [{
					name: 'data-name',
					observe: ['water', 'candy'],
					format: function(val, modelAttr) {
						_.each(modelAttr, _.bind(function(attr, i) {
							equal(val[i], this.model.get(attr));
						}, this));
						equal(modelAttr.toString(), 'water,candy');
						return model.get('water') + '-' + model.get('candy');
					}
				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').attr('data-name'), 'fountain-twix');

		model.set({'water':'evian', 'candy':'snickers'});
		equal(view.$('#test5').attr('data-name'), 'evian-snickers');
	});

	test('bindings:attributes (properties)', function() {
		
		model.set({'water':true});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				attributes: [{
					name: 'readonly',
					observe: 'water'
				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test1').prop('readonly'), true);

		model.set({'water':false});
		equal(view.$('#test1').prop('readonly'), false);
	});

	test('input:number', function() {
		
		model.set({'code':1});
		view.model = model;
		view.templateId = 'jst11';
		view.bindings = {
			'#test11': {
				modelAttr: 'code'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(Number(view.$('#test11').val()), 1);

		model.set('code', 2);
		equal(Number(view.$('#test11').val()), 2);
	});

	test('visible', 16, function() {
		
		model.set({'water':false, 'candy':'twix', 'costume':false});
		view.model = model;
		view.templateId = 'jst14';
		view.bindings = {
			'#test14-1': {
				modelAttr: 'water',
				visible: true
			},
			'#test14-2': {
				modelAttr: 'candy',
				visible: function(val, attrName) {
					equal(val, this.model.get('candy'));
					equal(attrName, 'candy');
					return this.model.get('candy') == 'twix';
				}
			},
			'#test14-3': {
				modelAttr: 'costume',
				visible: true,
				visibleFn: function($el, val, attrName) {
					equal($el.attr('id'), 'test14-3');
					equal(val, this.model.get('costume'));
					equal(attrName, 'costume');
				}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test14-1').css('display') == 'block' , false);
		equal(view.$('#test14-2').css('display') == 'block' , true);
		equal(view.$('#test14-3').css('display') == 'block' , true);

		model.set('water', true);
		model.set('candy', 'snickers');
		model.set('costume', true);
		
		equal(view.$('#test14-1').css('display') == 'block' , true);
		equal(view.$('#test14-2').css('display') == 'block' , false);
		equal(view.$('#test14-3').css('display') == 'block' , true);
	});

	test('modelAttr (multiple; array)', 12, function() {
		
		model.set({'water':'fountain', 'candy':'twix'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: ['water', 'candy'],
				format: function(val, modelAttr) {
					_.each(modelAttr, _.bind(function(attr, i) {
						equal(val[i], this.model.get(attr));
					}, this));
					equal(modelAttr.toString(), 'water,candy');
					return model.get('water') + ' ' + model.get('candy');
				}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), 'fountain twix');

		model.set('water', 'evian');
		equal(view.$('#test5').text(), 'evian twix');

		model.set('candy', 'snickers');
		equal(view.$('#test5').text(), 'evian snickers');
	});

	test('events', 7, function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.eventHandler = function($el, event, options) {
			equal($el.attr('id'), 'test5');
			equal($(event.target).attr('id'), 'test5');
			ok(_.has(options, 'bindKey'));
		};
		view.bindings = {
			'#test5': {
				modelAttr: 'water',
				format: function() { return 'water events'; },
				click: 'eventHandler',
				customEvent: 'eventHandler'
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), 'water events');

		view.$('#test5').click();
		view.$('#test5').trigger('customEvent');
	});

	test('bindings:updateView', 6, function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				modelAttr: 'water',
				updateView: function(val) {
					equal(val, model.get('water'));
					return val == 'evian';
				}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test1').val(), '');

		model.set({water:'evian'});
		equal(view.$('#test1').val(), 'evian');

		model.set({water:'dasina'});
		equal(view.$('#test1').val(), 'evian');
	});

	test('bindings:udpateModel', 6, function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				modelAttr: 'water',
				updateModel: function(val, attrName) {
					equal(val, view.$('#test1').val());
					equal(attrName, 'water');
					return val == 'evian';
				}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		view.$('#test1').val('dasina').keyup();
		equal(model.get('water'), 'fountain');

		view.$('#test1').val('evian').keyup();
		equal(model.get('water'), 'evian');
	});

});
