$(document).ready(function() {

	module("view.unstickModel");

	test('unstickModel', function() {
		
		model.set({'water':'fountain', 'test':'nada', 'copy':'cat', 'fickle':'brat'});
		view.model = model;
		view.templateId = 'jst10';
		view.bindings = {
			'.test10': {
				modelAttr: 'water',
				attributes: [{
					name: 'class',
					observe: 'copy'
				}, {
					name: 'data-test',
					observe: 'fickle'
				}]
			}
		};
		$('#qunit-fixture').html(view.render().el);

		equal(_.keys(view.model._callbacks).length, 3);

		view.unstickModel();

		equal(_.keys(view.model._callbacks).length, 0);
	});

});
