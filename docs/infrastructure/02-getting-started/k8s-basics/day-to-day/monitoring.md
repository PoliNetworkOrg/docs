## Monitoring

### Alerts

You usually don't have to go looking for problems: Prometheus evaluates alert
rules and Alertmanager sends them to our **Telegram** alert chat. Critical alerts
repeat every hour, warnings every 12 hours. Among others, you get alerted when:

- the node is short on CPU, memory, disk space or inodes;
- a pod is crash-looping, OOM-killed or not running, or a deployment is missing replicas;
- a Flux resource, an `ExternalSecret` or a secret store is not ready;
- the Cloudflare tunnel has no connections (all public websites are down);
- a backup hasn't succeeded on schedule.

The rules live in `apps/monitoring/prometheus/alert-rules.yml` in polinetwork-cd.

### Dashboards

- [Flux Web UI](https://flux.polinetwork.org): is every app in sync with Git? Why not?
- [Grafana](https://monitoring.polinetwork.org): node and container metrics from Prometheus.
- [Uptime Kuma](https://status.polinetwork.org): is each public website up?

### From the command line

[SSH into the node](../../setup.md#cloudflare-warp--ssh), then run

```
kubectl get pods -A
```

This will give you a breakdown of all the pods running in the infrastructure.
Besides one namespace per app (`web`, `backend`, `postgres`, ...), you'll see:

| Namespace | What runs there |
|-----------|-----------------|
| `flux-system` | Flux controllers, the Flux Web UI |
| `external-secrets` | External Secrets Operator |
| `cloudflared` | The two Cloudflare Tunnel connectors |
| `local-path-storage` | The volume provisioner |
| `kube-system` | K3s components: CoreDNS, Traefik, metrics-server, node-exporter |

Look at the `READY`, `STATUS` and `RESTARTS` columns: a pod that is not `Running`,
or whose restart count keeps growing, needs a look. Some useful follow-ups:

```sh
# Events and the reason of the last restart
kubectl describe pod -n <namespace> <pod-name>

# Logs (add --previous to see the logs of the crashed container)
kubectl logs -n <namespace> deploy/<deployment-name>

# CPU and memory usage per pod
kubectl top pods -A

# Apps that Flux couldn't apply
kubectl get kustomizations -n flux-system
```

Find an overview of Flux in [Flux](../../cloud-infrastructure/03-flux.md).
