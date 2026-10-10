import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Prima installazione su server`},i=`\`\`\`
	sudo apt install dotnet jq unzip certbot
	mkdir PoliFemoBackend && cd PoliFemoBackend
	wget https://raw.githubusercontent.com/PoliNetworkOrg/PoliFemoBackend/main/run.sh
	sudo chmod +x run.sh
	sudo certbot certonly --standalone -d api.polinetwork.org
	mkdir conf.d && cd conf.d
	mkdir https
	sudo openssl pkcs12 -export -out $HOME/PoliFemoBackend/conf.d/https/dev_cert.pfx -inkey /etc/letsencrypt/live/api.polinetwork.org/privkey.pem -in /etc/letsencrypt/live/api.polinetwork.org/cert.pem -certfile /etc/letsencrypt/live/api.polinetwork.org/chain.pem
\`\`\`

Inserire password a scelta

\`\`\`
	cd ..
	sudo ./run.sh
\`\`\`

Poi fare un commit senza uscire dalla sessione SSH, se si riavvia correttamente si può uscire.
`,a={contents:[{heading:void 0,content:`Inserire password a scelta`},{heading:void 0,content:`Poi fare un commit senza uscire dalla sessione SSH, se si riavvia correttamente si può uscire.`}],headings:[]},o=[];function s(e){let t={code:`code`,p:`p`,pre:`pre`,span:`span`,...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	sudo apt install dotnet jq unzip certbot`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	mkdir PoliFemoBackend && cd PoliFemoBackend`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	wget https://raw.githubusercontent.com/PoliNetworkOrg/PoliFemoBackend/main/run.sh`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	sudo chmod +x run.sh`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	sudo certbot certonly --standalone -d api.polinetwork.org`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	mkdir conf.d && cd conf.d`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	mkdir https`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	sudo openssl pkcs12 -export -out $HOME/PoliFemoBackend/conf.d/https/dev_cert.pfx -inkey /etc/letsencrypt/live/api.polinetwork.org/privkey.pem -in /etc/letsencrypt/live/api.polinetwork.org/cert.pem -certfile /etc/letsencrypt/live/api.polinetwork.org/chain.pem`})})]})})}),`
`,(0,n.jsx)(t.p,{children:`Inserire password a scelta`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	cd ..`})}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`	sudo ./run.sh`})})]})})}),`
`,(0,n.jsx)(t.p,{children:`Poi fare un commit senza uscire dalla sessione SSH, se si riavvia correttamente si può uscire.`})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};