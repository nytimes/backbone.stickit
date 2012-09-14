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

		ok(view.$('#test1').prop('disabled'));
	});

	test('bindings:afterUpdate', function() {
		
		model.set({'water':'fountain'});
		view.model = model;
		view.templateId = 'jst1';
		view.bindings = {
			'#test1': {
				modelAttr: 'water',
				afterUpdate: function($el, val) {
					equal($el.val(), model.get('water'));
					equal(val, model.get('water'));
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
					collection: function() { return [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:2,name:'dasina'}]; },
					labelPath: 'name',
					valuePath: 'name'
				}
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test8 option:selected').data('val'), 'fountain');

		model.set('water', 'evian');
		equal(view.$('#test8 option:selected').data('val'), 'evian');
		
		view.$('#test8').val('dasina').change();
		equal(model.get('water'), 'dasina');
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
					format: function() { return this.model.get('water') + '-' + this.model.get('candy'); }
				}]
			}
		};

		$('#qunit-fixture').html(view.render().el);

		equal(view.$('#test5').attr('data-name'), 'fountain-twix');

		model.set({'water':'evian', 'candy':'snickers'});
		equal(view.$('#test5').attr('data-name'), 'evian-snickers');
	});

});
