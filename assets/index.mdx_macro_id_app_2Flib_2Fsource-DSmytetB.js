import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Cloud Infrastructure`},i=`## Overview [#overview]

This section explains how we organized our infrastructure.

Everything regarding the deployment of apps and services is divided into two repositories:

- [polinetworkorg/terraform](https://github.com/polinetworkorg/terraform) - Contains the Terraform code for the Azure resources: the \`k3s01\` VM, its disks and network, the Key Vaults, the managed identities, the backup storage account.
- [polinetworkorg/polinetwork-cd](https://github.com/polinetworkorg/polinetwork-cd) - Our GitOps repo. It contains the Ansible playbooks that turn the VM into a K3s node, and the Kubernetes manifests of every app and service. Flux, running in the cluster, applies them.

\`\`\`mermaid
flowchart TD
  subgraph Github
    tf(["\`**terraform**\`"])
    cd(["\`**polinetwork-cd**\`"])
    ghcr[(GHCR images)]
  end
  subgraph Cloudflare
    edge[Tunnel + Access]
  end
  subgraph Azure
    kv[(Key Vaults)]
    blob[(Backup storage)]
    subgraph vm[VM k3s01]
      subgraph k3s[K3s cluster]
        flux[Flux]
        eso[External Secrets]
        cfd[cloudflared]
        traefik[Traefik]
        app@{ shape: processes, label: "Apps / Services" }
      end
    end
  end

  tf -.-> vm
  tf -.-> kv
  cd -. Ansible .-> vm
  cd <-.-> flux --> app
  ghcr -. image digests .-> flux
  kv --> eso --> app
  edge <--> cfd --> traefik --> app
  vm -. backups .-> blob
\`\`\`

### **Terraform: Definition and Purpose** [#terraform-definition-and-purpose]  

The **Terraform** repository is responsible for managing and provisioning cloud infrastructure. In simple terms, it defines and creates the resources needed for the infrastructure, such as:  

- **Networks and subnets** (Virtual Network, outbound-only public IP, Network Security Group)
- **Virtual machines** (the \`k3s01\` K3s node)
- **Storage** (Managed Disks for the node, Blob Storage for backups and Terraform state)
- **Security services** (Key Vaults, managed identities, workload identity federation)

The code in **Terraform** describes these resources declaratively: it defines the desired state, and Terraform applies the necessary changes to reach that state. This repository is primarily used to **create and modify the cloud infrastructure** where applications will run.

Terraform stops at the Azure boundary: it creates the VM, but it doesn't configure
what runs inside it.

### **PoliNetwork-CD: Definition and Purpose** [#polinetwork-cd-definition-and-purpose]  

The **PoliNetwork-CD** (Continuous Deployment) repository picks up where Terraform stops. It has two parts:

- **\`ansible/\`** configures the VM: it mounts the data disks, hardens SSH and the
  firewall, installs a pinned K3s version, schedules the encrypted backups and
  bootstraps Flux. You run it by hand, rarely.
- **\`clusters/k3s/\`, \`infrastructure/\` and \`apps/\`** describe everything inside
  Kubernetes. **Flux** watches the \`main\` branch and applies it continuously, so you
  never run \`kubectl apply\` by hand.

Through Flux, the repository is used to:

- **Define application deployments** in Kubernetes (plain manifests organized with Kustomize, or Helm charts)
- **Automatically update applications** when a new \`latest\` image is published
- **Manage application configurations** (environment variables, secrets pulled from Key Vault)
- **Monitor the state of applications** and ensure they remain in sync with the repository

While Terraform is responsible for infrastructure, **PoliNetwork-CD** focuses on **managing the lifecycle of applications** running on that infrastructure, ensuring that code changes are applied automatically and securely.  

### **Key Difference: Infrastructure vs. Deployment** [#key-difference-infrastructure-vs-deployment]

| Repository | Main Purpose | Example of Managed Resources |
|------------|--------------|------------------------------|
| **Terraform** | Creates and manages cloud infrastructure | VM, disks, network, Key Vaults, identities |
| **PoliNetwork-CD** (\`ansible/\`) | Configures the VM | Disk mounts, firewall, SSH, K3s, backups |
| **PoliNetwork-CD** (Flux) | Automates application deployment and updates | Deployments, ingresses, secrets, storage |

In summary, **Terraform builds the foundation on which applications run**, while **PoliNetwork-CD sets up the node and manages the deployment and continuous updating of applications**. Both repositories work together to ensure a scalable and efficient cloud infrastructure.

### How a request reaches an app [#how-a-request-reaches-an-app]

1. A visitor opens e.g. \`https://api.polinetwork.org\`. DNS points to Cloudflare.
2. Cloudflare sends the request through the \`k3s01\` tunnel to one of the two
   \`cloudflared\` pods in the cluster.
3. \`cloudflared\` forwards it to **Traefik**, the K3s ingress controller.
4. Traefik picks the app from the \`Ingress\` whose \`host\` matches, and forwards the
   request to that app's \`Service\`.

The VM never accepts inbound connections from the Internet: the tunnel is an
outbound connection, and the VM's public IP is used only for outbound traffic.

<Cards>
  <Card
    title="Terraform"
    href="/docs/infrastructure/getting-started/cloud-infrastructure/terraform"
    description="Detailed overview of our Azure-based infrastructure managed via the polinetworkorg/terraform repository."
  />
  <Card
    title="K3s Node"
    href="/docs/infrastructure/getting-started/cloud-infrastructure/k3s-node"
    description="The k3s01 VM, how Ansible configures it, and how to run the playbooks."
  />
  <Card
    title="Flux"
    href="/docs/infrastructure/getting-started/cloud-infrastructure/flux"
    description="How Flux deploys the polinetwork-cd repository to the K3s cluster."
  />
</Cards>

## References [#references]

### **Links to Repositories** [#links-to-repositories]

- [Terraform Repository](https://github.com/polinetworkorg/terraform)
- [PoliNetwork-CD Repository](https://github.com/polinetworkorg/polinetwork-cd)

### **Additional Resources** [#additional-resources]

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [K3s Documentation](https://docs.k3s.io/)
- [Flux Documentation](https://fluxcd.io/flux/)
- [Terraform Documentation](https://www.terraform.io/docs/)
`,a={contents:[{heading:`overview`,content:`This section explains how we organized our infrastructure.`},{heading:`overview`,content:`Everything regarding the deployment of apps and services is divided into two repositories:`},{heading:`overview`,content:"polinetworkorg/terraform - Contains the Terraform code for the Azure resources: the `k3s01` VM, its disks and network, the Key Vaults, the managed identities, the backup storage account."},{heading:`overview`,content:`polinetworkorg/polinetwork-cd - Our GitOps repo. It contains the Ansible playbooks that turn the VM into a K3s node, and the Kubernetes manifests of every app and service. Flux, running in the cluster, applies them.`},{heading:`terraform-definition-and-purpose`,content:`The **Terraform** repository is responsible for managing and provisioning cloud infrastructure. In simple terms, it defines and creates the resources needed for the infrastructure, such as:`},{heading:`terraform-definition-and-purpose`,content:`**Networks and subnets** (Virtual Network, outbound-only public IP, Network Security Group)`},{heading:`terraform-definition-and-purpose`,content:"**Virtual machines** (the `k3s01` K3s node)"},{heading:`terraform-definition-and-purpose`,content:`**Storage** (Managed Disks for the node, Blob Storage for backups and Terraform state)`},{heading:`terraform-definition-and-purpose`,content:`**Security services** (Key Vaults, managed identities, workload identity federation)`},{heading:`terraform-definition-and-purpose`,content:`The code in **Terraform** describes these resources declaratively: it defines the desired state, and Terraform applies the necessary changes to reach that state. This repository is primarily used to **create and modify the cloud infrastructure** where applications will run.`},{heading:`terraform-definition-and-purpose`,content:`Terraform stops at the Azure boundary: it creates the VM, but it doesn't configure
what runs inside it.`},{heading:`polinetwork-cd-definition-and-purpose`,content:`The **PoliNetwork-CD** (Continuous Deployment) repository picks up where Terraform stops. It has two parts:`},{heading:`polinetwork-cd-definition-and-purpose`,content:`**\`ansible/\`** configures the VM: it mounts the data disks, hardens SSH and the
firewall, installs a pinned K3s version, schedules the encrypted backups and
bootstraps Flux. You run it by hand, rarely.`},{heading:`polinetwork-cd-definition-and-purpose`,content:"**`clusters/k3s/`, `infrastructure/` and `apps/`** describe everything inside\nKubernetes. **Flux** watches the `main` branch and applies it continuously, so you\nnever run `kubectl apply` by hand."},{heading:`polinetwork-cd-definition-and-purpose`,content:`Through Flux, the repository is used to:`},{heading:`polinetwork-cd-definition-and-purpose`,content:`**Define application deployments** in Kubernetes (plain manifests organized with Kustomize, or Helm charts)`},{heading:`polinetwork-cd-definition-and-purpose`,content:"**Automatically update applications** when a new `latest` image is published"},{heading:`polinetwork-cd-definition-and-purpose`,content:`**Manage application configurations** (environment variables, secrets pulled from Key Vault)`},{heading:`polinetwork-cd-definition-and-purpose`,content:`**Monitor the state of applications** and ensure they remain in sync with the repository`},{heading:`polinetwork-cd-definition-and-purpose`,content:`While Terraform is responsible for infrastructure, **PoliNetwork-CD** focuses on **managing the lifecycle of applications** running on that infrastructure, ensuring that code changes are applied automatically and securely.`},{heading:`key-difference-infrastructure-vs-deployment`,content:`| Repository    | Main Purpose                             | Example of Managed Resources               |
| ------------- | ---------------------------------------- | ------------------------------------------ |
| **Terraform** | Creates and manages cloud infrastructure | VM, disks, network, Key Vaults, identities |`,table:`table-0`},{heading:`key-difference-infrastructure-vs-deployment`,content:`| Repository                      | Main Purpose      | Example of Managed Resources             |
| ------------------------------- | ----------------- | ---------------------------------------- |
| **PoliNetwork-CD** (\`ansible/\`) | Configures the VM | Disk mounts, firewall, SSH, K3s, backups |`,table:`table-0`},{heading:`key-difference-infrastructure-vs-deployment`,content:`| Repository                | Main Purpose                                 | Example of Managed Resources             |
| ------------------------- | -------------------------------------------- | ---------------------------------------- |
| **PoliNetwork-CD** (Flux) | Automates application deployment and updates | Deployments, ingresses, secrets, storage |`,table:`table-0`},{heading:`key-difference-infrastructure-vs-deployment`,content:`In summary, **Terraform builds the foundation on which applications run**, while **PoliNetwork-CD sets up the node and manages the deployment and continuous updating of applications**. Both repositories work together to ensure a scalable and efficient cloud infrastructure.`},{heading:`how-a-request-reaches-an-app`,content:"A visitor opens e.g. `https://api.polinetwork.org`. DNS points to Cloudflare."},{heading:`how-a-request-reaches-an-app`,content:"Cloudflare sends the request through the `k3s01` tunnel to one of the two\n`cloudflared` pods in the cluster."},{heading:`how-a-request-reaches-an-app`,content:"`cloudflared` forwards it to **Traefik**, the K3s ingress controller."},{heading:`how-a-request-reaches-an-app`,content:"Traefik picks the app from the `Ingress` whose `host` matches, and forwards the\nrequest to that app's `Service`."},{heading:`how-a-request-reaches-an-app`,content:`The VM never accepts inbound connections from the Internet: the tunnel is an
outbound connection, and the VM's public IP is used only for outbound traffic.`},{heading:`how-a-request-reaches-an-app`,content:`<Card title="Terraform" href="/docs/infrastructure/getting-started/cloud-infrastructure/terraform" description="Detailed overview of our Azure-based infrastructure managed via the polinetworkorg/terraform reposit…" />`},{heading:`how-a-request-reaches-an-app`,content:`<Card title="K3s Node" href="/docs/infrastructure/getting-started/cloud-infrastructure/k3s-node" description="The k3s01 VM, how Ansible configures it, and how to run the playbooks." />`},{heading:`how-a-request-reaches-an-app`,content:`<Card title="Flux" href="/docs/infrastructure/getting-started/cloud-infrastructure/flux" description="How Flux deploys the polinetwork-cd repository to the K3s cluster." />`},{heading:`links-to-repositories`,content:`Terraform Repository`},{heading:`links-to-repositories`,content:`PoliNetwork-CD Repository`},{heading:`additional-resources`,content:`Kubernetes Documentation`},{heading:`additional-resources`,content:`K3s Documentation`},{heading:`additional-resources`,content:`Flux Documentation`},{heading:`additional-resources`,content:`Terraform Documentation`}],headings:[{id:`overview`,content:`Overview`},{id:`terraform-definition-and-purpose`,content:`**Terraform: Definition and Purpose**`},{id:`polinetwork-cd-definition-and-purpose`,content:`**PoliNetwork-CD: Definition and Purpose**`},{id:`key-difference-infrastructure-vs-deployment`,content:`**Key Difference: Infrastructure vs. Deployment**`},{id:`how-a-request-reaches-an-app`,content:`How a request reaches an app`},{id:`references`,content:`References`},{id:`links-to-repositories`,content:`**Links to Repositories**`},{id:`additional-resources`,content:`**Additional Resources**`}]},o=[{depth:2,url:`#overview`,title:(0,n.jsx)(n.Fragment,{children:`Overview`})},{depth:3,url:`#terraform-definition-and-purpose`,title:(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(`strong`,{children:`Terraform: Definition and Purpose`})})},{depth:3,url:`#polinetwork-cd-definition-and-purpose`,title:(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(`strong`,{children:`PoliNetwork-CD: Definition and Purpose`})})},{depth:3,url:`#key-difference-infrastructure-vs-deployment`,title:(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(`strong`,{children:`Key Difference: Infrastructure vs. Deployment`})})},{depth:3,url:`#how-a-request-reaches-an-app`,title:(0,n.jsx)(n.Fragment,{children:`How a request reaches an app`})},{depth:2,url:`#references`,title:(0,n.jsx)(n.Fragment,{children:`References`})},{depth:3,url:`#links-to-repositories`,title:(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(`strong`,{children:`Links to Repositories`})})},{depth:3,url:`#additional-resources`,title:(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(`strong`,{children:`Additional Resources`})})}];function s(e){let t={a:`a`,code:`code`,h2:`h2`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components},{Card:r,Cards:i,Mermaid:a}=t;return r||l(`Card`,!0),i||l(`Cards`,!0),a||l(`Mermaid`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`overview`,children:`Overview`}),`
`,(0,n.jsx)(t.p,{children:`This section explains how we organized our infrastructure.`}),`
`,(0,n.jsx)(t.p,{children:`Everything regarding the deployment of apps and services is divided into two repositories:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/terraform`,children:`polinetworkorg/terraform`}),` - Contains the Terraform code for the Azure resources: the `,(0,n.jsx)(t.code,{children:`k3s01`}),` VM, its disks and network, the Key Vaults, the managed identities, the backup storage account.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/polinetwork-cd`,children:`polinetworkorg/polinetwork-cd`}),` - Our GitOps repo. It contains the Ansible playbooks that turn the VM into a K3s node, and the Kubernetes manifests of every app and service. Flux, running in the cluster, applies them.`]}),`
`]}),`
`,(0,n.jsx)(a,{chart:`flowchart TD
  subgraph Github
    tf(["\`**terraform**\`"])
    cd(["\`**polinetwork-cd**\`"])
    ghcr[(GHCR images)]
  end
  subgraph Cloudflare
    edge[Tunnel + Access]
  end
  subgraph Azure
    kv[(Key Vaults)]
    blob[(Backup storage)]
    subgraph vm[VM k3s01]
      subgraph k3s[K3s cluster]
        flux[Flux]
        eso[External Secrets]
        cfd[cloudflared]
        traefik[Traefik]
        app@{ shape: processes, label: "Apps / Services" }
      end
    end
  end

  tf -.-> vm
  tf -.-> kv
  cd -. Ansible .-> vm
  cd <-.-> flux --> app
  ghcr -. image digests .-> flux
  kv --> eso --> app
  edge <--> cfd --> traefik --> app
  vm -. backups .-> blob`}),`
`,(0,n.jsx)(t.h3,{id:`terraform-definition-and-purpose`,children:(0,n.jsx)(t.strong,{children:`Terraform: Definition and Purpose`})}),`
`,(0,n.jsxs)(t.p,{children:[`The `,(0,n.jsx)(t.strong,{children:`Terraform`}),` repository is responsible for managing and provisioning cloud infrastructure. In simple terms, it defines and creates the resources needed for the infrastructure, such as:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Networks and subnets`}),` (Virtual Network, outbound-only public IP, Network Security Group)`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Virtual machines`}),` (the `,(0,n.jsx)(t.code,{children:`k3s01`}),` K3s node)`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Storage`}),` (Managed Disks for the node, Blob Storage for backups and Terraform state)`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Security services`}),` (Key Vaults, managed identities, workload identity federation)`]}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`The code in `,(0,n.jsx)(t.strong,{children:`Terraform`}),` describes these resources declaratively: it defines the desired state, and Terraform applies the necessary changes to reach that state. This repository is primarily used to `,(0,n.jsx)(t.strong,{children:`create and modify the cloud infrastructure`}),` where applications will run.`]}),`
`,(0,n.jsx)(t.p,{children:`Terraform stops at the Azure boundary: it creates the VM, but it doesn't configure
what runs inside it.`}),`
`,(0,n.jsx)(t.h3,{id:`polinetwork-cd-definition-and-purpose`,children:(0,n.jsx)(t.strong,{children:`PoliNetwork-CD: Definition and Purpose`})}),`
`,(0,n.jsxs)(t.p,{children:[`The `,(0,n.jsx)(t.strong,{children:`PoliNetwork-CD`}),` (Continuous Deployment) repository picks up where Terraform stops. It has two parts:`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`ansible/`})}),` configures the VM: it mounts the data disks, hardens SSH and the
firewall, installs a pinned K3s version, schedules the encrypted backups and
bootstraps Flux. You run it by hand, rarely.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsxs)(t.strong,{children:[(0,n.jsx)(t.code,{children:`clusters/k3s/`}),`, `,(0,n.jsx)(t.code,{children:`infrastructure/`}),` and `,(0,n.jsx)(t.code,{children:`apps/`})]}),` describe everything inside
Kubernetes. `,(0,n.jsx)(t.strong,{children:`Flux`}),` watches the `,(0,n.jsx)(t.code,{children:`main`}),` branch and applies it continuously, so you
never run `,(0,n.jsx)(t.code,{children:`kubectl apply`}),` by hand.`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`Through Flux, the repository is used to:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Define application deployments`}),` in Kubernetes (plain manifests organized with Kustomize, or Helm charts)`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Automatically update applications`}),` when a new `,(0,n.jsx)(t.code,{children:`latest`}),` image is published`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Manage application configurations`}),` (environment variables, secrets pulled from Key Vault)`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Monitor the state of applications`}),` and ensure they remain in sync with the repository`]}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`While Terraform is responsible for infrastructure, `,(0,n.jsx)(t.strong,{children:`PoliNetwork-CD`}),` focuses on `,(0,n.jsx)(t.strong,{children:`managing the lifecycle of applications`}),` running on that infrastructure, ensuring that code changes are applied automatically and securely.`]}),`
`,(0,n.jsx)(t.h3,{id:`key-difference-infrastructure-vs-deployment`,children:(0,n.jsx)(t.strong,{children:`Key Difference: Infrastructure vs. Deployment`})}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Repository`}),(0,n.jsx)(t.th,{children:`Main Purpose`}),(0,n.jsx)(t.th,{children:`Example of Managed Resources`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.strong,{children:`Terraform`})}),(0,n.jsx)(t.td,{children:`Creates and manages cloud infrastructure`}),(0,n.jsx)(t.td,{children:`VM, disks, network, Key Vaults, identities`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.strong,{children:`PoliNetwork-CD`}),` (`,(0,n.jsx)(t.code,{children:`ansible/`}),`)`]}),(0,n.jsx)(t.td,{children:`Configures the VM`}),(0,n.jsx)(t.td,{children:`Disk mounts, firewall, SSH, K3s, backups`})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsxs)(t.td,{children:[(0,n.jsx)(t.strong,{children:`PoliNetwork-CD`}),` (Flux)`]}),(0,n.jsx)(t.td,{children:`Automates application deployment and updates`}),(0,n.jsx)(t.td,{children:`Deployments, ingresses, secrets, storage`})]})]})]}),`
`,(0,n.jsxs)(t.p,{children:[`In summary, `,(0,n.jsx)(t.strong,{children:`Terraform builds the foundation on which applications run`}),`, while `,(0,n.jsx)(t.strong,{children:`PoliNetwork-CD sets up the node and manages the deployment and continuous updating of applications`}),`. Both repositories work together to ensure a scalable and efficient cloud infrastructure.`]}),`
`,(0,n.jsx)(t.h3,{id:`how-a-request-reaches-an-app`,children:`How a request reaches an app`}),`
`,(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsxs)(t.li,{children:[`A visitor opens e.g. `,(0,n.jsx)(t.code,{children:`https://api.polinetwork.org`}),`. DNS points to Cloudflare.`]}),`
`,(0,n.jsxs)(t.li,{children:[`Cloudflare sends the request through the `,(0,n.jsx)(t.code,{children:`k3s01`}),` tunnel to one of the two
`,(0,n.jsx)(t.code,{children:`cloudflared`}),` pods in the cluster.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.code,{children:`cloudflared`}),` forwards it to `,(0,n.jsx)(t.strong,{children:`Traefik`}),`, the K3s ingress controller.`]}),`
`,(0,n.jsxs)(t.li,{children:[`Traefik picks the app from the `,(0,n.jsx)(t.code,{children:`Ingress`}),` whose `,(0,n.jsx)(t.code,{children:`host`}),` matches, and forwards the
request to that app's `,(0,n.jsx)(t.code,{children:`Service`}),`.`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`The VM never accepts inbound connections from the Internet: the tunnel is an
outbound connection, and the VM's public IP is used only for outbound traffic.`}),`
`,(0,n.jsxs)(i,{children:[(0,n.jsx)(r,{title:`Terraform`,href:`/docs/infrastructure/getting-started/cloud-infrastructure/terraform`,description:`Detailed overview of our Azure-based infrastructure managed via the polinetworkorg/terraform repository.`}),(0,n.jsx)(r,{title:`K3s Node`,href:`/docs/infrastructure/getting-started/cloud-infrastructure/k3s-node`,description:`The k3s01 VM, how Ansible configures it, and how to run the playbooks.`}),(0,n.jsx)(r,{title:`Flux`,href:`/docs/infrastructure/getting-started/cloud-infrastructure/flux`,description:`How Flux deploys the polinetwork-cd repository to the K3s cluster.`})]}),`
`,(0,n.jsx)(t.h2,{id:`references`,children:`References`}),`
`,(0,n.jsx)(t.h3,{id:`links-to-repositories`,children:(0,n.jsx)(t.strong,{children:`Links to Repositories`})}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/terraform`,children:`Terraform Repository`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/polinetwork-cd`,children:`PoliNetwork-CD Repository`})}),`
`]}),`
`,(0,n.jsx)(t.h3,{id:`additional-resources`,children:(0,n.jsx)(t.strong,{children:`Additional Resources`})}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://kubernetes.io/docs/`,children:`Kubernetes Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://docs.k3s.io/`,children:`K3s Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://fluxcd.io/flux/`,children:`Flux Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://www.terraform.io/docs/`,children:`Terraform Documentation`})}),`
`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};