---
sidebar_position: 3
---
## Intro
Keep in mind that the aim of this guide is not to provide a complete overview of all the commands in the k8s ecosystem but merely to give an easy to read handbook on very basic stuff 

## Tools needed
If you want to monitor or make changes to the pods:
- Azure Cli

If you want to make changes to the infrastructure:
- Terraform
- [Pre-Commits](https://github.com/antonbabenko/pre-commit-terraform)

## Configure the tools
- Login in Azure CLI using az login
- Install Kubectl and Kubelogin by running ```sudo az aks install-cli```
- Configure Kubectl using ```az aks get-credentials --resource-group rg-polinetwork --name aks-polinetwork```
