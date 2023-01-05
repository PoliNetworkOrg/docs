"use strict";(self.webpackChunkpolinetworkdocs=self.webpackChunkpolinetworkdocs||[]).push([[54],{3905:(e,n,t)=>{t.d(n,{Zo:()=>s,kt:()=>f});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var c=r.createContext({}),p=function(e){var n=r.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},s=function(e){var n=p(e.components);return r.createElement(c.Provider,{value:n},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},m=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),d=p(t),m=i,f=d["".concat(c,".").concat(m)]||d[m]||u[m]||a;return t?r.createElement(f,o(o({ref:n},s),{},{components:t})):r.createElement(f,o({ref:n},s))}));function f(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,o=new Array(a);o[0]=m;var l={};for(var c in n)hasOwnProperty.call(n,c)&&(l[c]=n[c]);l.originalType=e,l[d]="string"==typeof e?e:i,o[1]=l;for(var p=2;p<a;p++)o[p]=t[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},6214:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=t(7462),i=(t(7294),t(3905));const a={},o=void 0,l={unversionedId:"app/developer/backend/DBPolifemo/TabelleArticle",id:"app/developer/backend/DBPolifemo/TabelleArticle",title:"TabelleArticle",description:"",source:"@site/docs/app/developer/backend/DBPolifemo/TabelleArticle.md",sourceDirName:"app/developer/backend/DBPolifemo",slug:"/app/developer/backend/DBPolifemo/TabelleArticle",permalink:"/docs/app/developer/backend/DBPolifemo/TabelleArticle",draft:!1,editUrl:"https://github.com/polinetworkorg/polinetworkdocs/docs/app/developer/backend/DBPolifemo/TabelleArticle.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"TabellaGroups",permalink:"/docs/app/developer/backend/DBPolifemo/TabellaGroups"},next:{title:"TabelleCalendar",permalink:"/docs/app/developer/backend/DBPolifemo/TabelleCalendar"}},c={},p=[],s={toc:p};function d(e){let{components:n,...t}=e;return(0,i.kt)("wrapper",(0,r.Z)({},s,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("mermaid",{value:"classDiagram\n\nclass Article {\n  int primary key id_article\n  String title\n  String subtitle\n  String content\n  Datetime publishTime\n  Datetime targetTime\n  String music\n  FK id_media\n  int replace_id\n  bool notify\n}\n\nclass hashtag{\n  int primary key id_hashtag\n  String text\n}\n\nclass territorial{\n  int primary key id_territorial\n  String name\n}\n\nclass media{\n  int primary key id_media\n}\n\n\nclass link_{\n  int primary key id_link\n  String link\n  FK id_media\n}\n\nclass point{\n  int primary key id_point\n  float latitude\n  float longitude\n}\n\nclass location{\n  int primary key id_location\n  String name\n  String link\n  FK id_point  \n}\n\nclass author{\n  int primary key id_author\n  String name\n  String link\n}\n\nclass source{\n  int primary key id_source\n  String name\n  String link\n}\n\nclass scritto{\n  FK id_author\n  FK id_article\n}\n\nclass su{\n  FK id_territorial\n  FK id_article\n}\n\nclass prende{\n  FK id_source\n  FK id_article\n}\n\nclass where{\n  FK id_location\n  FK id_article\n}\n\nclass tag{\n  FK id_hashtag\n  FK id_article\n}\n\nprende <|--Article\nsource <|--prende\n\nsu <|--Article\nterritorial<|--su\n\ntag <|--Article\nhashtag<|--tag\n\nscritto <|--Article\nauthor<|--scritto\n\nwhere <|--Article\nlocation<|--where\npoint <|--location\n\nmedia <|--Article\nlink_<|--media\n\n\n"}))}d.isMDXComponent=!0}}]);