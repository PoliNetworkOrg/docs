import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Monitoring`},i=`## Monitoring [#monitoring]

### Alerts [#alerts]

You usually don't have to go looking for problems: Prometheus evaluates alert
rules and Alertmanager sends them to our **Telegram** alert chat. Critical alerts
repeat every hour, warnings every 12 hours. Among others, you get alerted when:

- the node is short on CPU, memory, disk space or inodes;
- a pod is crash-looping, OOM-killed or not running, or a deployment is missing replicas;
- a Flux resource, an \`ExternalSecret\` or a secret store is not ready;
- the Cloudflare tunnel has no connections (all public websites are down);
- a backup hasn't succeeded on schedule.

The rules live in \`apps/monitoring/prometheus/alert-rules.yml\` in polinetwork-cd.

### Dashboards [#dashboards]

- [Flux Web UI](https://flux.polinetwork.org): is every app in sync with Git? Why not?
- [Grafana](https://monitoring.polinetwork.org): node and container metrics from Prometheus.
- [Uptime Kuma](https://status.polinetwork.org): is each public website up?

### From the command line [#from-the-command-line]

[SSH into the node](/docs/infrastructure/getting-started/setup#cloudflare-warp--ssh), then run

\`\`\`
kubectl get pods -A
\`\`\`

This will give you a breakdown of all the pods running in the infrastructure.
Besides one namespace per app (\`web\`, \`backend\`, \`postgres\`, ...), you'll see:

| Namespace | What runs there |
|-----------|-----------------|
| \`flux-system\` | Flux controllers, the Flux Web UI |
| \`external-secrets\` | External Secrets Operator |
| \`cloudflared\` | The two Cloudflare Tunnel connectors |
| \`local-path-storage\` | The volume provisioner |
| \`kube-system\` | K3s components: CoreDNS, Traefik, metrics-server, node-exporter |

Look at the \`READY\`, \`STATUS\` and \`RESTARTS\` columns: a pod that is not \`Running\`,
or whose restart count keeps growing, needs a look. Some useful follow-ups:

\`\`\`sh
# Events and the reason of the last restart
kubectl describe pod -n <namespace> <pod-name>

# Logs (add --previous to see the logs of the crashed container)
kubectl logs -n <namespace> deploy/<deployment-name>

# CPU and memory usage per pod
kubectl top pods -A

# Apps that Flux couldn't apply
kubectl get kustomizations -n flux-system
\`\`\`

Find an overview of Flux in [Flux](/docs/infrastructure/getting-started/cloud-infrastructure/flux).
`,a={contents:[{heading:`alerts`,content:`You usually don't have to go looking for problems: Prometheus evaluates alert
rules and Alertmanager sends them to our **Telegram** alert chat. Critical alerts
repeat every hour, warnings every 12 hours. Among others, you get alerted when:`},{heading:`alerts`,content:`the node is short on CPU, memory, disk space or inodes;`},{heading:`alerts`,content:`a pod is crash-looping, OOM-killed or not running, or a deployment is missing replicas;`},{heading:`alerts`,content:"a Flux resource, an `ExternalSecret` or a secret store is not ready;"},{heading:`alerts`,content:`the Cloudflare tunnel has no connections (all public websites are down);`},{heading:`alerts`,content:`a backup hasn't succeeded on schedule.`},{heading:`alerts`,content:"The rules live in `apps/monitoring/prometheus/alert-rules.yml` in polinetwork-cd."},{heading:`dashboards`,content:`Flux Web UI: is every app in sync with Git? Why not?`},{heading:`dashboards`,content:`Grafana: node and container metrics from Prometheus.`},{heading:`dashboards`,content:`Uptime Kuma: is each public website up?`},{heading:`from-the-command-line`,content:`SSH into the node, then run`},{heading:`from-the-command-line`,content:"This will give you a breakdown of all the pods running in the infrastructure.\nBesides one namespace per app (`web`, `backend`, `postgres`, ...), you'll see:"},{heading:`from-the-command-line`,content:`| Namespace     | What runs there                   |
| ------------- | --------------------------------- |
| \`flux-system\` | Flux controllers, the Flux Web UI |`,table:`table-0`},{heading:`from-the-command-line`,content:`| Namespace          | What runs there           |
| ------------------ | ------------------------- |
| \`external-secrets\` | External Secrets Operator |`,table:`table-0`},{heading:`from-the-command-line`,content:`| Namespace     | What runs there                      |
| ------------- | ------------------------------------ |
| \`cloudflared\` | The two Cloudflare Tunnel connectors |`,table:`table-0`},{heading:`from-the-command-line`,content:`| Namespace            | What runs there        |
| -------------------- | ---------------------- |
| \`local-path-storage\` | The volume provisioner |`,table:`table-0`},{heading:`from-the-command-line`,content:`| Namespace     | What runs there                                                 |
| ------------- | --------------------------------------------------------------- |
| \`kube-system\` | K3s components: CoreDNS, Traefik, metrics-server, node-exporter |`,table:`table-0`},{heading:`from-the-command-line`,content:"Look at the `READY`, `STATUS` and `RESTARTS` columns: a pod that is not `Running`,\nor whose restart count keeps growing, needs a look. Some useful follow-ups:"},{heading:`from-the-command-line`,content:`Find an overview of Flux in Flux.`}],headings:[{id:`monitoring`,content:`Monitoring`},{id:`alerts`,content:`Alerts`},{id:`dashboards`,content:`Dashboards`},{id:`from-the-command-line`,content:`From the command line`}]},o=[{depth:2,url:`#monitoring`,title:(0,n.jsx)(n.Fragment,{children:`Monitoring`})},{depth:3,url:`#alerts`,title:(0,n.jsx)(n.Fragment,{children:`Alerts`})},{depth:3,url:`#dashboards`,title:(0,n.jsx)(n.Fragment,{children:`Dashboards`})},{depth:3,url:`#from-the-command-line`,title:(0,n.jsx)(n.Fragment,{children:`From the command line`})}];function s(e){let t={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`monitoring`,children:`Monitoring`}),`
`,(0,n.jsx)(t.h3,{id:`alerts`,children:`Alerts`}),`
`,(0,n.jsxs)(t.p,{children:[`You usually don't have to go looking for problems: Prometheus evaluates alert
rules and Alertmanager sends them to our `,(0,n.jsx)(t.strong,{children:`Telegram`}),` alert chat. Critical alerts
repeat every hour, warnings every 12 hours. Among others, you get alerted when:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:`the node is short on CPU, memory, disk space or inodes;`}),`
`,(0,n.jsx)(t.li,{children:`a pod is crash-looping, OOM-killed or not running, or a deployment is missing replicas;`}),`
`,(0,n.jsxs)(t.li,{children:[`a Flux resource, an `,(0,n.jsx)(t.code,{children:`ExternalSecret`}),` or a secret store is not ready;`]}),`
`,(0,n.jsx)(t.li,{children:`the Cloudflare tunnel has no connections (all public websites are down);`}),`
`,(0,n.jsx)(t.li,{children:`a backup hasn't succeeded on schedule.`}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`The rules live in `,(0,n.jsx)(t.code,{children:`apps/monitoring/prometheus/alert-rules.yml`}),` in polinetwork-cd.`]}),`
`,(0,n.jsx)(t.h3,{id:`dashboards`,children:`Dashboards`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.a,{href:`https://flux.polinetwork.org`,children:`Flux Web UI`}),`: is every app in sync with Git? Why not?`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.a,{href:`https://monitoring.polinetwork.org`,children:`Grafana`}),`: node and container metrics from Prometheus.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.a,{href:`https://status.polinetwork.org`,children:`Uptime Kuma`}),`: is each public website up?`]}),`
`]}),`
`,(0,n.jsx)(t.h3,{id:`from-the-command-line`,children:`From the command line`}),`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/setup#cloudflare-warp--ssh`,children:`SSH into the node`}),`, then run`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{children:`kubectl get pods -A`})})})})}),`
`,(0,n.jsxs)(t.p,{children:[`This will give you a breakdown of all the pods running in the infrastructure.
Besides one namespace per app (`,(0,n.jsx)(t.code,{children:`web`}),`, `,(0,n.jsx)(t.code,{children:`backend`}),`, `,(0,n.jsx)(t.code,{children:`postgres`}),`, ...), you'll see:`]}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Namespace`}),(0,n.jsx)(t.th,{children:`What runs there`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`flux-system`})}),(0,n.jsx)(t.td,{children:`Flux controllers, the Flux Web UI`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`external-secrets`})}),(0,n.jsx)(t.td,{children:`External Secrets Operator`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`cloudflared`})}),(0,n.jsx)(t.td,{children:`The two Cloudflare Tunnel connectors`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`local-path-storage`})}),(0,n.jsx)(t.td,{children:`The volume provisioner`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`kube-system`})}),(0,n.jsx)(t.td,{children:`K3s components: CoreDNS, Traefik, metrics-server, node-exporter`})]})]})]}),`
`,(0,n.jsxs)(t.p,{children:[`Look at the `,(0,n.jsx)(t.code,{children:`READY`}),`, `,(0,n.jsx)(t.code,{children:`STATUS`}),` and `,(0,n.jsx)(t.code,{children:`RESTARTS`}),` columns: a pod that is not `,(0,n.jsx)(t.code,{children:`Running`}),`,
or whose restart count keeps growing, needs a look. Some useful follow-ups:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Events and the reason of the last restart`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` describe`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pod`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`namespac`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`pod-nam`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Logs (add --previous to see the logs of the crashed container)`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` logs`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`namespac`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` deploy/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`deployment-nam`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# CPU and memory usage per pod`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` top`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pods`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -A`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Apps that Flux couldn't apply`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`kubectl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` get`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` kustomizations`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` flux-system`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[`Find an overview of Flux in `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/cloud-infrastructure/flux`,children:`Flux`}),`.`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};