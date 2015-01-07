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

    view.$('#test1').val('dasina').trigger('change');
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

    view.$('#test2').val('dasina').trigger('change');
    equal(model.get('water'), 'dasina');
  });

  _([1,2]).each(function(subtest) {
    var sel = '#test17-' + subtest;

    test('contenteditable-' + subtest, function() {
      model.set({'water':'<span>fountain</span>'});
      view.model = model;
      view.templateId = 'jst17';
      view.bindings = {};
      view.bindings[sel] = {
        observe: 'water'
      };
      $('#qunit-fixture').html(view.render().el);

      equal(view.$(sel).html(), '<span>fountain</span>');

      model.set('water', '<span>evian</span>');
      equal(view.$(sel).html(), '<span>evian</span>');

      view.$(sel).html('<span>dasina</span>').trigger('change');
      equal(model.get('water'), '<span>dasina</span>');
    });

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

    view.$('#test3').prop('checked', true).trigger('change');
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

    view.$('.test4[value=fountain]').prop('checked', true).trigger('change');
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

  test('bindings as a function', 2, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = function() {
      return {'#test1':'water'};
    };
    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test1').val(), 'fountain');
    view.$('#test1').val('dasina').trigger('change');
    equal(model.get('water'), 'dasina');
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

    testView.$('#test0-textarea').val('kit kat').trigger('change');
    testView.$('#test0-input').val('butterfinger').trigger('change');

    equal(model1.get('candy'), 'kit kat');
    equal(model2.get('candy'), 'butterfinger');

    testView.remove();
  });

  test('stickit (existing events property as hash with multiple models and bindings)', function() {

    var model1, model2, testView;

    model1 = new (Backbone.Model)({id:1, candy:'twix' });
    model2 = new (Backbone.Model)({id:2, candy:'snickers'});

    testView = new (Backbone.View.extend({

      initialize: function() {
        this.model = model1;
        this.otherModel = model2;
      },

      events: {
        click: 'handleClick'
      },

      bindings: {
        '#test0-textarea': 'candy'
      },

      otherBindings: {
        '#test0-input': 'candy'
      },

      render: function() {
        var html = document.getElementById('jst0').innerHTML;
        this.$el.html(_.template(html)());
        this.stickit();
        this.stickit(this.otherModel, this.otherBindings);
        return this;
      },

      handleClick: function() {
        this.clickHandled = true;
      }

    }))();

    $('#qunit-fixture').html(testView.render().el);

    testView.$('#test0-textarea').val('kit kat').trigger('change');
    testView.$('#test0-input').val('butterfinger').trigger('change');

    equal(model1.get('candy'), 'kit kat');
    equal(model2.get('candy'), 'butterfinger');

    testView.$el.trigger('click');

    equal(testView.clickHandled, true);

    // Remove the view which should unbind the event handlers.
    testView.remove();

    testView.$('#test0-textarea').val('mounds').trigger('change');
    testView.$('#test0-input').val('skittles').trigger('change');

    equal(model1.get('candy'), 'kit kat');
    equal(model2.get('candy'), 'butterfinger');
  });

  test('stickit (existing events property as function with multiple models and bindings)', function() {

    var model1, model2, testView;

    model1 = new (Backbone.Model)({id:1, candy:'twix' });
    model2 = new (Backbone.Model)({id:2, candy:'snickers'});

    testView = new (Backbone.View.extend({

      initialize: function() {
        this.model = model1;
        this.otherModel = model2;
      },

      events: function() {
        return {
          click: this.clickHandled
        };
      },

      clickHandled: function() {
        this.clickHandled = true;
      },

      bindings: {
        '#test0-textarea': 'candy'
      },

      otherBindings: {
        '#test0-input': 'candy'
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

    testView.$('#test0-textarea').val('kit kat').trigger('change');
    testView.$('#test0-input').val('butterfinger').trigger('change');

    equal(model1.get('candy'), 'kit kat');
    equal(model2.get('candy'), 'butterfinger');

    testView.$el.trigger('click');

    equal(testView.clickHandled, true);

    testView.remove();
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

    view.$('#test1').val('dasina').trigger('change');
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

  test('bindings:onSet/onGet', 6, function() {

    model.set({'water':'_fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        onGet: function(val, options) {
          equal(val, this.model.get('water'));
          equal(options.observe, 'water');
          return val.substring(1);
        },
        onSet: function(val, options) {
          equal(val, view.$('#test1').val());
          equal(options.observe, 'water');
          return '_' + val;
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test1').val(), 'fountain');
    view.$('#test1').val('evian').trigger('change');
    equal(model.get('water'), '_evian');
  });

  test('bindings:sanitization', 7, function() {

    model.set({'duration':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'duration',
        onGet: function(val, options) {
          equal(val, null);
          equal(options.observe, 'duration');
          return val;
        },
        onSet: function(val, options) {
          equal(parseInt(val, 10), 30);
          equal(val, view.$('#test1').val());
          equal(options.observe, 'duration');
          return null;
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test1').val(), '');
    view.$('#test1').val(30).trigger('change');
    equal(model.get('duration'), null);
  });

  test('bindings:onSet (returning array of observed values)', 2, function() {

    model.set({'water':'fountain', 'candy':'skittles'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: ['water', 'candy'],
        onGet: function(val, options) {
          return model.get(options[0]) + '-' + model.get(options[1]);
        },
        onSet: function(val, options) {
          return val.split('-');
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    view.$('#test1').val('evian-kitkat').trigger('change');
    equal(model.get('water'), 'evian');
    equal(model.get('candy'), 'kitkat');
  });

  test('bindings:set', 5, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        set: function(attr, val, options, config) {
          equal(attr, 'water');
          equal(val, 'evian');
          equal(options.stickitChange.observe, attr);
          equal(config.observe, attr);
          model.set(attr, val);
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    view.$('#test1').val('evian').trigger('change');
    equal(model.get('water'), 'evian');
  });

  test('bindings:afterUpdate', 14, function() {

    model.set({'water':'fountain', 'candy':true});
    view.model = model;
    view.templateId = 'jst15';
    view.bindings = {
      '#test15-1': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          equal($el.text(), model.get('water'));
          equal(val, 'evian');
          equal(options.observe, 'water');
        }
      },
      '#test15-2': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          equal($el.val(), model.get('water'));
          equal(val, 'evian');
          equal(options.observe, 'water');
        }
      },
      '#test15-3': {
        observe: 'candy',
        afterUpdate: function($el, val, options) {
          equal(val, false);
          equal(options.observe, 'candy');
        }
      },
      '.test15-4': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          equal(val, 'evian');
          equal(options.observe, 'water');
        }
      },
      '#test15-6': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          equal(val, 'evian');
          equal(options.observe, 'water');
        }
      },
      '#test15-7': {
        observe: 'water',
        selectOptions: {
          collection: function() { return [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]; },
          labelPath: 'name',
          valuePath: 'name'
        },
        afterUpdate: function($el, val, options) {
          equal(val, 'evian');
          equal(options.observe, 'water');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    model.set('water', 'evian');
    model.set('candy', false);
  });

  test('bindings:selectOptions', 7, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            ok($el.is('select'));
            equal(options.observe, 'water');
            return [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}];
          },
          labelPath: 'name',
          valuePath: 'name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    equal(model.get('water'), 'dasina');
  });

  test('bindings:selectOptions:defaultOption', 8, function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            ok($el.is('select'));
            equal(options.observe, 'water');
            return [{id:1,type:{name:'fountain'}}, {id:2,type:{name:'evian'}}, {id:3,type:{name:'dasina'}}];
          },
          defaultOption: {
            label: 'Choose one...',
            value: null
          },
          labelPath: 'type.name',
          valuePath: 'type.name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test8 option').eq(0).text(), 'Choose one...');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), null);

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    equal(model.get('water'), 'dasina');
  });

  test('bindings:selectOptions:defaultOption (options is a method)', 8, function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            ok($el.is('select'));
            equal(options.observe, 'water');
            return [{id:1,type:{name:'fountain'}}, {id:2,type:{name:'evian'}}, {id:3,type:{name:'dasina'}}];
          },
          defaultOption: function(){
            return {label: 'Choose dynamic...',
            value: null};
          },
          labelPath: 'type.name',
          valuePath: 'type.name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test8 option').eq(0).text(), 'Choose dynamic...');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), null);

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    equal(model.get('water'), 'dasina');
  });

  test('bindings:selectOptions:defaultOption (options is disabled)', 9, function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            ok($el.is('select'));
            equal(options.observe, 'water');
            return [{id:1,type:{name:'fountain'}}, {id:2,type:{name:'evian'}}, {id:3,type:{name:'dasina'}}];
          },
          defaultOption: {
            label: 'Choose one...',
            value: null,
            disabled: true
          },
          labelPath: 'type.name',
          valuePath: 'type.name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test8 option').eq(0).text(), 'Choose one...');
    ok(view.$('#test8 option').eq(0).prop('disabled'));

    equal(model.get('water'), null);

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    // We can force the selection of disabled options
    view.$('#test8 option').eq(0).prop('selected', true).trigger('change');
    equal(model.get('water'), null);
  });

  test('bindings:selectOptions:defaultOption:OptGroups', 8, function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            ok($el.is('select'));
            equal(options.observe, 'water');
            return {
              'opt_labels': ['Types'],
              'Types': [{id:1,type:{name:'fountain'}}, {id:2,type:{name:'evian'}}, {id:3,type:{name:'dasina'}}]
            };
          },
          defaultOption: {
            label: 'Choose one...',
            value: null
          },
          labelPath: 'type.name',
          valuePath: 'type.name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test8 > option').eq(0).text(), 'Choose one...');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), null);

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    equal(model.get('water'), 'dasina');
  });

  test('bindings:selectOptions (disabled options)'  , function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: [{id:1,name:'fountain'}, {id:2,name:'evian',disabled:true}, {id:3,name:'dasina'}],
          labelPath: 'name',
          valuePath: 'id'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test8 option').eq(0).prop('disabled'), false);
    equal(view.$('#test8 option').eq(1).prop('disabled'), true);
    equal(view.$('#test8 option').eq(2).prop('disabled'), false);
  });

  test('bindings:selectOptions (pre-rendered)', 3, function() {

    // Note that we're working with strings and not numeric values here - the pre-rendered <select>
    // handling is limited to strings unless data-stickit-bind-val is specified for each <option>

    model.set({'water':'1'});
    view.model = model;
    view.templateId = 'jst21';
    view.bindings = {
      '#test21': {
        observe: 'water'
      }
    };

    $('#qunit-fixture').html(view.render().el);

    strictEqual(getSelectedOption(view.$('#test21')).data('stickit-bind-val'), '1');

    model.set('water', '2');
    strictEqual(getSelectedOption(view.$('#test21')).data('stickit-bind-val'), '2');

    view.$('#test21 option').eq(2).prop('selected', true).trigger('change');
    strictEqual(model.get('water'), '3');
  });

  test('bindings:selectOptions (pre-rendered, with data-stickit-bind-val)', function() {

    // Here we're testing that numeric values can be bound via data-stickit-bind-val

    model.set({'water': 1});
    view.model = model;
    view.templateId = 'jst26';
    view.bindings = {
        '#test26': {
            observe: 'water'
        }
    };

    $('#qunit-fixture').html(view.render().el);

    strictEqual(getSelectedOption(view.$('#test26')).data('stickit-bind-val'), 1);

    model.set('water', 2);
    strictEqual(getSelectedOption(view.$('#test26')).data('stickit-bind-val'), 2);

    view.$('#test26 option:contains("dasina")').prop('selected', true).trigger('change');
    strictEqual(model.get('water'), 3);

    view.$('#test26 option:contains("foutain")').prop('selected', true).trigger('change');
    strictEqual(model.get('water'), 0);
  });

  test('bindings:selectOptions (Backbone.Collection)', function() {

    var collection = new Backbone.Collection([{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]);
    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function() { return collection; },
          labelPath: 'name',
          valuePath: 'name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    equal(model.get('water'), 'dasina');
  });

  test('bindings:selectOptions (Backbone.Collection that changes)', function() {

    var collection = new Backbone.Collection([{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]);
    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function() { return collection; },
          labelPath: 'name',
          valuePath: 'name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    equal(model.get('water'), 'dasina');

    // Test that the select options are auto-updated
    collection.add({id:4,name:'buxton'});
    equal(view.$('#test8 option').eq(3).data('stickit-bind-val'), 'buxton');

    var modelEvents = ['stickit:unstuck', 'stickit:selectRefresh'];
    var collectionEvents = ['stickit:selectRefresh', 'add', 'remove', 'reset', 'sort'];

    // Test the number of event listeners set against the model and collection
    equal(_.filter(model._events, function(event, key) {
      return (event.length === 1 && _.contains(modelEvents, key));
    }).length, modelEvents.length);

    equal(_.filter(collection._events, function(event, key) {
      return (event.length === 1 && _.contains(collectionEvents, key));
    }).length, collectionEvents.length);

    collection.remove(2);
    equal(view.$('#test8 option').length, collection.length);

    collection.reset();
    equal(view.$('#test8 option').length, collection.length);

    // Test the number of event listeners set against the model and collection after changes to the collection
    equal(_.filter(model._events, function(event, key) {
      return (event.length === 1 && _.contains(modelEvents, key));
    }).length, modelEvents.length);

    equal(_.filter(collection._events, function(event, key) {
      return (event.length === 1 && _.contains(collectionEvents, key));
    }).length, collectionEvents.length);

    view.unstickit();

    // Test that the select options are no longer updated
    collection.add([{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]);
    notEqual(view.$('#test8 option').length, collection.length);

    // Test that all event listeners have been removed after unstickit
    ok(_.isEmpty(model._events));
    ok(_.isEmpty(collection._events));
  });

  test('bindings:selectOptions (collection path relative to `this`)', function() {

    view.collection = new Backbone.Collection([{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]);
    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: 'this.collection',
          labelPath: 'name',
          valuePath: 'name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    equal(model.get('water'), 'dasina');
  });

  test('bindings:selectOptions (empty valuePath)', function() {

    model.set({'water':{id:1, name:'fountain'}});
    window.test = {
      collection: [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]
    };
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: 'window.test.collection',
          labelPath: 'name'
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val').id, 1);

    model.set('water', {id:2, name:'evian'});
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val').id, 2);

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    equal(model.get('water').id, 3);
  });

  test('bindings:selectOptions (empty string label)', function() {

    model.set({'water':'session'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function() {
            return [{label:'c',value:''}, {label:'s',value:'session'}];
          },
          labelPath: "label",
          valuePath: "value"
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'session');
    equal(view.$('#test8 option').eq(0).data('stickit-bind-val'), '');

    model.set('water', '');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), '');
  });

  test('bindings:selectOptions (default labelPath/valuePath)', function() {

    model.set({'water':'evian'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function() {
            return [{label:'c',value:'fountain'}, {label:'s',value:'evian'}];
          }
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    model.set('water', 'fountain');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');
  });

  test('bindings:selectOptions (collection defined as value/label map)', function() {

    model.set({'sound':'moo'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'sound',
        selectOptions: {
          collection: {
            moo: 'cow',
            baa: 'sheep',
            oink: 'pig'
          }
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'moo');

    // Options are sorted alphabetically by label
    equal(view.$('#test8 option:eq(0)').data('stickit-bind-val'), 'moo');
    equal(view.$('#test8 option:eq(1)').data('stickit-bind-val'), 'oink');
    equal(view.$('#test8 option:eq(2)').data('stickit-bind-val'), 'baa');
  });

  test('bindings:selectOptions (collection defined as value/label map, sorted by value)', function() {

    model.set({'sound':'moo'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'sound',
        selectOptions: {
          collection: {
            moo: 'cow',
            baa: 'sheep',
            oink: 'pig'
          },
          comparator: function(sound) { return sound.value; }
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'moo');

    // Options are sorted alphabetically by value
    equal(view.$('#test8 option:eq(0)').data('stickit-bind-val'), 'baa');
    equal(view.$('#test8 option:eq(1)').data('stickit-bind-val'), 'moo');
    equal(view.$('#test8 option:eq(2)').data('stickit-bind-val'), 'oink');
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

    equal(getSelectedOption(view.$('#test16')).eq(0).data('stickit-bind-val').name, 'fountain');
    equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val').name, 'dasina');

    var field = _.clone(model.get('water'));
    field.push({id:2,name:'evian'});

    model.set({'water':field});
    equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val').name, 'evian');

    view.$('#test16 option').eq(3).prop('selected', true).trigger('change');

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

    equal(getSelectedOption(view.$('#test16')).eq(0).data('stickit-bind-val'), 1);
    equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 3);

    var field = _.clone(model.get('water'));
    field.push(2);

    model.set({'water':field});
    equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 2);

    view.$('#test16 option').eq(3).prop('selected', true).trigger('change');

    equal(model.get('water').length, 4);

  });

  test('bindings:selectOptions (pre-rendered multi-select)', function() {

    model.set({'water': ['1', '3']});
    view.model = model;
    view.templateId = 'jst23';
    view.bindings = {
      '#test23': {
        observe: 'water'
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test23')).eq(0).data('stickit-bind-val'), '1');
    equal(getSelectedOption(view.$('#test23')).eq(1).data('stickit-bind-val'), '3');

    var field = _.clone(model.get('water'));
    field.push('2');

    model.set({'water':field});
    equal(getSelectedOption(view.$('#test23')).eq(1).data('stickit-bind-val'), '2');

    view.$('#test23 option').eq(3).prop('selected', true).trigger('change');

    equal(model.get('water').length, '4');

  });

  test('bindings:selectOptions (multi-select with onGet/onSet)', function() {

    var collection = [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}, {id:4,name:'aquafina'}];

    model.set({'water':'1-3'});
    view.model = model;
    view.templateId = 'jst16';
    view.bindings = {
      '#test16': {
        observe: 'water',
        onGet: function(val) {
          return _.map(val.split('-'), function(id) {return Number(id);});
        },
        onSet: function(vals) {
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

    equal(getSelectedOption(view.$('#test16')).eq(0).data('stickit-bind-val'), 1);
    equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 3);

    var field = _.clone(model.get('water'));
    field += '-2';

    model.set({'water':field});
    equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 2);

    view.$('#test16 option').eq(3).prop('selected', true).trigger('change');

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

    equal(getSelectedOption(view.$('#test8')).parent().is('optgroup'), true);
    equal(getSelectedOption(view.$('#test8')).parent().attr('label'), 'Three Stooges');
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 3);

    model.set({'character':2});
    equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 2);

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    equal(model.get('character'), 4);
  });

  test('bindings:selectOptions (pre-rendered optgroup)', function() {

    model.set({'character':'3'});
    view.model = model;
    view.templateId = 'jst22';
    view.bindings = {
      '#test22': {
        observe: 'character'
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test22')).parent().is('optgroup'), true);
    equal(getSelectedOption(view.$('#test22')).parent().attr('label'), 'Three Stooges');
    equal(getSelectedOption(view.$('#test22')).data('stickit-bind-val'), '3');

    model.set({'character':'2'});
    equal(getSelectedOption(view.$('#test22')).data('stickit-bind-val'), '2');

    view.$('#test22 option').eq(3).prop('selected', true).trigger('change');
    equal(model.get('character'), '4');
  });

  test('bindings:selectOptions (pre-rendered optgroup with extra option)', function() {

    model.set({'character':'3'});
    view.model = model;
    view.templateId = 'jst24';
    view.bindings = {
      '#test24': {
        observe: 'character'
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(getSelectedOption(view.$('#test24')).parent().is('optgroup'), true);
    equal(getSelectedOption(view.$('#test24')).parent().attr('label'), 'Three Stooges');
    equal(getSelectedOption(view.$('#test24')).data('stickit-bind-val'), '3');

    model.set({'character':'0'});
    equal(getSelectedOption(view.$('#test24')).data('stickit-bind-val'), '0');

    view.$('#test24 option').eq(4).prop('selected', true).trigger('change');
    equal(model.get('character'), '4');
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

  test('bindings:attributes:onGet', function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': {
        observe: 'water',
        attributes: [{
          name: 'data-name',
          onGet: function(val, options) { return '_' + val + '_' + options.observe; }
        }]
      }
    };

    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test5').attr('data-name'), '_fountain_water');

    model.set('water', 'evian');
    equal(view.$('#test5').attr('data-name'), '_evian_water');
  });

  test('bindings:attributes:onGet (string)', function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst5';
    view.onGetByString = function(val, options) { return '_' + val + '_' + options.observe; };
    view.bindings = {
      '#test5': {
        observe: 'water',
        attributes: [{
          name: 'data-name',
          onGet: 'onGetByString'
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
          onGet: function(val, options) {
            _.each(options.observe, _.bind(function(attr, i) {
              equal(val[i], this.model.get(attr));
            }, this));
            equal(options.observe.toString(), 'water,candy');
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

  test('bindings:classes:name', function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': {
        classes: {
          testClass: 'water'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);
    ok(view.$('#test5').hasClass('testClass'));

    model.set('water', false);
    ok(!view.$('#test5').hasClass('testClass'));
  });

  test('bindings:classes:observe', function() {

    model.set({'truthy':false});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': {
        classes: {
          'col-md-2': {
            observe:'truthy'
          },
          'col-md-3': {
            observe: 'truthy',
            onGet: function(val) {
              return !val;
            }
          }
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);
    ok(!view.$('#test5').hasClass('col-md-2'));
    ok(view.$('#test5').hasClass('col-md-3'));

    model.set('truthy', 'string is truthy');
    ok(view.$('#test5').hasClass('col-md-2'));
    ok(!view.$('#test5').hasClass('col-md-3'));
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

  test('visible', 28, function() {

    model.set({'water':false, 'candy':'twix', 'costume':false, 'visible': 'yes'});
    view.model = model;
    view.templateId = 'jst14';
    view.bindings = {
      '#test14-1': {
        observe: 'water',
        visible: true
      },
      '#test14-2': {
        observe: 'candy',
        visible: function(val, options) {
          equal(val, this.model.get('candy'));
          equal(options.observe, 'candy');
          return this.model.get('candy') == 'twix';
        }
      },
      '#test14-3': {
        observe: ['candy', 'costume'],
        visible: true,
        visibleFn: function($el, isVisible, options) {
          equal($el.attr('id'), 'test14-3');
          ok(isVisible);
          equal(options.observe.toString(), 'candy,costume');
        }
      },
      '#test14-4': {
        observe: 'visible',
        visible: function(val) { return val == 'yes'; },
        updateView: true
      },
      '#test14-5': {
        observe: 'visible',
        visible: function(val) { return val; }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test14-1').css('display') == 'block' , false);
    equal(view.$('#test14-2').css('display') == 'block' , true);
    equal(view.$('#test14-2').text(), 'Test');
    equal(view.$('#test14-3').css('display') == 'block' , true);
    equal(view.$('#test14-4').css('display') == 'block' , true);
    equal(view.$('#test14-4').text(), 'yes');
    equal(view.$('#test14-5').css('display') == 'block' , true);

    // Force-hide #test14-5 to make sure the fact that it's still visible
    // later is due to the truthiness check.
    view.$('#test14-5').hide()

    model.set('water', true);
    model.set('candy', 'snickers');
    model.set('costume', true);
    model.set('visible', 'no')

    equal(view.$('#test14-1').css('display') == 'block' , true);
    equal(view.$('#test14-2').css('display') == 'block' , false);
    equal(view.$('#test14-2').text(), 'Test');
    equal(view.$('#test14-3').css('display') == 'block' , true);
    equal(view.$('#test14-4').css('display') == 'block' , false);
    equal(view.$('#test14-4').text(), 'no');

    // 'no' is still truthy.
    equal(view.$('#test14-5').css('display') == 'block' , true);

    model.set('visible', false);

    equal(view.$('#test14-5').css('display') == 'block' , false);

  });

  test('observe (multiple; array)', 12, function() {

    model.set({'water':'fountain', 'candy':'twix'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': {
        observe: ['water', 'candy'],
        onGet: function(val, options) {
          _.each(options.observe, _.bind(function(attr, i) {
            equal(val[i], this.model.get(attr));
          }, this));
          equal(options.observe.toString(), 'water,candy');
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

  test('observe (function)', 5, function() {
    model.set({'water':'fountain'});

    var testView = new (Backbone.View.extend({
      initialize: function(options) {
        this.options = options;
      },
      bindings: {
        '#test1': {
          observe: function() {
            equal(this, testView);
            equal(this.options.observeValue, 'water');
            return this.options.observeValue;
          }
        }
      },
      render: function() {
        var html = document.getElementById('jst1').innerHTML;
        this.$el.html(_.template(html)());
        this.stickit();
        return this;
      }
    }))({
      model: model,
      observeValue: 'water'
    });

    $('#qunit-fixture').html(testView.render().el);

    equal(testView.$('#test1').val(), 'fountain');

    model.set('water', 'evian');
    equal(testView.$('#test1').val(), 'evian');

    testView.$('#test1').val('dasina').trigger('change');
    equal(model.get('water'), 'dasina');

    testView.remove();
  });

  test('bindings:updateView', 9, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        updateView: function(val, options) {
          equal(options.observe, 'water');
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

  test('bindings:updateModel', 10, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        updateModel: function(val, event, config) {
          equal(this.cid, view.cid);
          equal(val, view.$('#test1').val());
          equal(config.observe, 'water');
          equal(event.type, 'change');
          return val == 'evian';
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    view.$('#test1').val('dasina').trigger('change');
    equal(model.get('water'), 'fountain');

    view.$('#test1').val('evian').trigger('change');
    equal(model.get('water'), 'evian');
  });

  test('bindings:events', function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        events: ['blur', 'keydown']
      }
    };
    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test1').val(), 'fountain');

    // change should be overriden, so no change...
    view.$('#test1').val('dasina').trigger('change');
    equal(model.get('water'), 'fountain');

    view.$('#test1').trigger('blur');
    equal(model.get('water'), 'dasina');

    view.$('#test1').val('evian').trigger('keydown');
    equal(model.get('water'), 'evian');
  });

  test('checkbox multiple', function() {

    model.set({'water':['fountain', 'dasina']});
    view.model = model;
    view.templateId = 'jst18';
    view.bindings = {
      '.boxes': 'water'
    };
    $('#qunit-fixture').html(view.render().el);

    equal(view.$('.boxes[value="fountain"]').prop('checked'), true);
    equal(view.$('.boxes[value="evian"]').prop('checked'), false);
    equal(view.$('.boxes[value="dasina"]').prop('checked'), true);

    model.set('water', ['evian']);
    equal(view.$('.boxes[value="fountain"]').prop('checked'), false);
    equal(view.$('.boxes[value="evian"]').prop('checked'), true);
    equal(view.$('.boxes[value="dasina"]').prop('checked'), false);

    view.$('.boxes[value="dasina"]').prop('checked', true).trigger('change');
    equal(model.get('water').length, 2);
    equal(_.indexOf(model.get('water'), 'evian') > -1, true);
    equal(_.indexOf(model.get('water'), 'dasina') > -1, true);
  });

  test('checkbox (single with value defined)', function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst19';
    view.bindings = {
      '.box': 'water'
    };
    $('#qunit-fixture').html(view.render().el);

    equal(view.$('.box').prop('checked'), false);

    model.set('water', 'fountain');
    equal(view.$('.box').prop('checked'), true);

    view.$('.box').prop('checked', false).trigger('change');
    equal(model.get('water'), null);
  });

  test('getVal', 5, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        getVal: function($el, event, options) {
          equal(this.cid, view.cid);
          equal($el.attr('id'), 'test1');
          equal(event.type, 'change');
          equal(options.observe, 'water');
          return 'test-' + $el.val();
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    view.$('#test1').val('dasina').trigger('change');
    equal(model.get('water'), 'test-dasina');
  });

  test('update', 8, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        update: function($el, val, model, options) {
          equal($el.attr('id'), 'test1');
          equal(val, model.get('water'));
          equal(options.observe, 'water');
          $el.val('test-' + val);
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    equal(view.$('#test1').val(), 'test-fountain');

    model.set('water', 'dasina');
    equal(view.$('#test1').val(), 'test-dasina');
  });

  test('initialize', 3, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        initialize: function($el, model, options) {
          equal($el.val(), 'fountain');
          equal(model.get('water'), 'fountain');
          equal(options.observe, 'water');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);
  });

  test('destroy', 3, function() {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        events: ['change', 'input', 'keyup'],
        destroy: function($el, model, options) {
          equal($el.val(), 'fountain');
          equal(model.get('water'), 'fountain');
          equal(options.observe, 'water');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);
    view.unstickit();
  });

  test('null form value', function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': 'water'
    };
    $('#qunit-fixture').html(view.render().el);
    equal(view.$('#test1').val(), '');
  });

  test('null html value', function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': 'water'
    };
    $('#qunit-fixture').html(view.render().el);
    equal(view.$('#test5').html(), '');
  });

  test('stickitChange', 1, function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': 'water'
    };
    $('#qunit-fixture').html(view.render().el);

    model.on('change:water', function(m, v, options) {
      ok(options.stickitChange);
    });

    view.$('#test1').val('dasina').trigger('change');
  });

  test('view.remove should be called and unbind events', 4, function() {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': 'water'
    };
    view.remove = function(option) {
      ok(true);
      ok(!!option);
    };
    $('#qunit-fixture').html(view.render().el);
    equal(view._modelBindings.length, 1);
    view.remove('test');
    equal(view._modelBindings.length, 0);
  });

});
