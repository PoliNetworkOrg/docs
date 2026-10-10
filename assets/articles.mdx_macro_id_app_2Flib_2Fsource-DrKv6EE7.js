import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`articles`},i=`\`\`\`mermaid
classDiagram

Article *-- Author
Article *-- Position
Article *-- Point
Article *-- Territorial
Article *-- Collection

class Article {
  int id
  String title
  String? subtitle
  String text //html
  Author[] authors
  String[]? sources
  Position[]? positions
  String[]? hashtag
  Territorial[]? territorials
  DateTime publishTime
  DateTime? targetTime
  String[]? music
  String[]? photos
  Collection? collection
}

class Author {
  int id
  String name
  String? link
}

class Position {
   Point point
   string name
}

class Point {
   decimal x
   decimal y
}

class Territorial {
   int id
   String name
}

class Collection {
	int id
	String name
	String? link
}
\`\`\`
`,a={contents:[],headings:[]},o=[];function s(e){let{Mermaid:t}=e.components||{};return t||l(`Mermaid`,!0),(0,n.jsx)(t,{chart:`classDiagram

Article *-- Author
Article *-- Position
Article *-- Point
Article *-- Territorial
Article *-- Collection

class Article {
  int id
  String title
  String? subtitle
  String text //html
  Author[] authors
  String[]? sources
  Position[]? positions
  String[]? hashtag
  Territorial[]? territorials
  DateTime publishTime
  DateTime? targetTime
  String[]? music
  String[]? photos
  Collection? collection
}

class Author {
  int id
  String name
  String? link
}

class Position {
   Point point
   string name
}

class Point {
   decimal x
   decimal y
}

class Territorial {
   int id
   String name
}

class Collection {
	int id
	String name
	String? link
}`})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};