---
title: Add Storage
---

## Core Concepts

Many applications and services need a physical volume or storage to store their data or configuration.  
As you should know, we use AKS (Kubernetes) to host everything from databases to telegram bots.  
In our AKS cluster we have (ATTOW) a single node (VM) `Standard_B2ms` which allows to attach only 4 disks,
one of which is the VM's disk itself.
This means that you can only attach 3 managed disks to the Cluster, resulting in limited deployable services.

To solve this problem, we added [Longhorn](https://longhorn.io/) so that we can create multiple
[PVC](https://kubernetes.io/docs/concepts/storage/persistent-volumes) from the VM's disk 
(ATTOW it's a 128GB Standard SSD).

:::important
Longhorn is a handy tool to create multiple PVC/volumes without creating new disks, but this comes with degraded performance and stability.  
If you want to deploy something critical like a production database, it's recommended to create a dedicated
[Managed Disk](https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview).
:::

## Add a Longhorn volume

First of all, you must login in [our Longhorn dashboard](https://longhorn.polinetwork.org) and check
how much space is available for scheduling a new volume.
:::tip 
- `Schedulable` is space you can use to create new volumes
- `Reserved` is space reserved to the VM, not available to create new volumes

How much `Reserved` space is configured in the `Node` page, but at least 20-25 GB is recommended.
:::

Once you verified you have sufficient `Schedulable` space available, you can create the PVC in the k8s manifest:

```yaml title="my-longhorn-example.yaml"
# add-highlight-start
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: <name>-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn-static
  resources:
    requests:
      storage: <size>
# add-highlight-end
---
kind: Pod
apiVersion: v1
metadata:
  name: my-longhorn-example-pod
  namespace: <namespace>
spec:
  containers:
    - name: busybox
      image: registry.k8s.io/e2e-test-images/busybox:1.29-4
      command:
        - '/bin/sleep'
        - '10000'
      # add-highlight-start
      volumeMounts:
        - name: my-volume # Name of the volume defined below
          mountPath: /app/data # Where you need to mount the volume
      # add-highlight-end
# add-highlight-start
  volumes:
    - name: my-volume # it can be whatever you want
      persistentVolumeClaim:
        claimName: <name>-pvc # the name of the PVC defined above
# add-highlight-end
```

Parameters:
- `namespace` k8s namespace
- `name` should identify the app where the volume will be used
- `size` size of the volume. Check [resource units](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory).
    e.g. `300M`, `1Gi`, `200Mi`
