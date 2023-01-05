"use strict";(self.webpackChunkpolinetworkdocs=self.webpackChunkpolinetworkdocs||[]).push([[877],{3905:(e,n,r)=>{r.d(n,{Zo:()=>s,kt:()=>f});var t=r(7294);function o(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function a(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function l(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?a(Object(r),!0).forEach((function(n){o(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function i(e,n){if(null==e)return{};var r,t,o=function(e,n){if(null==e)return{};var r,t,o={},a=Object.keys(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||(o[r]=e[r]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var p=t.createContext({}),c=function(e){var n=t.useContext(p),r=n;return e&&(r="function"==typeof e?e(n):l(l({},n),e)),r},s=function(e){var n=c(e.components);return t.createElement(p.Provider,{value:n},e.children)},d="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},m=t.forwardRef((function(e,n){var r=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,s=i(e,["components","mdxType","originalType","parentName"]),d=c(r),m=o,f=d["".concat(p,".").concat(m)]||d[m]||u[m]||a;return r?t.createElement(f,l(l({ref:n},s),{},{components:r})):t.createElement(f,l({ref:n},s))}));function f(e,n){var r=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var a=r.length,l=new Array(a);l[0]=m;var i={};for(var p in n)hasOwnProperty.call(n,p)&&(i[p]=n[p]);i.originalType=e,i[d]="string"==typeof e?e:o,l[1]=i;for(var c=2;c<a;c++)l[c]=r[c];return t.createElement.apply(null,l)}return t.createElement.apply(null,r)}m.displayName="MDXCreateElement"},6634:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>p,contentTitle:()=>l,default:()=>d,frontMatter:()=>a,metadata:()=>i,toc:()=>c});var t=r(7462),o=(r(7294),r(3905));const a={},l=void 0,i={unversionedId:"app/developer/backend/DBPolifemo/TabelleCalendar",id:"app/developer/backend/DBPolifemo/TabelleCalendar",title:"TabelleCalendar",description:"",source:"@site/docs/app/developer/backend/DBPolifemo/TabelleCalendar.md",sourceDirName:"app/developer/backend/DBPolifemo",slug:"/app/developer/backend/DBPolifemo/TabelleCalendar",permalink:"/docs/app/developer/backend/DBPolifemo/TabelleCalendar",draft:!1,editUrl:"https://github.com/polinetworkorg/polinetworkdocs/docs/app/developer/backend/DBPolifemo/TabelleCalendar.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"TabelleArticle",permalink:"/docs/app/developer/backend/DBPolifemo/TabelleArticle"},next:{title:"Prima installazione su server",permalink:"/docs/app/developer/backend/runOnServer"}},p={},c=[],s={toc:c};function d(e){let{components:n,...r}=e;return(0,o.kt)("wrapper",(0,t.Z)({},s,r,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("mermaid",{value:"classDiagram\n\nclass Day {\n  Date  giorno PK\n}\n\nclass Tipologia{\nint id_tipologia PK,\t\nENUM name_ \n}\n\nclass appartiene{\nint giorno FK,\nint id_tipologia FK\n}\n\nclass lesson{\nint  id_lesson PK,\t\nVARCHAR name_,\nVARCHAR aula,\nTIME orarioInizio,\nTIME orarioFine,\nVARCHAR professore\n}\n\nclass Presente{\nint giorno FK,\nint id_lesson FK\n}\n\nclass Exam{\nint id_exam PK,\t\nVARCHAR name_,\nVARCHAR sede,\nint semestre,\nVARCHAR docente,\ndatetime data,\nint giorno FK\n}\n\nappartiene<|--Day\nTipologia<|--appartiene\n\nPresente<|--Day\nlesson<|--Presente\n\nExam<|--Day\n\n"}))}d.isMDXComponent=!0}}]);