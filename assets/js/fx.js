// Namespace
var Focus = Focus || {};

(function($, exports) {
    /**
      * A small / simple animation framework to create time based CSS animations.
      * Only animates pixel values (except for opacity).
      * Also, only animates one property at a time.
      * @author: Kris Hedstrom (kris@tumblr.com)
      * @constructor
      * @param {HTMLElement} el The element to animate.
      * @param {String} prop The CSS property we will be animating.
      * @param {Object} opts A configuration object. Including:
      *     from {Int}
      *     to {Int}
      *     duration {Int} time in milliseconds
      *     delay {Boolean|Int} time to wait, or to initiate immediately.
      *     callback {Function}
      *
      * @todo: Animate more than one property at a time.
      * @todo: Allow color animations.
      * @todo: Create helper effects like highlight, move, fadein/out, etc.
      * @todo: If from starting point isn't included try to get the current starting
      * point.
      */
    var Fx = function(el, prop, opts) {

        // If user accidentally omits the new keyword, this will silently
        // correct the problem.
        if (!(this instanceof Fx)) {
            return new Fx(el, prop, opts);
        }

        // Extended version of the element.
        this.el = (typeof el === 'string') ? $(el).get(0) : el;
        this.$el = $(el); // jQuery object.
        this.options = opts;
        
        // Take advantage of HTML5 data attributes to support customization of
        // the plugin on a per-element basis.
        this.metadata = this.$el.data('plugin-options');
        this.config = $.extend({}, Fx.defaults, this.options, this.metadata);
        
        this.prop = prop;
        this.from = opts.from;
        this.to = opts.to;
        this.duration = opts.duration;
        this.callback = opts.callback;
        this.animDiff = this.to - this.from;
        
        this.prefix = Fx.prefix();
        this.cssTransition = opts.cssTransition && this.prefix;
        this.cssEasing = opts.cssEasing || 'linear';

        if(this.cssTransition) {
            this.transitionEndEvent = Fx.whichTransitionEvent();
            // Cache events so we can remove them later.
            this.events = {
                __end: $.proxy(this.__cssTransitionEnd, this)
            };
        }
        
        this.easing = Fx.easing[opts.easing] || function(x, t, b, c, d) {
            return b + c * x;
        };
        
        // Is a delay timer set?
        if(!opts.delay) {
            this.start();
        } else if(typeof opts.delay === 'number') {
            setTimeout(function() {
                self.start();
            }, opts.delay);
        } else {
            // Delay is set to true, which means `start` needs to be called
            // implicitily. Do nothing here.
        }
    };

    Fx.prototype = {

        /**********************************************************************
         * PRIVATE METHODS
         **********************************************************************/

         /**
          * Determine if value is color.
          * @param {String} val The CSS value.
          * @private
          */
        _isColor: function(val) {
            // This could be improved on a lot.
            // Matches any string # or rgb.
            var regex = /(#[a-f|A-F|0-9]|rgb)/;
            return typeof val === 'string' && regex.test(val);
        },
      

        /**
         * Set the style of the property.
         * @param {String} val The CSS value.
         * @private
         */
        _setStyle: function(val) {
            var measurement;
            if(this.cssTransition) {
                this.el.style.cssText = this.prefix + 'transition: ' +
                    this.prop + ' ' +
                    this.duration + 'ms ' +
                    this.cssEasing;
            }
            // Could set rules for non-standard styles here, like IE filters,
            // if I cared. I do not.
            measurement = (this.prop === 'opacity') ? '' : 'px';
            this.el.style[Tumblr.$.camelize(this.prop)] = val + measurement;

        },

        /**
         * The tweening function.
         * @private
         */
        _tween: function() {
            this.now = new Date();
            this.elapsed = this.now - this.startTime;
            
            if (this.elapsed >= this.duration) {
                this._animationEnd(true);
            } else {

                this.percentage = (this.elapsed / this.duration);

                /**
                 * Easing
                 * percentComplete: (0.0 to 1.0). (x)
                 * elaspedTime: The number of ms the animation has been running (t)
                 * startValue: the value to start at (or the value when 0%) (b)
                 * endValue: the value to end at (or the value when 100%) (c)
                 * totalDuration: The total length of the animation in ms (d)
                 * example:
                 * linear: function(x, t, b, c, d) {
                 *     return b + c * x;
                 * }
                 */
                this.val = this.easing(
                                this.percentage, // x
                                this.elapsed, // t
                                this.from, // b
                                this.animDiff, // c
                                this.duration // d
                            );

                this._setStyle(this.val);
            }

        },

        /**
         * At the end of the animation.
         * @param {Boolean} end Should the end value be set?
         * @private
         */
        _animationEnd: function(end) {
            this.ended = true;
            clearInterval(this.timer);
            // Jump to end value?
            if(end && !this.cssTransition) {
                this._setStyle(this.to);
            }

            if (this.callback && typeof this.callback === 'function') {
                this.callback.call(this);
            }
        },

        /**********************************************************************
         * EVENT HANDLERS
         **********************************************************************/

        /**
         * At the end of the css animation.
         * @param {Event} e Transition end event.
         * @private
         */
        __cssTransitionEnd: function(e) {
            if(e.propertyName === this.prop) {
                // Cleanup.
                this.el.removeEventListener(this.transitionEndEvent,
                    this.events.__end, false);
                this._animationEnd(true);
            }
        },

        /**********************************************************************
         * PUBLIC METHODS
         **********************************************************************/

        /**
         * Start the animation.
         */
        start: function() {
            var self = this;
            this.startTime = new Date();

            if(this.cssTransition) {
                // Set the style.
                this._setStyle(this.to);
                // Listen for transition end event.
                this.el.addEventListener(this.transitionEndEvent,
                    this.events.__end, false);
                
            } else {
                // Overclock the timer. Slow browser will play catch-up, and
                // animation will look smooth everywhere.
                this.timer = setInterval(function() {
                    self._tween.call(self);
                }, 3);
                // @TODO: look into request animation frames. Seems like overkill
                // for right now. Keeping it around though.
                // (function animloop(){
                //     window.webkitRequestAnimationFrame(animloop);
                //     self._tween.call(self);
                // })();
            }
        },

        /**
         * Stop the animation.
         * @param {Boolean} end Should the animation set the end value?
         */
        stop: function(end) {
            this._animationEnd(end);
        }

    };

    /**************************************************************************
     * STATIC METHODS
     **************************************************************************/

    Fx.defaults = {};
    
    Fx.register = function(instance) {
        this.instances.push(instance);
    };
 
    Fx.destroyAll = function(instance) {
        for(var i = 0; i < this.instances.length; i++) {
            this.instances[i].destroy();
        }
    };

    // Plugify.
    $.fn.focusfx = function(prop, options) {
        return this.each(function() {
            new Fx(this, prop, options);
        });
    };

    /**
     * Does the browser support a certain css property?
     * @static
     * @param {String} prop Property to check for.
     * @return {Boolean}
     */
    Fx.propSupport = (function() {
        return function(prop) {
            var div = document.createElement('fakeelement');
            var prefixes = ["Webkit", "Moz", "O", "MS", 'Khtml'];
            var len = prefixes.length;
            if (prop in div.style ) return true;
            prop = prop.replace(/^[a-z]/, function(val) {
                return val.toUpperCase();
            });

            while(len--) {
                if (prefixes[len] + prop in div.style ) {
                    return true;
                }
            }
            return false;
        };
    })();



    /**
     * Which vendor prefix should be used?
     * @static
     * @return {String|Boolean} Vendor prefix or false.
     */
    Fx.prefix = (function() {
        var cache;
        return function() {
            if(cache === undefined) {
                var test = document.createElement("fakeelement");
                var prefixes = ["Webkit", "Moz", "O", "MS", 'Khtml'];
                var i = prefixes.length;
                var prefix;
        
                while (i--) {
                    prefix = prefixes[i];
                    test.style.cssText = "-" + prefix.toLowerCase() +
                        "-transition:opacity;";
                    if (typeof test.style[prefix + "Transition"] != "undefined") {
                        cache = "-" + prefix.toLowerCase() + "-";
                        return cache;
                    }
                }

                cache = false;
                return cache;
            }
            return cache;
        };
    })();

    /**
     * Which transition end event should we be using?
     * @static
     * @return {String|Boolean} Transition end event string or false.
     */
    Fx.whichTransitionEvent = (function () {
        // Store the value of this function.
        var cache;
        return function() {
            if(cache === undefined) {
                var t;
                var el = document.createElement('fakeelement');
                var transitions = {
                    'transition': 'transitionend',
                    'OTransition': 'oTransitionEnd',
                    'MSTransition': 'msTransitionEnd',
                    'MozTransition': 'transitionend',
                    'WebkitTransition': 'webkitTransitionEnd'
                };

                for(t in transitions) {
                    if(el.style[t] !== undefined) {
                        cache = transitions[t];
                        return cache;
                    }
                }

                // No transition end event available.
                cache = false;
                return cache;
            }
            return cache;
        };
    })();


    /**
     * Easing equations cribbed from jQuery Easing plugin.
     */

    /*
     * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
     *
     * Uses the built in easing capabilities added In jQuery 1.1
     * to offer multiple easing options
     *
     * TERMS OF USE - jQuery Easing
     * 
     * Open source under the BSD License.
     * 
     * Copyright Â© 2008 George McGinley Smith
     * All rights reserved.
     * 
     * Redistribution and use in source and binary forms, with or without modification, 
     * are permitted provided that the following conditions are met:
     * 
     * Redistributions of source code must retain the above copyright notice, this list of 
     * conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright notice, this list 
     * of conditions and the following disclaimer in the documentation and/or other materials 
     * provided with the distribution.
     * 
     * Neither the name of the author nor the names of contributors may be used to endorse 
     * or promote products derived from this software without specific prior written permission.
     * 
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
     * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
     *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
     * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
     * OF THE POSSIBILITY OF SUCH DAMAGE. 
     *
    */

    Fx.easing = {
        linear: function(x, t, b, c, d) {
             return b+c*x;
        },
        easeInQuad: function (x, t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function (x, t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },
        easeInCubic: function (x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOutCubic: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },
        easeInQuart: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
        },
        easeOutQuart: function (x, t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOutQuart: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },
        easeInQuint: function (x, t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOutQuint: function (x, t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },
        easeInSine: function (x, t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function (x, t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function (x, t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },
        easeInExpo: function (x, t, b, c, d) {
            return (t===0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOutExpo: function (x, t, b, c, d) {
            if (t===0) return b;
            if (t===d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOutCirc: function (x, t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOutCirc: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },
        easeInElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t===0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
            if (a < Math.abs(c)) { a=c; s=p/4; }
            else s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t===0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
            if (a < Math.abs(c)) { a=c; s=p/4; }
            else s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function (x, t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (t===0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(0.3*1.5);
            if (a < Math.abs(c)) { a=c; s=p/4; }
            else s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
        },
        easeInBack: function (x, t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (x, t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function (x, t, b, c, d, s) {
            if (s === undefined) s = 1.70158;
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        easeInBounce: function (x, t, b, c, d) {
            return c - Fx.easing.easeOutBounce (x, d-t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d/2) return Fx.easing.easeInBounce (x, t*2, 0, c, d) * 0.5 + b;
            return Fx.easing.easeOutBounce (x, t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
        }
    };

    exports.Fx = Fx;
})(jQuery, Focus);
