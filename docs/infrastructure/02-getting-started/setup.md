---
sidebar_position: 1
---
# Setup

If it's your first time accessing the infrastructure, you'll need to setup the tools and configure them.

:::caution
This tutorial assumes your account has the right permissions to access the infrastructure. If not, please contact the team.
:::

## Azure CLI & Kubectl

- Download and install Kubectl [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/).

- Download and install the Azure CLI [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

- Run ```az login``` to login.

- Run ```sudo az aks install-cli``` to install kubectl

- Run ```az aks get-credentials --resource-group rg-polinetwork --name aks-polinetwork``` to configure Kubectl.

- Run ```kubelogin convert-kubeconfig``` if you have installed Kubectl > v1.26

- To check if everything is working, run ```kubectl get pods -n <namespace>```. You should see a list of pods.

:::info
The possible values of ```<namespace>``` may vary depending on the project you're working on. If you're not sure, ask the team.
:::

:::danger
Starting from Kubectl v1.26, the Azure auth plugin has been removed. If you're using a new version, you'll need to install Kubectl and Kubelogin. Then run ```kubectl get pods -n <namespace>``` again.

For now as there is no install instruction on the kubelogin repo for linux, download the latest release for your computer architecture from [here](https://github.com/Azure/kubelogin/releases), unzip it and run it with `./kubelogin convert-kubeconfig`. Follow the indicated steps
:::

## Port Forwarding

To access services running on the cluster (such as the MariaDB database), you'll need to forward the correct ports. To do so, we need the correct pod name.

- Run ```kubectl get pods -n <namespace>``` to get the pod name. The pod name is listed under the ```NAME``` column.

- Run ```kubectl port-forward <pod-name> <local-port>:<remote-port> -n <namespace>```  
For example, if you want to access the MariaDB database, you'll need to run

```sh
kubectl port-forward <pod-name> 3306:3306 -n <namespace>
```

:::tip
If you're using the MariaDB database, you can use the following command to get the pod name and forward the port in one go:  

```sh
PODNAME=$(kubectl get pods --no-headers -n mariadb -o custom-columns=":metadata.name" | tail -1); kubectl port-forward -n mariadb $PODNAME 3306:3306
```

You can use the same template to connect to other services.
:::
