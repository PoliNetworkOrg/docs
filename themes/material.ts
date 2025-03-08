import type { PrismTheme } from 'prism-react-renderer'

export default {
  darker: {
    plain: {
      color: '#EEFFFF',
      backgroundColor: '#212121',
    },
    styles: [
      {
        types: ['comment', 'prolog', 'doctype', 'cdata', 'block-comment'],
        style: {
          color: '#545454',
          fontStyle: 'italic',
        },
      },
      {
        types: ['attr-name', 'namespace'],
        style: {
          color: '#bb80b3',
        },
      },
      {
        types: ['function', 'function-name'],
        style: {
          color: '#82aaff',
        },
      },
      {
        types: ['unit', 'url', 'number', 'boolean'],
        style: {
          color: '#f78c6c',
        },
      },
      {
        types: [
          'color',
          'hexcode',
          'builtin',
          'property',
          'class',
          'class-name',
          'constant',
          'symbol',
        ],
        style: {
          color: '#ffcb6b',
        },
      },
      {
        types: ['id', 'selector', 'important', 'atrule', 'keyword'],
        style: {
          color: '#c792ea',
        },
      },
      {
        types: [
          'pseudo-class',
          'pseudo-element',
          'inserted',
          'attribute',
          'string',
          'char',
          'attr-value',
          'variable',
          'regex',
        ],
        style: {
          color: '#c3e88d',
        },
      },
      {
        types: ['punctuation', 'operator', 'entity', 'url'],
        style: {
          color: '#89ddff',
        },
      },
      {
        types: ['tag'],
        style: {
          color: '#f07178',
        },
      },
      {
        types: ['parameter', 'deleted'],
        style: {
          color: '#ff5370',
        },
      },
      {
        types: ['italic'],
        style: {
          fontStyle: 'italic',
        },
      },
      {
        types: ['bold', 'important'],
        style: {
          fontWeight: 'bold',
        },
      },
      {
        types: ['entity'],
        style: {
          cursor: 'help',
        },
      },
    ],
  },
} satisfies Record<string, PrismTheme>
