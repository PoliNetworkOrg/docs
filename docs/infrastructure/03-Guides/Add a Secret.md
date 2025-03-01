# Add a Secret

## Introduction

Secrets are used to configure deployments with **sensitive** data like database login, API keys, and so on.  
We have deployed a "Azure Key vault" (the "KV") named "kv-polinetwork" that stores all the secrets.  
Next, we can pass a secret from the KV to the k8s pod using a `SecretProviderClass`.

The following sections explain how to add a new secret.

## Basics


There are three required steps:

1. Add the secret into the "KV"
2. Create and configure a `SecretProviderClass`
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
Running the following command:

```sh
kubectl get secretproviderclass --namespace <namespace>
```

you should see a message like `No resources found in <namespace> namespace.`

Otherwise the `SecretProviderClass` already exists and you can directly 
[add a new secret](#add-kv-secrets-into-the-secretproviderclass).

:::

This is a basic `SecretProviderClass` manifest:
```yaml title="spc.yaml"
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: <name>                  # a recommended name convention is "<namespace>-spc"
  namespace: <namespace>        # if not specified, the default k8s namespace is "default"
spec:
  provider: azure
  parameters:
    usePodIdentity: 'false'
    useVMManagedIdentity: 'true'                                    # Set to true for using managed identity
    userAssignedIdentityID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'  # Set the clientID of the managed identity to use
    tenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'                # The tenant ID of the key vault
    keyvaultName: 'kv-polinetwork'                                  # Set to the name of your key vault
```

A few things to note:
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

### Add "KV" secrets into the `SecretProviderClass`

Inside the `SecretProviderClass` manifest, add "KV" secrets:
```yaml title="spc.yaml"
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: <name>
  namespace: <namespace>
spec:
  provider: azure
  parameters:
    usePodIdentity: 'false'
    useVMManagedIdentity: 'true'                                   
    userAssignedIdentityID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' 
    tenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'               
    keyvaultName: 'kv-polinetwork'                                 
    # add-highlight-start
    objects: |
      array:
        - |
          objectName: <secret-1-key>            
          objectType: secret
        - |
          objectName: <secret-2-key>            
          objectType: secret
    # add-highlight-end
```

In this example, we map two secrets (`<secret-1-key>` and `<secret-2-key>`) 
from the key vault `kv-polinetwork` to a volume you can mount in your pod.  

### Mount the secret volume inside the pod

The secret must be mounted as a volume.  
Here is an example pod manifest:

```yaml title="my-spc-example-pod.yaml"
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

After applying this manifest to the cluster, you can retrieve the secret by reading the files in the `/mnt/secrets-store/` directory (`mountPath` parameter).  
To test if everything works, try running the following command.

```sh
kubectl exec -it my-spc-example-pod -- cat /mnt/secrets-store/<secret-1-key>
```

:::tip
More than one secret can be mounted at the same time by adding more entries in the array,
all of them can be found in the same directory, you can see them by running:

```sh
kubectl exec -it my-spc-example-pod -- ls /mnt/secrets-store
```

In the [previous section](#add-kv-secrets-into-the-secretproviderclass), we have added `<secret-1-key>` and `<secret-2-key>`.

:::

## Loading the secret inside an Environment Variable

:::important
Even if you want to load the secret as an ENV variable, it's **REQUIRED** to follow every steps in the previous section, including 
[mounting the secret volume](#mount-the-secret-volume-inside-the-pod).
:::

To load the secret as an Environment Variable follows the following steps.

### Register the secret as a k8s secret
Inside the `ServiceProviderClass` manifest, add a new field `secretObjects` to create a 
new k8s secret collection:

```yaml title="spc.yaml"
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: <name>
  namespace: <namespace>
spec:
  provider: azure
  parameters:
    usePodIdentity: 'false'
    useVMManagedIdentity: 'true'                                   
    userAssignedIdentityID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' 
    tenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'               
    keyvaultName: 'kv-polinetwork'                                 
    # add-highlight-start
    secretObjects:
      # each of these is a COLLECTION of secrets.
      # multiple separate collections can be defined, but to identify Azure secrets from other k8s secrets,
      # we use a collection that contains multiple secrets (as if it were an Object in fact).
      # important: it only needs to be created the first time, then just add a key underneath
      - secretName: azure-kv
        type: Opaque
        data:
          # the secret that we want to expose also as k8s secret should be added here.
          # important to distinguish objectName (reference to "KV") from key (custom name)
          - objectName: <secret-1-key>      # secret name inside the "KV"
            key: example-secret             # custom k8s secret's key
    # add-highlight-end
    objects: |
      array:
        - |
          objectName: <secret-1-key>            
          objectType: secret
```


### Use the secret as environment variable
After [mounting the secret volume](#mount-the-secret-volume-inside-the-pod) and [configuring the k8s secret](#register-the-secret-as-a-k8s-secret), 
you can add an environment variable with the secret as value reference:

```yaml title="my-spc-example-pod.yaml"
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
      volumeMounts:
        - name: secrets-store
          mountPath: '/mnt/secrets-store'
          readOnly: true
      # add-highlight-start
      env:
        - name: EXAMPLE_SECRET # env variable name (independent from the name of the secret)
          valueFrom:
            secretKeyRef:
              name: azure-kv # k8s secret collection name
              key: example-secret # secret key inside of k8s secret collection specified in the line above
      # add-highlight-end
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 250m
          memory: 256Mi

  volumes:
    - name: secrets-store
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: '<namespace>-spc'
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
