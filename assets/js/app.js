/**
 * Focus Tumblr Theme.
 */

// Namespace
var Focus = window.Focus || {};

(function($, exports, undefined) {

    var GridToggler = function(els, target) {
        if(!this instanceof GridToggler) {
            new GridToggler(els, target);
        }
        this.els = $(els);
        this.target = $(target);

        this.els.on('click', $.proxy(function(e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var type = el.data('type');
            console.log(this);
            this.setType(type);
        }, this));

    };

    GridToggler.prototype = {

        setType: function(type) {
            this.target.toggleClass(type);
        }

    };

    exports.GridToggler = GridToggler;

})(jQuery, Focus);

jQuery(function() {
    console.log('loaded');
    Focus.GridToggler('.type li', '#posts');
});