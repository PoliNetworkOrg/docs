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
pointing to the [polinetwork-cd](https://github.com/PoliNetworkOrg/polinetwork-cd) GitHub repo.

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

For more info, check the *[relative section]*
:::
