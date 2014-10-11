$(document).ready(function() {

  module("view.unstickit");

  test('unstickit', function() {

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

    equal(_.keys(view.model._events).length, 3);
    var events = $._data(view.$el[0], 'events');
    ok(events.input.length && events.propertychange.length && events.change.length);

    view.unstickit();
    equal(_.keys(view.model._events).length, 0);
    events = $._data(view.$el[0], 'events');
    ok(!events);
  });

  test('unstickit with selector parameter', 4, function() {

    model.set({'water':'fountain', 'candy':'skittles', 'album':'rival-dealer', 'state': 'liquid'});
    view.model = model;
    view.templateId = 'jst14';
    view.bindings = {
      '#test14-1': 'water',
      '#test14-2': 'candy',
      '#test14-3': 'album',
      '#test14-6': 'state'
    };
    $('#qunit-fixture').html(view.render().el);
    equal(_.keys(view.model._events).length, 4);

    view.unstickit(null, '#test14-1');
    equal(_.keys(view.model._events).length, 3);

    view.$('#test14-6').val('solid').change();
    equal(model.get('state'), 'solid');

    view.unstickit(null, view.bindings);
    equal(_.keys(view.model._events).length, 0);
  });

  test('unstickit is only called once on remove with multiple stickits', function() {
    view.model = model;
    view.render = function() {
      this.stickit();
      this.stickit();
      return this;
    }
    view.render();

    var unstickit = view.unstickit, counter = 0;
    view.unstickit = function() {
      counter++;
      unstickit.apply(this, arguments);
    }

    view.remove();

    equal(counter, 1);
    view.unstickit = unstickit;
  });

  test('unstickit (multiple models)', function() {

    var model1, model2, view, model3;

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
      moreBindings: {
        '.test12-5': 'five',
        '.test12-6': 'six'
      },
      render: function() {
        var html = document.getElementById('jst12').innerHTML;
        this.$el.html(_.template(html)());
        this.stickit();
        this.stickit(model2, this.otherBindings);
        this.stickit(model3, this.moreBindings);
        return this;
      }
    }))().render();

    var events = $._data(view.$el[0], 'events');
    ok(events.input.length == 6 && events.propertychange.length == 6 && events.change.length == 6);

    equal(_.keys(model1._events).length, 2);
    equal(_.keys(model2._events).length, 2);
    equal(_.keys(model3._events).length, 2);
    equal(view._modelBindings.length, 6);

    view.unstickit(model3);

    events = $._data(view.$el[0], 'events');
    ok(events.input.length == 4 && events.propertychange.length == 4 && events.change.length == 4);

    equal(_.keys(model1._events).length, 2);
    equal(_.keys(model2._events).length, 2);
    equal(_.keys(model3._events).length, 0);
    equal(view._modelBindings.length, 4);

    view.unstickit();

    events = $._data(view.$el[0], 'events');
    ok(!events);

    equal(_.keys(model1._events).length, 0);
    equal(_.keys(model2._events).length, 0);
    equal(view._modelBindings.length, 0);
  });

  test('addBinding', 2, function() {
    view = new (Backbone.View.extend({
      initialize: function() {
        this.model = model;
      },
      bindings: {
        '.test12-1': {
          observe: 'one',
          destroy: function() {
            ok(true);
          }
        },
        '.test12-2': 'two'
      },
      render: function() {
        var html = document.getElementById('jst12').innerHTML;
        this.$el.html(_.template(html)());
        this.stickit();
        this.addBinding(null, '.test12-3', 'three');
        this.addBinding(null, {'.test12-4': 'four'});
        this.addBinding(null, {'.test12-1': 'one'});
        return this;
      }
    }))().render();

    equal(view._modelBindings.length, 4);
  });

  test('stickit:unstuck event', 1, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst10';
    view.bindings = {
      '.test10': {
        observe: 'water'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    model.on('stickit:unstuck', function() { ok(true); });
    view.unstickit();
    view.unstickit();
  });

   test('change with different model', 2, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst10';
    view.bindings = {
      '.test10': {
        observe: 'water',
        updateView: function(value, config) {
          ok(value == 'fountain');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);
    // intentionally pass a wrong model here (this can happen via event bubbling of Backbone.Associations i.e.)
    model.trigger('change:water', new Backbone.Model({ 'otherProp': 'value' }));
  });
});
