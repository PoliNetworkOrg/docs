import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Intro`},i=`Let's discover **PoliNetwork's Infrastructure in less than 5 minutes**.

## Getting Started [#getting-started]

### Where [#where]

Our infrastructure is deployed on Azure West Europe (Amsterdam).
The Azure resources are described in Terraform (IaC) in the
[terraform](https://github.com/polinetworkorg/terraform) repository.

### What [#what]

Production runs on **K3s**, a lightweight Kubernetes distribution, installed on
a single Azure ARM64 VM called \`k3s01\`. Around it there are a few Azure services
(Key Vault, Managed Disks, Blob Storage, Entra ID) and Cloudflare, which
publishes our websites through a tunnel and gives us SSH access to the VM.

Three layers, three tools:

| Layer | Tool | Repository |
|-------|------|------------|
| Azure resources (VM, disks, network, Key Vaults, identities) | Terraform | [terraform](https://github.com/polinetworkorg/terraform) |
| The VM itself (disks, firewall, K3s, backups) | Ansible | [polinetwork-cd/ansible](https://github.com/polinetworkorg/polinetwork-cd/tree/main/ansible) |
| Everything running inside Kubernetes | Flux (GitOps) | [polinetwork-cd](https://github.com/polinetworkorg/polinetwork-cd) |

### Why [#why]

Why Kubernetes on a single VM instead of plain Docker?
Kubernetes gives us declarative deployments, rolling updates, health checks and
per-application resource limits. Flux keeps the cluster in sync with Git, so the
\`polinetwork-cd\` repository is always the source of truth for what is running.

Why K3s instead of a managed cluster?
Until October 2026 we ran on AKS (Azure Kubernetes Service). K3s gives us the
same Kubernetes API on one VM that we fully control and size ourselves, and it
drops our dependency on AKS-specific add-ons (Azure CSI drivers, Longhorn, ArgoCD).

<Callout type="note" title="Legacy AKS">

The AKS cluster \`aks-polinetwork\` is still defined in the \`environments/legacy\`
Terraform root, but no production workload runs on it anymore.
If you find instructions mentioning \`az aks get-credentials\`, ArgoCD,
\`SecretProviderClass\` or Longhorn (e.g. in old READMEs), they refer to the AKS setup.

</Callout>

## About this documentation [#about-this-documentation]

<Callout type="important">

Most of the docs explain procedures with \`kubectl\`, which you run on the K3s node
over SSH, and with the Azure CLI, which you use for Key Vault secrets.
Make sure to [set up your access](/docs/infrastructure/getting-started/setup) to follow along.

</Callout>

The best place to start is going through the [Getting Started](/docs/infrastructure/getting-started/setup) section to get a high level overview of how things are organized.  
If you're looking for a guide on how to achieve a specific outcome, you can look in the [Guides](/docs/infrastructure/Guides/deploy-a-new-app).
`,a={contents:[{heading:void 0,content:`Let's discover **PoliNetwork's Infrastructure in less than 5 minutes**.`},{heading:`where`,content:`Our infrastructure is deployed on Azure West Europe (Amsterdam).
The Azure resources are described in Terraform (IaC) in the
terraform repository.`},{heading:`what`,content:`Production runs on **K3s**, a lightweight Kubernetes distribution, installed on
a single Azure ARM64 VM called \`k3s01\`. Around it there are a few Azure services
(Key Vault, Managed Disks, Blob Storage, Entra ID) and Cloudflare, which
publishes our websites through a tunnel and gives us SSH access to the VM.`},{heading:`what`,content:`Three layers, three tools:`},{heading:`what`,content:`| Layer                                                        | Tool      | Repository |
| ------------------------------------------------------------ | --------- | ---------- |
| Azure resources (VM, disks, network, Key Vaults, identities) | Terraform | terraform  |`,table:`table-0`},{heading:`what`,content:`| Layer                                         | Tool    | Repository             |
| --------------------------------------------- | ------- | ---------------------- |
| The VM itself (disks, firewall, K3s, backups) | Ansible | polinetwork-cd/ansible |`,table:`table-0`},{heading:`what`,content:`| Layer                                | Tool          | Repository     |
| ------------------------------------ | ------------- | -------------- |
| Everything running inside Kubernetes | Flux (GitOps) | polinetwork-cd |`,table:`table-0`},{heading:`why`,content:`Why Kubernetes on a single VM instead of plain Docker?
Kubernetes gives us declarative deployments, rolling updates, health checks and
per-application resource limits. Flux keeps the cluster in sync with Git, so the
\`polinetwork-cd\` repository is always the source of truth for what is running.`},{heading:`why`,content:`Why K3s instead of a managed cluster?
Until October 2026 we ran on AKS (Azure Kubernetes Service). K3s gives us the
same Kubernetes API on one VM that we fully control and size ourselves, and it
drops our dependency on AKS-specific add-ons (Azure CSI drivers, Longhorn, ArgoCD).`},{heading:`why`,content:"The AKS cluster `aks-polinetwork` is still defined in the `environments/legacy`\nTerraform root, but no production workload runs on it anymore.\nIf you find instructions mentioning `az aks get-credentials`, ArgoCD,\n`SecretProviderClass` or Longhorn (e.g. in old READMEs), they refer to the AKS setup."},{heading:`about-this-documentation`,content:`Most of the docs explain procedures with \`kubectl\`, which you run on the K3s node
over SSH, and with the Azure CLI, which you use for Key Vault secrets.
Make sure to set up your access to follow along.`},{heading:`about-this-documentation`,content:`The best place to start is going through the Getting Started section to get a high level overview of how things are organized.  
If you're looking for a guide on how to achieve a specific outcome, you can look in the Guides.`}],headings:[{id:`getting-started`,content:`Getting Started`},{id:`where`,content:`Where`},{id:`what`,content:`What`},{id:`why`,content:`Why`},{id:`about-this-documentation`,content:`About this documentation`}]},o=[{depth:2,url:`#getting-started`,title:(0,n.jsx)(n.Fragment,{children:`Getting Started`})},{depth:3,url:`#where`,title:(0,n.jsx)(n.Fragment,{children:`Where`})},{depth:3,url:`#what`,title:(0,n.jsx)(n.Fragment,{children:`What`})},{depth:3,url:`#why`,title:(0,n.jsx)(n.Fragment,{children:`Why`})},{depth:2,url:`#about-this-documentation`,title:(0,n.jsx)(n.Fragment,{children:`About this documentation`})}];function s(e){let t={a:`a`,br:`br`,code:`code`,h2:`h2`,h3:`h3`,p:`p`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,...e.components},{Callout:r}=t;return r||l(`Callout`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(t.p,{children:[`Let's discover `,(0,n.jsx)(t.strong,{children:`PoliNetwork's Infrastructure in less than 5 minutes`}),`.`]}),`
`,(0,n.jsx)(t.h2,{id:`getting-started`,children:`Getting Started`}),`
`,(0,n.jsx)(t.h3,{id:`where`,children:`Where`}),`
`,(0,n.jsxs)(t.p,{children:[`Our infrastructure is deployed on Azure West Europe (Amsterdam).
The Azure resources are described in Terraform (IaC) in the
`,(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/terraform`,children:`terraform`}),` repository.`]}),`
`,(0,n.jsx)(t.h3,{id:`what`,children:`What`}),`
`,(0,n.jsxs)(t.p,{children:[`Production runs on `,(0,n.jsx)(t.strong,{children:`K3s`}),`, a lightweight Kubernetes distribution, installed on
a single Azure ARM64 VM called `,(0,n.jsx)(t.code,{children:`k3s01`}),`. Around it there are a few Azure services
(Key Vault, Managed Disks, Blob Storage, Entra ID) and Cloudflare, which
publishes our websites through a tunnel and gives us SSH access to the VM.`]}),`
`,(0,n.jsx)(t.p,{children:`Three layers, three tools:`}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Layer`}),(0,n.jsx)(t.th,{children:`Tool`}),(0,n.jsx)(t.th,{children:`Repository`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:`Azure resources (VM, disks, network, Key Vaults, identities)`}),(0,n.jsx)(t.td,{children:`Terraform`}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/terraform`,children:`terraform`})})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:`The VM itself (disks, firewall, K3s, backups)`}),(0,n.jsx)(t.td,{children:`Ansible`}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/polinetwork-cd/tree/main/ansible`,children:`polinetwork-cd/ansible`})})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:`Everything running inside Kubernetes`}),(0,n.jsx)(t.td,{children:`Flux (GitOps)`}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/polinetwork-cd`,children:`polinetwork-cd`})})]})]})]}),`
`,(0,n.jsx)(t.h3,{id:`why`,children:`Why`}),`
`,(0,n.jsxs)(t.p,{children:[`Why Kubernetes on a single VM instead of plain Docker?
Kubernetes gives us declarative deployments, rolling updates, health checks and
per-application resource limits. Flux keeps the cluster in sync with Git, so the
`,(0,n.jsx)(t.code,{children:`polinetwork-cd`}),` repository is always the source of truth for what is running.`]}),`
`,(0,n.jsx)(t.p,{children:`Why K3s instead of a managed cluster?
Until October 2026 we ran on AKS (Azure Kubernetes Service). K3s gives us the
same Kubernetes API on one VM that we fully control and size ourselves, and it
drops our dependency on AKS-specific add-ons (Azure CSI drivers, Longhorn, ArgoCD).`}),`
`,(0,n.jsx)(r,{type:`note`,title:`Legacy AKS`,children:(0,n.jsxs)(t.p,{children:[`The AKS cluster `,(0,n.jsx)(t.code,{children:`aks-polinetwork`}),` is still defined in the `,(0,n.jsx)(t.code,{children:`environments/legacy`}),`
Terraform root, but no production workload runs on it anymore.
If you find instructions mentioning `,(0,n.jsx)(t.code,{children:`az aks get-credentials`}),`, ArgoCD,
`,(0,n.jsx)(t.code,{children:`SecretProviderClass`}),` or Longhorn (e.g. in old READMEs), they refer to the AKS setup.`]})}),`
`,(0,n.jsx)(t.h2,{id:`about-this-documentation`,children:`About this documentation`}),`
`,(0,n.jsx)(r,{type:`important`,children:(0,n.jsxs)(t.p,{children:[`Most of the docs explain procedures with `,(0,n.jsx)(t.code,{children:`kubectl`}),`, which you run on the K3s node
over SSH, and with the Azure CLI, which you use for Key Vault secrets.
Make sure to `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/setup`,children:`set up your access`}),` to follow along.`]})}),`
`,(0,n.jsxs)(t.p,{children:[`The best place to start is going through the `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/setup`,children:`Getting Started`}),` section to get a high level overview of how things are organized.`,(0,n.jsx)(t.br,{}),`
`,`If you're looking for a guide on how to achieve a specific outcome, you can look in the `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/Guides/deploy-a-new-app`,children:`Guides`}),`.`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};