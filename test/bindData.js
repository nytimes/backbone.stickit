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
		
		view.$('.test4').prop('checked', true).change();
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

	test('bindings:format', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst5';
		view.bindings = {
			'#test5': {
				modelAttr: 'water',
				format: function(val) { return '_' + val; }
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').text(), '_fountain');
	});

	test('bindings:readonly', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				modelAttr: 'water',
				readonly: true
			}
		};
		$('#qunit-fixture').html(view.render().el);

		ok(view.$('#test1').prop('readonly'));
	});

	test('bindings:afterUpdate', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				modelAttr: 'water',
				afterUpdate: function($el, val, originalVal) {
					equal($el.val(), model.get('water'));
					equal(val, 'evian');
					equal(originalVal, 'fountain');
				}
			}
		};
		$('#qunit-fixture').html(view.render().el);

		model.set('water', 'evian');
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
					format: function() { return this.model.get('water') + '-ralph'; }
				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').attr('data-name'), 'fountain-ralph');

		model.set('water', 'evian');
		equal(view.$('#test5').attr('data-name'), 'evian-ralph');
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

});
