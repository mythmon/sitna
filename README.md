# Sitna

A PDF viewer intended to mimic a physical set of books, based on [PDF.js][].

Currently it is little more than a demo of PDF.js. Eventually it should be
able to replace a small stack of books that have bookmarks stuck in them,
pages tagged with sticky tabs, and a finger holding a place temporarily. It
should be possible to view multiple pages from a PDF that aren't necessarily
adjacent.

The primary intended use case is the reference books for tabletop roleplaying
games, such as Dungeons and Dragons or Chronicles of Darkness, viewed on a
large tablet such as an iPad Pro or a Pixel Slate.

## Development

Sitna is made with [Web Components][] and [Typescript]. You can set up and
run the project for development like normal JS web app:

```
npm install
npm start
```

Linting is handled with ESLint and Prettier. To run the lints manually:

```
npm run lint
```

[Web Components]: https://developer.mozilla.org/en-US/docs/Web/Web_Components
[Typescript]: https://www.typescriptlang.org/
[Therapist]: https://github.com/rehandalal/therapist

## What's the name?

_Sitna_ is the Lojban word for "[reference][]" as in _"mi sitna lo cukta"_: "I
reference the book".

[PDF.js]: https://mozilla.github.io/pdf.js/
[reference]: http://vlasisku.lojban.org/vlasisku/sitna
