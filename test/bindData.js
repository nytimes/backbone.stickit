$(document).ready(function() {

	module("view.stickit");

	test('input:text', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				observe: 'water'
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
				observe: 'water'
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
				observe: 'water'
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
				observe: 'water'
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
				observe: 'water'
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
				observe: 'water'
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
				observe: 'water'
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
					observe: 'water'
				},
				'#test0-textarea': {
					observe: 'candy'
				}
			},
			otherBindings: {
				'#test0-span': {
					observe: 'water'
				},
				'#test0-input': {
					observe: 'candy'
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
				observe: 'water',
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
				observe: 'water',
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
				observe: 'water',
				updateMethod: 'html',
				escape: true
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), '<a href="www.test.com">river</a>');
	});

	test('bindings:format', 3, function() {

		// Deprecated version of `onget`.
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				observe: 'water',
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

	test('bindings:onSet/onGet', 6, function() {
		
		model.set({'water':'_fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				observe: 'water',
				onGet: function(val, modelAttr) {
					equal(val, this.model.get('water'));
					equal(modelAttr, 'water');
					return val.substring(1);
				},
				onSet: function(val, modelAttr) {
					equal(val, view.$('#test1').val());
					equal(modelAttr, 'water');
					return '_' + val;
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test1').val(), 'fountain');
		view.$('#test1').val('evian').keyup();
		equal(model.get('water'), '_evian');
	});

	test('bindings:afterUpdate', function() {
		
		model.set({'water':'fountain', 'candy':true});
		view.model = model;
		view.templateId = 'jst15';
		view.bindings = {
			'#test15-1': {
				observe: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal($el.text(), model.get('water'));
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-2': {
				observe: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal($el.val(), model.get('water'));
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-3': {
				observe: 'candy',
				afterUpdate: function($el, val, originalVal) {
					equal(val, false);
					equal(originalVal, true);
				}
			},
			'.test15-4': {
				observe: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-6': {
				observe: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			},
			'#test15-7': {
				observe: 'water',
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
				observe: 'water',
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
				observe: 'water',
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
				observe: 'water',
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
				observe: 'water',
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
				observe: 'water',
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

	test('bindings:selectOptions (multi-select with onGet/onSet)', function() {

		var collection = [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}, {id:4,name:'aquafina'}];
		
		model.set({'water':'1-3'});
		view.model = model;
		view.templateId = 'jst16';
		view.bindings = {
			'#test16': {
				observe: 'water',
				onGet: function(val, attr) {
					return _.map(val.split('-'), function(id) {return Number(id);});
				},
				onSet: function(vals, attr) {
					return vals.join('-');
				},
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
		field += '-2';

		model.set({'water':field});
		equal(view.$('#test16 option:selected:eq(1)').data('stickit_bind_val'), 2);

		view.$('#test16 option:eq(3)').prop('selected', true).change();

		equal(model.get('water'), '1-2-3-4');

	});

	test('bindings:selectOptions (optgroup)', function() {

		model.set({'character':3});
		view.model = model;
		view.templateId = 'jst8';
		view.bindings = {
			'#test8': {
				observe: 'character',
				selectOptions: {
					collection: function() {
						return {
							'opt_labels': ['Looney Tunes', 'Three Stooges'],
							'Looney Tunes': [{id: 1, name: 'Bugs Bunny'}, {id: 2, name: 'Donald Duck'}],
							'Three Stooges': [{id: 3, name : 'moe'}, {id: 4, name : 'larry'}, {id: 5, name : 'curly'}]
						};
					},
					labelPath: 'name',
					valuePath: 'id'
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test8 option:selected').parent().is('optgroup'), true);
		equal(view.$('#test8 option:selected').parent().attr('label'), 'Three Stooges');
		equal(view.$('#test8 option:selected').data('stickit_bind_val'), 3);

		model.set({'character':2});
		equal(view.$('#test8 option:selected').data('stickit_bind_val'), 2);

		view.$('#test8 option:eq(3)').prop('selected', true).change();
		equal(model.get('character'), 4);
	});

	test('bindings:attributes:name', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				observe: 'water',
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
				observe: 'water',
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
		
		// Deprecated version of `onGet`

		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				observe: 'water',
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

	test('bindings:attributes:onGet', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				observe: 'water',
				attributes: [{
					name: 'data-name',
					onGet: function(val, modelAttr) { return '_' + val + '_' + modelAttr; }
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
					onGet: function(val) {
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
					onGet: function(val, modelAttr) {
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
				observe: 'code'
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
				observe: 'water',
				visible: true
			},
			'#test14-2': {
				observe: 'candy',
				visible: function(val, attrName) {
					equal(val, this.model.get('candy'));
					equal(attrName, 'candy');
					return this.model.get('candy') == 'twix';
				}
			},
			'#test14-3': {
				observe: 'costume',
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

	test('observe (multiple; array)', 12, function() {
		
		model.set({'water':'fountain', 'candy':'twix'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				observe: ['water', 'candy'],
				onGet: function(val, modelAttr) {
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

	test('bindings:updateView', 6, function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				observe: 'water',
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

	test('bindings:updateModel', 6, function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				observe: 'water',
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

	test('bindings:eventsOverride', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				observe: 'water',
				eventsOverride: ['blur', 'keydown']
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test1').val(), 'fountain');

		// keyup should be overriden, so no change...
		view.$('#test1').val('dasina').keyup();
		equal(model.get('water'), 'fountain');

		view.$('#test1').blur();
		equal(model.get('water'), 'dasina');

		view.$('#test1').val('evian').keydown();
		equal(model.get('water'), 'evian');
	});

	test('bindings:modelAttr (deprecated)', function() {
		
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

});
