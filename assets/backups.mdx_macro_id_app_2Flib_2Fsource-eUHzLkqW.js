import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Backups`},i=`## Overview [#overview]

Two systemd timers on the node, installed by Ansible (\`ansible/roles/backup\`), back up the cluster:

| Backup | When (UTC) | Contents |
|--------|------------|----------|
| **Applications** (\`k3s-application-backup\`) | Every 6 hours (00:45, 06:45, 12:45, 18:45) | PostgreSQL (\`pg_dumpall\`, all databases and roles), Redis (\`redis\` and \`bot-ts\` RDB snapshots), InfluxDB (\`influx backup\`), Uptime Kuma and Grafana (SQLite databases and files) |
| **Control plane** (\`k3s-control-plane-backup\`) | Daily at 02:15 | The K3s datastore (\`state.db\`), the K3s server token and \`config.yaml\` |

Each run:

1. takes consistent online copies (no app is stopped);
2. packs them in a \`.tar.gz\` with a \`SHA256SUMS\` file and encrypts it with
   [age](https://age-encryption.org/);
3. uploads it to the private \`backups\` container of the \`polinetworkbackups\`
   storage account, using the \`id-k3s-backup\` managed identity;
4. publishes its success time to Prometheus.

<Callout type="important" title="Encryption">

The node only has the age **public** key. The private key (the "identity") is the
secret \`backup-age-identity\` in the \`kv-pn-infra\` Key Vault, and it must never be
copied to the node. Without it, the backups can't be read.

</Callout>

## Retention [#retention]

| Where | Path | Kept for |
|-------|------|----------|
| Node | \`/srv/standard/backups/k3s-applications/\`, \`/srv/standard/backups/k3s-control-plane/\` | 7 days |
| Blob Storage | \`backups/k3s-applications/k3s01/\`, \`backups/k3s-control-plane/k3s01/\` | 90 days, immutable for the first 30 |

The storage account only accepts traffic from the K3s subnet, so download backups from the node.

## Monitoring [#monitoring]

The \`BackupStale\` alert fires on Telegram when there has been no successful
application backup for 7 hours or no control-plane backup for 26 hours.
\`BackupMetricsMissing\` fires if the metrics disappear altogether.

From the node:

\`\`\`sh
# Next and last runs
systemctl list-timers 'k3s-*-backup.timer'

# Logs of the last run
sudo journalctl -u k3s-application-backup.service -n 50

# Run a backup now
sudo systemctl start k3s-application-backup.service
\`\`\`

## Adding a new app [#adding-a-new-app]

Volumes are not backed up automatically. If you add an app with data worth keeping
(see [Add Storage](/docs/infrastructure/Guides/add-storage)), add it to
\`ansible/roles/backup/templates/k3s-application-backup.sh.j2\` in polinetwork-cd, using
the right tool for the data:

- a database: its own dump/backup command, through \`kubectl exec\` (like PostgreSQL and InfluxDB);
- an SQLite file: the \`sqlite_backup\` helper, which takes a consistent copy and archives
  the other files in the volume;
- Redis: the \`redis_snapshot\` helper.

Then run the playbook (see [K3s Node](/docs/infrastructure/getting-started/cloud-infrastructure/k3s-node#running-the-playbooks)):
\`verify.yml\` takes a fresh backup and checks it.

## Restoring [#restoring]

<Callout type="danger">

Restoring overwrites live data. Agree on it with the Direttivo first, and take a
fresh backup right before (\`sudo systemctl start k3s-application-backup.service\`)
so you can go back.

</Callout>

### 1. Get the archive [#1-get-the-archive]

The last 7 days are on the node, in \`/srv/standard/backups/k3s-applications/\`,
readable only by root. Copy the one you need to your home:

\`\`\`sh
sudo cp /srv/standard/backups/k3s-applications/<archive>.tar.gz.age ~
sudo chown pnadmin ~/<archive>.tar.gz.age
\`\`\`

For older backups, list and download them from Blob Storage on the node, with the
backup identity (its client ID is \`backup_identity_client_id\` in \`ansible/vars/main.yml\`):

\`\`\`sh
TOKEN=$(curl -s -H Metadata:true \\
  "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2019-08-01&resource=https%3A%2F%2Fstorage.azure.com%2F&client_id=<backup-identity-client-id>" \\
  | jq -r .access_token)

# List
curl -s -H "Authorization: Bearer $TOKEN" -H "x-ms-version: 2023-11-03" \\
  "https://polinetworkbackups.blob.core.windows.net/backups?restype=container&comp=list&prefix=k3s-applications/k3s01/" \\
  | grep -o '<Name>[^<]*</Name>'

# Download
curl -s -H "Authorization: Bearer $TOKEN" -H "x-ms-version: 2023-11-03" \\
  -o ~/<archive>.tar.gz.age \\
  "https://polinetworkbackups.blob.core.windows.net/backups/k3s-applications/k3s01/<archive>.tar.gz.age"
\`\`\`

### 2. Decrypt it on your machine [#2-decrypt-it-on-your-machine]

Copy the encrypted archive to your machine and decrypt it there with
[age](https://github.com/FiloSottile/age#installation) and the identity from Key Vault:

\`\`\`sh
scp pnadmin@10.43.1.4:<archive>.tar.gz.age .

# umask 077: the identity file is readable only by you
(umask 077; az keyvault secret show --vault-name kv-pn-infra --name backup-age-identity \\
  --query value -o tsv > age-identity.txt)

mkdir restore
age --decrypt --identity age-identity.txt <archive>.tar.gz.age | tar -xz -C restore
(cd restore && sha256sum -c SHA256SUMS)

rm age-identity.txt
\`\`\`

\`restore/\` now contains \`postgres-dumpall.sql\`, \`redis.rdb\`, \`bot-ts-redis.rdb\`,
\`influxdb-backup.tar\`, \`uptime-kuma.db\`, \`grafana.db\` and the \`*-files.tar\` archives.

<Callout type="caution">

These files hold personal data and credentials in clear text. Delete them as soon as
you're done.

</Callout>

### 3. Restore the data [#3-restore-the-data]

For PostgreSQL, the dump recreates every database (\`--clean --if-exists\`), so you can
stream it into the running server:

\`\`\`sh
ssh pnadmin@10.43.1.4 \\
  "k3s kubectl exec -i -n postgres deploy/postgres -- sh -c 'psql --username=\\"\\$POSTGRES_USER\\" --dbname=postgres'" \\
  < restore/postgres-dumpall.sql
\`\`\`

For the other services, stop the app (\`kubectl scale --replicas=0\`), put the files back
in its volume under \`/srv/<fast|standard>/volumes/<namespace>/<pvc>/\`, and scale it up
again. Follow the upstream docs for
[Redis](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) and
[InfluxDB](https://docs.influxdata.com/influxdb/v2/admin/backup-restore/restore/).

The control-plane backup is only needed to rebuild the node from scratch: it restores
the K3s datastore, including the service-account signing key that Azure workload
identity trusts.
`,a={contents:[{heading:`overview`,content:"Two systemd timers on the node, installed by Ansible (`ansible/roles/backup`), back up the cluster:"},{heading:`overview`,content:"| Backup                                      | When (UTC)                                 | Contents                                                                                                                                                                         |\n| ------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |\n| **Applications** (`k3s-application-backup`) | Every 6 hours (00:45, 06:45, 12:45, 18:45) | PostgreSQL (`pg_dumpall`, all databases and roles), Redis (`redis` and `bot-ts` RDB snapshots), InfluxDB (`influx backup`), Uptime Kuma and Grafana (SQLite databases and files) |",table:`table-0`},{heading:`overview`,content:"| Backup                                         | When (UTC)     | Contents                                                               |\n| ---------------------------------------------- | -------------- | ---------------------------------------------------------------------- |\n| **Control plane** (`k3s-control-plane-backup`) | Daily at 02:15 | The K3s datastore (`state.db`), the K3s server token and `config.yaml` |",table:`table-0`},{heading:`overview`,content:`Each run:`},{heading:`overview`,content:`takes consistent online copies (no app is stopped);`},{heading:`overview`,content:"packs them in a `.tar.gz` with a `SHA256SUMS` file and encrypts it with\nage;"},{heading:`overview`,content:"uploads it to the private `backups` container of the `polinetworkbackups`\nstorage account, using the `id-k3s-backup` managed identity;"},{heading:`overview`,content:`publishes its success time to Prometheus.`},{heading:`overview`,content:'The node only has the age **public** key. The private key (the "identity") is the\nsecret `backup-age-identity` in the `kv-pn-infra` Key Vault, and it must never be\ncopied to the node. Without it, the backups can\'t be read.'},{heading:`retention`,content:"| Where | Path                                                                                  | Kept for |\n| ----- | ------------------------------------------------------------------------------------- | -------- |\n| Node  | `/srv/standard/backups/k3s-applications/`, `/srv/standard/backups/k3s-control-plane/` | 7 days   |",table:`table-1`},{heading:`retention`,content:"| Where        | Path                                                                  | Kept for                            |\n| ------------ | --------------------------------------------------------------------- | ----------------------------------- |\n| Blob Storage | `backups/k3s-applications/k3s01/`, `backups/k3s-control-plane/k3s01/` | 90 days, immutable for the first 30 |",table:`table-1`},{heading:`retention`,content:`The storage account only accepts traffic from the K3s subnet, so download backups from the node.`},{heading:`monitoring`,content:"The `BackupStale` alert fires on Telegram when there has been no successful\napplication backup for 7 hours or no control-plane backup for 26 hours.\n`BackupMetricsMissing` fires if the metrics disappear altogether."},{heading:`monitoring`,content:`From the node:`},{heading:`adding-a-new-app`,content:`Volumes are not backed up automatically. If you add an app with data worth keeping
(see Add Storage), add it to
\`ansible/roles/backup/templates/k3s-application-backup.sh.j2\` in polinetwork-cd, using
the right tool for the data:`},{heading:`adding-a-new-app`,content:"a database: its own dump/backup command, through `kubectl exec` (like PostgreSQL and InfluxDB);"},{heading:`adding-a-new-app`,content:"an SQLite file: the `sqlite_backup` helper, which takes a consistent copy and archives\nthe other files in the volume;"},{heading:`adding-a-new-app`,content:"Redis: the `redis_snapshot` helper."},{heading:`adding-a-new-app`,content:"Then run the playbook (see K3s Node):\n`verify.yml` takes a fresh backup and checks it."},{heading:`restoring`,content:`Restoring overwrites live data. Agree on it with the Direttivo first, and take a
fresh backup right before (\`sudo systemctl start k3s-application-backup.service\`)
so you can go back.`},{heading:`1-get-the-archive`,content:"The last 7 days are on the node, in `/srv/standard/backups/k3s-applications/`,\nreadable only by root. Copy the one you need to your home:"},{heading:`1-get-the-archive`,content:"For older backups, list and download them from Blob Storage on the node, with the\nbackup identity (its client ID is `backup_identity_client_id` in `ansible/vars/main.yml`):"},{heading:`2-decrypt-it-on-your-machine`,content:`Copy the encrypted archive to your machine and decrypt it there with
age and the identity from Key Vault:`},{heading:`2-decrypt-it-on-your-machine`,content:"`restore/` now contains `postgres-dumpall.sql`, `redis.rdb`, `bot-ts-redis.rdb`,\n`influxdb-backup.tar`, `uptime-kuma.db`, `grafana.db` and the `*-files.tar` archives."},{heading:`2-decrypt-it-on-your-machine`,content:`These files hold personal data and credentials in clear text. Delete them as soon as
you're done.`},{heading:`3-restore-the-data`,content:"For PostgreSQL, the dump recreates every database (`--clean --if-exists`), so you can\nstream it into the running server:"},{heading:`3-restore-the-data`,content:`For the other services, stop the app (\`kubectl scale --replicas=0\`), put the files back
in its volume under \`/srv/<fast|standard>/volumes/<namespace>/<pvc>/\`, and scale it up
again. Follow the upstream docs for
Redis and
InfluxDB.`},{heading:`3-restore-the-data`,content:`The control-plane backup is only needed to rebuild the node from scratch: it restores
the K3s datastore, including the service-account signing key that Azure workload
identity trusts.`}],headings:[{id:`overview`,content:`Overview`},{id:`retention`,content:`Retention`},{id:`monitoring`,content:`Monitoring`},{id:`adding-a-new-app`,content:`Adding a new app`},{id:`restoring`,content:`Restoring`},{id:`1-get-the-archive`,content:`1. Get the archive`},{id:`2-decrypt-it-on-your-machine`,content:`2. Decrypt it on your machine`},{id:`3-restore-the-data`,content:`3. Restore the data`}]},o=[{depth:2,url:`#overview`,title:(0,n.jsx)(n.Fragment,{children:`Overview`})},{depth:2,url:`#retention`,title:(0,n.jsx)(n.Fragment,{children:`Retention`})},{depth:2,url:`#monitoring`,title:(0,n.jsx)(n.Fragment,{children:`Monitoring`})},{depth:2,url:`#adding-a-new-app`,title:(0,n.jsx)(n.Fragment,{children:`Adding a new app`})},{depth:2,url:`#restoring`,title:(0,n.jsx)(n.Fragment,{children:`Restoring`})},{depth:3,url:`#1-get-the-archive`,title:(0,n.jsx)(n.Fragment,{children:`1. Get the archive`})},{depth:3,url:`#2-decrypt-it-on-your-machine`,title:(0,n.jsx)(n.Fragment,{children:`2. Decrypt it on your machine`})},{depth:3,url:`#3-restore-the-data`,title:(0,n.jsx)(n.Fragment,{children:`3. Restore the data`})}];function s(e){let t={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components},{Callout:r}=t;return r||l(`Callout`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`overview`,children:`Overview`}),`
`,(0,n.jsxs)(t.p,{children:[`Two systemd timers on the node, installed by Ansible (`,(0,n.jsx)(t.code,{children:`ansible/roles/backup`}),`), back up the cluster:`]}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Backup`}),(0,n.jsx)(t.th,{children:`When (UTC)`}),(0,n.jsx)(t.th,{children:`Contents`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.strong,{children:`Applications`}),` (`,(0,n.jsx)(t.code,{children:`k3s-application-backup`}),`)`]}),(0,n.jsx)(t.td,{children:`Every 6 hours (00:45, 06:45, 12:45, 18:45)`}),(0,n.jsxs)(t.td,{children:[`PostgreSQL (`,(0,n.jsx)(t.code,{children:`pg_dumpall`}),`, all databases and roles), Redis (`,(0,n.jsx)(t.code,{children:`redis`}),` and `,(0,n.jsx)(t.code,{children:`bot-ts`}),` RDB snapshots), InfluxDB (`,(0,n.jsx)(t.code,{children:`influx backup`}),`), Uptime Kuma and Grafana (SQLite databases and files)`]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.strong,{children:`Control plane`}),` (`,(0,n.jsx)(t.code,{children:`k3s-control-plane-backup`}),`)`]}),(0,n.jsx)(t.td,{children:`Daily at 02:15`}),(0,n.jsxs)(t.td,{children:[`The K3s datastore (`,(0,n.jsx)(t.code,{children:`state.db`}),`), the K3s server token and `,(0,n.jsx)(t.code,{children:`config.yaml`})]})]})]})]}),`
`,(0,n.jsx)(t.p,{children:`Each run:`}),`
`,(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsx)(t.li,{children:`takes consistent online copies (no app is stopped);`}),`
`,(0,n.jsxs)(t.li,{children:[`packs them in a `,(0,n.jsx)(t.code,{children:`.tar.gz`}),` with a `,(0,n.jsx)(t.code,{children:`SHA256SUMS`}),` file and encrypts it with
`,(0,n.jsx)(t.a,{href:`https://age-encryption.org/`,children:`age`}),`;`]}),`
`,(0,n.jsxs)(t.li,{children:[`uploads it to the private `,(0,n.jsx)(t.code,{children:`backups`}),` container of the `,(0,n.jsx)(t.code,{children:`polinetworkbackups`}),`
storage account, using the `,(0,n.jsx)(t.code,{children:`id-k3s-backup`}),` managed identity;`]}),`
`,(0,n.jsx)(t.li,{children:`publishes its success time to Prometheus.`}),`
`]}),`
`,(0,n.jsx)(r,{type:`important`,title:`Encryption`,children:(0,n.jsxs)(t.p,{children:[`The node only has the age `,(0,n.jsx)(t.strong,{children:`public`}),` key. The private key (the "identity") is the
secret `,(0,n.jsx)(t.code,{children:`backup-age-identity`}),` in the `,(0,n.jsx)(t.code,{children:`kv-pn-infra`}),` Key Vault, and it must never be
copied to the node. Without it, the backups can't be read.`]})}),`
`,(0,n.jsx)(t.h2,{id:`retention`,children:`Retention`}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Where`}),(0,n.jsx)(t.th,{children:`Path`}),(0,n.jsx)(t.th,{children:`Kept for`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:`Node`}),(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.code,{children:`/srv/standard/backups/k3s-applications/`}),`, `,(0,n.jsx)(t.code,{children:`/srv/standard/backups/k3s-control-plane/`})]}),(0,n.jsx)(t.td,{children:`7 days`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:`Blob Storage`}),(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.code,{children:`backups/k3s-applications/k3s01/`}),`, `,(0,n.jsx)(t.code,{children:`backups/k3s-control-plane/k3s01/`})]}),(0,n.jsx)(t.td,{children:`90 days, immutable for the first 30`})]})]})]}),`
`,(0,n.jsx)(t.p,{children:`The storage account only accepts traffic from the K3s subnet, so download backups from the node.`}),`
`,(0,n.jsx)(t.h2,{id:`monitoring`,children:`Monitoring`}),`
`,(0,n.jsxs)(t.p,{children:[`The `,(0,n.jsx)(t.code,{children:`BackupStale`}),` alert fires on Telegram when there has been no successful
application backup for 7 hours or no control-plane backup for 26 hours.
`,(0,n.jsx)(t.code,{children:`BackupMetricsMissing`}),` fires if the metrics disappear altogether.`]}),`
`,(0,n.jsx)(t.p,{children:`From the node:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Next and last runs`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`systemctl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` list-timers`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 'k3s-*-backup.timer'`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Logs of the last run`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`sudo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` journalctl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -u`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` k3s-application-backup.service`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -n`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` 50`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Run a backup now`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`sudo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` systemctl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` start`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` k3s-application-backup.service`})]})]})})}),`
`,(0,n.jsx)(t.h2,{id:`adding-a-new-app`,children:`Adding a new app`}),`
`,(0,n.jsxs)(t.p,{children:[`Volumes are not backed up automatically. If you add an app with data worth keeping
(see `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/Guides/add-storage`,children:`Add Storage`}),`), add it to
`,(0,n.jsx)(t.code,{children:`ansible/roles/backup/templates/k3s-application-backup.sh.j2`}),` in polinetwork-cd, using
the right tool for the data:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`a database: its own dump/backup command, through `,(0,n.jsx)(t.code,{children:`kubectl exec`}),` (like PostgreSQL and InfluxDB);`]}),`
`,(0,n.jsxs)(t.li,{children:[`an SQLite file: the `,(0,n.jsx)(t.code,{children:`sqlite_backup`}),` helper, which takes a consistent copy and archives
the other files in the volume;`]}),`
`,(0,n.jsxs)(t.li,{children:[`Redis: the `,(0,n.jsx)(t.code,{children:`redis_snapshot`}),` helper.`]}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`Then run the playbook (see `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/cloud-infrastructure/k3s-node#running-the-playbooks`,children:`K3s Node`}),`):
`,(0,n.jsx)(t.code,{children:`verify.yml`}),` takes a fresh backup and checks it.`]}),`
`,(0,n.jsx)(t.h2,{id:`restoring`,children:`Restoring`}),`
`,(0,n.jsx)(r,{type:`danger`,children:(0,n.jsxs)(t.p,{children:[`Restoring overwrites live data. Agree on it with the Direttivo first, and take a
fresh backup right before (`,(0,n.jsx)(t.code,{children:`sudo systemctl start k3s-application-backup.service`}),`)
so you can go back.`]})}),`
`,(0,n.jsx)(t.h3,{id:`1-get-the-archive`,children:`1. Get the archive`}),`
`,(0,n.jsxs)(t.p,{children:[`The last 7 days are on the node, in `,(0,n.jsx)(t.code,{children:`/srv/standard/backups/k3s-applications/`}),`,
readable only by root. Copy the one you need to your home:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`sudo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` cp`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` /srv/standard/backups/k3s-applications/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`archiv`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`.tar.gz.age`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` ~`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`sudo`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` chown`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pnadmin`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` ~/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`archiv`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`.tar.gz.age`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[`For older backups, list and download them from Blob Storage on the node, with the
backup identity (its client ID is `,(0,n.jsx)(t.code,{children:`backup_identity_client_id`}),` in `,(0,n.jsx)(t.code,{children:`ansible/vars/main.yml`}),`):`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`TOKEN`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`=`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`$(`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`curl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -s`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -H`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` Metadata:`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`true`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2019-08-01&resource=https%3A%2F%2Fstorage.azure.com%2F&client_id=<backup-identity-client-id>"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`  |`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` jq`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -r`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` .access_token`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`)`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# List`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`curl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -s`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -H`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` "Authorization: Bearer `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`$TOKEN`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -H`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` "x-ms-version: 2023-11-03"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  "https://polinetworkbackups.blob.core.windows.net/backups?restype=container&comp=list&prefix=k3s-applications/k3s01/"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`  |`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` grep`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -o`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` '<Name>[^<]*</Name>'`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# Download`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`curl`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -s`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -H`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` "Authorization: Bearer `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`$TOKEN`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -H`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` "x-ms-version: 2023-11-03"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`  -o`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` ~/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`archiv`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`.tar.gz.age`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  "https://polinetworkbackups.blob.core.windows.net/backups/k3s-applications/k3s01/<archive>.tar.gz.age"`})})]})})}),`
`,(0,n.jsx)(t.h3,{id:`2-decrypt-it-on-your-machine`,children:`2. Decrypt it on your machine`}),`
`,(0,n.jsxs)(t.p,{children:[`Copy the encrypted archive to your machine and decrypt it there with
`,(0,n.jsx)(t.a,{href:`https://github.com/FiloSottile/age#installation`,children:`age`}),` and the identity from Key Vault:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`scp`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pnadmin@10.43.1.4:`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`archiv`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`.tar.gz.age`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` .`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsx)(t.span,{className:`line`,children:(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`# umask 077: the identity file is readable only by you`})}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`(`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`umask`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` 077`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`; `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`az`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` keyvault`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` secret`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` show`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --vault-name`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` kv-pn-infra`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --name`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` backup-age-identity`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`  --query`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` value`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -o`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` tsv`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` >`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` age-identity.txt`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`)`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`mkdir`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` restore`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`age`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --decrypt`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --identity`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` age-identity.txt`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`archiv`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`e`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`.tar.gz.age`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` |`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` tar`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -xz`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -C`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` restore`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`(`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`cd`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` restore`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` && `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`sha256sum`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` -c`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` SHA256SUMS`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`)`})]}),`
`,(0,n.jsx)(t.span,{className:`line`}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`rm`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` age-identity.txt`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.code,{children:`restore/`}),` now contains `,(0,n.jsx)(t.code,{children:`postgres-dumpall.sql`}),`, `,(0,n.jsx)(t.code,{children:`redis.rdb`}),`, `,(0,n.jsx)(t.code,{children:`bot-ts-redis.rdb`}),`,
`,(0,n.jsx)(t.code,{children:`influxdb-backup.tar`}),`, `,(0,n.jsx)(t.code,{children:`uptime-kuma.db`}),`, `,(0,n.jsx)(t.code,{children:`grafana.db`}),` and the `,(0,n.jsx)(t.code,{children:`*-files.tar`}),` archives.`]}),`
`,(0,n.jsx)(r,{type:`caution`,children:(0,n.jsx)(t.p,{children:`These files hold personal data and credentials in clear text. Delete them as soon as
you're done.`})}),`
`,(0,n.jsx)(t.h3,{id:`3-restore-the-data`,children:`3. Restore the data`}),`
`,(0,n.jsxs)(t.p,{children:[`For PostgreSQL, the dump recreates every database (`,(0,n.jsx)(t.code,{children:`--clean --if-exists`}),`), so you can
stream it into the running server:`]}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`ssh`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` pnadmin@10.43.1.4`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`  "k3s kubectl exec -i -n postgres deploy/postgres -- sh -c 'psql --username=`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`\\"\\$`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`POSTGRES_USER`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:`\\"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` --dbname=postgres'"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` \\`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`  <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` restore/postgres-dumpall.sql`})]})]})})}),`
`,(0,n.jsxs)(t.p,{children:[`For the other services, stop the app (`,(0,n.jsx)(t.code,{children:`kubectl scale --replicas=0`}),`), put the files back
in its volume under `,(0,n.jsx)(t.code,{children:`/srv/<fast|standard>/volumes/<namespace>/<pvc>/`}),`, and scale it up
again. Follow the upstream docs for
`,(0,n.jsx)(t.a,{href:`https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/`,children:`Redis`}),` and
`,(0,n.jsx)(t.a,{href:`https://docs.influxdata.com/influxdb/v2/admin/backup-restore/restore/`,children:`InfluxDB`}),`.`]}),`
`,(0,n.jsx)(t.p,{children:`The control-plane backup is only needed to rebuild the node from scratch: it restores
the K3s datastore, including the service-account signing key that Azure workload
identity trusts.`})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};