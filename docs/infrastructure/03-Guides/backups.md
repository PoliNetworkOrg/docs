---
title: Backups
---

## Overview

Two systemd timers on the node, installed by Ansible (`ansible/roles/backup`), back up the cluster:

| Backup | When (UTC) | Contents |
|--------|------------|----------|
| **Applications** (`k3s-application-backup`) | Every 6 hours (00:45, 06:45, 12:45, 18:45) | PostgreSQL (`pg_dumpall`, all databases and roles), Redis (`redis` and `bot-ts` RDB snapshots), InfluxDB (`influx backup`), Uptime Kuma and Grafana (SQLite databases and files) |
| **Control plane** (`k3s-control-plane-backup`) | Daily at 02:15 | The K3s datastore (`state.db`), the K3s server token and `config.yaml` |

Each run:

1. takes consistent online copies (no app is stopped);
2. packs them in a `.tar.gz` with a `SHA256SUMS` file and encrypts it with
   [age](https://age-encryption.org/);
3. uploads it to the private `backups` container of the `polinetworkbackups`
   storage account, using the `id-k3s-backup` managed identity;
4. publishes its success time to Prometheus.

:::important Encryption
The node only has the age **public** key. The private key (the "identity") is the
secret `backup-age-identity` in the `kv-pn-infra` Key Vault, and it must never be
copied to the node. Without it, the backups can't be read.
:::

## Retention

| Where | Path | Kept for |
|-------|------|----------|
| Node | `/srv/standard/backups/k3s-applications/`, `/srv/standard/backups/k3s-control-plane/` | 7 days |
| Blob Storage | `backups/k3s-applications/k3s01/`, `backups/k3s-control-plane/k3s01/` | 90 days, immutable for the first 30 |

The storage account only accepts traffic from the K3s subnet, so download backups from the node.

## Monitoring

The `BackupStale` alert fires on Telegram when there has been no successful
application backup for 7 hours or no control-plane backup for 26 hours.
`BackupMetricsMissing` fires if the metrics disappear altogether.

From the node:

```sh
# Next and last runs
systemctl list-timers 'k3s-*-backup.timer'

# Logs of the last run
sudo journalctl -u k3s-application-backup.service -n 50

# Run a backup now
sudo systemctl start k3s-application-backup.service
```

## Adding a new app

Volumes are not backed up automatically. If you add an app with data worth keeping
(see [Add Storage](./add-storage.md)), add it to
`ansible/roles/backup/templates/k3s-application-backup.sh.j2` in polinetwork-cd, using
the right tool for the data:

- a database: its own dump/backup command, through `kubectl exec` (like PostgreSQL and InfluxDB);
- an SQLite file: the `sqlite_backup` helper, which takes a consistent copy and archives
  the other files in the volume;
- Redis: the `redis_snapshot` helper.

Then run the playbook (see [K3s Node](../02-getting-started/cloud-infrastructure/02-k3s-node.md#running-the-playbooks)):
`verify.yml` takes a fresh backup and checks it.

## Restoring

:::danger
Restoring overwrites live data. Agree on it with the Direttivo first, and take a
fresh backup right before (`sudo systemctl start k3s-application-backup.service`)
so you can go back.
:::

### 1. Get the archive

The last 7 days are on the node, in `/srv/standard/backups/k3s-applications/`,
readable only by root. Copy the one you need to your home:

```sh
sudo cp /srv/standard/backups/k3s-applications/<archive>.tar.gz.age ~
sudo chown pnadmin ~/<archive>.tar.gz.age
```

For older backups, list and download them from Blob Storage on the node, with the
backup identity (its client ID is `backup_identity_client_id` in `ansible/vars/main.yml`):

```sh
TOKEN=$(curl -s -H Metadata:true \
  "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2019-08-01&resource=https%3A%2F%2Fstorage.azure.com%2F&client_id=<backup-identity-client-id>" \
  | jq -r .access_token)

# List
curl -s -H "Authorization: Bearer $TOKEN" -H "x-ms-version: 2023-11-03" \
  "https://polinetworkbackups.blob.core.windows.net/backups?restype=container&comp=list&prefix=k3s-applications/k3s01/" \
  | grep -o '<Name>[^<]*</Name>'

# Download
curl -s -H "Authorization: Bearer $TOKEN" -H "x-ms-version: 2023-11-03" \
  -o ~/<archive>.tar.gz.age \
  "https://polinetworkbackups.blob.core.windows.net/backups/k3s-applications/k3s01/<archive>.tar.gz.age"
```

### 2. Decrypt it on your machine

Copy the encrypted archive to your machine and decrypt it there with
[age](https://github.com/FiloSottile/age#installation) and the identity from Key Vault:

```sh
scp pnadmin@10.43.1.4:<archive>.tar.gz.age .

az keyvault secret show --vault-name kv-pn-infra --name backup-age-identity \
  --query value -o tsv > age-identity.txt

mkdir restore
age --decrypt --identity age-identity.txt <archive>.tar.gz.age | tar -xz -C restore
(cd restore && sha256sum -c SHA256SUMS)

rm age-identity.txt
```

`restore/` now contains `postgres-dumpall.sql`, `redis.rdb`, `bot-ts-redis.rdb`,
`influxdb-backup.tar`, `uptime-kuma.db`, `grafana.db` and the `*-files.tar` archives.

:::caution
These files hold personal data and credentials in clear text. Delete them as soon as
you're done.
:::

### 3. Restore the data

For PostgreSQL, the dump recreates every database (`--clean --if-exists`), so you can
stream it into the running server:

```sh
ssh pnadmin@10.43.1.4 \
  "k3s kubectl exec -i -n postgres deploy/postgres -- sh -c 'psql --username=\"\$POSTGRES_USER\" --dbname=postgres'" \
  < restore/postgres-dumpall.sql
```

For the other services, stop the app (`kubectl scale --replicas=0`), put the files back
in its volume under `/srv/<fast|standard>/volumes/<namespace>/<pvc>/`, and scale it up
again. Follow the upstream docs for
[Redis](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) and
[InfluxDB](https://docs.influxdata.com/influxdb/v2/admin/backup-restore/restore/).

The control-plane backup is only needed to rebuild the node from scratch: it restores
the K3s datastore, including the service-account signing key that Azure workload
identity trusts.
