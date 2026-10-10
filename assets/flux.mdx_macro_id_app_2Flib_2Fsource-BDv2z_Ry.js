import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Flux`,description:`How Flux deploys the polinetwork-cd repository to the K3s cluster.`},i=`## What is Flux? [#what-is-flux]

[Flux](https://fluxcd.io/) is a GitOps tool: it runs inside the cluster, watches a
Git repository and applies whatever it finds there, over and over. If someone
changes a resource by hand, Flux puts it back the way Git says. It replaced the
ArgoCD instance we had on AKS.

Ours is installed by Ansible through the
[Flux Operator](https://fluxcd.control-plane.io/operator/), and it syncs the
**\`main\`** branch of
[polinetwork-cd](https://github.com/polinetworkorg/polinetwork-cd), starting
from the \`clusters/k3s\` folder.

<Callout type="important">

Merging to \`main\` in polinetwork-cd **is** deploying to production.
Never \`kubectl apply\` or \`kubectl edit\` a resource that Flux manages: Flux reverts
it at the next reconciliation.

</Callout>

## Repository layout [#repository-layout]

\`\`\`bash
📁 polinetworkorg/polinetwork-cd/
 ├─ 📁 ansible/                 # Host configuration (see K3s Node)
 ├─ 📁 clusters/k3s/            # Entry point: one Flux Kustomization per component
 │   ├─ infrastructure-*.yaml   # Platform components
 │   └─ 📁 apps/                # One file per app + kustomization.yaml listing them
 ├─ 📁 infrastructure/          # Manifests of the platform components
 ├─ 📁 apps/                    # Manifests of the apps, one folder per namespace
 │   ├─ 📁 backend/
 │   ├─ 📁 web/
 │   └─ ...
 └─ 📁 tests/                   # Manifest checks run in CI
\`\`\`

Folders at the root of the repository (\`bot-prod/\`, \`bot-rooms/\`, \`mariadb/\`, ...)
are leftovers from the AKS era, all disabled. Flux ignores them.

### \`clusters/k3s\` [#clustersk3s]

Each file here is a Flux
[\`Kustomization\`](https://fluxcd.io/flux/components/kustomize/kustomizations/)
that points to one folder of \`infrastructure/\` or \`apps/\`. It also sets:

- \`dependsOn\`: what must be ready first. Apps wait for the secret stores, storage
  and Traefik; \`backend\` also waits for \`postgres\` and \`redis\`.
- \`prune: true\`: a resource removed from Git is deleted from the cluster.
- \`wait: true\`: the Kustomization is ready only when all its resources are healthy.
- \`interval: 30m\`: a full reconciliation at least every 30 minutes, even if Git
  didn't change.

\`clusters/k3s/apps/kustomization.yaml\` lists the apps Flux runs. An app file
that is not listed there does nothing.

### Platform components (\`infrastructure/\`) [#platform-components-infrastructure]

| Component | What it does |
|-----------|--------------|
| \`security\` | Admission policies (no host namespaces, no pods as \`keyvault-reader\`) |
| \`storage\` | [local-path provisioner](https://github.com/rancher/local-path-provisioner) and the \`fast\` / \`standard\` storage classes |
| \`traefik\` | Makes the bundled Traefik a \`ClusterIP\` service |
| \`external-secrets\` | [External Secrets Operator](https://external-secrets.io/), installed with Helm |
| \`secret-stores\` | The \`kv-pn-apps\` and \`kv-pn-infra\` \`ClusterSecretStore\`s |
| \`cloudflared\` | The Cloudflare Tunnel connector (2 replicas) |
| \`image-automation\` | Detects new \`latest\` images on GHCR (see below) |
| \`node-exporter\` | Node metrics for Prometheus |
| \`flux-web\` | The Flux Web UI at [flux.polinetwork.org](https://flux.polinetwork.org) |

## Automatic image updates [#automatic-image-updates]

Most of our apps are deployed from the \`latest\` tag of an image on
[GHCR](https://github.com/orgs/PoliNetworkOrg/packages). A tag can point to a
different image over time, so Flux resolves it to a **digest** and deploys that
digest. When the digest changes, the app rolls out the new image.

\`\`\`mermaid
flowchart LR
  ci[App CI pushes :latest] --> gh[GitHub package event]
  gh -- webhook --> rcv[Flux Receiver]
  rcv --> prov[ResourceSetInputProvider<br/>resolves latest to a digest]
  prov --> rs[ResourceSet<br/>renders the app Kustomization]
  rs --> app[Deployment rolls out]
\`\`\`

The pieces, all in polinetwork-cd:

- \`infrastructure/image-automation/image-providers.yaml\`: one
  \`ResourceSetInputProvider\` per image, which reads the \`latest\` tag and its digest.
- \`infrastructure/image-automation/receiver.yaml\`: a Flux \`Receiver\` called by
  the PoliNetworkOrg organization webhook on \`package\` events, at
  \`flux-webhook.polinetwork.org\`. The webhook's HMAC signature is its only
  authentication. If the webhook doesn't fire, the providers poll every 6 hours anyway.
- \`clusters/k3s/apps/<app>.yaml\`: for apps with automatic updates this is a
  \`ResourceSet\` instead of a plain Kustomization. It generates the app's
  Kustomization with an \`images\` override that pins the digest.

Apps that don't need automatic updates (databases, monitoring, ...) pin their
image in the manifest, and you bump them with a PR.

## Day-to-day [#day-to-day]

### Web UI [#web-ui]

[flux.polinetwork.org](https://flux.polinetwork.org) shows every Kustomization,
HelmRelease and ResourceSet, with its status, last applied revision and errors.
You log in through [auth.polinetwork.org](https://auth.polinetwork.org); only
the Direttivo is admitted. From the UI you can **reconcile** (sync now),
**suspend** and **resume** any resource.

### From the node [#from-the-node]

The \`flux\` CLI isn't installed on the node, but the Flux resources are regular
Kubernetes objects:

\`\`\`sh
# Status of all the Kustomizations (apps and infrastructure)
kubectl get kustomizations -n flux-system

# Latest image resolved for each app
kubectl get resourcesetinputproviders -n flux-system

# Why is an app not ready?
kubectl describe kustomization <app> -n flux-system

# Sync now instead of waiting: fetch the latest commit, then apply it
kubectl annotate --overwrite gitrepository flux-system -n flux-system \\
  reconcile.fluxcd.io/requestedAt="$(date +%s)"
kubectl annotate --overwrite kustomization <app> -n flux-system \\
  reconcile.fluxcd.io/requestedAt="$(date +%s)"
\`\`\`

<Callout type="tip" title="Suspending an app">

To stop Flux from touching an app while you debug it by hand, **suspend** its
Kustomization from the Web UI. Remember to **resume** it afterwards: a suspended
app also stops receiving image updates.

</Callout>

## References [#references]

- [Flux Documentation](https://fluxcd.io/flux/)
- [Flux Operator Documentation](https://fluxcd.control-plane.io/operator/)
- [ResourceSets](https://fluxcd.control-plane.io/operator/resourcesets/introduction/)
- [PoliNetwork-CD Repository](https://github.com/polinetworkorg/polinetwork-cd)
`,a={contents:[{heading:`what-is-flux`,content:`Flux is a GitOps tool: it runs inside the cluster, watches a
Git repository and applies whatever it finds there, over and over. If someone
changes a resource by hand, Flux puts it back the way Git says. It replaced the
ArgoCD instance we had on AKS.`},{heading:`what-is-flux`,content:`Ours is installed by Ansible through the
Flux Operator, and it syncs the
**\`main\`** branch of
polinetwork-cd, starting
from the \`clusters/k3s\` folder.`},{heading:`what-is-flux`,content:"Merging to `main` in polinetwork-cd **is** deploying to production.\nNever `kubectl apply` or `kubectl edit` a resource that Flux manages: Flux reverts\nit at the next reconciliation."},{heading:`repository-layout`,content:"Folders at the root of the repository (`bot-prod/`, `bot-rooms/`, `mariadb/`, ...)\nare leftovers from the AKS era, all disabled. Flux ignores them."},{heading:`clustersk3s`,content:"Each file here is a Flux\n`Kustomization`\nthat points to one folder of `infrastructure/` or `apps/`. It also sets:"},{heading:`clustersk3s`,content:"`dependsOn`: what must be ready first. Apps wait for the secret stores, storage\nand Traefik; `backend` also waits for `postgres` and `redis`."},{heading:`clustersk3s`,content:"`prune: true`: a resource removed from Git is deleted from the cluster."},{heading:`clustersk3s`,content:"`wait: true`: the Kustomization is ready only when all its resources are healthy."},{heading:`clustersk3s`,content:"`interval: 30m`: a full reconciliation at least every 30 minutes, even if Git\ndidn't change."},{heading:`clustersk3s`,content:"`clusters/k3s/apps/kustomization.yaml` lists the apps Flux runs. An app file\nthat is not listed there does nothing."},{heading:`platform-components-infrastructure`,content:"| Component  | What it does                                                          |\n| ---------- | --------------------------------------------------------------------- |\n| `security` | Admission policies (no host namespaces, no pods as `keyvault-reader`) |",table:`table-0`},{heading:`platform-components-infrastructure`,content:"| Component | What it does                                                       |\n| --------- | ------------------------------------------------------------------ |\n| `storage` | local-path provisioner and the `fast` / `standard` storage classes |",table:`table-0`},{heading:`platform-components-infrastructure`,content:"| Component | What it does                                    |\n| --------- | ----------------------------------------------- |\n| `traefik` | Makes the bundled Traefik a `ClusterIP` service |",table:`table-0`},{heading:`platform-components-infrastructure`,content:`| Component          | What it does                                   |
| ------------------ | ---------------------------------------------- |
| \`external-secrets\` | External Secrets Operator, installed with Helm |`,table:`table-0`},{heading:`platform-components-infrastructure`,content:"| Component       | What it does                                             |\n| --------------- | -------------------------------------------------------- |\n| `secret-stores` | The `kv-pn-apps` and `kv-pn-infra` `ClusterSecretStore`s |",table:`table-0`},{heading:`platform-components-infrastructure`,content:`| Component     | What it does                                 |
| ------------- | -------------------------------------------- |
| \`cloudflared\` | The Cloudflare Tunnel connector (2 replicas) |`,table:`table-0`},{heading:`platform-components-infrastructure`,content:"| Component          | What it does                                    |\n| ------------------ | ----------------------------------------------- |\n| `image-automation` | Detects new `latest` images on GHCR (see below) |",table:`table-0`},{heading:`platform-components-infrastructure`,content:`| Component       | What it does                |
| --------------- | --------------------------- |
| \`node-exporter\` | Node metrics for Prometheus |`,table:`table-0`},{heading:`platform-components-infrastructure`,content:`| Component  | What it does                            |
| ---------- | --------------------------------------- |
| \`flux-web\` | The Flux Web UI at flux.polinetwork.org |`,table:`table-0`},{heading:`automatic-image-updates`,content:`Most of our apps are deployed from the \`latest\` tag of an image on
GHCR. A tag can point to a
different image over time, so Flux resolves it to a **digest** and deploys that
digest. When the digest changes, the app rolls out the new image.`},{heading:`automatic-image-updates`,content:`The pieces, all in polinetwork-cd:`},{heading:`automatic-image-updates`,content:"`infrastructure/image-automation/image-providers.yaml`: one\n`ResourceSetInputProvider` per image, which reads the `latest` tag and its digest."},{heading:`automatic-image-updates`,content:"`infrastructure/image-automation/receiver.yaml`: a Flux `Receiver` called by\nthe PoliNetworkOrg organization webhook on `package` events, at\n`flux-webhook.polinetwork.org`. The webhook's HMAC signature is its only\nauthentication. If the webhook doesn't fire, the providers poll every 6 hours anyway."},{heading:`automatic-image-updates`,content:"`clusters/k3s/apps/<app>.yaml`: for apps with automatic updates this is a\n`ResourceSet` instead of a plain Kustomization. It generates the app's\nKustomization with an `images` override that pins the digest."},{heading:`automatic-image-updates`,content:`Apps that don't need automatic updates (databases, monitoring, ...) pin their
image in the manifest, and you bump them with a PR.`},{heading:`web-ui`,content:`flux.polinetwork.org shows every Kustomization,
HelmRelease and ResourceSet, with its status, last applied revision and errors.
You log in through auth.polinetwork.org; only
the Direttivo is admitted. From the UI you can **reconcile** (sync now),
**suspend** and **resume** any resource.`},{heading:`from-the-node`,content:"The `flux` CLI isn't installed on the node, but the Flux resources are regular\nKubernetes objects:"},{heading:`from-the-node`,content:`To stop Flux from touching an app while you debug it by hand, **suspend** its
Kustomization from the Web UI. Remember to **resume** it afterwards: a suspended
app also stops receiving image updates.`},{heading:`references`,content:`Flux Documentation`},{heading:`references`,content:`Flux Operator Documentation`},{heading:`references`,content:`ResourceSets`},{heading:`references`,content:`PoliNetwork-CD Repository`}],headings:[{id:`what-is-flux`,content:`What is Flux?`},{id:`repository-layout`,content:`Repository layout`},{id:`clustersk3s`,content:"`clusters/k3s`"},{id:`platform-components-infrastructure`,content:"Platform components (`infrastructure/`)"},{id:`automatic-image-updates`,content:`Automatic image updates`},{id:`day-to-day`,content:`Day-to-day`},{id:`web-ui`,content:`Web UI`},{id:`from-the-node`,content:`From the node`},{id:`references`,content:`References`}]},o=[{depth:2,url:`#what-is-flux`,title:(0,n.jsx)(n.Fragment,{children:`What is Flux?`})},{depth:2,url:`#repository-layout`,title:(0,n.jsx)(n.Fragment,{children:`Repository layout`})},{depth:3,url:`#clustersk3s`,title:(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(`code`,{children:`clusters/k3s`})})},{depth:3,url:`#platform-components-infrastructure`,title:(0,n.jsxs)(n.Fragment,{children:[`Platform components (`,(0,n.jsx)(`code`,{children:`infrastructure/`}),`)`]})},{depth:2,url:`#automatic-image-updates`,title:(0,n.jsx)(n.Fragment,{children:`Automatic image updates`})},{depth:2,url:`#day-to-day`,title:(0,n.jsx)(n.Fragment,{children:`Day-to-day`})},{depth:3,url:`#web-ui`,title:(0,n.jsx)(n.Fragment,{children:`Web UI`})},{depth:3,url:`#from-the-node`,title:(0,n.jsx)(n.Fragment,{children:`From the node`})},{depth:2,url:`#references`,title:(0,n.jsx)(n.Fragment,{children:`References`})}];function s(e){let t={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components},{Callout:r,Mermaid:i}=t;return r||l(`Callout`,!0),i||l(`Mermaid`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`what-is-flux`,children:`What is Flux?`}),`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.a,{href:`https://fluxcd.io/`,children:`Flux`}),` is a GitOps tool: it runs inside the cluster, watches a
Git repository and applies whatever it finds there, over and over. If someone
changes a resource by hand, Flux puts it back the way Git says. It replaced the
ArgoCD instance we had on AKS.`]}),`
`,(0,n.jsxs)(t.p,{children:[`Ours is installed by Ansible through the
`,(0,n.jsx)(t.a,{href:`https://fluxcd.control-plane.io/operator/`,children:`Flux Operator`}),`, and it syncs the
`,(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`main`})}),` branch of
`,(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/polinetwork-cd`,children:`polinetwork-cd`}),`, starting
from the `,(0,n.jsx)(t.code,{children:`clusters/k3s`}),` folder.`]}),`
`,(0,n.jsx)(r,{type:`important`,children:(0,n.jsxs)(t.p,{children:[`Merging to `,(0,n.jsx)(t.code,{children:`main`}),` in polinetwork-cd `,(0,n.jsx)(t.strong,{children:`is`}),` deploying to production.
Never `,(0,n.jsx)(t.code,{children:`kubectl apply`}),` or `,(0,n.jsx)(t.code,{children:`kubectl edit`}),` a resource that Flux manages: Flux reverts
it at the next reconciliation.`]})}),`
`,(0,n.jsx)(t.h2,{id:`repository-layout`,children:`Repository layout`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` polinetworkorg/polinetwork-cd/`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` ansible/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`                 # Host configuration (see K3s Node)`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` clusters/k3s/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`            # Entry point: one Flux Kustomization per component`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` infrastructure-`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`*`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`.yaml`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`   # Platform components`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   └─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` apps/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`                # One file per app + kustomization.yaml listing them`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` infrastructure/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`          # Manifests of the platform components`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` apps/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`                    # Manifests of the apps, one folder per namespace`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` backend/`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` web/`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   └─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` ...`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` └─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` tests/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`                   # Manifest checks run in CI`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[`Folders at the root of the repository (`,(0,n.jsx)(t.code,{children:`bot-prod/`}),`, `,(0,n.jsx)(t.code,{children:`bot-rooms/`}),`, `,(0,n.jsx)(t.code,{children:`mariadb/`}),`, ...)
are leftovers from the AKS era, all disabled. Flux ignores them.`]}),`
`,(0,n.jsx)(t.h3,{id:`clustersk3s`,children:(0,n.jsx)(t.code,{children:`clusters/k3s`})}),`
`,(0,n.jsxs)(t.p,{children:[`Each file here is a Flux
`,(0,n.jsx)(t.a,{href:`https://fluxcd.io/flux/components/kustomize/kustomizations/`,children:(0,n.jsx)(t.code,{children:`Kustomization`})}),`
that points to one folder of `,(0,n.jsx)(t.code,{children:`infrastructure/`}),` or `,(0,n.jsx)(t.code,{children:`apps/`}),`. It also sets:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`dependsOn`}),`: what must be ready first. Apps wait for the secret stores, storage
and Traefik; `,(0,n.jsx)(t.code,{children:`backend`}),` also waits for `,(0,n.jsx)(t.code,{children:`postgres`}),` and `,(0,n.jsx)(t.code,{children:`redis`}),`.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`prune: true`}),`: a resource removed from Git is deleted from the cluster.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`wait: true`}),`: the Kustomization is ready only when all its resources are healthy.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`interval: 30m`}),`: a full reconciliation at least every 30 minutes, even if Git
didn't change.`]}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:`clusters/k3s/apps/kustomization.yaml`}),` lists the apps Flux runs. An app file
that is not listed there does nothing.`]}),`
`,(0,n.jsxs)(t.h3,{id:`platform-components-infrastructure`,children:[`Platform components (`,(0,n.jsx)(t.code,{children:`infrastructure/`}),`)`]}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Component`}),(0,n.jsx)(t.th,{children:`What it does`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`security`})}),(0,n.jsxs)(t.td,{children:[`Admission policies (no host namespaces, no pods as `,(0,n.jsx)(t.code,{children:`keyvault-reader`}),`)`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`storage`})}),(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.a,{href:`https://github.com/rancher/local-path-provisioner`,children:`local-path provisioner`}),` and the `,(0,n.jsx)(t.code,{children:`fast`}),` / `,(0,n.jsx)(t.code,{children:`standard`}),` storage classes`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`traefik`})}),(0,n.jsxs)(t.td,{children:[`Makes the bundled Traefik a `,(0,n.jsx)(t.code,{children:`ClusterIP`}),` service`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`external-secrets`})}),(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.a,{href:`https://external-secrets.io/`,children:`External Secrets Operator`}),`, installed with Helm`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`secret-stores`})}),(0,n.jsxs)(t.td,{children:[`The `,(0,n.jsx)(t.code,{children:`kv-pn-apps`}),` and `,(0,n.jsx)(t.code,{children:`kv-pn-infra`}),` `,(0,n.jsx)(t.code,{children:`ClusterSecretStore`}),`s`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`cloudflared`})}),(0,n.jsx)(t.td,{children:`The Cloudflare Tunnel connector (2 replicas)`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`image-automation`})}),(0,n.jsxs)(t.td,{children:[`Detects new `,(0,n.jsx)(t.code,{children:`latest`}),` images on GHCR (see below)`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`node-exporter`})}),(0,n.jsx)(t.td,{children:`Node metrics for Prometheus`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`flux-web`})}),(0,n.jsxs)(t.td,{children:[`The Flux Web UI at `,(0,n.jsx)(t.a,{href:`https://flux.polinetwork.org`,children:`flux.polinetwork.org`})]})]})]})]}),`
`,(0,n.jsx)(t.h2,{id:`automatic-image-updates`,children:`Automatic image updates`}),`
`,(0,n.jsxs)(t.p,{children:[`Most of our apps are deployed from the `,(0,n.jsx)(t.code,{children:`latest`}),` tag of an image on
`,(0,n.jsx)(t.a,{href:`https://github.com/orgs/PoliNetworkOrg/packages`,children:`GHCR`}),`. A tag can point to a
different image over time, so Flux resolves it to a `,(0,n.jsx)(t.strong,{children:`digest`}),` and deploys that
digest. When the digest changes, the app rolls out the new image.`]}),`
`,(0,n.jsx)(i,{chart:`flowchart LR
  ci[App CI pushes :latest] --> gh[GitHub package event]
  gh -- webhook --> rcv[Flux Receiver]
  rcv --> prov[ResourceSetInputProvider<br/>resolves latest to a digest]
  prov --> rs[ResourceSet<br/>renders the app Kustomization]
  rs --> app[Deployment rolls out]`}),`
`,(0,n.jsx)(t.p,{children:`The pieces, all in polinetwork-cd:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`infrastructure/image-automation/image-providers.yaml`}),`: one
`,(0,n.jsx)(t.code,{children:`ResourceSetInputProvider`}),` per image, which reads the `,(0,n.jsx)(t.code,{children:`latest`}),` tag and its digest.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`infrastructure/image-automation/receiver.yaml`}),`: a Flux `,(0,n.jsx)(t.code,{children:`Receiver`}),` called by
the PoliNetworkOrg organization webhook on `,(0,n.jsx)(t.code,{children:`package`}),` events, at
`,(0,n.jsx)(t.code,{children:`flux-webhook.polinetwork.org`}),`. The webhook's HMAC signature is its only
authentication. If the webhook doesn't fire, the providers poll every 6 hours anyway.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`clusters/k3s/apps/<app>.yaml`}),`: for apps with automatic updates this is a
`,(0,n.jsx)(t.code,{children:`ResourceSet`}),` instead of a plain Kustomization. It generates the app's
Kustomization with an `,(0,n.jsx)(t.code,{children:`images`}),` override that pins the digest.`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`Apps that don't need automatic updates (databases, monitoring, ...) pin their
image in the manifest, and you bump them with a PR.`}),`
`,(0,n.jsx)(t.h2,{id:`day-to-day`,children:`Day-to-day`}),`
`,(0,n.jsx)(t.h3,{id:`web-ui`,children:`Web UI`}),`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.a,{href:`https://flux.polinetwork.org`,children:`flux.polinetwork.org`}),` shows every Kustomization,
HelmRelease and ResourceSet, with its status, last applied revision and errors.
You log in through `,(0,n.jsx)(t.a,{href:`https://auth.polinetwork.org`,children:`auth.polinetwork.org`}),`; only
the Direttivo is admitted. From the UI you can `,(0,n.jsx)(t.strong,{children:`reconcile`}),` (sync now),
`,(0,n.jsx)(t.strong,{children:`suspend`}),` and `,(0,n.jsx)(t.strong,{children:`resume`}),` any resource.`]}),`
`,(0,n.jsx)(t.h3,{id:`from-the-node`,children:`From the node`}),`
`,(0,n.jsxs)(t.p,{children:[`The `,(0,n.jsx)(t.code,{children:`flux`}),` CLI isn't installed on the node, but the Flux resources are regular
Kubernetes objects:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Status of all the Kustomizations (apps and infrastructure)`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` get`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` kustomizations`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` flux-system`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Latest image resolved for each app`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` get`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` resourcesetinputproviders`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` flux-system`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Why is an app not ready?`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` describe`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` kustomization`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`ap`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`p`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` flux-system`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Sync now instead of waiting: fetch the latest commit, then apply it`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` annotate`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --overwrite`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` gitrepository`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` flux-system`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` flux-system`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  reconcile.fluxcd.io/requestedAt="$(`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`date`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` +%s)"`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` annotate`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --overwrite`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` kustomization`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`ap`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`p`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` flux-system`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  reconcile.fluxcd.io/requestedAt="$(`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`date`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` +%s)"`})]})]})})}),`
`,(0,n.jsx)(r,{type:`tip`,title:`Suspending an app`,children:(0,n.jsxs)(t.p,{children:[`To stop Flux from touching an app while you debug it by hand, `,(0,n.jsx)(t.strong,{children:`suspend`}),` its
Kustomization from the Web UI. Remember to `,(0,n.jsx)(t.strong,{children:`resume`}),` it afterwards: a suspended
app also stops receiving image updates.`]})}),`
`,(0,n.jsx)(t.h2,{id:`references`,children:`References`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://fluxcd.io/flux/`,children:`Flux Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://fluxcd.control-plane.io/operator/`,children:`Flux Operator Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://fluxcd.control-plane.io/operator/resourcesets/introduction/`,children:`ResourceSets`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/polinetwork-cd`,children:`PoliNetwork-CD Repository`})}),`
`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};