---
sidebar_position: 2
---
## Continuous Delivery
Following the [Bot Pipeline](https://github.com/PoliNetworkOrg/PoliNetworkBot_CSharp/blob/master/.github/workflows/ci-cd.yaml) we deploy the built Docker Image in our [Docker Hub registry](https://hub.docker.com/u/polinetwork).
We currently have 2 environments, dev and prod on the dev and main branch respectively.
Finally we update [these](https://github.com/polinetworkorg/polinetwork-cd) k8s (Kubernetes) deployment files. 
## Continuous Deployment
We rely on ArgoCD to deploy our pods following the manifest present in the polinetwork-cd repository, as specified [here in the terraform deployment code](https://github.com/PoliNetworkOrg/terraform/blob/main/argocd-applications.yaml).
ArgoCD works by ensuring 0 downtime (by monitoring continuously all the deployed pods) and checking for changes on the polinetwork-cd repository (which is updated by the various pipeline whenever a change is pushed to the registry) ensuring fast deployment of fixes and changes in dev and prod environments.
