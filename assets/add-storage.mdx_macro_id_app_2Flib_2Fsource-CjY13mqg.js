import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Add Storage`},i=`## Core Concepts [#core-concepts]

Many applications and services need a physical volume or storage to store their data or configuration.  
On K3s, volumes are plain directories on the node's data disks, created on demand by the
[local-path provisioner](https://github.com/rancher/local-path-provisioner) when a
[PVC](https://kubernetes.io/docs/concepts/storage/persistent-volumes) asks for one.
We replaced Longhorn and the Azure Managed Disk volumes we used on AKS with it.

There are two storage classes, one per data disk:

| Storage class | Disk | Path on the node | Use it for |
|---------------|------|------------------|------------|
| \`fast\` | Premium SSD v2, 64 GB | \`/srv/fast/volumes/<namespace>/<pvc>/\` | Latency-sensitive databases (today: PostgreSQL and the Redis instances) |
| \`standard\` (default) | Standard SSD, 128 GB | \`/srv/standard/volumes/<namespace>/<pvc>/\` | Everything else (today: InfluxDB, Prometheus, Grafana, Uptime Kuma) |

<Callout type="important">

- **The size is not enforced.** \`storage: 4Gi\` in a PVC is a label, not a quota: a volume can
  grow until the whole disk is full, and then every app on that disk breaks.
  Check the free space first, and keep an eye on the \`PersistentVolumeHigh\` and
  \`NodeDiskHigh\` alerts.
- **\`ReadWriteOnce\` doesn't mean one pod.** It limits a volume to one node, and we only
  have one node: two pods can mount the same volume and write to it at the same time.
  Make sure only one pod at a time uses it (see \`Recreate\` below).
- **Volumes are retained.** Deleting a PVC doesn't delete its directory (\`reclaimPolicy: Retain\`).

</Callout>

## Add a volume [#add-a-volume]

First of all, [SSH into the node](/docs/infrastructure/getting-started/setup#cloudflare-warp--ssh) and check
how much space is available on the disk you want to use:

\`\`\`sh
df -h /srv/fast /srv/standard
\`\`\`

Once you verified you have sufficient space available, add the PVC to the app manifest:

\`\`\`yaml title="apps/<namespace>/deployment.yaml"
# [!code ++:13]
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: <name>-pvc
  annotations:
    kustomize.toolkit.fluxcd.io/prune: disabled   # never let Flux delete the data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: <storage-class>
  resources:
    requests:
      storage: <size>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <name>
spec:
  replicas: 1
  # [!code ++:2]
  strategy:
    type: Recreate      # stop the old pod before starting the new one
  selector:
    matchLabels:
      app: <name>
  template:
    metadata:
      labels:
        app: <name>
    spec:
      containers:
        - name: <name>
          image: <image>
          # [!code ++:3]
          volumeMounts:
            - name: data           # Name of the volume defined below
              mountPath: /app/data # Where you need to mount the volume
      # [!code ++:4]
      volumes:
        - name: data               # it can be whatever you want
          persistentVolumeClaim:
            claimName: <name>-pvc  # the name of the PVC defined above
\`\`\`

Parameters:
- \`namespace\` k8s namespace (set by the app's \`kustomization.yaml\`)
- \`name\` should identify the app where the volume will be used
- \`storage-class\` \`fast\` or \`standard\` (see [the table above](#core-concepts))
- \`size\` expected size of the volume. Check [resource units](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory).
    e.g. \`300M\`, \`1Gi\`, \`200Mi\`

<Callout type="warning" title="Both are required">

- The \`kustomize.toolkit.fluxcd.io/prune: disabled\` annotation keeps Flux from deleting the
  PVC if it disappears from Git (e.g. a bad refactor). CI rejects PVCs without it.
- The \`Recreate\` strategy avoids two pods writing to the same volume during a rollout.

</Callout>

The volume is created when the first pod using it is scheduled, so the PVC stays
\`Pending\` until then: that's expected.

<Callout type="tip" title="File permissions">

local-path directories are owned by \`root\`. If your container runs as a non-root
user, set \`securityContext.fsGroup\` on the pod to the user's group (see \`apps/redis\`
for an example).

</Callout>

## Back it up [#back-it-up]

Volumes are **not** backed up automatically. The application backup on the node
only includes the databases and directories it knows about. If the new volume
holds data we can't afford to lose, add it to the backup script: see
[Backups](/docs/infrastructure/Guides/backups#adding-a-new-app).

## Inspecting a volume [#inspecting-a-volume]

Since a volume is just a directory, you can look at it from the node:

\`\`\`sh
sudo ls -la /srv/<fast|standard>/volumes/<namespace>/<name>-pvc/
\`\`\`

<Callout type="danger">

Don't edit files of a running database from the node. Stop the app first, or go
through the app itself.

</Callout>
`,a={contents:[{heading:`core-concepts`,content:`Many applications and services need a physical volume or storage to store their data or configuration.  
On K3s, volumes are plain directories on the node's data disks, created on demand by the
local-path provisioner when a
PVC asks for one.
We replaced Longhorn and the Azure Managed Disk volumes we used on AKS with it.`},{heading:`core-concepts`,content:`There are two storage classes, one per data disk:`},{heading:`core-concepts`,content:"| Storage class | Disk                  | Path on the node                       | Use it for                                                              |\n| ------------- | --------------------- | -------------------------------------- | ----------------------------------------------------------------------- |\n| `fast`        | Premium SSD v2, 64 GB | `/srv/fast/volumes/<namespace>/<pvc>/` | Latency-sensitive databases (today: PostgreSQL and the Redis instances) |",table:`table-0`},{heading:`core-concepts`,content:"| Storage class        | Disk                 | Path on the node                           | Use it for                                                          |\n| -------------------- | -------------------- | ------------------------------------------ | ------------------------------------------------------------------- |\n| `standard` (default) | Standard SSD, 128 GB | `/srv/standard/volumes/<namespace>/<pvc>/` | Everything else (today: InfluxDB, Prometheus, Grafana, Uptime Kuma) |",table:`table-0`},{heading:`core-concepts`,content:"**The size is not enforced.** `storage: 4Gi` in a PVC is a label, not a quota: a volume can\ngrow until the whole disk is full, and then every app on that disk breaks.\nCheck the free space first, and keep an eye on the `PersistentVolumeHigh` and\n`NodeDiskHigh` alerts."},{heading:`core-concepts`,content:"**`ReadWriteOnce` doesn't mean one pod.** It limits a volume to one node, and we only\nhave one node: two pods can mount the same volume and write to it at the same time.\nMake sure only one pod at a time uses it (see `Recreate` below)."},{heading:`core-concepts`,content:"**Volumes are retained.** Deleting a PVC doesn't delete its directory (`reclaimPolicy: Retain`)."},{heading:`add-a-volume`,content:`First of all, SSH into the node and check
how much space is available on the disk you want to use:`},{heading:`add-a-volume`,content:`Once you verified you have sufficient space available, add the PVC to the app manifest:`},{heading:`add-a-volume`,content:`Parameters:`},{heading:`add-a-volume`,content:"`namespace` k8s namespace (set by the app's `kustomization.yaml`)"},{heading:`add-a-volume`,content:"`name` should identify the app where the volume will be used"},{heading:`add-a-volume`,content:"`storage-class` `fast` or `standard` (see the table above)"},{heading:`add-a-volume`,content:"`size` expected size of the volume. Check resource units.\n  e.g. `300M`, `1Gi`, `200Mi`"},{heading:`add-a-volume`,content:"The `kustomize.toolkit.fluxcd.io/prune: disabled` annotation keeps Flux from deleting the\nPVC if it disappears from Git (e.g. a bad refactor). CI rejects PVCs without it."},{heading:`add-a-volume`,content:"The `Recreate` strategy avoids two pods writing to the same volume during a rollout."},{heading:`add-a-volume`,content:"The volume is created when the first pod using it is scheduled, so the PVC stays\n`Pending` until then: that's expected."},{heading:`add-a-volume`,content:"local-path directories are owned by `root`. If your container runs as a non-root\nuser, set `securityContext.fsGroup` on the pod to the user's group (see `apps/redis`\nfor an example)."},{heading:`back-it-up`,content:`Volumes are **not** backed up automatically. The application backup on the node
only includes the databases and directories it knows about. If the new volume
holds data we can't afford to lose, add it to the backup script: see
Backups.`},{heading:`inspecting-a-volume`,content:`Since a volume is just a directory, you can look at it from the node:`},{heading:`inspecting-a-volume`,content:`Don't edit files of a running database from the node. Stop the app first, or go
through the app itself.`}],headings:[{id:`core-concepts`,content:`Core Concepts`},{id:`add-a-volume`,content:`Add a volume`},{id:`back-it-up`,content:`Back it up`},{id:`inspecting-a-volume`,content:`Inspecting a volume`}]},o=[{depth:2,url:`#core-concepts`,title:(0,n.jsx)(n.Fragment,{children:`Core Concepts`})},{depth:2,url:`#add-a-volume`,title:(0,n.jsx)(n.Fragment,{children:`Add a volume`})},{depth:2,url:`#back-it-up`,title:(0,n.jsx)(n.Fragment,{children:`Back it up`})},{depth:2,url:`#inspecting-a-volume`,title:(0,n.jsx)(n.Fragment,{children:`Inspecting a volume`})}];function s(e){let t={a:`a`,br:`br`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components},{Callout:r}=t;return r||l(`Callout`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`core-concepts`,children:`Core Concepts`}),`
`,(0,n.jsxs)(t.p,{children:[`Many applications and services need a physical volume or storage to store their data or configuration.`,(0,n.jsx)(t.br,{}),`
`,`On K3s, volumes are plain directories on the node's data disks, created on demand by the
`,(0,n.jsx)(t.a,{href:`https://github.com/rancher/local-path-provisioner`,children:`local-path provisioner`}),` when a
`,(0,n.jsx)(t.a,{href:`https://kubernetes.io/docs/concepts/storage/persistent-volumes`,children:`PVC`}),` asks for one.
We replaced Longhorn and the Azure Managed Disk volumes we used on AKS with it.`]}),`
`,(0,n.jsx)(t.p,{children:`There are two storage classes, one per data disk:`}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Storage class`}),(0,n.jsx)(t.th,{children:`Disk`}),(0,n.jsx)(t.th,{children:`Path on the node`}),(0,n.jsx)(t.th,{children:`Use it for`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`fast`})}),(0,n.jsx)(t.td,{children:`Premium SSD v2, 64 GB`}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`/srv/fast/volumes/<namespace>/<pvc>/`})}),(0,n.jsx)(t.td,{children:`Latency-sensitive databases (today: PostgreSQL and the Redis instances)`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.code,{children:`standard`}),` (default)`]}),(0,n.jsx)(t.td,{children:`Standard SSD, 128 GB`}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`/srv/standard/volumes/<namespace>/<pvc>/`})}),(0,n.jsx)(t.td,{children:`Everything else (today: InfluxDB, Prometheus, Grafana, Uptime Kuma)`})]})]})]}),`
`,(0,n.jsx)(r,{type:`important`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`The size is not enforced.`}),` `,(0,n.jsx)(t.code,{children:`storage: 4Gi`}),` in a PVC is a label, not a quota: a volume can
grow until the whole disk is full, and then every app on that disk breaks.
Check the free space first, and keep an eye on the `,(0,n.jsx)(t.code,{children:`PersistentVolumeHigh`}),` and
`,(0,n.jsx)(t.code,{children:`NodeDiskHigh`}),` alerts.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsxs)(t.strong,{children:[(0,n.jsx)(t.code,{children:`ReadWriteOnce`}),` doesn't mean one pod.`]}),` It limits a volume to one node, and we only
have one node: two pods can mount the same volume and write to it at the same time.
Make sure only one pod at a time uses it (see `,(0,n.jsx)(t.code,{children:`Recreate`}),` below).`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Volumes are retained.`}),` Deleting a PVC doesn't delete its directory (`,(0,n.jsx)(t.code,{children:`reclaimPolicy: Retain`}),`).`]}),`
`]})}),`
`,(0,n.jsx)(t.h2,{id:`add-a-volume`,children:`Add a volume`}),`
`,(0,n.jsxs)(t.p,{children:[`First of all, `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/setup#cloudflare-warp--ssh`,children:`SSH into the node`}),` and check
how much space is available on the disk you want to use:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`df`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -h`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` /srv/fast`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` /srv/standard`})]})})})}),`
`,(0,n.jsx)(t.p,{children:`Once you verified you have sufficient space available, add the PVC to the app manifest:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark has-diff`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,title:`apps/<namespace>/deployment.yaml`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`apiVersion`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`v1`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`kind`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`PersistentVolumeClaim`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`metadata`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  name`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<name>-pvc`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  annotations`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`    kustomize.toolkit.fluxcd.io/prune`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`disabled`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`   # never let Flux delete the data`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`spec`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  accessModes`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`    - `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`ReadWriteOnce`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  storageClassName`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<storage-class>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  resources`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`    requests`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`      storage`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<size>`})]}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`---`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`apiVersion`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`apps/v1`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`kind`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`Deployment`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`metadata`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  name`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<name>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`spec`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  replicas`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`1`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  strategy`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`    type`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`Recreate`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`      # stop the old pod before starting the new one`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  selector`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`    matchLabels`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`      app`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<name>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`  template`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`    metadata`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`      labels`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`        app`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<name>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`    spec`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`      containers`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`        - `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`name`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<name>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`          image`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<image>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`          volumeMounts`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`            - `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`name`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`data`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`           # Name of the volume defined below`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`              mountPath`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`/app/data`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:` # Where you need to mount the volume`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`      volumes`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`        - `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`name`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`data`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`               # it can be whatever you want`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`          persistentVolumeClaim`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`:`})]}),`
`,(0,n.jsxs)(t.span,{className:`line diff add`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#22863A`,"--shiki-dark":`#85E89D`},children:`            claimName`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`: `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`<name>-pvc`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`  # the name of the PVC defined above`})]})]})})}),`
`,(0,n.jsx)(t.p,{children:`Parameters:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`namespace`}),` k8s namespace (set by the app's `,(0,n.jsx)(t.code,{children:`kustomization.yaml`}),`)`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`name`}),` should identify the app where the volume will be used`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`storage-class`}),` `,(0,n.jsx)(t.code,{children:`fast`}),` or `,(0,n.jsx)(t.code,{children:`standard`}),` (see `,(0,n.jsx)(t.a,{href:`#core-concepts`,children:`the table above`}),`)`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`size`}),` expected size of the volume. Check `,(0,n.jsx)(t.a,{href:`https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory`,children:`resource units`}),`.
e.g. `,(0,n.jsx)(t.code,{children:`300M`}),`, `,(0,n.jsx)(t.code,{children:`1Gi`}),`, `,(0,n.jsx)(t.code,{children:`200Mi`})]}),`
`]}),`
`,(0,n.jsx)(r,{type:`warning`,title:`Both are required`,children:(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`The `,(0,n.jsx)(t.code,{children:`kustomize.toolkit.fluxcd.io/prune: disabled`}),` annotation keeps Flux from deleting the
PVC if it disappears from Git (e.g. a bad refactor). CI rejects PVCs without it.`]}),`
`,(0,n.jsxs)(t.li,{children:[`The `,(0,n.jsx)(t.code,{children:`Recreate`}),` strategy avoids two pods writing to the same volume during a rollout.`]}),`
`]})}),`
`,(0,n.jsxs)(t.p,{children:[`The volume is created when the first pod using it is scheduled, so the PVC stays
`,(0,n.jsx)(t.code,{children:`Pending`}),` until then: that's expected.`]}),`
`,(0,n.jsx)(r,{type:`tip`,title:`File permissions`,children:(0,n.jsxs)(t.p,{children:[`local-path directories are owned by `,(0,n.jsx)(t.code,{children:`root`}),`. If your container runs as a non-root
user, set `,(0,n.jsx)(t.code,{children:`securityContext.fsGroup`}),` on the pod to the user's group (see `,(0,n.jsx)(t.code,{children:`apps/redis`}),`
for an example).`]})}),`
`,(0,n.jsx)(t.h2,{id:`back-it-up`,children:`Back it up`}),`
`,(0,n.jsxs)(t.p,{children:[`Volumes are `,(0,n.jsx)(t.strong,{children:`not`}),` backed up automatically. The application backup on the node
only includes the databases and directories it knows about. If the new volume
holds data we can't afford to lose, add it to the backup script: see
`,(0,n.jsx)(t.a,{href:`/docs/infrastructure/Guides/backups#adding-a-new-app`,children:`Backups`}),`.`]}),`
`,(0,n.jsx)(t.h2,{id:`inspecting-a-volume`,children:`Inspecting a volume`}),`
`,(0,n.jsx)(t.p,{children:`Since a volume is just a directory, you can look at it from the node:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsx)(t.code,{children:(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`sudo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` ls`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -la`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` /srv/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`fast`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`|`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`standard`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`/volumes/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`<namespace>/<name>-pvc/`})]})})})}),`
`,(0,n.jsx)(r,{type:`danger`,children:(0,n.jsx)(t.p,{children:`Don't edit files of a running database from the node. Stop the app first, or go
through the app itself.`})})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};