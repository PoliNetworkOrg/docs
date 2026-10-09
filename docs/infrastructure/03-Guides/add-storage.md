---
title: Add Storage
---

## Core Concepts

Many applications and services need a physical volume or storage to store their data or configuration.  
On K3s, volumes are plain directories on the node's data disks, created on demand by the
[local-path provisioner](https://github.com/rancher/local-path-provisioner) when a
[PVC](https://kubernetes.io/docs/concepts/storage/persistent-volumes) asks for one.
We replaced Longhorn and the Azure Managed Disk volumes we used on AKS with it.

There are two storage classes, one per data disk:

| Storage class | Disk | Path on the node | Use it for |
|---------------|------|------------------|------------|
| `fast` | Premium SSD v2, 64 GB | `/srv/fast/volumes/<namespace>/<pvc>/` | Latency-sensitive databases (today: PostgreSQL and the Redis instances) |
| `standard` (default) | Standard SSD, 128 GB | `/srv/standard/volumes/<namespace>/<pvc>/` | Everything else (today: InfluxDB, Prometheus, Grafana, Uptime Kuma) |

:::important
- **The size is not enforced.** `storage: 4Gi` in a PVC is a label, not a quota: a volume can
  grow until the whole disk is full, and then every app on that disk breaks.
  Check the free space first, and keep an eye on the `PersistentVolumeHigh` and
  `NodeDiskHigh` alerts.
- **Volumes are `ReadWriteOnce`** and live on one node: only one pod at a time should
  write to them.
- **Volumes are retained.** Deleting a PVC doesn't delete its directory (`reclaimPolicy: Retain`).
:::

## Add a volume

First of all, [SSH into the node](../getting-started/setup#cloudflare-warp--ssh) and check
how much space is available on the disk you want to use:

```sh
df -h /srv/fast /srv/standard
```

Once you verified you have sufficient space available, add the PVC to the app manifest:

```yaml title="apps/<namespace>/deployment.yaml"
# add-highlight-start
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
# add-highlight-end
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <name>
spec:
  replicas: 1
  # add-highlight-start
  strategy:
    type: Recreate      # stop the old pod before starting the new one
  # add-highlight-end
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
          # add-highlight-start
          volumeMounts:
            - name: data           # Name of the volume defined below
              mountPath: /app/data # Where you need to mount the volume
          # add-highlight-end
      # add-highlight-start
      volumes:
        - name: data               # it can be whatever you want
          persistentVolumeClaim:
            claimName: <name>-pvc  # the name of the PVC defined above
      # add-highlight-end
```

Parameters:
- `namespace` k8s namespace (set by the app's `kustomization.yaml`)
- `name` should identify the app where the volume will be used
- `storage-class` `fast` or `standard` (see [the table above](#core-concepts))
- `size` expected size of the volume. Check [resource units](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory).
    e.g. `300M`, `1Gi`, `200Mi`

:::warning Both are required
- The `kustomize.toolkit.fluxcd.io/prune: disabled` annotation keeps Flux from deleting the
  PVC if it disappears from Git (e.g. a bad refactor). CI rejects PVCs without it.
- The `Recreate` strategy avoids two pods writing to the same volume during a rollout.
:::

The volume is created when the first pod using it is scheduled, so the PVC stays
`Pending` until then: that's expected.

:::tip File permissions
local-path directories are owned by `root`. If your container runs as a non-root
user, set `securityContext.fsGroup` on the pod to the user's group (see `apps/redis`
for an example).
:::

## Back it up

Volumes are **not** backed up automatically. The application backup on the node
only includes the databases and directories it knows about. If the new volume
holds data we can't afford to lose, add it to the backup script: see
[Backups](./backups.md#adding-a-new-app).

## Inspecting a volume

Since a volume is just a directory, you can look at it from the node:

```sh
sudo ls -la /srv/<fast|standard>/volumes/<namespace>/<name>-pvc/
```

:::danger
Don't edit files of a running database from the node. Stop the app first, or go
through the app itself.
:::
