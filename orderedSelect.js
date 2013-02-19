"use strict";
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
  $.fn.orderedSelect = function(options) {
    $(this).each(function(){
      var selectBox = $(this);
      var orderedSelect = new OrderedSelect(selectBox, options || {});
    });
  };

  function OrderedEntry(value, text) {
    this.value = value;
    this.text = text;
    this.selected = false;
    this.visible = true;

    this.optionHtml = function() {
      return '<option value="' + this.value + '">' + this.text + '</option>';
    }
  }

  function OrderedSelect(selectBox, options) {
    var displayArea = options.displayArea || $('#' + selectBox.attr('data-display-area-id'));
    var initial = options.initial || [];
    var name = options.name;
    var selectedArray = [];
    var orderedSelect = this;
    var state = buildInitialState(selectBox);
    var lookup = buildLookup(state);

    var generateItemText = options.generateItemText || function(entry, index) {
      return (index + 1) + '. ' + entry.text;
    }

    var generateHiddenInput = options.generateHiddenInput || function(entry, index) {
      return '<input type="hidden" name="' + name + '[' + index + ']" value="' + entry.value + '" />';
    }

    this.addSelection = function(value) {
      var entry = lookup[value];
      entry.selected = true;
      entry.visible = false;
      selectedArray.push(entry);
    }

    this.removeSelection = function(value) {
      var entry = lookup[value];
      entry.selected = false;
      entry.visible = true;
      removeFromArray(selectedArray, findSelectedPosition(entry));
    };

    selectBox.data('orderedSelect', this);
    initSelectBox(selectBox);
    initDisplayArea(displayArea);
    selectAll(initial);
    selectBox.rebuild();
    displayArea.rebuild();

    function findSelectedPosition(entry) {
      for (var i = 0; i < selectedArray.length; i++) {
        if (entry === selectedArray[i]) {
          return i;
        }
      }
      return -1;
    }

    /**
     * After rearranging the display area we have to sync the new order of
     * the items to the state array.
     */
    function syncDisplayState() {
      var selected = displayArea.find('li.osDisplayNode');
      var newSelectedArray = new Array(selectedArray.length);
      for (var i = 0; i < selected.length; i++) {
        newSelectedArray[i] = $(selected[i]).data('osEntry');
      }
      selectedArray = newSelectedArray;
      displayArea.rebuild();
    }

    function buildInitialState(selectBox) {
      var options = selectBox.find('option');
      var state = new Array(options.length);
      for (var i = 0; i < options.length; i++) {
        state[i] = new OrderedEntry($(options[i]).val(), $(options[i]).text());
      }
      return state;
    }

    function buildLookup(state) {
      var lookup = {};
      for (var i = 0; i < state.length; i++) {
        lookup[state[i].value] = state[i];
      }
      return lookup;
    }

    function initSelectBox(selectBox) {
      var options = selectBox.find('option');

      selectBox.rebuild = function() {
        var optionHtml = '';
        for (var i = 0; i < state.length; i++) {
          var entry = state[i];
          if (entry.visible) {
            optionHtml += entry.optionHtml();
          }
        }
        selectBox.html(optionHtml);
      }

      selectBox.clearSelection = function() {
        $(this).find(':selected').removeAttr('selected');
      }

      selectBox.change(function(data, extra) {
        if (extra && extra.ignore) { 
          return;
        }
        orderedSelect.addSelection($(this).val());
        selectBox.clearSelection();
        selectBox.rebuild();
        displayArea.rebuild();
        setTimeout(function() { selectBox.trigger('change', { ignore : true }); }, 0);
      });
    }

    function initDisplayArea(displayArea) {
      displayArea.rebuild = function() {
        $(this).html('');
        var ol = $('<ol class="osWrapper"/>');

        for (var i = 0; i < selectedArray.length; i++) {
          var entry = selectedArray[i];
          var displayHtml = $('<li class="osDisplayNode">' + generateItemText(entry, i) + '</li>');
          var removeTrigger = $('<a class="osRemove" href="#">&times</a>');

          var onclick = (function(value) { 
            return function() {
              orderedSelect.removeSelection(value); 
              displayArea.rebuild();
              selectBox.rebuild();
              return false;
            };
          })(entry.value);

          removeTrigger.click(onclick);
          displayHtml.append(removeTrigger);
          displayHtml.append($(generateHiddenInput(entry, i)));
          displayHtml.data('osEntry', entry);
          ol.append(displayHtml);
        }

        displayArea.append(ol);
        ol.sortable();
        ol.bind('sortstop', function() { syncDisplayState(); });
      }
    }

    function selectAll(selectValues) {
      for (var i = 0; i < selectValues.length; i++) {
        orderedSelect.addSelection(selectValues[i]);
      }
    }

    /**
     * From http://ejohn.org/blog/javascript-array-remove/
     */
    function removeFromArray(array, from, to) {
      var rest = array.slice((to || from) + 1 || array.length);
      array.length = from < 0 ? array.length + from : from;
      return array.push.apply(array, rest);
    }
  }
  
})(jQuery);