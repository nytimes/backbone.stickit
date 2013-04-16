$(document).ready(function() {

  module("Backbone.Stickit");

  test('addHandler', function() {

    Backbone.Stickit.addHandler({
      selector: 'input.trim',
      update: function($el, val) { $el.val($.trim(val)); }
    });

    equal(_.last(Backbone.Stickit._handlers).selector, 'input.trim');

    Backbone.Stickit.addHandler([{
      selector: 'textarea',
      update: function($el, val) { $el.val('blood ' + val); }
    }, {
      selector: 'div',
      updateMethod: 'html'
    }]);

    equal(_.last(Backbone.Stickit._handlers).selector, 'div');
    equal(_.last(Backbone.Stickit._handlers, 2)[0].selector, 'textarea');

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

    equal(view.$('.input').val(), ' clot ');
    equal(view.$('input.trim').val(), 'clot');
    equal(view.$('#textarea').val(), 'blood clot');
    equal(view.$('#div').text(), 'clot');

    Backbone.Stickit._handlers = _.first(Backbone.Stickit._handlers, Backbone.Stickit._handlers.length - 3);
  });

  test('public getConfiguration', function(){
    $('#qunit-fixture').html($('#jst25').html());
    var $el = $('#qunit-fixture').find('.test25');
    equal(Backbone.Stickit.getConfiguration($el).getVal($el), 'two');
  });
});