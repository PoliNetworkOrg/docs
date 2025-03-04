# Deploy a New App

## Introduction

We use k8s to deploy our applications.  
You can choose, based on your needs, to use basic k8s manifests, [Kustomize](https://kustomize.io/) or [Helm Charts](https://helm.sh/docs/topics/charts/).

If you have access to PoliNetwork's k8s cluster (you can perform `kubectl` commands) you can directly deploy from your machine.  
Although, this is not recommended in a production environment.  
Check [minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download) to install a k8s cluster in your machine for testing purposes.

## Continuos Deployment (CD)

:::note TL;DR
To deploy our applications, we use [ArgoCD](https://argo-cd.readthedocs.io/en/stable/) 
with a [Git File Generator](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Git/#git-generator-files) 
pointing to the [polinetwork-cd](https://github.com/PoliNetworkOrg/polinetwork-cd) GitHub repo.
:::

In this section, we are going to explain how (and why) we structured our Continuos Deployment (CD). 

[[ TODO ]]
