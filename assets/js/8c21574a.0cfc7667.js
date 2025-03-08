"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([["4487"],{7791:function(e,n,r){r.r(n),r.d(n,{default:()=>p,frontMatter:()=>a,metadata:()=>t,assets:()=>c,toc:()=>d,contentTitle:()=>i});var t=JSON.parse('{"id":"app/developer/backend/runOnServer","title":"Prima installazione su server","description":"Inserire password a scelta","source":"@site/docs/app/developer/backend/runOnServer.md","sourceDirName":"app/developer/backend","slug":"/app/developer/backend/runOnServer","permalink":"/docs/app/developer/backend/runOnServer","draft":false,"unlisted":false,"editUrl":"https://github.com/polinetworkorg/docs/tree/main/docs/app/developer/backend/runOnServer.md","tags":[],"version":"current","frontMatter":{},"sidebar":"polifemo","previous":{"title":"TabelleCalendar","permalink":"/docs/app/developer/backend/DBPolifemo/TabelleCalendar"},"next":{"title":"ToDo Backend","permalink":"/docs/app/developer/backend/todo_backend"}}'),o=r("6773"),s=r("6070");let a={},i="Prima installazione su server",c={},d=[];function l(e){let n={code:"code",h1:"h1",header:"header",p:"p",pre:"pre",...(0,s.a)(),...e.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(n.header,{children:(0,o.jsx)(n.h1,{id:"prima-installazione-su-server",children:"Prima installazione su server"})}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{children:"	sudo apt install dotnet jq unzip certbot\n	mkdir PoliFemoBackend && cd PoliFemoBackend\n	wget https://raw.githubusercontent.com/PoliNetworkOrg/PoliFemoBackend/main/run.sh\n	sudo chmod +x run.sh\n	sudo certbot certonly --standalone -d api.polinetwork.org\n	mkdir conf.d && cd conf.d\n	mkdir https\n	sudo openssl pkcs12 -export -out $HOME/PoliFemoBackend/conf.d/https/dev_cert.pfx -inkey /etc/letsencrypt/live/api.polinetwork.org/privkey.pem -in /etc/letsencrypt/live/api.polinetwork.org/cert.pem -certfile /etc/letsencrypt/live/api.polinetwork.org/chain.pem\n"})}),"\n",(0,o.jsx)(n.p,{children:"Inserire password a scelta"}),"\n",(0,o.jsx)(n.pre,{children:(0,o.jsx)(n.code,{children:"	cd ..\n	sudo ./run.sh\n"})}),"\n",(0,o.jsx)(n.p,{children:"Poi fare un commit senza uscire dalla sessione SSH, se si riavvia correttamente si pu\xf2 uscire."})]})}function p(e={}){let{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,o.jsx)(n,{...e,children:(0,o.jsx)(l,{...e})}):l(e)}},6070:function(e,n,r){r.d(n,{Z:function(){return i},a:function(){return a}});var t=r(1699);let o={},s=t.createContext(o);function a(e){let n=t.useContext(s);return t.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:a(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);