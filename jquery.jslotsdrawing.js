/*
 * Arthor James Chiang
 * MIT licenses
 */

(function($){
  $.jSlotsDrawing = function(uiList, options){
    var base = this;
    
    base.$uiList = $(uiList);
    base.uiList = uiList;
    base.$uiList.data("jSlotsDrawing", base);

    base.init = function() {
      base.options = $.extend({},$.jSlotsDrawing.defaultOptions, options);
      base.setup();
      base.bindStartEvent();
    };

    //set default
    $.jSlotsDrawing.defaultOptions = {
      spinner : '',        // start button
      digit : 4,           // digit of total count
      winnerNumber : 0,    // The ending number            
      spinEvent : 'click',
      easing : 'easeOutBounce',    // jquery easing type for ending
      time : 5000,         // total time of spin ms
      loops : 20,          // spin round times
      onStart : $.noop,
      onEnd : $.noop
    };

    base.isSpinning = false;
    base.spinSpeed = 0;
    base.doneCount = 0;

    base.$liHeight = 0;
    base.$liWidth = 0;

    base.allSlots = [];

    base.setup = function() {
      // set sizes
      var $list = base.$uiList;
      var $li = $list.find('li').first();

      base.$liHeight = $li.outerHeight();
      base.$liWidth = $li.outerWidth();

      base.liCount = base.$uiList.children().length;

      base.listHeight = base.$liHeight * base.liCount;

      base.increment = (base.options.time / base.options.loops) / base.options.loops;

      $list.css('position', 'relative');

      $li.clone().appendTo($list);

      base.$wrapper = $list.wrap('<div class="jSlotsDrawing-wrapper"></div>').parent();

      base.$uiList.remove();

      for (var i = base.options.digit - 1; i >= 0; --i){
        base.allSlots.push( new base.Slot() );
      }
    };

    base.bindStartEvent = function() {
      $(base.options.spinner).bind(base.options.spinEvent, function(event) {
        if (!base.isSpinning) {
          base.startSlots();
        }
      });
    };
    
    //Slot Object
    base.Slot = function() {
      this.spinSpeed = 0;
      this.loopCount = 0;
      this.uiList = base.$uiList.clone().appendTo(base.$wrapper)[0];
      this.$uiList = $(this.uiList);
    };
    base.Slot.prototype = {
      spinAnimation : function(index, spinSpeed) {
        var that = this;
        that.$uiList
          .css( 'top', -base.listHeight )
          .animate( { 'top' : '0px' }, that.spinSpeed, 'linear', function() {
            that.spinSpeed += base.increment;
            that.loopCount++;
            if ( that.loopCount < base.options.loops ) {
              that.spinAnimation(index);
            }
            else {
              that.finish(index+1);
            }
          });
      },
      slowdown : function(index) {
        var that = this;
        that.$uiList
          .css( 'top', -base.listHeight )
          .animate( { 'top' : '0px' }, that.spinSpeed*30, 'linear', function() {
            //that.slowdown(index);
          });
      },
      finish : function(endNum) {
        var finalPos = - ( (base.$liHeight * endNum) - base.$liHeight );
        var finalSpeed = ( (this.spinSpeed * 0.5) * (base.liCount) ) / endNum;

        this.$uiList
          .css( 'top', -base.listHeight )
          .animate( {'top': finalPos}, finalSpeed, base.options.easing, function() {
            base.finishSlots();
          });
      }
    };

    base.startSlots = function() {
      base.isSpinning = true;
      base.doneCount = 0;

      if ( $.isFunction(base.options.onStart) ) {
        base.options.onStart();
      }

      $.each(base.allSlots, function(index, val) {
        this.spinSpeed = 0;
        this.loopCount = 0;
        var target = Math.floor(base.options.winnerNumber/Math.pow(10, base.options.digit-index-1)) % 10;
        this.spinAnimation(target);
      });
    };
    base.finishSlots = function() {
      base.doneCount++;
      if (base.doneCount === base.options.digit) {
        if ( $.isFunction( base.options.onEnd ) ) {
          base.options.onEnd();
        }
        base.isSpinning = false;
      }
    };

    base.init();
  };

  $.fn.jSlotsDrawing = function(options){
    if (this.length) {
      return this.each(function(){
        (new $.jSlotsDrawing(this, options));
      });
    }
  };
})(jQuery);
