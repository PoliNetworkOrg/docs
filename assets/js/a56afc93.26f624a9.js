"use strict";(self.webpackChunkpolinetworkdocs=self.webpackChunkpolinetworkdocs||[]).push([[767],{1188:(n,e,o)=>{o.r(e),o.d(e,{assets:()=>l,contentTitle:()=>i,default:()=>d,frontMatter:()=>s,metadata:()=>t,toc:()=>c});const t=JSON.parse('{"id":"app/developer/backend/DBPolifemo/TabellaGroups","title":"TabellaGroups","description":"","source":"@site/docs/app/developer/backend/DBPolifemo/TabellaGroups.md","sourceDirName":"app/developer/backend/DBPolifemo","slug":"/app/developer/backend/DBPolifemo/TabellaGroups","permalink":"/docs/app/developer/backend/DBPolifemo/TabellaGroups","draft":false,"unlisted":false,"editUrl":"https://github.com/polinetworkorg/polinetworkdocs/tree/main/docs/app/developer/backend/DBPolifemo/TabellaGroups.md","tags":[],"version":"current","frontMatter":{},"sidebar":"docs","previous":{"title":"schermate","permalink":"/docs/app/design/schermate"},"next":{"title":"TabelleArticle","permalink":"/docs/app/developer/backend/DBPolifemo/TabelleArticle"}}');var a=o(5105),r=o(3881);const s={},i=void 0,l={},c=[];function p(n){const e={code:"code",pre:"pre",...(0,r.R)(),...n.components};return(0,a.jsx)(e.pre,{children:(0,a.jsx)(e.code,{className:"language-mermaid",children:"classDiagram\n\nclass Gruppo {\n  String class\n  ENUM office\n  int primary key id\n  ENUM degree\n  ENUM school\n  String id_link\n  ENUM language\n  char type\n  String year\n  ENUM platform\n  int permanent_id \n  datetime LastUpdateInviteLinkTime\n  ENUM Linkfunzionante\n}\n\nclass office{\n  <<enumeration>>\n  Bovisa\n  Como\n  Cremona\n  Lecco\n  Leonardo\n}\n\nclass degree{\n  <<enumeration>>\n  LT\n  LM\n  LM\n}\n\nclass school{\n  <<enumeration>>\n  ICAT\n  DES\n  3I\n  ICAT+3I\n  AUIC\n}\n\nclass language{\n  <<enumeration>>\n  ITA\n  ENG\n}\n\nclass type{\n  <<enumeration>>\n  S\n  C\n  E\n}\n\nclass platform{\n  <<enumeration>>\n  WA\n  TG\n  FB\n}\n\nclass Linkfunzionante{\n  <<enumeration>>\n  Y\n  N\n}\n"})})}function d(n={}){const{wrapper:e}={...(0,r.R)(),...n.components};return e?(0,a.jsx)(e,{...n,children:(0,a.jsx)(p,{...n})}):p(n)}},3881:(n,e,o)=>{o.d(e,{R:()=>s,x:()=>i});var t=o(8101);const a={},r=t.createContext(a);function s(n){const e=t.useContext(r);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function i(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(a):n.components||a:s(n.components),t.createElement(r.Provider,{value:e},n.children)}}}]);