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
        this.inner = this.els.find('span');
        this.target = $(target);

        this.els.on('click', 'span', $.proxy(function(e) {
            if(this.els.hasClass('open')) {
                this.els.removeClass('open');
                this.inner.html('+');
                this.target.removeClass('open');
            } else {
                this.els.addClass('open');
                this.inner.html('-');
                this.target.addClass('open');
            }
        }, this));

    };

    exports.PanelToggler = PanelToggler;

})(jQuery, Focus);

(function($, exports, undefined) {

    var Resizer = function() {
        if(!(this instanceof Resizer)) {
            return new Resizer();
        }

        var $win = $(window);
        console.log($win.width());
        $win.on('resize', $.proxy(function(e) {
            console.log($win.width(), $win.height());
        }, this));

        var mobileSize = window.matchMedia("(max-width: 600px)");
        var desktopSize = window.matchMedia("(min-width: 601px)");
        mobileSize.addListener(function() {
            $('.type li.grid').removeClass('active');
            $('.type li.list').addClass('active');
            $('.type li').hide();
            $('#posts').removeClass('grid');
        });

        desktopSize.addListener(function() {
            $('.type li').show();
        });

    };

    Resizer.prototype = {



    };

    exports.Resizer = Resizer;

})(jQuery, Focus);


jQuery(function() {
    Focus.GridToggler('.type li', '#posts');
    Focus.PanelToggler('.expand-panel', '#main-content');
    Focus.Resizer();
});