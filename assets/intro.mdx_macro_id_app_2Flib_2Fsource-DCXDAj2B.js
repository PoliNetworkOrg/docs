import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Intro`},i=`## Intro [#intro]
Keep in mind that the aim of this guide is not to provide a complete overview of all the commands in the k8s ecosystem but merely to give an easy to read handbook on very basic stuff 

## Tools needed [#tools-needed]
If you want to monitor or make changes to the pods:
- Cloudflare WARP and an SSH client (\`kubectl\` runs on the node)

If you want to manage secrets:
- Azure CLI

If you want to make changes to the infrastructure:
- Terraform
- [Pre-Commits](https://github.com/antonbabenko/pre-commit-terraform)
- Ansible, only for changes to the node itself

## Configure the tools [#configure-the-tools]
- Connect WARP to PoliNetwork's Cloudflare Zero Trust organization
- SSH into the node with \`\`\`ssh pnadmin@10.43.1.4\`\`\`
- Run kubectl as \`\`\`k3s kubectl\`\`\` (or add the alias \`\`\`alias kubectl='k3s kubectl'\`\`\`)
- Login in Azure CLI using az login

The full procedure is in [Setup](/docs/infrastructure/getting-started/setup).
`,a={contents:[{heading:`intro`,content:`Keep in mind that the aim of this guide is not to provide a complete overview of all the commands in the k8s ecosystem but merely to give an easy to read handbook on very basic stuff`},{heading:`tools-needed`,content:`If you want to monitor or make changes to the pods:`},{heading:`tools-needed`,content:"Cloudflare WARP and an SSH client (`kubectl` runs on the node)"},{heading:`tools-needed`,content:`If you want to manage secrets:`},{heading:`tools-needed`,content:`Azure CLI`},{heading:`tools-needed`,content:`If you want to make changes to the infrastructure:`},{heading:`tools-needed`,content:`Terraform`},{heading:`tools-needed`,content:`Pre-Commits`},{heading:`tools-needed`,content:`Ansible, only for changes to the node itself`},{heading:`configure-the-tools`,content:`Connect WARP to PoliNetwork's Cloudflare Zero Trust organization`},{heading:`configure-the-tools`,content:"SSH into the node with ```ssh pnadmin@10.43.1.4```"},{heading:`configure-the-tools`,content:"Run kubectl as ```k3s kubectl``` (or add the alias ```alias kubectl='k3s kubectl'```)"},{heading:`configure-the-tools`,content:`Login in Azure CLI using az login`},{heading:`configure-the-tools`,content:`The full procedure is in Setup.`}],headings:[{id:`intro`,content:`Intro`},{id:`tools-needed`,content:`Tools needed`},{id:`configure-the-tools`,content:`Configure the tools`}]},o=[{depth:2,url:`#intro`,title:(0,n.jsx)(n.Fragment,{children:`Intro`})},{depth:2,url:`#tools-needed`,title:(0,n.jsx)(n.Fragment,{children:`Tools needed`})},{depth:2,url:`#configure-the-tools`,title:(0,n.jsx)(n.Fragment,{children:`Configure the tools`})}];function s(e){let t={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,ul:`ul`,...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`intro`,children:`Intro`}),`
`,(0,n.jsx)(t.p,{children:`Keep in mind that the aim of this guide is not to provide a complete overview of all the commands in the k8s ecosystem but merely to give an easy to read handbook on very basic stuff`}),`
`,(0,n.jsx)(t.h2,{id:`tools-needed`,children:`Tools needed`}),`
`,(0,n.jsx)(t.p,{children:`If you want to monitor or make changes to the pods:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`Cloudflare WARP and an SSH client (`,(0,n.jsx)(t.code,{children:`kubectl`}),` runs on the node)`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`If you want to manage secrets:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Azure CLI`}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`If you want to make changes to the infrastructure:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Terraform`}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://github.com/antonbabenko/pre-commit-terraform`,children:`Pre-Commits`})}),`
`,(0,n.jsx)(t.li,{children:`Ansible, only for changes to the node itself`}),`
`]}),`
`,(0,n.jsx)(t.h2,{id:`configure-the-tools`,children:`Configure the tools`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`Connect WARP to PoliNetwork's Cloudflare Zero Trust organization`}),`
`,(0,n.jsxs)(t.li,{children:[`SSH into the node with `,(0,n.jsx)(t.code,{children:`ssh pnadmin@10.43.1.4`})]}),`
`,(0,n.jsxs)(t.li,{children:[`Run kubectl as `,(0,n.jsx)(t.code,{children:`k3s kubectl`}),` (or add the alias `,(0,n.jsx)(t.code,{children:`alias kubectl='k3s kubectl'`}),`)`]}),`
`,(0,n.jsx)(t.li,{children:`Login in Azure CLI using az login`}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`The full procedure is in `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/setup`,children:`Setup`}),`.`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};