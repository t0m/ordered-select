A simple jquery plugin for handling web input backed by an ordered collection. 
It takes input from the user via a selectbox and submits data via an array of 
hidden inputs following whatever naming convention the backend requires 
(e.g. nameOfInput[0] ... nameOfInput[n]).  The entered values can be reordered
via drag and drop and the plugin will handle the hidden inputs automatically.


![preview image](http://t0m.github.com/ordered-select/screenshot.png)

Given a display area div and a selectbox:

```
<div id="stateDisplayArea"></div>
<select id="statesToVisitSelect">
  <!-- collection of state options -->
</select>
```

To initialize a ordered list, just give a name and the id of the 
display area:

```
$('#statesToVisitSelect').orderedSelect({ name : 'statesToVisit', displayArea : 'stateDisplayArea'});
```
  

Alternately, you can give the selectbox a "data-display-area-id" attribute
pointing to your display area:

```
<div id="stateDisplayArea"></div>
<select id="statesToVisitSelect" data-display-area-id="stateDisplayArea">
  <!-- collection of state options -->
</select>
```

And then you'd just have to give a name:

```
$('#statesToVisitSelect').orderedSelect({ name : 'statesToVisit'});
```
  
  
To prepopulate the widget with data, use the "initial" option with an array
of option values from the selectbox. The text to display will be pulled from 
the corresponding option text:

```
$('#statesToVisitSelect').orderedSelect({ name : 'statesToVisit', initial : ['CT', 'NY', 'DC']});
```

The default name formatter will take the name you pass in and create hidden 
inputs with the index number in brackets like so:

```
<input type="hidden" name="statesToVisit[0]" value="CT"/>
<input type="hidden" name="statesToVisit[1]" value="NY"/>
<input type="hidden" name="statesToVisit[2]" value="DC"/>
```

In order to modify this you can specify your own "generateHiddenInput" function.
For example, to submit a rails-style hash where the key is the array index you 
would use:

```
var generateRailsHiddenInput = function(name, entry, index) {
  var railsStyleName = name + '[' + index + ']';
  return '<input type="hidden" name="' + railsStyleName + '" value="' + entry.value + '"/>';
}

$('#statesToVisitSelect').orderedSelect({ 
  name : 'statesToVisit', 
  generateHiddenInput : generateRailsHiddenInput 
});
```
