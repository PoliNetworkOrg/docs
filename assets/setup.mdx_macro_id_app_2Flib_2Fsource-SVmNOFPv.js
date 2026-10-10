import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Setup`},i=`If it's your first time accessing the infrastructure, you'll need to set up the tools and configure them.

<Callout type="caution">

This tutorial assumes your account has the right permissions to access the infrastructure. If not, please contact the team.
SSH access to the node is restricted to the **IT Lead** group.

</Callout>

## How access works [#how-access-works]

The K3s node \`k3s01\` has **no public IP**. Its private address is \`10.43.1.4\`,
inside the Azure VNet \`vnet-k3s\`, and the Azure firewall (NSG) denies all inbound
traffic. Nothing reaches the VM directly from the Internet:

- websites reach the cluster through a **Cloudflare Tunnel** (an outbound connection
  opened by \`cloudflared\` pods running in the cluster);
- people reach the VM through **Cloudflare WARP**, which routes \`10.43.1.4\` through
  the same tunnel, and **Cloudflare Access for Infrastructure**, which signs a
  short-lived SSH certificate after you log in with your PoliNetwork account.

There is no kubeconfig to download: you SSH into the node and run \`kubectl\` there.

## Cloudflare WARP & SSH [#cloudflare-warp--ssh]

- Install the [Cloudflare WARP client](https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/download-warp/).

- Enroll it in PoliNetwork's Cloudflare Zero Trust organization
  (*Preferences → Account → Login to Cloudflare Zero Trust*) and log in with your
  PoliNetwork account. Ask the team for the organization (team) name.

- With WARP connected, SSH into the node:

  \`\`\`sh
  ssh pnadmin@10.43.1.4
  \`\`\`

  The first time, your browser asks you to authenticate. You don't need an SSH key:
  Cloudflare issues a short-lived certificate for the \`pnadmin\` user, and the node
  only accepts keys and Cloudflare Access certificates (no passwords, no root login).

- To check if everything is working, run \`k3s kubectl get pods -n <namespace>\`. You should see a list of pods.

<Callout type="tip">

\`pnadmin\` is in the \`k3s-admin\` group, which can read the K3s kubeconfig, so
\`k3s kubectl\` works without \`sudo\`. Add an alias to save some typing:

\`\`\`sh
echo "alias kubectl='k3s kubectl'" >> ~/.bashrc
\`\`\`

The rest of the docs write \`kubectl\` and assume this alias.

</Callout>

<Callout type="info">

The possible values of \`\`\`<namespace>\`\`\` match the folders in
[\`apps/\`](https://github.com/polinetworkorg/polinetwork-cd/tree/main/apps) in the
polinetwork-cd repository (e.g. \`web\`, \`backend\`, \`postgres\`). Run
\`kubectl get namespaces\` to see them all.

</Callout>

<Callout type="danger" title="Break-glass access">

If Cloudflare is down or the tunnel is broken, you can still reach the VM through
**Azure Run Command** or the **Serial Console** in the Azure portal (VM \`k3s01\`,
resource group \`rg-polinetwork\`). Use them only for emergencies.

</Callout>

## Azure CLI [#azure-cli]

You still need the Azure CLI to manage secrets in Key Vault and to inspect Azure
resources.

- Download and install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

- Run \`\`\`az login\`\`\` to login.

You don't need \`az aks get-credentials\` or \`kubelogin\` anymore: those were only
needed for the old AKS cluster.

## Web dashboards [#web-dashboards]

| URL | What | Who can log in |
|-----|------|----------------|
| [flux.polinetwork.org](https://flux.polinetwork.org) | Flux Web UI: sync status of every app, reconcile/suspend/resume | Direttivo, via auth.polinetwork.org |
| [monitoring.polinetwork.org](https://monitoring.polinetwork.org) | Grafana dashboards (Prometheus metrics) | Grafana accounts |
| [status.polinetwork.org](https://status.polinetwork.org) | Uptime Kuma status page | Public |

## Port Forwarding [#port-forwarding]

To access services running on the cluster (such as the PostgreSQL database), you
need two hops: \`kubectl port-forward\` on the node, and an SSH tunnel from your
machine to the node. You can do both with one command:

\`\`\`sh
ssh -L <local-port>:localhost:<remote-port> pnadmin@10.43.1.4 \\
  k3s kubectl port-forward -n <namespace> svc/<service-name> <remote-port>:<service-port>
\`\`\`

For example, to reach PostgreSQL on \`localhost:5432\`:

\`\`\`sh
ssh -L 5432:localhost:5432 pnadmin@10.43.1.4 \\
  k3s kubectl port-forward -n postgres svc/postgres-service 5432:5432
\`\`\`

Keep the command running while you use the connection, and stop it with \`Ctrl+C\`.

<Callout type="tip">

Run \`kubectl get svc -n <namespace>\` on the node to find service names and ports.
You can use the same template to connect to other services.

</Callout>
`,a={contents:[{heading:void 0,content:`If it's your first time accessing the infrastructure, you'll need to set up the tools and configure them.`},{heading:void 0,content:`This tutorial assumes your account has the right permissions to access the infrastructure. If not, please contact the team.
SSH access to the node is restricted to the **IT Lead** group.`},{heading:`how-access-works`,content:"The K3s node `k3s01` has **no public IP**. Its private address is `10.43.1.4`,\ninside the Azure VNet `vnet-k3s`, and the Azure firewall (NSG) denies all inbound\ntraffic. Nothing reaches the VM directly from the Internet:"},{heading:`how-access-works`,content:"websites reach the cluster through a **Cloudflare Tunnel** (an outbound connection\nopened by `cloudflared` pods running in the cluster);"},{heading:`how-access-works`,content:`people reach the VM through **Cloudflare WARP**, which routes \`10.43.1.4\` through
the same tunnel, and **Cloudflare Access for Infrastructure**, which signs a
short-lived SSH certificate after you log in with your PoliNetwork account.`},{heading:`how-access-works`,content:"There is no kubeconfig to download: you SSH into the node and run `kubectl` there."},{heading:`cloudflare-warp--ssh`,content:`Install the Cloudflare WARP client.`},{heading:`cloudflare-warp--ssh`,content:`Enroll it in PoliNetwork's Cloudflare Zero Trust organization
(*Preferences → Account → Login to Cloudflare Zero Trust*) and log in with your
PoliNetwork account. Ask the team for the organization (team) name.`},{heading:`cloudflare-warp--ssh`,content:`With WARP connected, SSH into the node:`},{heading:`cloudflare-warp--ssh`,content:`The first time, your browser asks you to authenticate. You don't need an SSH key:
Cloudflare issues a short-lived certificate for the \`pnadmin\` user, and the node
only accepts keys and Cloudflare Access certificates (no passwords, no root login).`},{heading:`cloudflare-warp--ssh`,content:"To check if everything is working, run `k3s kubectl get pods -n <namespace>`. You should see a list of pods."},{heading:`cloudflare-warp--ssh`,content:"`pnadmin` is in the `k3s-admin` group, which can read the K3s kubeconfig, so\n`k3s kubectl` works without `sudo`. Add an alias to save some typing:"},{heading:`cloudflare-warp--ssh`,content:"The rest of the docs write `kubectl` and assume this alias."},{heading:`cloudflare-warp--ssh`,content:"The possible values of ```<namespace>``` match the folders in\n`apps/` in the\npolinetwork-cd repository (e.g. `web`, `backend`, `postgres`). Run\n`kubectl get namespaces` to see them all."},{heading:`cloudflare-warp--ssh`,content:"If Cloudflare is down or the tunnel is broken, you can still reach the VM through\n**Azure Run Command** or the **Serial Console** in the Azure portal (VM `k3s01`,\nresource group `rg-polinetwork`). Use them only for emergencies."},{heading:`azure-cli`,content:`You still need the Azure CLI to manage secrets in Key Vault and to inspect Azure
resources.`},{heading:`azure-cli`,content:`Download and install the Azure CLI.`},{heading:`azure-cli`,content:"Run ```az login``` to login."},{heading:`azure-cli`,content:"You don't need `az aks get-credentials` or `kubelogin` anymore: those were only\nneeded for the old AKS cluster."},{heading:`web-dashboards`,content:`| URL                  | What                                                            | Who can log in                      |
| -------------------- | --------------------------------------------------------------- | ----------------------------------- |
| flux.polinetwork.org | Flux Web UI: sync status of every app, reconcile/suspend/resume | Direttivo, via auth.polinetwork.org |`,table:`table-0`},{heading:`web-dashboards`,content:`| URL                        | What                                    | Who can log in   |
| -------------------------- | --------------------------------------- | ---------------- |
| monitoring.polinetwork.org | Grafana dashboards (Prometheus metrics) | Grafana accounts |`,table:`table-0`},{heading:`web-dashboards`,content:`| URL                    | What                    | Who can log in |
| ---------------------- | ----------------------- | -------------- |
| status.polinetwork.org | Uptime Kuma status page | Public         |`,table:`table-0`},{heading:`port-forwarding`,content:`To access services running on the cluster (such as the PostgreSQL database), you
need two hops: \`kubectl port-forward\` on the node, and an SSH tunnel from your
machine to the node. You can do both with one command:`},{heading:`port-forwarding`,content:"For example, to reach PostgreSQL on `localhost:5432`:"},{heading:`port-forwarding`,content:"Keep the command running while you use the connection, and stop it with `Ctrl+C`."},{heading:`port-forwarding`,content:"Run `kubectl get svc -n <namespace>` on the node to find service names and ports.\nYou can use the same template to connect to other services."}],headings:[{id:`how-access-works`,content:`How access works`},{id:`cloudflare-warp--ssh`,content:`Cloudflare WARP & SSH`},{id:`azure-cli`,content:`Azure CLI`},{id:`web-dashboards`,content:`Web dashboards`},{id:`port-forwarding`,content:`Port Forwarding`}]},o=[{depth:2,url:`#how-access-works`,title:(0,n.jsx)(n.Fragment,{children:`How access works`})},{depth:2,url:`#cloudflare-warp--ssh`,title:(0,n.jsx)(n.Fragment,{children:`Cloudflare WARP & SSH`})},{depth:2,url:`#azure-cli`,title:(0,n.jsx)(n.Fragment,{children:`Azure CLI`})},{depth:2,url:`#web-dashboards`,title:(0,n.jsx)(n.Fragment,{children:`Web dashboards`})},{depth:2,url:`#port-forwarding`,title:(0,n.jsx)(n.Fragment,{children:`Port Forwarding`})}];function s(e){let t={a:`a`,code:`code`,em:`em`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components},{Callout:r}=t;return r||l(`Callout`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.p,{children:`If it's your first time accessing the infrastructure, you'll need to set up the tools and configure them.`}),`
`,(0,n.jsx)(r,{type:`caution`,children:(0,n.jsxs)(t.p,{children:[`This tutorial assumes your account has the right permissions to access the infrastructure. If not, please contact the team.
SSH access to the node is restricted to the `,(0,n.jsx)(t.strong,{children:`IT Lead`}),` group.`]})}),`
`,(0,n.jsx)(t.h2,{id:`how-access-works`,children:`How access works`}),`
`,(0,n.jsxs)(t.p,{children:[`The K3s node `,(0,n.jsx)(t.code,{children:`k3s01`}),` has `,(0,n.jsx)(t.strong,{children:`no public IP`}),`. Its private address is `,(0,n.jsx)(t.code,{children:`10.43.1.4`}),`,
inside the Azure VNet `,(0,n.jsx)(t.code,{children:`vnet-k3s`}),`, and the Azure firewall (NSG) denies all inbound
traffic. Nothing reaches the VM directly from the Internet:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`websites reach the cluster through a `,(0,n.jsx)(t.strong,{children:`Cloudflare Tunnel`}),` (an outbound connection
opened by `,(0,n.jsx)(t.code,{children:`cloudflared`}),` pods running in the cluster);`]}),`
`,(0,n.jsxs)(t.li,{children:[`people reach the VM through `,(0,n.jsx)(t.strong,{children:`Cloudflare WARP`}),`, which routes `,(0,n.jsx)(t.code,{children:`10.43.1.4`}),` through
the same tunnel, and `,(0,n.jsx)(t.strong,{children:`Cloudflare Access for Infrastructure`}),`, which signs a
short-lived SSH certificate after you log in with your PoliNetwork account.`]}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`There is no kubeconfig to download: you SSH into the node and run `,(0,n.jsx)(t.code,{children:`kubectl`}),` there.`]}),`
`,(0,n.jsx)(t.h2,{id:`cloudflare-warp--ssh`,children:`Cloudflare WARP & SSH`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[`Install the `,(0,n.jsx)(t.a,{href:`https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/download-warp/`,children:`Cloudflare WARP client`}),`.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[`Enroll it in PoliNetwork's Cloudflare Zero Trust organization
(`,(0,n.jsx)(t.em,{children:`Preferences → Account → Login to Cloudflare Zero Trust`}),`) and log in with your
PoliNetwork account. Ask the team for the organization (team) name.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsx)(t.p,{children:`With WARP connected, SSH into the node:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`ssh`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pnadmin@10.43.1.4`})]})})})}),`
`,(0,n.jsxs)(t.p,{children:[`The first time, your browser asks you to authenticate. You don't need an SSH key:
Cloudflare issues a short-lived certificate for the `,(0,n.jsx)(t.code,{children:`pnadmin`}),` user, and the node
only accepts keys and Cloudflare Access certificates (no passwords, no root login).`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[`To check if everything is working, run `,(0,n.jsx)(t.code,{children:`k3s kubectl get pods -n <namespace>`}),`. You should see a list of pods.`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(r,{type:`tip`,children:[(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:`pnadmin`}),` is in the `,(0,n.jsx)(t.code,{children:`k3s-admin`}),` group, which can read the K3s kubeconfig, so
`,(0,n.jsx)(t.code,{children:`k3s kubectl`}),` works without `,(0,n.jsx)(t.code,{children:`sudo`}),`. Add an alias to save some typing:`]}),(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`echo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` "alias kubectl='k3s kubectl'"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` >>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` ~/.bashrc`})]})})})}),(0,n.jsxs)(t.p,{children:[`The rest of the docs write `,(0,n.jsx)(t.code,{children:`kubectl`}),` and assume this alias.`]})]}),`
`,(0,n.jsx)(r,{type:`info`,children:(0,n.jsxs)(t.p,{children:[`The possible values of `,(0,n.jsx)(t.code,{children:`<namespace>`}),` match the folders in
`,(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/polinetwork-cd/tree/main/apps`,children:(0,n.jsx)(t.code,{children:`apps/`})}),` in the
polinetwork-cd repository (e.g. `,(0,n.jsx)(t.code,{children:`web`}),`, `,(0,n.jsx)(t.code,{children:`backend`}),`, `,(0,n.jsx)(t.code,{children:`postgres`}),`). Run
`,(0,n.jsx)(t.code,{children:`kubectl get namespaces`}),` to see them all.`]})}),`
`,(0,n.jsx)(r,{type:`danger`,title:`Break-glass access`,children:(0,n.jsxs)(t.p,{children:[`If Cloudflare is down or the tunnel is broken, you can still reach the VM through
`,(0,n.jsx)(t.strong,{children:`Azure Run Command`}),` or the `,(0,n.jsx)(t.strong,{children:`Serial Console`}),` in the Azure portal (VM `,(0,n.jsx)(t.code,{children:`k3s01`}),`,
resource group `,(0,n.jsx)(t.code,{children:`rg-polinetwork`}),`). Use them only for emergencies.`]})}),`
`,(0,n.jsx)(t.h2,{id:`azure-cli`,children:`Azure CLI`}),`
`,(0,n.jsx)(t.p,{children:`You still need the Azure CLI to manage secrets in Key Vault and to inspect Azure
resources.`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[`Download and install the `,(0,n.jsx)(t.a,{href:`https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest`,children:`Azure CLI`}),`.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[`Run `,(0,n.jsx)(t.code,{children:`az login`}),` to login.`]}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`You don't need `,(0,n.jsx)(t.code,{children:`az aks get-credentials`}),` or `,(0,n.jsx)(t.code,{children:`kubelogin`}),` anymore: those were only
needed for the old AKS cluster.`]}),`
`,(0,n.jsx)(t.h2,{id:`web-dashboards`,children:`Web dashboards`}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`URL`}),(0,n.jsx)(t.th,{children:`What`}),(0,n.jsx)(t.th,{children:`Who can log in`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:`https://flux.polinetwork.org`,children:`flux.polinetwork.org`})}),(0,n.jsx)(t.td,{children:`Flux Web UI: sync status of every app, reconcile/suspend/resume`}),(0,n.jsx)(t.td,{children:`Direttivo, via auth.polinetwork.org`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:`https://monitoring.polinetwork.org`,children:`monitoring.polinetwork.org`})}),(0,n.jsx)(t.td,{children:`Grafana dashboards (Prometheus metrics)`}),(0,n.jsx)(t.td,{children:`Grafana accounts`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.a,{href:`https://status.polinetwork.org`,children:`status.polinetwork.org`})}),(0,n.jsx)(t.td,{children:`Uptime Kuma status page`}),(0,n.jsx)(t.td,{children:`Public`})]})]})]}),`
`,(0,n.jsx)(t.h2,{id:`port-forwarding`,children:`Port Forwarding`}),`
`,(0,n.jsxs)(t.p,{children:[`To access services running on the cluster (such as the PostgreSQL database), you
need two hops: `,(0,n.jsx)(t.code,{children:`kubectl port-forward`}),` on the node, and an SSH tunnel from your
machine to the node. You can do both with one command:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`ssh`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -L`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`local-por`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`t`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`:localhost:`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`remote-por`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`t`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pnadmin@10.43.1.4`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  k3s`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` port-forward`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`namespac`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` svc/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`service-nam`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`remote-por`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`t`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`:`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`service-por`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`t`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[`For example, to reach PostgreSQL on `,(0,n.jsx)(t.code,{children:`localhost:5432`}),`:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`ssh`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -L`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 5432:localhost:5432`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pnadmin@10.43.1.4`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  k3s`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` port-forward`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` postgres`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` svc/postgres-service`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 5432:5432`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[`Keep the command running while you use the connection, and stop it with `,(0,n.jsx)(t.code,{children:`Ctrl+C`}),`.`]}),`
`,(0,n.jsx)(r,{type:`tip`,children:(0,n.jsxs)(t.p,{children:[`Run `,(0,n.jsx)(t.code,{children:`kubectl get svc -n <namespace>`}),` on the node to find service names and ports.
You can use the same template to connect to other services.`]})})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};