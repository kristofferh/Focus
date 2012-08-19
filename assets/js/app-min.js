/**
 * Focus Tumblr Theme.
 */// Namespace
var Focus=window.Focus||{};(function(e,t,n){var r=function(t,n){!this instanceof r&&new r(t,n);this.els=e(t);this.target=e(n);this.els.on("click",e.proxy(function(t){t.preventDefault();var n=e(t.currentTarget),r=n.data("type");console.log(this);this.setType(r)},this))};r.prototype={setType:function(e){this.target.toggleClass(e)}};t.GridToggler=r})(jQuery,Focus);jQuery(function(){console.log("loaded");Focus.GridToggler(".type li","#posts")});