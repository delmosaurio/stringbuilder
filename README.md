# StringBuilder [![Build Status](https://secure.travis-ci.org/delmosaurio/stringbuilder.png)](http://travis-ci.org/delmosaurio/stringbuilder)

An string builder for [Node.js](http://nodejs.org/)

### npm install

```
npm install stringbuilder
```

### Usage

```js
var StringBuilder = require('stringbuilder')

// create an StringBuilder();
var sb = new StringBuilder( {newline:'\r\n'} );
var sbInside = new StringBuilder( {newline:'\r\n'} );

sb.append('some text') // append text
sb.append('{0:YYYY}', new Date()) // append text formatted
sb.appendLine('some text') // append a new line
sb.appendLine('{0:$ 0.1}', 50.1044) // append a new line formatted
ab.append( sbInside );  // append other sbInside into sb
                        // you can append text into `sbInside` after that                        

sbInside.append('another text');

```

extends the String 

```js
var StringBuilder = require('stringbuilder')

StringBuilder.extend('string');

'The current year is {0:YYYY}'.format(new Date(2013)); // The current year is 2013
or the same
String.format('The current year is {0:YYYY}', new Date(2013)); // The current year is 2013
```

### example

```js
var StringBuilder = require('stringbuilder')
  , fs = require('fs');

// Make an markdown file of the beatles
var data = {
    band: "The Beatles"
  , formed: new Date(1960)
  , discography: [
      { name: 'Sentimental Journey', created: new Date(1970), price: (Math.random()*10)+1 }
    , { name: 'Beaucoups of Blues', created: new Date(1970), price: (Math.random()*10)+1 }
    , { name: 'Ringo', created: new Date(1973), price: (Math.random()*10)+1 }
    , { name: 'Goodnight Vienna', created: new Date(1974), price: (Math.random()*10)+1 }
    , { name: 'Ringo\'s Rotogravure', created: new Date(1976), price: (Math.random()*10)+1 }
    , { name: 'Ringo the 4th', created: new Date(1977), price: (Math.random()*10)+1 }
  ]
};

var main = new StringBuilder()
  , discography = new StringBuilder();

// extend de String object
StringBuilder.extend('string');

var filename = './{0}.md'.format(data.band);

var stream = fs.createWriteStream( filename );

main
  .appendLine('## {0}', data.band)
  .appendLine()
  .append('{0} were an English rock band formed in Liverpool in {1:YYYY}.', data.band, data.formed)
  .append('They became the most commercially successful and critically ')
  .append('acclaimed act in the rock music era. The group\'s best-known ')
  .appendLine('lineup consisted of John Lennon, Paul McCartney, George Harrison, and Ringo Starr.')
  .replace(/(John|Paul|George|Ringo)\s(Lennon|McCartney|Harrison|Starr)/g, '[$1 $2](http://en.wikipedia.org/wiki/$1_$2)')
  .appendLine()
  .appendLine('### Discography')
  .appendLine()
  .append(discography); // add an StringBuilder

// append into the discography
data.discography.forEach(function(disk){
  discography.appendLine(' - {0} in {1:YYYY}   *{2:$ 0,0.00 } release price*', disk.name, disk.created, disk.price);
});

var filename = './{0}.md'.format(data.band);
var stream = fs.createWriteStream( filename, 'utf-8' );

main.pipe(stream);
main.flush();
```

output

## The Beatles

The Beatles were an English rock band formed in Liverpool in 1969.They became the most commercially successful and critically acclaimed act in the rock music era. The group's best-known lineup consisted of [John Lennon](http://en.wikipedia.org/wiki/John_Lennon), [Paul McCartney](http://en.wikipedia.org/wiki/Paul_McCartney), [George Harrison](http://en.wikipedia.org/wiki/George_Harrison), and [Ringo Starr](http://en.wikipedia.org/wiki/Ringo_Starr).

### Discography

 - Sentimental Journey in 1969   *$ 4.678 release price*
 - Beaucoups of Blues in 1969   *$ 8.430 release price*
 - Ringo in 1969   *$ 6.816 release price*
 - Goodnight Vienna in 1969   *$ 7.842 release price*
 - Ringo's Rotogravure in 1969   *$ 8.055 release price*
 - Ringo the 4th in 1969   *$ 3.751 release price*


----------------------------------------

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

## more information

### build trough

Please see [async](https://github.com/caolan/async)

This is the way that the StringBuilder build the strings.

```
waterfall
  |-parallel
    |-sb.append(format, ...args)
    |-sb.append(string)
    |-sb.appendLine(format, ...args)
    |-sb.appendLine(string)
  |-sb.insert(...)
  |-sb.replace(...)
  |-parallel
    |-sb.append(format, ...args)
    |-sb.append(StringBuilder())
    |-sb.appendLine(string)
  |-sb.insert(...)
  |-parallel
    |-sb.append(format, ...args)
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