$(document).ready(function() {

  module("view.unstickit");

  var eventsPresent = function(model, n) {
    var key, events = model._events, num = 0;
    for (key in events) {
        if (events[key].length) num++;
    }
    equal(n, num);
  };

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

    eventsPresent(view.model, 3);

    view.unstickit();

    eventsPresent(view.model, 0);
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

    eventsPresent(model1, 2);
    eventsPresent(model2, 2);
    eventsPresent(model3, 2);
    equal(view._modelBindings.length, 6);

    view.unstickit(model3);

    eventsPresent(model1, 2);
    eventsPresent(model2, 2);
    eventsPresent(model3, 0);
    equal(view._modelBindings.length, 4);

    view.unstickit();

    eventsPresent(model1, 0);
    eventsPresent(model2, 0);
    equal(view._modelBindings.length, 0);
  });

});
