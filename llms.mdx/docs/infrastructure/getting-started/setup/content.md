# Setup (/docs/infrastructure/getting-started/setup)

If it's your first time accessing the infrastructure, you'll need to set up the tools and configure them.

<Callout type="caution">

This tutorial assumes your account has the right permissions to access the infrastructure. If not, please contact the team.
SSH access to the node is restricted to the **IT Lead** group.

</Callout>

## How access works [#how-access-works]

The K3s node `k3s01` lives at the private address `10.43.1.4`, inside the Azure
VNet `vnet-k3s`. Its public IP is used only for outbound traffic: the Azure
firewall (NSG) denies all inbound traffic. Nothing reaches the VM directly from
the Internet:

- websites reach the cluster through a **Cloudflare Tunnel** (an outbound connection
  opened by `cloudflared` pods running in the cluster);
- people reach the VM through **Cloudflare WARP**, which routes `10.43.1.4` through
  the same tunnel, and **Cloudflare Access for Infrastructure**, which signs a
  short-lived SSH certificate after you log in with your PoliNetwork account.

There is no kubeconfig to download: you SSH into the node and run `kubectl` there.

## Cloudflare WARP & SSH [#cloudflare-warp--ssh]

- Install the [Cloudflare WARP client](https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/download-warp/).

- Enroll it in PoliNetwork's Cloudflare Zero Trust organization
  (*Preferences → Account → Login to Cloudflare Zero Trust*) and log in with your
  PoliNetwork account. Ask the team for the organization (team) name.

- With WARP connected, SSH into the node:

  ```sh
  ssh pnadmin@10.43.1.4
  ```

  The first time, your browser asks you to authenticate. You don't need an SSH key:
  Cloudflare issues a short-lived certificate for the `pnadmin` user, and the node
  only accepts keys and Cloudflare Access certificates (no passwords, no root login).

- To check if everything is working, run `k3s kubectl get pods -n <namespace>`. You should see a list of pods.

<Callout type="tip">

`pnadmin` is in the `k3s-admin` group, which can read the K3s kubeconfig, so
`k3s kubectl` works without `sudo`. Add an alias to save some typing:

```sh
echo "alias kubectl='k3s kubectl'" >> ~/.bashrc
```

The rest of the docs write `kubectl` and assume this alias.

</Callout>

<Callout type="info">

The possible values of ```<namespace>``` match the folders in
[`apps/`](https://github.com/polinetworkorg/polinetwork-cd/tree/main/apps) in the
polinetwork-cd repository (e.g. `web`, `backend`, `postgres`). Run
`kubectl get namespaces` to see them all.

</Callout>

<Callout type="danger" title="Break-glass access">

If Cloudflare is down or the tunnel is broken, you can still reach the VM through
**Azure Run Command** or the **Serial Console** in the Azure portal (VM `k3s01`,
resource group `rg-polinetwork`). Use them only for emergencies.

</Callout>

## Azure CLI [#azure-cli]

You still need the Azure CLI to manage secrets in Key Vault and to inspect Azure
resources.

- Download and install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

- Run ```az login``` to login.

You don't need `az aks get-credentials` or `kubelogin` anymore: those were only
needed for the old AKS cluster.

## Web dashboards [#web-dashboards]

| URL | What | Who can log in |
|-----|------|----------------|
| [flux.polinetwork.org](https://flux.polinetwork.org) | Flux Web UI: sync status of every app, reconcile/suspend/resume | Direttivo, via auth.polinetwork.org |
| [monitoring.polinetwork.org](https://monitoring.polinetwork.org) | Grafana dashboards (Prometheus metrics) | Grafana accounts |
| [status.polinetwork.org](https://status.polinetwork.org) | Uptime Kuma status page | Public |

## Port Forwarding [#port-forwarding]

To access services running on the cluster (such as the PostgreSQL database), you
need two hops: `kubectl port-forward` on the node, and an SSH tunnel from your
machine to the node. You can do both with one command:

```sh
ssh -L <local-port>:localhost:<remote-port> pnadmin@10.43.1.4 \
  k3s kubectl port-forward -n <namespace> svc/<service-name> <remote-port>:<service-port>
```

For example, to reach PostgreSQL on `localhost:5432`:

```sh
ssh -L 5432:localhost:5432 pnadmin@10.43.1.4 \
  k3s kubectl port-forward -n postgres svc/postgres-service 5432:5432
```

Keep the command running while you use the connection, and stop it with `Ctrl+C`.

<Callout type="tip">

Run `kubectl get svc -n <namespace>` on the node to find service names and ports.
You can use the same template to connect to other services.

</Callout>
