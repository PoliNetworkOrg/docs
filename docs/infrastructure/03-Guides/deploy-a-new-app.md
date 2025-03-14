---
title: Deploy a New App
---

## Introduction

We use k8s to deploy our applications.  
You can choose, based on your needs, to use basic k8s manifests, [Kustomize](https://kustomize.io/) or [Helm Charts](https://helm.sh/docs/topics/charts/).

If you have access to PoliNetwork's k8s cluster (you can perform `kubectl` commands) you can directly deploy from your machine.  
Although, this is not recommended in a production environment.  
Check [minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download) to install a k8s cluster in your machine for testing purposes.

:::note CD
To deploy our applications, we use [ArgoCD](https://argo-cd.readthedocs.io/en/stable/) 
with a [Git File Generator](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Git/#git-generator-files) 
pointing to the [polinetwork-cd](https://github.com/PoliNetworkOrg/polinetwork-cd/) GitHub repo.

For more info, check out *[Getting Started / Basic Knowledge]*
:::

## Procedure

1. Deploy a [Docker image](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/)
2. [Create the app structure](#create-the-app-structure)
3. Open a PR into polinetwork-cd
4. Monitor deploy on ArgoCD

### Create the app structure
This is the crucial part, so make sure to follow it step-by-step.
1. Clone [polinetwork-cd](https://github.com/PoliNetworkOrg/polinetwork-cd) repo
2. Create a new branch (named as you like, e.g. `mc-server-deploy`)
3. Create this minimal file structure:
```
🗀 <k8s-namespace>
├─ 🗀 src
│  └── deployment.yaml
│ 
└─ config.json
```

:::info
The `<k8s-namespace>` should be a slug (lowercase words separated by hyphens) identifier of the application/service you want to deploy.  
You can append, if necessary, an enviornment tag (e.g. `app-dev`, `app-prod`).  

Make sure that you use the same `<k8s-namespace>` value for both:
- folder name
- namespace field in k8s resources
:::
 
Inside `src/` you can put one of the following:
- base k8s manifest ([example](https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/controllers/nginx-deployment.yaml))
- [Kustomize](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)
- [Helm Chart](https://helm.sh/docs/topics/charts/)

How these build tools are detected and distinguished is described [here](https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/#tool-detection).

:::important
If you would like to use the Docker Image Auto-Updater, base k8s manifests are not supported, you must choose between Kustomize and Helm Chart.

For more info, check the [relative section](#docker-image-auto-updater).
:::

## Docker Image Auto-Updater
We use [ArgoCD Image Updater](https://argocd-image-updater.readthedocs.io/en/stable/) to 
automatically update docker images in deployments.  
This is an optional feature, but the alternative is to use a docker image fixed version (e.g. `nginx:1.27.4`).  

We use the `digest` strategy by default (also the only one we documented so far).  
Check out [the other strategies available](https://argocd-image-updater.readthedocs.io/en/stable/basics/update-strategies/).

As mentioned in the [section above](#create-the-app-structure), you must use Kustomize or Helm Charts.

:::warning
Consider the following manifest:
```yaml
kind: Pod
apiVersion: v1
metadata:
  name: example-pod
  namespace: test
spec:
  containers:
    - name: nginx
      image: nginx:latest
```
the image would **not update** if you **don't follow** this guide, even though there is `latest`.
:::

### Digest with Kustomize
- [Full example](https://github.com/PoliNetworkOrg/polinetwork-cd/tree/main/tests/docker-test)

In this configuration, we are using a Kustomize deployment with `digest` strategy.  
These are the steps to follow: (we are using `toto04/testcontainer` as the docker image)

1. Create a `src/kustomization.yaml` with this content:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- deployment.yaml
```

2. As declared in the `resources` field above, we need a k8s manifest `src/deployment.yaml`.  
Create it and set the `spec.containers[x].image` field as a fixed digest, example:
```yaml
spec:
  containers:
  - name: docker-test-pod
    image: toto04/testcontainer@sha256:b5ec2efcc11e90c2fd955cd1c01f3fdf7c2f18c77c213360addcd37be7e8f2f3
```

:::tip
If you are using Docker Hub, you can find a digest going to the image homepage ([example](https://hub.docker.com/r/toto04/testcontainer/tags))
under the tag you want to use (e.g. `latest`)
:::

3. In the `config.json` file set the image(s) to automatically update:
```yaml
  "image": {
    "image_list": "toto04/testcontainer:latest",
    "update_strategy": "digest"
  }
```

In this configuration, the image `toto04/testcontainer` would be automatically updated following the tag `latest`.



:::tip
You can also specify multiple images to update:
```yaml title="config.json"
  "image": {
# add-highlight-start
    "image_list": "x/image1:latest x/image2:latest",
# add-highlight-end
    "update_strategy": "digest"
  }
```

```yaml title="src/deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-1
  namespace: <k8s-namespace>
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app-1
  template:
    metadata:
      labels:
        app: app-1
    spec:
      containers:
      - name: app-1-pod
# add-highlight-start
        image: x/image1@sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# add-highlight-end
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-2
  namespace: <k8s-namespace>
spec:
  replicas: 2
  selector:
    matchLabels:
      app: app-2
  template:
    metadata:
      labels:
        app: app-2
    spec:
      containers:
      - name: app-2-pod
# add-highlight-start
        image: x/image2@sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# add-highlight-end
```
:::

## Options
These are some useful options you can configure by editing the `config.json` file.
### Disable an app
If you want to disable an app (excluding it from the git generator) you can add `"disabled": true`.  
Example:
```yaml title="config.json"
{
# add-highlight-next-line
  "disabled": true
  "image": {
    "image_list": "x/image1:latest x/image2:latest",
    "update_strategy": "digest"
  }
}
```

To reactivate the application just remove this property or set it to `false`.  
This configuration option is introduced with [this commit](https://github.com/PoliNetworkOrg/terraform/commit/8ddf6e984c802d823573e85f147d48a916556c7c).

:::info
In the git generator configuration the selector is set to `"false"` due to the limitations of `matchExpression`.  
However, in the application's `config.json` you can set the `disabled` flag to either `false` or `"false"`.
:::
