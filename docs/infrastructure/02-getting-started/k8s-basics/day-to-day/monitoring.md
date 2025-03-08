## Monitoring
The first thing you'll need to run is
```
kubectl get pods -A
```
This will give you a breakdown of all the pods running in the infrastructure, this is an example:
```
NAMESPACE              NAME                                                     READY   STATUS                   RESTARTS        AGE
argocd                 argo-argocd-application-controller-0                     1/1     Running                  0               46h
argocd                 argo-argocd-applicationset-controller-7fdfdc786f-hzbwv   1/1     Running                  0               16d
argocd                 argo-argocd-dex-server-654c59ffdf-mj77j                  1/1     Running                  0               16d
argocd                 argo-argocd-notifications-controller-7987fc45b5-jgxwr    1/1     Running                  0               16d
argocd                 argo-argocd-redis-7f845dff5-97dch                        1/1     Running                  0               16d
argocd                 argo-argocd-repo-server-9c7bf9cb-zfdcj                   1/1     Running                  12 (25h ago)    16d
argocd                 argo-argocd-server-86b5d7ddcf-686kp                      1/1     Running                  0               46h
bot-dev                bot-dev-5d95dfc74c-6kjk9                                 1/1     Running                  1 (114m ago)    8h
bot-dev                bot-dev-6b6f9f776d-8jnts                                 0/1     ContainerStatusUnknown   1               28h
bot-dev                bot-dev-6b6f9f776d-xtf9z                                 0/1     ContainerStatusUnknown   1               25h
bot-dev                bot-dev-85db98944b-slj7p                                 0/1     ContainerStatusUnknown   2 (33h ago)     46h
bot-mat                bot-mat-b5c7d6c55-xs9zh                                  1/1     Running                  0               7h37m
bot-prod               bot-prod-7967fff9bf-sbj47                                1/1     Running                  0               8h
calico-system          calico-kube-controllers-5598966f4d-xlt4b                 1/1     Running                  0               16d
calico-system          calico-node-x4n8x                                        1/1     Running                  3 (46h ago)     16d
calico-system          calico-node-x8wbh                                        1/1     Running                  1 (4h14m ago)   10h
calico-system          calico-typha-d78cf44dc-rv2bz                             1/1     Running                  0               16d
kube-system            cloud-node-manager-5qkc2                                 1/1     Running                  0               10h
kube-system            cloud-node-manager-v78ms                                 1/1     Running                  0               16d
kube-system            coredns-autoscaler-5589fb5654-5gx7t                      1/1     Running                  0               16d
kube-system            coredns-b4854dd98-gk44p                                  1/1     Running                  0               16d
kube-system            coredns-b4854dd98-nmkrp                                  1/1     Running                  0               16d
kube-system            csi-azuredisk-node-l8bfw                                 3/3     Running                  0               10h
kube-system            csi-azuredisk-node-rvmlx                                 3/3     Running                  0               16d
kube-system            csi-azurefile-node-fkpgg                                 3/3     Running                  0               10h
kube-system            csi-azurefile-node-q8khz                                 3/3     Running                  0               16d
kube-system            konnectivity-agent-bc779f4c7-2gr86                       1/1     Running                  0               16d
kube-system            konnectivity-agent-bc779f4c7-mdbmq                       1/1     Running                  0               16d
kube-system            kube-proxy-nlvhd                                         1/1     Running                  0               16d
kube-system            kube-proxy-vbwtj                                         1/1     Running                  0               10h
kube-system            metrics-server-f77b4cd8-k9v6f                            1/1     Running                  0               16d
kube-system            metrics-server-f77b4cd8-zkfhl                            1/1     Running                  0               16d
kubernetes-dashboard   dashboard-metrics-scraper-6f669b9c9b-mjzfj               1/1     Running                  0               33h
kubernetes-dashboard   kubernetes-dashboard-758765f476-hvzdz                    1/1     Running                  0               33h
mariadb                mariadb-67f5f7896c-bcw2r                                 0/1     ContainerStatusUnknown   1               2d
mariadb                mariadb-67f5f7896c-ng5df                                 1/1     Running                  0               24h
tigera-operator        tigera-operator-7c546fc6d5-hjdbc                         1/1     Running                  9 (25h ago)     16d
```
You see that the dev bot is struggling a bit with multiple reboots and dead pods, which is to be expected as its allocated resources are the lowest in the cluster, given the marginal importance.
You can also see that the production bots (prod and mat) are both apparently healthy and the database is fine with only 1 reboot 24h ago.

You can take a deeper look into the monitoring with ArgoCD.
Start by getting the argocd password using
```
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```
then configure the port-forward to your localhost:8081
```
kubectl port-forward -n argocd :argo-argocd-server_POD_NAME: 8081:8080
```
now connect to argoCD via `localhost:8081`.
Find an overview of argocd [here](https://argo-cd.readthedocs.io/en/stable/)
