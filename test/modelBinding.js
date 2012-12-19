$(document).ready(function() {

	module("view.unstickModel");

	test('unstickModel', function() {
		
		model.set({'water':'fountain', 'test':'nada', 'copy':'cat', 'fickle':'brat'});
		view.model = model;
		view.templateId = 'jst10';
		view.bindings = {
			'.test10': {
				observe: 'water',
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

	test('unstickModel (multiple models across multiple views)', function() {
		
		var model1, model2, view, view2, model3;

		model1 = new (Backbone.Model)({one:'', two:''});
		model2 = new (Backbone.Model)({three:'', four:''});
		model3 = new (Backbone.Model)({five:'', six:''});

		view = new (Backbone.View.extend({
			initialize: function() {
				this.model = model1;
			},
			bindings: {
				'.test12-1': 'one',
				'.test12-2': 'two'
			},
			otherBindings: {
				'.test12-3': 'three',
				'.test12-4': 'four'
			},
			render: function() {
				var html = document.getElementById('jst12').innerHTML;
				this.$el.html(_.template(html)());
				this.stickit();
				this.stickit(model2, this.otherBindings);
				return this;
			}
		}))().render();

		view2 = new (Backbone.View.extend({
			bindings: {
				'.test13-5': 'five',
				'.test13-6': 'six'
			},
			render: function() {
				var html = document.getElementById('jst13').innerHTML;
				this.$el.html(_.template(html)());
				this.stickit(model3);
				return this;
			}
		}))().render();


		equal(_.keys(model1._callbacks).length, 2);
		equal(_.keys(model2._callbacks).length, 2);
		equal(_.keys(model3._callbacks).length, 2);
		equal(view._modelBindings.length, 4);
		equal(view2._modelBindings.length, 2);

		view.unstickModel();

		equal(_.keys(model1._callbacks).length, 0);
		equal(_.keys(model2._callbacks).length, 0);
		equal(view._modelBindings.length, 0);
		equal(_.keys(model3._callbacks).length, 2);

		view2.unstickModel();

		equal(_.keys(model3._callbacks).length, 0);
		equal(view2._modelBindings.length, 0);
	});

});
