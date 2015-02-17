# rubbish-erb-parser [![Build Status](https://travis-ci.org/callumacrae/rubbish-erb-parser.svg)](https://travis-ci.org/callumacrae/rubbish-erb-parser)

This is an erb parser which only supports a tiny subset of erb. We're using it
in the development of components at Lost My Name, but this library is basically
not much use for many things.

It's a subset because the Ruby you write has to be valid JavaScript. The
following will not render:

```ruby
<%= image_helper 'dog.png', foo: 'bar' %>
```

You have to write the following instead:

```js
<%= image_helper('dog.png', { foo: 'bar' }) %>
```

Niiice.

Also it currently only supports two helpers, `image_path` and `image_tag`.

And it doesn't support `<% %>` at all because nunjucks didn't like it.

## Install

```
$ npm install --save rubbish-erb-parser
```

## License

If for some reason you want to use this, it's released under the MIT license.