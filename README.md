A simple jquery plugin for handling web input backed by an ordered collection. 
It takes input from the user via a selectbox and submits data via an array of 
hidden inputs following whatever naming convention the backend requires 
(e.g. nameOfInput[0] ... nameOfInput[n]).  The entered values can be reordered
via drag and drop and the plugin will handle the hidden inputs automatically.


![preview image](http://t0m.github.com/ordered-select/screenshot.png)

Given a display area and a selectbox:

```
<div id="stateDisplayArea"></div>
<select id="statesToVisitSelect">
  <!-- collection of state options -->
</select>
```

To initialize a ordered list:

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

