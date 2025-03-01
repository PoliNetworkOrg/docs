# Add a Secret

## Introduction

Secrets are used to configure deployments with **sensitive** data like database login, API keys, and so on.  
We have deployed a "Azure Key vault" (the "KV") named "kv-polinetwork" that stores all the secrets.  
Next, we can pass a secret from the KV to the k8s pod using a `SecretProviderClass`.

The following sections explain how to add a new secret.

## Basics


There are three required steps:

1. Add the secret into the "KV"
2. Create (if not exists) a `SecretProviderClass` in the k8s **namespace** (e.g. `bot-prod`), specifying the secrets you want to expose to the namespace's pods.
3. Mount the secret volume inside the pod

:::tip
Whenever there is `<something>` in the code or in a command, that's a paramter you need to set.
:::

### Add the secret into the "KV"

See [this section](#add-or-update-a-secret).

### Create the `SecretProviderClass`

References:
- [Microsoft Guide](https://learn.microsoft.com/en-us/azure/aks/csi-secrets-store-identity-access?tabs=azure-portal&pivots=access-with-a-user-assigned-managed-identity)
- [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io)

:::important
Check if the namespace already contains a `SecretProviderClass` before creating a new one.  
Running the following command

```sh
kubectl get secretproviderclass --namespace <namespace>
```

you should see a message like `No resources found in <namespace> namespace.`  
Otherwise the `SecretProviderClass` already exists.
:::

To create the `SecretProviderClass`, create a `yaml` file with the following content:

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: <name>                  # a recommended name convention is "<namespace>-spc"
  namespace: <k8s-namespace>    # if not specified, the default namespace is "default"
spec:
  provider: azure
  parameters:
    usePodIdentity: 'false'
    useVMManagedIdentity: 'true'                                    # Set to true for using managed identity
    userAssignedIdentityID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  # Set the clientID of the managed identity to use
    tenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'                # The tenant ID of the key vault
    keyvaultName: 'kv-polinetwork'                                  # Set to the name of your key vault
    objects: |
      array:
        - |
          objectName: <secret-1-name>            
          objectType: secret
        - |
          objectName: <secret-2-name>            
          objectType: secret
```


This maps the secrets `<secret-1-name>` and `<secret-2-name>`  from the key vault `kv-polinetwork` to a volume you can mount in your pod.  
A few things to note

- `usePodIdentity` should be set to `false` and `useVMManagedIdentity` should be set to `true` since we are using a VM managed identity.
- `userAssignedIdentityID` should be set to the client ID of the managed identity we linked to the key vault.
- `tenantId` should be set to the tenant ID of our Azure tenant.

:::tip
If you are unsure about what the `userAssignedIdentityID` and `tenantId` are, you probably aren't one of the heads of IT in PoliNetwork.  
Changes to such parts of the manifest should only be done by someone with the right permissions.

Anyway here's how to get them:

- `tenantId`

```sh
az account show --query tenantId --output tsv
```

- `userAssignedIdentityID`  

```sh
az aks show --resource-group <resource-group> --name <cluster-name> --query addonProfiles.azureKeyvaultSecretsProvider.identity.clientId -o tsv
```
`<resource-group>` and `<cluster-name>` can be found both in our [Terraform](https://github.com/PoliNetworkOrg/terraform/) or in the Azure Portal. 

:::

### Mount the secret volume inside the pod

The secret must be mounted as a volume.  
Here is an example pod `yaml` manifest:

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: my-spc-example-pod
  namespace: <namespace>
spec:
  containers:
    - name: busybox
      image: registry.k8s.io/e2e-test-images/busybox:1.29-4
      command:
        - '/bin/sleep'
        - '10000'
      # add-highlight-start
      volumeMounts:
        - name: secrets-store               # Name of the volume defined below
          mountPath: '/mnt/secrets-store'   # Path where the secrets are mounted inside the pod
          readOnly: true                    # A secret should be mounted as read-only
      # add-highlight-end
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 250m
          memory: 256Mi

# add-highlight-start
  volumes:
    - name: secrets-store                        # Name of the volume - it can be whatever you want
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: '<namespace>-spc' # The name of the SecretProviderClass
#add-highlight-end
```

After applying this manifest to the cluster, you can retrieve the secret by reading the files in the `/mnt/secrets-store/` directory.  
To test if everything works, try running the following command.

```sh
kubectl exec -it my-spc-example-pod -- cat /mnt/secrets-store/<secret-1-name>
```

:::tip
More than one secret can be mounted at the same time by adding more entries in the array, all of them can be found in the same directory, you can see them by running:

```sh
kubectl exec -it my-spc-example-pod -- ls /mnt/secrets-store
```

:::

## Loading the secret inside an Environment Variable

:::important
Even if you want to load the secret as an ENV variable, it's **REQUIRED** to follow every steps in the previous section, including mounting the secret volume.
:::

To load the secret as an Environment Variable follows the following steps.

### Register the secret as a k8s secret

```yaml title="spc.yaml"
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: <name>                  # a recommended name convention is "<namespace>-spc"
  namespace: <k8s-namespace>    # if not specified, the default namespace is "default"
spec:
  provider: azure
  parameters:
    usePodIdentity: 'false'
    useVMManagedIdentity: 'true'                                    # Set to true for using managed identity
    userAssignedIdentityID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  # Set the clientID of the managed identity to use
    tenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'                # The tenant ID of the key vault
    keyvaultName: 'kv-polinetwork'                                  # Set to the name of your key vault
    # add-highlight-start
    secretObjects:
      # ognuno di questi e' una COLLEZIONE di secrets
      # si possono definire piu' collezioni separate, ma per identificare i secret Azure dagli altri k8s secrets,
      # utilizziamo una collezione che contiene più secrets (come se fosse un Object appunto)
      # importante: va creato solo la prima volta, poi basta aggiungere una key sotto
      - secretName: azure-kv
        type: Opaque
        data:
          # qui va aggiunto il secret che vogliamo esporre anche come k8s secret
          # importante distinguere objectName (reference al KV) dalla key (nome personalizzato)
          - objectName: <secret-1-name>     # nome del secret dentro il KV di azure
            key: example-secret             # key personalizzata del k8s secret
    # add-highlight-end
    objects: |
      array:
        - |
          objectName: <secret-1-name>            
          objectType: secret

...
spec:
  provider: azure
  ...
```


### Use the secret as environment variable
Like before, you can then reference the secret in your pod manifest:

```yaml

---
spec:
  containers:
    env:
      # aggiungiamo l'env variable
      - name: EXAMPLE_SECRET # nome dell'env variable (indipendente dal nome del secret)
        valueFrom:
          secretKeyRef:
            name: azure-kv # nome della collezione di k8s secret
            key: example-secret # key del secret specifico da utilizzare dentro la collezione
```


## "KV" management
### Add or update a secret
You can add (or update) a secret with the following command:
```sh
az keyvault secret set --vault-name "kv-polinetwork" --name "<secret-name>" --value "<secret-value>"
```

:::tip
If the secret value is too long or you don't want to copy/paste in terminal you can use a file instead.
1. Paste the secret value into a text file (no extension or ".txt" is valid) on a **single line**
2. Run the following command
   ```sh
   az keyvault secret set --vault-name "kv-polinetwork" --name "<secret-name>" --file "<filename>"
   ```
:::

### Delete a secret
You can delete a secret with the following command:
```sh
az keyvault secret delete --vault-name "kv-polinetwork" --name "<secret-name>"
```

After the deletion, the secret remains in a `Recoverable State` for 7 days.  
During this period the secret can be recovered with the following command:
```sh
az keyvault secret recover --vault-name "kv-polinetwork" --name "<secret-name>"
```

To **permanently delete** that secret, after 7 days from deletion you can run the following command:
```sh
az keyvault secret purge --vault-name "kv-polinetwork" --name "<secret-name>"
```

:::note
To **update/re-set** that secret, during the 7 days retention period, you must recover it first, 
then run the command to update it

If you try to `set` a secret that has been deleted within the last 7 days without restoring it first, you get the following error:

```sh
#error-highlight-start
(Conflict) Secret <secret-name> is currently in a deleted but recoverable state, and its name cannot be reused; in this state, the secret can only be recovered or purged.
Code: Conflict
Message: Secret <secret-name> is currently in a deleted but recoverable state, and its name cannot be reused; in this state, the secret can only be recovered or purged.
Inner error: {
    "code": "ObjectIsDeletedButRecoverable"
}
#error-highlight-end
```
:::
