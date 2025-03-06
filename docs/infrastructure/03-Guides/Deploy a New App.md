# Deploy a New App

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
2. Create the app structure
3. Open a PR into polinetwork-cd
4. Monitor deploy on ArgoCD

### Create the app structure
1. Clone [polinetwork-cd](https://github.com/PoliNetworkOrg/polinetwork-cd) repo
2. Create a new branch (named as you like, e.g. `mc-server-deploy`)
3. Create this basic file structure:
```
🗀 <k8s-namespace>
├─ 🗀 src
│  └── deployment.yaml
│ 
└─ config.json
```

:::warning
The `<k8s-namespace>` should be a slug (lowercase words separated by hyphens) identifier of the application/service you want to deploy.  
You can append, if necessary, a enviornment tag (e.g. `app-dev`, `app-prod`).  

Make sure that you use the same `<k8s-namespace>` value for both:
- folder name
- namespace field in k8s resources
:::
 
Inside `src/` you can put one of the following:
- base k8s manifest (example [here](https://raw.githubusercontent.com/kubernetes/website/main/content/en/examples/controllers/nginx-deployment.yaml))
- [Kustomize](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)
- [Helm Chart](https://helm.sh/docs/topics/charts/)

:::important
If you would like to use the Docker Image Auto-Updater, base k8s manifests are not supported, you must choose between Kustomize and Helm Chart.

For more info, check the [relative section](#docker-image-auto-updater)
:::

## Docker Image Auto-Updater
We use [ArgoCD Image Updater](https://argocd-image-updater.readthedocs.io/en/stable/) to 
automatically update docker images in deployments.  
This is an optional feature, but the alternative is a fixed version (e.g. `nginx:1.27.4`).  

You can find a working example [here](https://github.com/PoliNetworkOrg/polinetwork-cd/tree/main/tests/docker-test).

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

1. In the `spec.containers[x].image` field you must set a fixed digest, example:
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
