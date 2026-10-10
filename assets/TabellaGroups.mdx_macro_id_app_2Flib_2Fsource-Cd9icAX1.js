import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`TabellaGroups`},i=`\`\`\`mermaid
classDiagram

class Gruppo {
  String class
  ENUM office
  int primary key id
  ENUM degree
  ENUM school
  String id_link
  ENUM language
  char type
  String year
  ENUM platform
  int permanent_id 
  datetime LastUpdateInviteLinkTime
  ENUM Linkfunzionante
}

class office{
  <<enumeration>>
  Bovisa
  Como
  Cremona
  Lecco
  Leonardo
}

class degree{
  <<enumeration>>
  LT
  LM
  LM
}

class school{
  <<enumeration>>
  ICAT
  DES
  3I
  ICAT+3I
  AUIC
}

class language{
  <<enumeration>>
  ITA
  ENG
}

class type{
  <<enumeration>>
  S
  C
  E
}

class platform{
  <<enumeration>>
  WA
  TG
  FB
}

class Linkfunzionante{
  <<enumeration>>
  Y
  N
}
\`\`\`
`,a={contents:[],headings:[]},o=[];function s(e){let{Mermaid:t}=e.components||{};return t||l(`Mermaid`,!0),(0,n.jsx)(t,{chart:`classDiagram

class Gruppo {
  String class
  ENUM office
  int primary key id
  ENUM degree
  ENUM school
  String id_link
  ENUM language
  char type
  String year
  ENUM platform
  int permanent_id 
  datetime LastUpdateInviteLinkTime
  ENUM Linkfunzionante
}

class office{
  <<enumeration>>
  Bovisa
  Como
  Cremona
  Lecco
  Leonardo
}

class degree{
  <<enumeration>>
  LT
  LM
  LM
}

class school{
  <<enumeration>>
  ICAT
  DES
  3I
  ICAT+3I
  AUIC
}

class language{
  <<enumeration>>
  ITA
  ENG
}

class type{
  <<enumeration>>
  S
  C
  E
}

class platform{
  <<enumeration>>
  WA
  TG
  FB
}

class Linkfunzionante{
  <<enumeration>>
  Y
  N
}`})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};