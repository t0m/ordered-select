/**
 * Widget for adding items selected from a single select box to an ordered list.
 * The widget uses a regular single select box and a display area div for 
 * showing the selected results. 
 * 
 * <div id="displayArea"></div>
 * <select id="mySelectBox" style="width:300px" data-display-area-id="displayArea"></select>
 * 
 * <script>
 * $('#mySelectBox').orderedSelect();
 * </script>
 */
(function($) {
  function OrderedSelect() {
    this.init = function(selectBox, displayArea) {
      var orderedSelect = this;
      this.selectBox = selectBox;
      this.displayArea = displayArea;
      this.selectedArray = [];
      this.selectedSet = {};
      selectBox.data('orderedSelect', orderedSelect);
      
      selectBox.change(function(data) {
        var val = selectBox.val();
        if (val !== '') {
          var selected = selectBox.find(':selected'); 
          var text = selected.text();
          orderedSelect.add(val, text);
          selected.removeAttr('selected');
          setTimeout(function() { selectBox.change(); }, 0);
        }
      });
    };
    
    this.isSelected = function(value) {
      return value in this.selectedSet;
    };
    
    this.add = function(value, text) {
      if (this.isSelected(value)) {
        return; 
      }
      
      var currentIndex = this.selectedArray.length;
      var node = this.buildDisplayNode(value, text, currentIndex);
      this.selectedSet[value] = currentIndex;
      this.selectedArray.push(node);
      this.rebuildDisplay();
    };
    
    this.remove = function(value) {
      if (!this.isSelected(value)) {
        return;
      }
      
      var index = this.selectedSet[value];
      delete this.selectedSet[value];
      removeFromArray(this.selectedArray, index);
      this.rebuildDisplay();
    };
    
    /**
     * To facilitate sorting, this will rebuild the selectedArray
     * and selectedSet values from the current state of the DOM.
     */
    this.rebuildArraysFromDom = function() {

    };
    
    /**
     * This will clear the DOM display and rebuild it from 
     * selectedArray. This should be called after adding or
     * removing nodes to sync the display with the internal state.
     */
    this.rebuildDisplay = function() {
      this.displayArea[0].innerHTML = '';

      if (this.selectedArray.length == 0) {
        return;
      }
      
      var orderedList = $('<ol class="osWrapper"/>');
      for (var i = 0; i < this.selectedArray.length; i++) {
        orderedList.append(this.selectedArray[i]);
      }
      
      this.displayArea.append(orderedList);
    };
    
    this.buildDisplayNode = function(value, text, index) {
      var orderedSelect = this;
      var displayIndex = index + 1;
      var wrapper = $('<li class="osDisplayNode"></li>');
      wrapper.append('<input type="hidden" value="' + value + '"/>');
      var displayPrefix = displayIndex + '. ';
      wrapper.append('<span class="osDisplayText">' + displayPrefix + text + '</span>');
      var remove = $('<a href="#" class="osRemove">&times;</a>');
      remove.click(function() { debugger; orderedSelect.remove(value); return false; });
      wrapper.append(remove);
      return wrapper;
    };
  }
  
  $.fn.orderedSelect = function() {
    $(this).each(function(){
      var selectBox = $(this);
      var displayArea = $('#' + $(this).data('display-area-id'));
      orderedSelect = new OrderedSelect();
      orderedSelect.init(selectBox, displayArea);
    });
  };
  
  /**
   * From http://ejohn.org/blog/javascript-array-remove/
   */
  function removeFromArray(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
  }

})(jQuery);