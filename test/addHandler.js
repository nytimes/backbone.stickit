$(document).ready(function() {

  QUnit.module("Backbone.Stickit");

  QUnit.test('addHandler', function(assert) {

    Backbone.Stickit.addHandler({
      selector: 'input.trim',
      update: function($el, val) { $el.val($.trim(val)); }
    });

    assert.equal(_.last(Backbone.Stickit._handlers).selector, 'input.trim');

    Backbone.Stickit.addHandler([{
      selector: 'textarea',
      update: function($el, val) { $el.val('blood ' + val); }
    }, {
      selector: 'div',
      updateMethod: 'html'
    }]);

    assert.equal(_.last(Backbone.Stickit._handlers).selector, 'div');
    assert.equal(_.last(Backbone.Stickit._handlers, 2)[0].selector, 'textarea');

    model.set({'input':' clot ', 'textarea':'clot', 'div':'<em>clot</em>'});
    view.model = model;
    view.templateId = 'jst20';
    view.bindings = {
      '.input': 'input',
      'input.trim': 'input',
      '#textarea': 'textarea',
      '#div': 'div'
    };
    $('#qunit-fixture').html(view.render().el);

    assert.equal(view.$('.input').val(), ' clot ');
    assert.equal(view.$('input.trim').val(), 'clot');
    assert.equal(view.$('#textarea').val(), 'blood clot');
    assert.equal(view.$('#div').text(), 'clot');

    Backbone.Stickit._handlers = _.first(Backbone.Stickit._handlers, Backbone.Stickit._handlers.length - 3);
  });

  QUnit.test('public getConfiguration', function(assert){
    $('#qunit-fixture').html($('#jst25').html());
    var $el = $('#qunit-fixture').find('.test25');
    assert.equal(Backbone.Stickit.getConfiguration($el).getVal($el), 'two');
  });
});
