/**
 * Focus Tumblr Theme.
 */

// Namespace
var Focus = window.Focus || {};

(function($, exports, undefined) {

    var GridToggler = function(els, target) {
        if(!(this instanceof GridToggler)) {
            return new GridToggler(els, target);
        }
        this.els = $(els);
        this.target = $(target);

        this.els.on('click', $.proxy(this.__setDisplayType, this));

    };

    GridToggler.prototype = {

        __setDisplayType: function(e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var type = el.data('type');

            if(type === 'grid' && !el.hasClass('active')) {
                this.setGrid();
            } else if(type === 'list' && !el.hasClass('active')) {
                this.setList();
            }
            this.els.removeClass('active');
            el.toggleClass('active');
        },

        setGrid: function() {
            this.target.removeClass('list').addClass('grid');
            // @TODO: set cookie to remember selection.
            // @TODO: reload iframes.
        },

        setList: function() {
            this.target.removeClass('grid').addClass('list');
        }

    };

    exports.GridToggler = GridToggler;

})(jQuery, Focus);

(function($, exports, undefined) {

    var PanelToggler = function(els, target) {
        if(!(this instanceof PanelToggler)) {
            return new PanelToggler(els, target);
        }
        this.els = $(els);
        this.target = $(target);

        this.els.on('click', $.proxy(function(e) {
            if(this.els.hasClass('open')) {
                this.els.html('+').removeClass('open');
                this.target.removeClass('open');
            } else {
                this.els.html('-').addClass('open');
                this.target.addClass('open');
            }
        }, this));

    };

    exports.PanelToggler = PanelToggler;

})(jQuery, Focus);


jQuery(function() {
    Focus.GridToggler('.type li', '#posts');
    Focus.PanelToggler('.expand-panel', '#main-content');
});