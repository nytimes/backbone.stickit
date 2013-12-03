$(document).ready(function() {

  QUnit.testStart = function() {
    window.view = new (Backbone.View.extend({
      model: null,
      templateId: '',
      render: function() {
        var html = document.getElementById(this.templateId).innerHTML;
        this.$el.html(_.template(html)());
        this.stickit();
        return this;
      }
    }))();

    window.model = new (Backbone.Model.extend())();
  };

  QUnit.testDone = function() {
    model.off();
    delete window.model;
    view.remove();
    delete window.view;
  };

  // Zepto does not have psuedo-selector support, so...
  window.getSelectedOption = function($el) {
    return $el.find('option').not(function(){ return !this.selected; });
  };

});