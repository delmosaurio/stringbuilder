# StringBuilder [![Build Status](https://secure.travis-ci.org/delmosaurio/stringbuilder.png)](http://travis-ci.org/delmosaurio/stringbuilder) - under development 

An string builder for [Node.js](http://nodejs.org/)

### npm install

```
npm install stringbuilder
```

## usage

```js
var StringBuilder = require('stringbuilder');

var sb1 = new StringBuilder();
var sb2 = new StringBuilder();

sb1
  .append(' consectetur {0} elit,', 'adipISIcing')
  .append(sb2)
  .insert('Lorem ipsum dolor sit amet,', 0)
  .replace('adipISIcing', 'adipisicing');

sb2
  .append(' sed do {0} dolore magna aliqua.', 'eiusmod tempor incididunt ut labore et')
  .append(' Ut {0} veniam,', 'enim ad minim')
  .append(' quis {0} laboris', 'nostrud exercitation ullamco')
  .append(' nisi {0} ex ea commodo consequat.', 'ut aliquip')
  .append(' Duis {0} reprehenderit in voluptate', 'aute irure dolor in')
  .append(' velit esse cillum dolore eu fugiat nulla pariatur.')
  .append(' Excepteur sint occaecat cupidatat non proident,')
  .append(' sunt in culpa qui officia deserunt')
  .append(' mollit anim id est laborum.');

sb1.build(function(err, result){
	console.log(result);	
});

```

output

```
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
```

### formats

To apply formats please see [moment](http://momentjs.com/) and [numeral](http://numeraljs.com/)

```js
var sb = new StringBuilder();

sb.append('{0:format}');

```

dates examples

```js
sb.append('{0:L}', new date());      // 04/29/2013
sb.append('{0:LL}', new date());     // April 29 2013
sb.append('{0:LLL}', new date());    // April 29 2013 9:13 AM
sb.append('{0:LLLL}', new date());   // Monday, April 29 2013 9:13 AM
```

numbers examples

```js
sb.append('{0:$0,0.00}', 1000.234);   // $0,000.23
sb.append('{0:0%}', 1);               // 100%
sb.append('{0:0b}', 100);             // 100B
sb.append('{0:(0,0.0000)}', -10000);  // (10,000.0000)
```

## license 

(The MIT License)

Copyright (c) 2012-2013 Delmo Carrozzo &lt;dcardev@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.