"use strict";
/**
 * Plug in for adding and rearranging items selected from a single select box 
 * to an ordered list. Options are removed as they are selected so the same
 * option cannot be selected more than once. An example use case would be to 
 * quickly add a list of states for a road trip. Designed to work well with
 * the select2 plugin from http://ivaynberg.github.com/select2/
 *
 * Requires JQuery and JQuery UI with the draggable and 
 * sortable modules. 
 * 
 * <div id="displayArea"></div>
 * <select id="states" style="width:300px" data-display-area-id="displayArea">
 *   <!-- options for all the states -->
 * </select>
 * 
 * <script>
 *   var alreadySelected = ['VT', 'MA', 'CT', 'NY', 'DC'];
 *   $('#states').orderedSelect({ name : 'roadTripStates', intitial : alreadySelected });
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

    // The default generator makes a hidden input with the index following in brackets like "myParameter[0]"
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

    if (initial.length > 0) {
      selectAll(initial);
      selectBox.rebuild();
      displayArea.rebuild();
    }

    /**
     * Return the index of the given entry in the selected array in linear time.
     * TODO: If there's a lot of selections it may be worth using a lookup table 
     */
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

    /**
     * Builds an array of OrderedEntry objects that represents the state of the
     * select box.
     */
    function buildInitialState(selectBox) {
      var options = selectBox.find('option');
      var state = new Array(options.length);
      for (var i = 0; i < options.length; i++) {
        state[i] = new OrderedEntry($(options[i]).val(), $(options[i]).text());
      }
      return state;
    }

    /**
     * Lookup object for finding an OrderedEntry object based on its value in
     * constant time.
     */
    function buildLookup(state) {
      var lookup = {};
      for (var i = 0; i < state.length; i++) {
        lookup[state[i].value] = state[i];
      }
      return lookup;
    }

    /**
     * Bind the rebuild and clearSelection methods for the selectBox
     */
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

    /**
     * Bind the rebuild method for the displayArea
     */
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

    /**
     * Select an array of values (values must correspond the value attribute 
     * of an option within the select box)
     */
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