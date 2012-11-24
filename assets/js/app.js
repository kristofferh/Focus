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

    var Pager = function(el, options) {
        if(!(this instanceof Pager)) {
            return new Pager(el, options);
        }

        // Extended version of the element.
        this.el = (typeof el === 'string') ? $(el).get(0) : el;
        this.$el = $(el); // jQuery object.
        this.options = options;
        
        // Take advantage of HTML5 data attributes to support customization of
        // the plugin on a per-element basis.
        this.metadata = this.$el.data('plugin-options');
        this.config = $.extend({}, Pager.defaults, this.options, this.metadata);
        
        this.$doc = $(document);

        this.$el.on('scroll', $.proxy(this._debounce(function() {
            if(this._nearBottom()) {
                this.nextPage();
            } else {
                this.config.loader.removeClass('active');
            }
        }, this.config.scrollDelay), this));

        this.config.pagination.addClass('visuallyhidden');

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

        Pager.register(this);
        return this;

    };

    Pager.prototype = {

        /**
         * Debounce. Call method only once, after a delay.
         * @param {Function} callback [description]
         * @param {Number} delay How long to wait before calling the function.
         * @return {Function} Returns a new function.
         */
        _debounce: function(callback, delay) {
            var throttleTimout = null;
            return function() {
                clearTimeout(throttleTimout);
                throttleTimout = setTimeout($.proxy(function() {
                    callback.apply(this);
                }, this), delay);
            };
        },

        /**
         * Check if we're close to the bottom of the page.
         * @return {Boolean}
         */
        _nearBottom: function() {
            var offset = 0 + this.$doc.height() - this.$el.height() - this.$el.scrollTop();
            var originalOffset = this.$doc.height() - this.config.pagination.offset().top;
            return ((offset - this.config.bufferPx) < originalOffset);
        },

        nextPage: function() {
            this.config.loader.addClass('active');
        }

    };

    Pager.instances = [];

    Pager.defaults = {
        bufferPx: 250,
        pagination: $('#pagination'),
        loader: $('.loader'),
        scrollDelay: 50
    };
    
    Pager.register = function(instance) {
        this.instances.push(instance);
    };

    // Plugify.
    $.fn.pager = function(options) {
        return this.each(function() {
            new Pager(this, options);
        });
    };


    exports.Pager = Pager;

})(jQuery, Focus);


jQuery(function() {
    Focus.GridToggler('.type li', '#posts');
    Focus.PanelToggler('.expand-panel', '#main-content');
    Focus.Pager(window);
});