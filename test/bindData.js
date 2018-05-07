$(document).ready(function() {

  QUnit.module("view.stickit");

  QUnit.test('input:text', function(assert) {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test1').val(), 'fountain');

    model.set('water', 'evian');
    assert.equal(view.$('#test1').val(), 'evian');

    view.$('#test1').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('textarea', function(assert) {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst2';
    view.bindings = {
      '#test2': {
        observe: 'water'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test2').val(), 'fountain');

    model.set('water', 'evian');
    assert.equal(view.$('#test2').val(), 'evian');

    view.$('#test2').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  _([1,2]).each(function(subtest) {
    var sel = '#test17-' + subtest;

    QUnit.test('contenteditable-' + subtest, function(assert) {
      model.set({'water':'<span>fountain</span>'});
      view.model = model;
      view.templateId = 'jst17';
      view.bindings = {};
      view.bindings[sel] = {
        observe: 'water'
      };
      $('#qunit-fixture').html(view.render().el);

      assert.equal(view.$(sel).html(), '<span>fountain</span>');

      model.set('water', '<span>evian</span>');
      assert.equal(view.$(sel).html(), '<span>evian</span>');

      view.$(sel).html('<span>dasina</span>').trigger('change');
      assert.equal(model.get('water'), '<span>dasina</span>');
    });

  });

  QUnit.test('checkbox', function(assert) {

    model.set({'water':true});
    view.model = model;
    view.templateId = 'jst3';
    view.bindings = {
      '#test3': {
        observe: 'water'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test3').prop('checked'), true);

    model.set('water', false);
    assert.equal(view.$('#test3').prop('checked'), false);

    view.$('#test3').prop('checked', true).trigger('change');
    assert.equal(model.get('water'), true);
  });

  QUnit.test('radio', function(assert) {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst4';
    view.bindings = {
      '.test4': {
        observe: 'water'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('.test4:checked').val(), 'fountain');

    model.set('water', 'evian');
    assert.equal(view.$('.test4:checked').val(), 'evian');

    view.$('.test4[value=fountain]').prop('checked', true).trigger('change');
    assert.equal(model.get('water'), 'fountain');
  });

  QUnit.test('div', function(assert) {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': {
        observe: 'water'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test5').text(), 'fountain');

    model.set('water', 'evian');
    assert.equal(view.$('#test5').text(), 'evian');
  });

  QUnit.test(':el selector', function(assert) {

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      ':el': {
        observe: 'water'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$el.text(), 'fountain');

    model.set('water', 'evian');
    assert.equal(view.$el.text(), 'evian');
  });

  QUnit.test('bindings as a function', function(assert) {

    assert.expect(2);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = function() {
      return {'#test1':'water'};
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test1').val(), 'fountain');
    view.$('#test1').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('stickit (shorthand bindings)', function(assert) {
    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': 'water'
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test5').text(), 'fountain');

    model.set('water', 'evian');

    assert.equal(view.$('#test5').text(), 'evian');

  });

  QUnit.test('stickit (multiple models and bindings)', function(assert) {

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

    assert.equal(testView.$('#test0-div').text(), 'fountain');
    assert.equal(testView.$('#test0-textarea').val(), 'twix');
    assert.equal(testView.$('#test0-span').text(), 'evian');
    assert.equal(testView.$('#test0-input').val(), 'snickers');

    model1.set({water:'dasina', candy: 'mounds'});
    model2.set({water:'poland springs', candy: 'almond joy'});

    assert.equal(testView.$('#test0-div').text(), 'dasina');
    assert.equal(testView.$('#test0-textarea').val(), 'mounds');
    assert.equal(testView.$('#test0-span').text(), 'poland springs');
    assert.equal(testView.$('#test0-input').val(), 'almond joy');

    testView.$('#test0-textarea').val('kit kat').trigger('change');
    testView.$('#test0-input').val('butterfinger').trigger('change');

    assert.equal(model1.get('candy'), 'kit kat');
    assert.equal(model2.get('candy'), 'butterfinger');

    testView.remove();
  });

  QUnit.test('stickit (existing events property as hash with multiple models and bindings)', function(assert) {

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

    assert.equal(model1.get('candy'), 'kit kat');
    assert.equal(model2.get('candy'), 'butterfinger');

    testView.$el.trigger('click');

    assert.equal(testView.clickHandled, true);

    // Remove the view which should unbind the event handlers.
    testView.remove();

    testView.$('#test0-textarea').val('mounds').trigger('change');
    testView.$('#test0-input').val('skittles').trigger('change');

    assert.equal(model1.get('candy'), 'kit kat');
    assert.equal(model2.get('candy'), 'butterfinger');
  });

  QUnit.test('stickit (existing events property as function with multiple models and bindings)', function(assert) {

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

    assert.equal(model1.get('candy'), 'kit kat');
    assert.equal(model2.get('candy'), 'butterfinger');

    testView.$el.trigger('click');

    assert.equal(testView.clickHandled, true);

    testView.remove();
  });

  QUnit.test('bindings:setOptions', function(assert) {

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

    assert.equal(view.$('#test1').val(), 'fountain');

    view.$('#test1').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'dasina');
    assert.equal(model.changedAttributes().water, 'dasina');
  });

  QUnit.test('bindings:updateMethod', function(assert) {

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

    assert.equal(view.$('#test5').text(), 'river');
  });

  QUnit.test('bindings:escape', function(assert) {

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

    assert.equal(view.$('#test5').text(), '<a href="www.test.com">river</a>');
  });

  QUnit.test('bindings:onSet/onGet', function(assert) {

    assert.expect(6);

    model.set({'water':'_fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        onGet: function(val, options) {
          assert.equal(val, this.model.get('water'));
          assert.equal(options.observe, 'water');
          return val.substring(1);
        },
        onSet: function(val, options) {
          assert.equal(val, view.$('#test1').val());
          assert.equal(options.observe, 'water');
          return '_' + val;
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test1').val(), 'fountain');
    view.$('#test1').val('evian').trigger('change');
    assert.equal(model.get('water'), '_evian');
  });

  QUnit.test('bindings:sanitization', function(assert) {

    assert.expect(7);

    model.set({'duration':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'duration',
        onGet: function(val, options) {
          assert.equal(val, null);
          assert.equal(options.observe, 'duration');
          return val;
        },
        onSet: function(val, options) {
          assert.equal(parseInt(val, 10), 30);
          assert.equal(val, view.$('#test1').val());
          assert.equal(options.observe, 'duration');
          return null;
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test1').val(), '');
    view.$('#test1').val(30).trigger('change');
    assert.equal(model.get('duration'), null);
  });

  QUnit.test('bindings:onSet (returning array of observed values)', function(assert) {

    assert.expect(2);

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
    assert.equal(model.get('water'), 'evian');
    assert.equal(model.get('candy'), 'kitkat');
  });

  QUnit.test('bindings:set', function(assert) {

    assert.expect(5);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        set: function(attr, val, options, config) {
          assert.equal(attr, 'water');
          assert.equal(val, 'evian');
          assert.equal(options.stickitChange.observe, attr);
          assert.equal(config.observe, attr);
          model.set(attr, val);
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    view.$('#test1').val('evian').trigger('change');
    assert.equal(model.get('water'), 'evian');
  });

  QUnit.test('bindings:afterUpdate', function(assert) {

    assert.expect(14);

    model.set({'water':'fountain', 'candy':true});
    view.model = model;
    view.templateId = 'jst15';
    view.bindings = {
      '#test15-1': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          assert.equal($el.text(), model.get('water'));
          assert.equal(val, 'evian');
          assert.equal(options.observe, 'water');
        }
      },
      '#test15-2': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          assert.equal($el.val(), model.get('water'));
          assert.equal(val, 'evian');
          assert.equal(options.observe, 'water');
        }
      },
      '#test15-3': {
        observe: 'candy',
        afterUpdate: function($el, val, options) {
          assert.equal(val, false);
          assert.equal(options.observe, 'candy');
        }
      },
      '.test15-4': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          assert.equal(val, 'evian');
          assert.equal(options.observe, 'water');
        }
      },
      '#test15-6': {
        observe: 'water',
        afterUpdate: function($el, val, options) {
          assert.equal(val, 'evian');
          assert.equal(options.observe, 'water');
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
          assert.equal(val, 'evian');
          assert.equal(options.observe, 'water');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    model.set('water', 'evian');
    model.set('candy', false);
  });

  QUnit.test('bindings:selectOptions', function(assert) {

    assert.expect(7);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            assert.ok($el.is('select'));
            assert.equal(options.observe, 'water');
            return [{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}];
          },
          labelPath: 'name',
          valuePath: 'name'
        }
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('bindings:selectOptions:defaultOption', function(assert) {

    assert.expect(8);

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            assert.ok($el.is('select'));
            assert.equal(options.observe, 'water');
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

    assert.equal(view.$('#test8 option').eq(0).text(), 'Choose one...');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), null);

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('bindings:selectOptions:defaultOption (options is a method)', function(assert) {

    assert.expect(8);

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            assert.ok($el.is('select'));
            assert.equal(options.observe, 'water');
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

    assert.equal(view.$('#test8 option').eq(0).text(), 'Choose dynamic...');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), null);

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('bindings:selectOptions:defaultOption (options is disabled)', function(assert) {

    assert.expect(9);

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            assert.ok($el.is('select'));
            assert.equal(options.observe, 'water');
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

    assert.equal(view.$('#test8 option').eq(0).text(), 'Choose one...');
    assert.ok(view.$('#test8 option').eq(0).prop('disabled'));

    assert.equal(model.get('water'), null);

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    // We can force the selection of disabled options
    view.$('#test8 option').eq(0).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), null);
  });

  QUnit.test('bindings:selectOptions:defaultOption:OptGroups', function(assert) {

    assert.expect(8);

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst8';
    view.bindings = {
      '#test8': {
        observe: 'water',
        selectOptions: {
          collection: function($el, options) {
            assert.ok($el.is('select'));
            assert.equal(options.observe, 'water');
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

    assert.equal(view.$('#test8 > option').eq(0).text(), 'Choose one...');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), null);

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('bindings:selectOptions (disabled options)', function(assert) {

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

    assert.equal(view.$('#test8 option').eq(0).prop('disabled'), false);
    assert.equal(view.$('#test8 option').eq(1).prop('disabled'), true);
    assert.equal(view.$('#test8 option').eq(2).prop('disabled'), false);
  });

  QUnit.test('bindings:selectOptions (pre-rendered)', function(assert) {
    assert.expect(3);

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

    assert.strictEqual(getSelectedOption(view.$('#test21')).data('stickit-bind-val'), '1');

    model.set('water', '2');
    assert.strictEqual(getSelectedOption(view.$('#test21')).data('stickit-bind-val'), '2');

    view.$('#test21 option').eq(2).prop('selected', true).trigger('change');
    assert.strictEqual(model.get('water'), '3');
  });

  QUnit.test('bindings:selectOptions (pre-rendered, with data-stickit-bind-val)', function(assert) {

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

    assert.strictEqual(getSelectedOption(view.$('#test26')).data('stickit-bind-val'), 1);

    model.set('water', 2);
    assert.strictEqual(getSelectedOption(view.$('#test26')).data('stickit-bind-val'), 2);

    view.$('#test26 option:contains("dasina")').prop('selected', true).trigger('change');
    assert.strictEqual(model.get('water'), 3);

    view.$('#test26 option:contains("foutain")').prop('selected', true).trigger('change');
    assert.strictEqual(model.get('water'), 0);
  });

  QUnit.test('bindings:selectOptions (Backbone.Collection)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('bindings:selectOptions (Backbone.Collection that changes)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), 'dasina');

    // Test that the select options are auto-updated
    collection.add({id:4,name:'buxton'});
    assert.equal(view.$('#test8 option').eq(3).data('stickit-bind-val'), 'buxton');

    var modelEvents = ['stickit:unstuck', 'stickit:selectRefresh'];
    var collectionEvents = ['stickit:selectRefresh', 'add', 'remove', 'reset', 'sort'];

    // Test the number of event listeners set against the model and collection
    assert.equal(_.filter(model._events, function(event, key) {
      return (event.length === 1 && _.contains(modelEvents, key));
    }).length, modelEvents.length);

    assert.equal(_.filter(collection._events, function(event, key) {
      return (event.length === 1 && _.contains(collectionEvents, key));
    }).length, collectionEvents.length);

    collection.remove(2);
    assert.equal(view.$('#test8 option').length, collection.length);

    collection.reset();
    assert.equal(view.$('#test8 option').length, collection.length);

    // Test the number of event listeners set against the model and collection after changes to the collection
    assert.equal(_.filter(model._events, function(event, key) {
      return (event.length === 1 && _.contains(modelEvents, key));
    }).length, modelEvents.length);

    assert.equal(_.filter(collection._events, function(event, key) {
      return (event.length === 1 && _.contains(collectionEvents, key));
    }).length, collectionEvents.length);

    view.unstickit();

    // Test that the select options are no longer updated
    collection.add([{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]);
    assert.notEqual(view.$('#test8 option').length, collection.length);

    // Test that all event listeners have been removed after unstickit
    assert.ok(_.isEmpty(model._events));
    assert.ok(_.isEmpty(collection._events));
  });

  // test for issue #250: https://github.com/NYTimes/backbone.stickit/issues/250
  QUnit.test('bindings:selectOptions (Backbone.Collection that changes - multiple views)', function(assert) {
    var collection = new Backbone.Collection([{id:1,name:'fountain'}, {id:2,name:'evian'}, {id:3,name:'dasina'}]);
    model.set({'water':'fountain'});

    var View = Backbone.View.extend({
      bindings: {
        'select': {
          observe: 'water',
          selectOptions: {
            collection: function() { return collection; },
            labelPath: 'name',
            valuePath: 'name'
          }
        }
      },

      initialize: function() {
        this.model = model;
        this.templateId = 'jst8';
      },

      render: function() {
        var html = document.getElementById(this.templateId).innerHTML;
        this.$el.html(_.template(html)());
        this.stickit();
        return this;
      }
    });

    var view1 = new View();
    var view2 = new View();

    $('#qunit-fixture').append(view1.render().el);
    $('#qunit-fixture').append(view2.render().el);

    assert.equal(getSelectedOption(view1.$('#test8')).data('stickit-bind-val'), 'fountain');
    assert.equal(getSelectedOption(view2.$('#test8')).data('stickit-bind-val'), 'fountain');

    collection.add({id:4,name:'buxton'});

    assert.equal(view1.$('#test8 option').eq(3).data('stickit-bind-val'), 'buxton');
    assert.equal(view2.$('#test8 option').eq(3).data('stickit-bind-val'), 'buxton');

    collection.set([]);
    assert.equal(view1.$('#test8 option').length, 0);
    assert.equal(view2.$('#test8 option').length, 0);

  });

  QUnit.test('bindings:selectOptions (collection path relative to `this`)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');

    model.set('water', 'evian');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    assert.equal(model.get('water'), 'dasina');
  });

  QUnit.test('bindings:selectOptions (empty valuePath)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val').id, 1);

    model.set('water', {id:2, name:'evian'});
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val').id, 2);

    view.$('#test8 option').eq(2).prop('selected', true).trigger('change');
    assert.equal(model.get('water').id, 3);
  });

  QUnit.test('bindings:selectOptions (empty string label)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'session');
    assert.equal(view.$('#test8 option').eq(0).data('stickit-bind-val'), '');

    model.set('water', '');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), '');
  });

  QUnit.test('bindings:selectOptions (default labelPath/valuePath)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'evian');

    model.set('water', 'fountain');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'fountain');
  });

  QUnit.test('bindings:selectOptions (collection defined as value/label map)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'moo');

    // Options are sorted alphabetically by label
    assert.equal(view.$('#test8 option:eq(0)').data('stickit-bind-val'), 'moo');
    assert.equal(view.$('#test8 option:eq(1)').data('stickit-bind-val'), 'oink');
    assert.equal(view.$('#test8 option:eq(2)').data('stickit-bind-val'), 'baa');
  });

  QUnit.test('bindings:selectOptions (collection defined as value/label map, sorted by value)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 'moo');

    // Options are sorted alphabetically by value
    assert.equal(view.$('#test8 option:eq(0)').data('stickit-bind-val'), 'baa');
    assert.equal(view.$('#test8 option:eq(1)').data('stickit-bind-val'), 'moo');
    assert.equal(view.$('#test8 option:eq(2)').data('stickit-bind-val'), 'oink');
  });

  QUnit.test('bindings:selectOptions (multi-select without valuePath)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test16')).eq(0).data('stickit-bind-val').name, 'fountain');
    assert.equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val').name, 'dasina');

    var field = _.clone(model.get('water'));
    field.push({id:2,name:'evian'});

    model.set({'water':field});
    assert.equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val').name, 'evian');

    view.$('#test16 option').eq(3).prop('selected', true).trigger('change');

    assert.equal(model.get('water').length, 4);

  });

  QUnit.test('bindings:selectOptions (multi-select with valuePath)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test16')).eq(0).data('stickit-bind-val'), 1);
    assert.equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 3);

    var field = _.clone(model.get('water'));
    field.push(2);

    model.set({'water':field});
    assert.equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 2);

    view.$('#test16 option').eq(3).prop('selected', true).trigger('change');

    assert.equal(model.get('water').length, 4);

  });

  QUnit.test('bindings:selectOptions (pre-rendered multi-select)', function(assert) {

    model.set({'water': ['1', '3']});
    view.model = model;
    view.templateId = 'jst23';
    view.bindings = {
      '#test23': {
        observe: 'water'
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(getSelectedOption(view.$('#test23')).eq(0).data('stickit-bind-val'), '1');
    assert.equal(getSelectedOption(view.$('#test23')).eq(1).data('stickit-bind-val'), '3');

    var field = _.clone(model.get('water'));
    field.push('2');

    model.set({'water':field});
    assert.equal(getSelectedOption(view.$('#test23')).eq(1).data('stickit-bind-val'), '2');

    view.$('#test23 option').eq(3).prop('selected', true).trigger('change');

    assert.equal(model.get('water').length, '4');

  });

  QUnit.test('bindings:selectOptions (multi-select with onGet/onSet)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test16')).eq(0).data('stickit-bind-val'), 1);
    assert.equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 3);

    var field = _.clone(model.get('water'));
    field += '-2';

    model.set({'water':field});
    assert.equal(getSelectedOption(view.$('#test16')).eq(1).data('stickit-bind-val'), 2);

    view.$('#test16 option').eq(3).prop('selected', true).trigger('change');

    assert.equal(model.get('water'), '1-2-3-4');

  });

  QUnit.test('bindings:selectOptions (optgroup)', function(assert) {

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

    assert.equal(getSelectedOption(view.$('#test8')).parent().is('optgroup'), true);
    assert.equal(getSelectedOption(view.$('#test8')).parent().attr('label'), 'Three Stooges');
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 3);

    model.set({'character':2});
    assert.equal(getSelectedOption(view.$('#test8')).data('stickit-bind-val'), 2);

    view.$('#test8 option').eq(3).prop('selected', true).trigger('change');
    assert.equal(model.get('character'), 4);
  });

  QUnit.test('bindings:selectOptions (pre-rendered optgroup)', function(assert) {

    model.set({'character':'3'});
    view.model = model;
    view.templateId = 'jst22';
    view.bindings = {
      '#test22': {
        observe: 'character'
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(getSelectedOption(view.$('#test22')).parent().is('optgroup'), true);
    assert.equal(getSelectedOption(view.$('#test22')).parent().attr('label'), 'Three Stooges');
    assert.equal(getSelectedOption(view.$('#test22')).data('stickit-bind-val'), '3');

    model.set({'character':'2'});
    assert.equal(getSelectedOption(view.$('#test22')).data('stickit-bind-val'), '2');

    view.$('#test22 option').eq(3).prop('selected', true).trigger('change');
    assert.equal(model.get('character'), '4');
  });

  QUnit.test('bindings:selectOptions (pre-rendered optgroup with extra option)', function(assert) {

    model.set({'character':'3'});
    view.model = model;
    view.templateId = 'jst24';
    view.bindings = {
      '#test24': {
        observe: 'character'
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(getSelectedOption(view.$('#test24')).parent().is('optgroup'), true);
    assert.equal(getSelectedOption(view.$('#test24')).parent().attr('label'), 'Three Stooges');
    assert.equal(getSelectedOption(view.$('#test24')).data('stickit-bind-val'), '3');

    model.set({'character':'0'});
    assert.equal(getSelectedOption(view.$('#test24')).data('stickit-bind-val'), '0');

    view.$('#test24 option').eq(4).prop('selected', true).trigger('change');
    assert.equal(model.get('character'), '4');
  });

  QUnit.test('bindings:attributes:name', function(assert) {

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

    assert.equal(view.$('#test5').attr('data-name'), 'fountain');

    model.set('water', 'evian');
    assert.equal(view.$('#test5').attr('data-name'), 'evian');
  });

  QUnit.test('bindings:attributes:name:class', function(assert) {

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

    assert.ok(view.$('#test9').hasClass('test') && view.$('#test9').hasClass('fountain'));

    model.set('water', 'evian');
    assert.ok(view.$('#test9').hasClass('test') && view.$('#test9').hasClass('evian'));
  });

  QUnit.test('bindings:attributes:onGet', function(assert) {

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

    assert.equal(view.$('#test5').attr('data-name'), '_fountain_water');

    model.set('water', 'evian');
    assert.equal(view.$('#test5').attr('data-name'), '_evian_water');
  });

  QUnit.test('bindings:attributes:onGet (string)', function(assert) {

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

    assert.equal(view.$('#test5').attr('data-name'), '_fountain_water');

    model.set('water', 'evian');
    assert.equal(view.$('#test5').attr('data-name'), '_evian_water');
  });

  QUnit.test('bindings:attributes:observe', function(assert) {

    model.set({'water':'fountain', 'candy':'twix'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': {
        attributes: [{
          name: 'data-name',
          observe: 'candy',
          onGet: function(val) {
            assert.equal(val, this.model.get('candy'));
            return this.model.get('water') + '-' + this.model.get('candy');
          }
        }]
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test5').attr('data-name'), 'fountain-twix');

    model.set({'water':'evian', 'candy':'snickers'});
    assert.equal(view.$('#test5').attr('data-name'), 'evian-snickers');
  });

  QUnit.test('bindings:attributes:observe (array)', function(assert) {
    assert.expect(11);

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
              assert.equal(val[i], this.model.get(attr));
            }, this));
            assert.equal(options.observe.toString(), 'water,candy');
            return model.get('water') + '-' + model.get('candy');
          }
        }]
      }
    };

    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test5').attr('data-name'), 'fountain-twix');

    model.set({'water':'evian', 'candy':'snickers'});
    assert.equal(view.$('#test5').attr('data-name'), 'evian-snickers');
  });

  QUnit.test('bindings:attributes (properties)', function(assert) {

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

    assert.equal(view.$('#test1').prop('readonly'), true);

    model.set({'water':false});
    assert.equal(view.$('#test1').prop('readonly'), false);
  });

  QUnit.test('bindings:classes:name', function(assert) {

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
    assert.ok(view.$('#test5').hasClass('testClass'));

    model.set('water', false);
    assert.ok(!view.$('#test5').hasClass('testClass'));
  });

  QUnit.test('bindings:classes:observe', function(assert) {

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
    assert.ok(!view.$('#test5').hasClass('col-md-2'));
    assert.ok(view.$('#test5').hasClass('col-md-3'));

    model.set('truthy', 'string is truthy');
    assert.ok(view.$('#test5').hasClass('col-md-2'));
    assert.ok(!view.$('#test5').hasClass('col-md-3'));
  });

  QUnit.test('input:number', function(assert) {

    model.set({'code':1});
    view.model = model;
    view.templateId = 'jst11';
    view.bindings = {
      '#test11': {
        observe: 'code'
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(Number(view.$('#test11').val()), 1);

    model.set('code', 2);
    assert.equal(Number(view.$('#test11').val()), 2);
  });

  QUnit.test('visible', function(assert) {
    assert.expect(28);

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
          assert.equal(val, this.model.get('candy'));
          assert.equal(options.observe, 'candy');
          return this.model.get('candy') == 'twix';
        }
      },
      '#test14-3': {
        observe: ['candy', 'costume'],
        visible: true,
        visibleFn: function($el, isVisible, options) {
          assert.equal($el.attr('id'), 'test14-3');
          assert.ok(isVisible);
          assert.equal(options.observe.toString(), 'candy,costume');
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

    assert.equal(view.$('#test14-1').css('display') == 'block' , false);
    assert.equal(view.$('#test14-2').css('display') == 'block' , true);
    assert.equal(view.$('#test14-2').text(), 'Test');
    assert.equal(view.$('#test14-3').css('display') == 'block' , true);
    assert.equal(view.$('#test14-4').css('display') == 'block' , true);
    assert.equal(view.$('#test14-4').text(), 'yes');
    assert.equal(view.$('#test14-5').css('display') == 'block' , true);

    // Force-hide #test14-5 to make sure the fact that it's still visible
    // later is due to the truthiness check.
    view.$('#test14-5').hide()

    model.set('water', true);
    model.set('candy', 'snickers');
    model.set('costume', true);
    model.set('visible', 'no')

    assert.equal(view.$('#test14-1').css('display') == 'block' , true);
    assert.equal(view.$('#test14-2').css('display') == 'block' , false);
    assert.equal(view.$('#test14-2').text(), 'Test');
    assert.equal(view.$('#test14-3').css('display') == 'block' , true);
    assert.equal(view.$('#test14-4').css('display') == 'block' , false);
    assert.equal(view.$('#test14-4').text(), 'no');

    // 'no' is still truthy.
    assert.equal(view.$('#test14-5').css('display') == 'block' , true);

    model.set('visible', false);

    assert.equal(view.$('#test14-5').css('display') == 'block' , false);

  });

  QUnit.test('observe (multiple; array)', function(assert) {
    assert.expect(12);

    model.set({'water':'fountain', 'candy':'twix'});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': {
        observe: ['water', 'candy'],
        onGet: function(val, options) {
          _.each(options.observe, _.bind(function(attr, i) {
            assert.equal(val[i], this.model.get(attr));
          }, this));
          assert.equal(options.observe.toString(), 'water,candy');
          return model.get('water') + ' ' + model.get('candy');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test5').text(), 'fountain twix');

    model.set('water', 'evian');
    assert.equal(view.$('#test5').text(), 'evian twix');

    model.set('candy', 'snickers');
    assert.equal(view.$('#test5').text(), 'evian snickers');
  });

  QUnit.test('observe (function)', function(assert) {
    assert.expect(5);

    model.set({'water':'fountain'});

    var testView = new (Backbone.View.extend({
      initialize: function(options) {
        this.options = options;
      },
      bindings: {
        '#test1': {
          observe: function() {
            assert.equal(this, testView);
            assert.equal(this.options.observeValue, 'water');
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

    assert.equal(testView.$('#test1').val(), 'fountain');

    model.set('water', 'evian');
    assert.equal(testView.$('#test1').val(), 'evian');

    testView.$('#test1').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'dasina');

    testView.remove();
  });

  QUnit.test('bindings:updateView', function(assert) {
    assert.expect(9);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        updateView: function(val, options) {
          assert.equal(options.observe, 'water');
          assert.equal(val, model.get('water'));
          return val == 'evian';
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test1').val(), '');

    model.set({water:'evian'});
    assert.equal(view.$('#test1').val(), 'evian');

    model.set({water:'dasina'});
    assert.equal(view.$('#test1').val(), 'evian');
  });

  QUnit.test('bindings:updateModel', function(assert) {
    assert.expect(10);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        updateModel: function(val, event, config) {
          assert.equal(this.cid, view.cid);
          assert.equal(val, view.$('#test1').val());
          assert.equal(config.observe, 'water');
          assert.equal(event.type, 'change');
          return val == 'evian';
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    view.$('#test1').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'fountain');

    view.$('#test1').val('evian').trigger('change');
    assert.equal(model.get('water'), 'evian');
  });

  QUnit.test('bindings:events', function(assert) {

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

    assert.equal(view.$('#test1').val(), 'fountain');

    // change should be overriden, so no change...
    view.$('#test1').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'fountain');

    view.$('#test1').trigger('blur');
    assert.equal(model.get('water'), 'dasina');

    view.$('#test1').val('evian').trigger('keydown');
    assert.equal(model.get('water'), 'evian');
  });

  QUnit.test('checkbox multiple', function(assert) {

    model.set({'water':['fountain', 'dasina']});
    view.model = model;
    view.templateId = 'jst18';
    view.bindings = {
      '.boxes': 'water'
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('.boxes[value="fountain"]').prop('checked'), true);
    assert.equal(view.$('.boxes[value="evian"]').prop('checked'), false);
    assert.equal(view.$('.boxes[value="dasina"]').prop('checked'), true);

    model.set('water', ['evian']);
    assert.equal(view.$('.boxes[value="fountain"]').prop('checked'), false);
    assert.equal(view.$('.boxes[value="evian"]').prop('checked'), true);
    assert.equal(view.$('.boxes[value="dasina"]').prop('checked'), false);

    view.$('.boxes[value="dasina"]').prop('checked', true).trigger('change');
    assert.equal(model.get('water').length, 2);
    assert.equal(_.indexOf(model.get('water'), 'evian') > -1, true);
    assert.equal(_.indexOf(model.get('water'), 'dasina') > -1, true);
  });

  QUnit.test('checkbox multiple with numbers', function(assert) {

    model.set({'numbers':[1, 3]});
    view.model = model;
    view.templateId = 'jst27';
    view.bindings = {
      '.boxes': 'numbers'
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('.boxes[value="1"]').prop('checked'), true);
    assert.equal(view.$('.boxes[value="2"]').prop('checked'), false);
    assert.equal(view.$('.boxes[value="3"]').prop('checked'), true);

    model.set({'numbers':[2]});
    assert.equal(view.$('.boxes[value="1"]').prop('checked'), false);
    assert.equal(view.$('.boxes[value="2"]').prop('checked'), true);
    assert.equal(view.$('.boxes[value="3"]').prop('checked'), false);

    view.$('.boxes[value="3"]').prop('checked', true).trigger('change');

    assert.equal(model.get('numbers').length, 2);
    assert.equal(_.contains(model.get('numbers'), '2'), true);
    assert.equal(_.contains(model.get('numbers'), '3'), true);
  });

  QUnit.test('checkbox (single with value defined)', function(assert) {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst19';
    view.bindings = {
      '.box': 'water'
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('.box').prop('checked'), false);

    model.set('water', 'fountain');
    assert.equal(view.$('.box').prop('checked'), true);

    view.$('.box').prop('checked', false).trigger('change');
    assert.equal(model.get('water'), null);
  });

  QUnit.test('checkbox (single with number value defined)', function(assert) {

    model.set({'number':null});
    view.model = model;
    view.templateId = 'jst28';
    view.bindings = {
      '.box': 'number'
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('.box').prop('checked'), false);

    model.set('number', '1');
    assert.equal(view.$('.box').prop('checked'), true);

    model.set('number', '2');
    assert.equal(view.$('.box').prop('checked'), false);

    model.set('number', 1);
    assert.equal(view.$('.box').prop('checked'), true);

    model.set('number', 2);
    assert.equal(view.$('.box').prop('checked'), false);

    view.$('.box').prop('checked', true).trigger('change');
    assert.equal(model.get('number'), "1");

    view.$('.box').prop('checked', false).trigger('change');
    assert.equal(model.get('number'), null);
  });

  QUnit.test('getVal', function(assert) {
    assert.expect(5);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        getVal: function($el, event, options) {
          assert.equal(this.cid, view.cid);
          assert.equal($el.attr('id'), 'test1');
          assert.equal(event.type, 'change');
          assert.equal(options.observe, 'water');
          return 'test-' + $el.val();
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    view.$('#test1').val('dasina').trigger('change');
    assert.equal(model.get('water'), 'test-dasina');
  });

  QUnit.test('update', function(assert) {
    assert.expect(8);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        update: function($el, val, model, options) {
          assert.equal($el.attr('id'), 'test1');
          assert.equal(val, model.get('water'));
          assert.equal(options.observe, 'water');
          $el.val('test-' + val);
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('#test1').val(), 'test-fountain');

    model.set('water', 'dasina');
    assert.equal(view.$('#test1').val(), 'test-dasina');
  });

  QUnit.test('initialize', function(assert) {
    assert.expect(3);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        initialize: function($el, model, options) {
          assert.equal($el.val(), 'fountain');
          assert.equal(model.get('water'), 'fountain');
          assert.equal(options.observe, 'water');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);
  });

  QUnit.test('destroy', function(assert) {
    assert.expect(3);

    model.set({'water':'fountain'});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': {
        observe: 'water',
        events: ['change', 'input', 'keyup'],
        destroy: function($el, model, options) {
          assert.equal($el.val(), 'fountain');
          assert.equal(model.get('water'), 'fountain');
          assert.equal(options.observe, 'water');
        }
      }
    };
    $('#qunit-fixture').html(view.render().el);
    view.unstickit();
  });

  QUnit.test('null form value', function(assert) {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': 'water'
    };
    $('#qunit-fixture').html(view.render().el);
    assert.equal(view.$('#test1').val(), '');
  });

  QUnit.test('null html value', function(assert) {

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst5';
    view.bindings = {
      '#test5': 'water'
    };
    $('#qunit-fixture').html(view.render().el);
    assert.equal(view.$('#test5').html(), '');
  });

  QUnit.test('stickitChange', function(assert) {
    assert.expect(1);

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': 'water'
    };
    $('#qunit-fixture').html(view.render().el);

    model.on('change:water', function(m, v, options) {
      assert.ok(options.stickitChange);
    });

    view.$('#test1').val('dasina').trigger('change');
  });

  QUnit.test('view.remove should be called and unbind events', function(assert) {
    assert.expect(4);

    model.set({'water':null});
    view.model = model;
    view.templateId = 'jst1';
    view.bindings = {
      '#test1': 'water'
    };
    view.remove = function(option) {
      assert.ok(true);
      assert.ok(!!option);
    };
    $('#qunit-fixture').html(view.render().el);
    assert.equal(view._modelBindings.length, 1);
    view.remove('test');
    assert.equal(view._modelBindings.length, 0);
  });


  QUnit.test('context loss in getAttr', function(assert) {
    var model1 = new Backbone.Model();
    var model2 = new Backbone.Model();

    var thises = [];
    var start = false;

    var View = Backbone.View.extend({
      templateId: 'jst29',
      bindings: {
        '#test29': {
          classes: {
            'isWater': {
              observe: 'water',
              onGet: function(model) {
                if (start) thises.push({model: model, view_cid: this.cid});
                return !!model;
              }
            }
          }
        }
      },
      render: function() {
        var html = document.getElementById(this.templateId).innerHTML;
        this.$el.html(_.template(html)());
        this.stickit();
        return this;
      }
    });

    var view1 = new View({ model: model1 });
    var view2 = new View({ model: model2 });

    $('#qunit-fixture').html(view1.render().el);
    $('#qunit-fixture').append(view2.render().el);

    start = true;
    model1.set({'water':'model1'});
    model2.set({'water':'model2'});

    assert.notEqual(thises[0]['view_cid'], thises[1]['view_cid']);
  });

});
