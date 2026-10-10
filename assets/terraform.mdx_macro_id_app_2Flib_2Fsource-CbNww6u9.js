import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{t}from"./jsx-runtime-DREnUpxT.js";var n=e(t()),r={title:`Terraform`,description:`Detailed overview of our Azure-based infrastructure managed via the polinetworkorg/terraform repository.`},i=`## What is Terraform? [#what-is-terraform]

Terraform is an open-source Infrastructure as Code (IaC) tool developed by
HashiCorp. It allows you to define, provision, and manage the infrastructure
using a declarative configuration language. This means you describe the desired
state of the infrastructure, and Terraform takes care of creating and updating
the resources to match that state.

<Callout type="important">

This documentation assumes you already have the Terraform CLI installed on your
local machine. If you need help setting up Terraform, please refer to the
[official documentation](https://learn.hashicorp.com/tutorials/terraform/install-cli).

You'll also need to be logged in with the Azure CLI and have the necessary
permissions to manage the resources in our Azure subscription (more on this
[here](/docs/infrastructure/getting-started/setup#azure-cli)).

Once you have logged in to the Azure CLI, select the subscription and export it
for the provider:

\`\`\`sh
az account set --subscription <subscription-id>
export ARM_SUBSCRIPTION_ID=<subscription-id>
export TF_VAR_subscription_id="$ARM_SUBSCRIPTION_ID"
\`\`\`

More about this in the [repository README](https://github.com/PoliNetworkOrg/terraform/#local-checks).

</Callout>

### Why We Use Terraform [#why-we-use-terraform]

Our organization leverages Terraform to manage our Azure cloud infrastructure for several important reasons:

- **Consistency:** Defining our infrastructure as code ensures that every environment is configured the same way, reducing the chance of human error.
- **Automation:** Terraform automates the provisioning and modification of resources, streamlining our deployment processes.
- **Version Control:** Storing Terraform configurations in version control systems allows us to track changes, collaborate effectively, and revert to previous versions if needed.
- **Modularity:** Terraform encourages breaking down the infrastructure into reusable modules, which simplifies management and enhances maintainability.

### How Terraform Works [#how-terraform-works]

<Callout type="warning">

To run terraform commands you need to have the right permissions and credentials.
If you are not sure about your permissions, please contact the IT department (but
if you have to ask you probably shouldn't run \`apply\` yourself anyway).

If you haven't yet set up the Azure CLI please refer to the [setup guide](/docs/infrastructure/getting-started/setup#azure-cli).

</Callout>

Terraform operates through a simple yet powerful workflow:

1. **Write:** You define the infrastructure in configuration files (typically with a \`.tf\` extension).
2. **Plan:** Running \`terraform plan\` generates an execution plan, showing you the changes Terraform will make to achieve the desired state.
3. **Apply:** Executing \`terraform apply\` implements the changes, creating or updating the infrastructure accordingly.

<Callout type="danger">

Running Terraform commands can modify the cloud infrastructure.

**THIS CAN INCUR COSTS OR CAUSE DOWNTIME AND PERMANENT DATA LOSS IF NOT DONE PROPERLY.**

Always review the execution plan (\`terraform plan\`) before applying changes.

</Callout>

### Terraform Code vs. Terraform State vs. Azure State [#terraform-code-vs-terraform-state-vs-azure-state]

- **Terraform Code:**  
  This consists of the configuration files that describe your desired
  infrastructure. These files are the blueprint for what you want the infrastructure to look like.

- **Terraform State:**  
  The state file (we have two of them, see [State Management](#state-management)) records the current state
  of the infrastructure as managed by Terraform. This file is critical because
  it maps your configuration to the real-world resources, tracks dependencies,
  and allows Terraform to detect what needs to change during updates. Our state
  file is stored remotely (in an Azure Storage Account) and is locked using
  Azure's integrated leasing mechanism to prevent concurrent modifications.

- **Azure State:**  
  This is the actual state of resources deployed in the Azure environment.
  While Terraform keeps track of these resources via its state file, the real
  configuration and runtime details exist within Azure. The Terraform state acts
  as an intermediary, ensuring that the desired state (from the Terraform code)
  and the actual state (in Azure) are in sync. If resources are modified directly
  in Azure without updating Terraform, discrepancies may occur, highlighting the
  importance of using Terraform as the single source of truth.

This clear separation between code, Terraform state, and the actual cloud state
is key to maintaining a reliable and predictable infrastructure.

## Terraform Implementation Overview [#terraform-implementation-overview]

Welcome to the documentation for the **polinetworkorg/terraform** repository.
This page provides an in-depth look at our Terraform implementation on
**Microsoft Azure**, detailing the architecture of our infrastructure and the
key modules that make it up. While this overview highlights our main components,
it’s important to note that there are alternative approaches to similar problems,
and our setup is tailored to our current needs.

### Repository Overview [#repository-overview]

The **polinetworkorg/terraform** repository is our centralized solution for
provisioning and managing cloud infrastructure on Azure. Its default branch is
**\`stable\`**.

The code is split into two independent **root modules** (the folders you run
\`terraform\` in). Each root owns its resources and has its own state file; a root
can only read the other's resources through data sources, never declare them.

- **\`environments/k3s\`:** the production K3s platform. It defines:
  - the \`k3s01\` VM (Debian 13 ARM64) and its two data disks, \`disk-k3s-fast\`
    (Premium SSD v2, 64 GB) and \`disk-k3s-standard\` (Standard SSD, 128 GB);
  - the network: \`vnet-k3s\` (\`10.43.0.0/16\`), a NAT Gateway for outbound traffic,
    and an NSG that denies all inbound traffic;
  - the Key Vaults \`kv-pn-apps\` (application secrets) and \`kv-pn-infra\`
    (platform secrets);
  - the managed identities, including the one External Secrets uses through
    workload identity federation, and the public OIDC issuer the cluster's
    service-account tokens are verified against.
- **\`environments/legacy\`:** everything from before the migration: the old AKS
  cluster and its Kubernetes/Helm resources (ArgoCD, Longhorn, Kubernetes
  Dashboard, MariaDB, ...), plus shared resources such as the resource group
  \`rg-polinetwork\`, the backup storage account \`polinetworkbackups\` and the budgets.

What runs *inside* the VM is not managed here: see [K3s Node](/docs/infrastructure/getting-started/cloud-infrastructure/k3s-node) and [Flux](/docs/infrastructure/getting-started/cloud-infrastructure/flux).

<Callout type="info">

While the choices made in this implementation reflect our specific requirements
and constraints, it's worth noting that other approaches exist for managing
cloud infrastructure with Terraform.

Our modular design, state management strategy,
and access controls are tailored to our current operational needs and funding
situation—but they are not set in stone. Please feel free to reach out to the
IT department if you have any questions or suggestions.

</Callout>

### Infrastructure Structure [#infrastructure-structure]

Our repository is organized to clearly separate concerns and promote reusability.
While the exact folder structure may vary, a typical layout looks like this:

\`\`\`bash
📁 polinetworkorg/terraform/
 ├─ 📁 environments/        # Root modules: run terraform here, with -chdir
 │   ├─ 📁 k3s/             # K3s node, network, Key Vaults, identities (k3s.tfstate)
 │   └─ 📁 legacy/          # Old AKS platform and shared resources (state.tfstate)
 ├─ 📁 modules/             # Modules used by the legacy root
 │   ├─ 📁 aks/             # Azure Kubernetes Service
 │   ├─ 📁 argocd/          # ArgoCD installation
 │   ├─ 📁 shared/          # Backup storage account, budgets
 │   ├─ 📁 storage/         # Azure Storage Account where the Terraform state is kept
 │   └─ [other modules]     # Additional modules for specific services
 ├── README.md              # General repository documentation
 ├── STATE_MIGRATION.md     # How the state was split between the two roots
 └── [other files]
\`\`\`

### State Management [#state-management]

We use an **Azure Storage Account** for managing the Terraform state. The state
files are stored within a dedicated container named \`terraform-state\`,
as defined in our **storage** module:

| Root | State file |
|------|------------|
| \`environments/legacy\` | \`state.tfstate\` |
| \`environments/k3s\` | \`k3s.tfstate\` |

 The integrated leasing mechanism provided
by the Azure Storage Account is used for state locking, ensuring that concurrent
Terraform operations do not conflict with each other.

### Access and Authorization [#access-and-authorization]

Given the critical nature of our infrastructure, modifications (e.g., running
\`terraform apply\`) are restricted to personnel with sufficient clearance. As an
association, any infrastructure changes require approval from either the Head of
the IT Department or the Directive Council. All authorization is managed through
**Microsoft's Entra ID system**, ensuring that only properly authenticated and
authorized users can perform these operations.

### Funding and Nonprofit Considerations [#funding-and-nonprofit-considerations]

As a nonprofit organization, we benefit from a **Microsoft Azure Grant for Nonprofits**,
which provides us with a budget of **€2000 per year**. This support helps offset
our cloud costs and underpins our commitment to maintaining a robust and scalable
infrastructure.

<Callout type="info">

This is one of the core reasons we are structured as a nonprofit organization, and why
we use Azure as our cloud provider.

You can find more about our benefits [here](https://www.microsoft.com/en-us/nonprofits/azure).

If you have access to the adminorg account, you can check the current status of
our Azure grant [here](https://www.microsoftazuresponsorships.com/).

</Callout>

## Making Changes to the Infrastructure [#making-changes-to-the-infrastructure]

This section provides a basic guide on how to update our infrastructure using
Terraform and introduces some of the automated workflows that help us maintain
consistency and control.

### Basic Workflow for Infrastructure Changes [#basic-workflow-for-infrastructure-changes]

1. **Edit the Terraform Code:**  
   Modify the relevant configuration files to define your desired changes in the
   infrastructure. Most changes belong to \`environments/k3s\`.

2. **Review Your Changes Locally:**  
   Run \`terraform -chdir=environments/<root> plan\` to generate an execution plan.
   This command will show you what changes will be made to align the actual
   infrastructure with your code.

3. **Open a Pull Request against \`stable\`:**  
   The **Terraform workflow** runs format, init, validate and plan for both roots
   and posts one comment per root with the plan. Pull requests never apply.

4. **Cost Estimation with Infracost:**  
   When you open a pull request, our **Infracost workflow** is triggered
   automatically. This workflow calculates the estimated cost impact of your
   changes and posts a report in the pull request comments, so you can review
   any potential cost implications before merging.
   <Callout type="tip">

   If you want to run Infracost locally, you can install it by following the
   [official documentation](https://www.infracost.io/docs/).

   </Callout>

5. **Apply the Changes:**  
   After your changes have been reviewed and approved, merge the pull request.
   The push to \`stable\` runs the plans again, then waits for a maintainer to
   approve the GitHub **\`production\`** environment. Once approved, it applies
   \`k3s\` first and \`legacy\` second. You don't run \`terraform apply\` yourself.

6. **Drift Detection:**  
   A nightly **Drift workflow** runs to detect any discrepancies between the
   current Terraform state and the actual state in Azure. If this workflow
   detects a drift from what the \`terraform plan\` output would predict, it
   automatically opens an issue for further investigation.
   At the moment it only checks the \`legacy\` root.

### Basic Terraform CLI Commands [#basic-terraform-cli-commands]

Always pick a root with \`-chdir\`, e.g. \`terraform -chdir=environments/k3s plan\`.
Running Terraform at the repository root does nothing useful.

- **\`terraform init\`**  
  Initializes the working directory containing the Terraform configuration files.
  <Callout type="tip">

  This has to be run as soon as you clone the repository or when you pull changes
  that include new modules or providers. Locally, add
  \`-backend-config=use_oidc=false\` (OIDC is only for GitHub Actions).

  </Callout>

- **\`terraform plan\`**  
  Generates an execution plan showing what changes will be applied to the infrastructure.

- **\`terraform apply\`**  
  Applies the changes defined in your Terraform configuration to the cloud environment.
  In practice the Terraform workflow does this for you after the \`production\` approval.

- **\`terraform destroy\`**  
  Destroys the resources managed by Terraform, useful for tearing down test environments or decommissioning infrastructure.

  <Callout type="danger">

  If you ever happen to be as much as tempted of using \`terraform destroy\`, you
  better be **SURE AS SHIT** about what you are doing. Never run it without
  \`-chdir\`, and remember the K3s data disks have \`prevent_destroy\` for a reason. Make sure to review the
  implications thoroughly before proceeding.
  > *One does not simply destroy PoliNetwork with one command.*

  </Callout>

By following these steps and leveraging our automated workflows, you ensure that
infrastructure changes are managed in a consistent, cost-aware, and controlled
manner.

## References [#references]

- [Terraform Documentation](https://www.terraform.io/docs/index.html)
- [Microsoft Azure Documentation](https://docs.microsoft.com/en-us/azure/)
- [Infracost Documentation](https://www.infracost.io/docs/)
- [Terraform Repository](https://github.com/polinetworkorg/terraform)
`,a={contents:[{heading:`what-is-terraform`,content:`Terraform is an open-source Infrastructure as Code (IaC) tool developed by
HashiCorp. It allows you to define, provision, and manage the infrastructure
using a declarative configuration language. This means you describe the desired
state of the infrastructure, and Terraform takes care of creating and updating
the resources to match that state.`},{heading:`what-is-terraform`,content:`This documentation assumes you already have the Terraform CLI installed on your
local machine. If you need help setting up Terraform, please refer to the
official documentation.`},{heading:`what-is-terraform`,content:`You'll also need to be logged in with the Azure CLI and have the necessary
permissions to manage the resources in our Azure subscription (more on this
here).`},{heading:`what-is-terraform`,content:`Once you have logged in to the Azure CLI, select the subscription and export it
for the provider:`},{heading:`what-is-terraform`,content:`More about this in the repository README.`},{heading:`why-we-use-terraform`,content:`Our organization leverages Terraform to manage our Azure cloud infrastructure for several important reasons:`},{heading:`why-we-use-terraform`,content:`**Consistency:** Defining our infrastructure as code ensures that every environment is configured the same way, reducing the chance of human error.`},{heading:`why-we-use-terraform`,content:`**Automation:** Terraform automates the provisioning and modification of resources, streamlining our deployment processes.`},{heading:`why-we-use-terraform`,content:`**Version Control:** Storing Terraform configurations in version control systems allows us to track changes, collaborate effectively, and revert to previous versions if needed.`},{heading:`why-we-use-terraform`,content:`**Modularity:** Terraform encourages breaking down the infrastructure into reusable modules, which simplifies management and enhances maintainability.`},{heading:`how-terraform-works`,content:`To run terraform commands you need to have the right permissions and credentials.
If you are not sure about your permissions, please contact the IT department (but
if you have to ask you probably shouldn't run \`apply\` yourself anyway).`},{heading:`how-terraform-works`,content:`If you haven't yet set up the Azure CLI please refer to the setup guide.`},{heading:`how-terraform-works`,content:`Terraform operates through a simple yet powerful workflow:`},{heading:`how-terraform-works`,content:"**Write:** You define the infrastructure in configuration files (typically with a `.tf` extension)."},{heading:`how-terraform-works`,content:"**Plan:** Running `terraform plan` generates an execution plan, showing you the changes Terraform will make to achieve the desired state."},{heading:`how-terraform-works`,content:"**Apply:** Executing `terraform apply` implements the changes, creating or updating the infrastructure accordingly."},{heading:`how-terraform-works`,content:`Running Terraform commands can modify the cloud infrastructure.`},{heading:`how-terraform-works`,content:`**THIS CAN INCUR COSTS OR CAUSE DOWNTIME AND PERMANENT DATA LOSS IF NOT DONE PROPERLY.**`},{heading:`how-terraform-works`,content:"Always review the execution plan (`terraform plan`) before applying changes."},{heading:`terraform-code-vs-terraform-state-vs-azure-state`,content:`**Terraform Code:**  
This consists of the configuration files that describe your desired
infrastructure. These files are the blueprint for what you want the infrastructure to look like.`},{heading:`terraform-code-vs-terraform-state-vs-azure-state`,content:`**Terraform State:**  
The state file (we have two of them, see State Management) records the current state
of the infrastructure as managed by Terraform. This file is critical because
it maps your configuration to the real-world resources, tracks dependencies,
and allows Terraform to detect what needs to change during updates. Our state
file is stored remotely (in an Azure Storage Account) and is locked using
Azure's integrated leasing mechanism to prevent concurrent modifications.`},{heading:`terraform-code-vs-terraform-state-vs-azure-state`,content:`**Azure State:**  
This is the actual state of resources deployed in the Azure environment.
While Terraform keeps track of these resources via its state file, the real
configuration and runtime details exist within Azure. The Terraform state acts
as an intermediary, ensuring that the desired state (from the Terraform code)
and the actual state (in Azure) are in sync. If resources are modified directly
in Azure without updating Terraform, discrepancies may occur, highlighting the
importance of using Terraform as the single source of truth.`},{heading:`terraform-code-vs-terraform-state-vs-azure-state`,content:`This clear separation between code, Terraform state, and the actual cloud state
is key to maintaining a reliable and predictable infrastructure.`},{heading:`terraform-implementation-overview`,content:`Welcome to the documentation for the **polinetworkorg/terraform** repository.
This page provides an in-depth look at our Terraform implementation on
**Microsoft Azure**, detailing the architecture of our infrastructure and the
key modules that make it up. While this overview highlights our main components,
it’s important to note that there are alternative approaches to similar problems,
and our setup is tailored to our current needs.`},{heading:`repository-overview`,content:`The **polinetworkorg/terraform** repository is our centralized solution for
provisioning and managing cloud infrastructure on Azure. Its default branch is
**\`stable\`**.`},{heading:`repository-overview`,content:`The code is split into two independent **root modules** (the folders you run
\`terraform\` in). Each root owns its resources and has its own state file; a root
can only read the other's resources through data sources, never declare them.`},{heading:`repository-overview`,content:"**`environments/k3s`:** the production K3s platform. It defines:"},{heading:`repository-overview`,content:"the `k3s01` VM (Debian 13 ARM64) and its two data disks, `disk-k3s-fast`\n(Premium SSD v2, 64 GB) and `disk-k3s-standard` (Standard SSD, 128 GB);"},{heading:`repository-overview`,content:"the network: `vnet-k3s` (`10.43.0.0/16`), a NAT Gateway for outbound traffic,\nand an NSG that denies all inbound traffic;"},{heading:`repository-overview`,content:"the Key Vaults `kv-pn-apps` (application secrets) and `kv-pn-infra`\n(platform secrets);"},{heading:`repository-overview`,content:`the managed identities, including the one External Secrets uses through
workload identity federation, and the public OIDC issuer the cluster's
service-account tokens are verified against.`},{heading:`repository-overview`,content:"**`environments/legacy`:** everything from before the migration: the old AKS\ncluster and its Kubernetes/Helm resources (ArgoCD, Longhorn, Kubernetes\nDashboard, MariaDB, ...), plus shared resources such as the resource group\n`rg-polinetwork`, the backup storage account `polinetworkbackups` and the budgets."},{heading:`repository-overview`,content:`What runs *inside* the VM is not managed here: see K3s Node and Flux.`},{heading:`repository-overview`,content:`While the choices made in this implementation reflect our specific requirements
and constraints, it's worth noting that other approaches exist for managing
cloud infrastructure with Terraform.`},{heading:`repository-overview`,content:`Our modular design, state management strategy,
and access controls are tailored to our current operational needs and funding
situation—but they are not set in stone. Please feel free to reach out to the
IT department if you have any questions or suggestions.`},{heading:`infrastructure-structure`,content:`Our repository is organized to clearly separate concerns and promote reusability.
While the exact folder structure may vary, a typical layout looks like this:`},{heading:`state-management`,content:`We use an **Azure Storage Account** for managing the Terraform state. The state
files are stored within a dedicated container named \`terraform-state\`,
as defined in our **storage** module:`},{heading:`state-management`,content:"| Root                  | State file      |\n| --------------------- | --------------- |\n| `environments/legacy` | `state.tfstate` |",table:`table-0`},{heading:`state-management`,content:"| Root               | State file    |\n| ------------------ | ------------- |\n| `environments/k3s` | `k3s.tfstate` |",table:`table-0`},{heading:`state-management`,content:`The integrated leasing mechanism provided
by the Azure Storage Account is used for state locking, ensuring that concurrent
Terraform operations do not conflict with each other.`},{heading:`access-and-authorization`,content:`Given the critical nature of our infrastructure, modifications (e.g., running
\`terraform apply\`) are restricted to personnel with sufficient clearance. As an
association, any infrastructure changes require approval from either the Head of
the IT Department or the Directive Council. All authorization is managed through
**Microsoft's Entra ID system**, ensuring that only properly authenticated and
authorized users can perform these operations.`},{heading:`funding-and-nonprofit-considerations`,content:`As a nonprofit organization, we benefit from a **Microsoft Azure Grant for Nonprofits**,
which provides us with a budget of **€2000 per year**. This support helps offset
our cloud costs and underpins our commitment to maintaining a robust and scalable
infrastructure.`},{heading:`funding-and-nonprofit-considerations`,content:`This is one of the core reasons we are structured as a nonprofit organization, and why
we use Azure as our cloud provider.`},{heading:`funding-and-nonprofit-considerations`,content:`You can find more about our benefits here.`},{heading:`funding-and-nonprofit-considerations`,content:`If you have access to the adminorg account, you can check the current status of
our Azure grant here.`},{heading:`making-changes-to-the-infrastructure`,content:`This section provides a basic guide on how to update our infrastructure using
Terraform and introduces some of the automated workflows that help us maintain
consistency and control.`},{heading:`basic-workflow-for-infrastructure-changes`,content:`**Edit the Terraform Code:**  
Modify the relevant configuration files to define your desired changes in the
infrastructure. Most changes belong to \`environments/k3s\`.`},{heading:`basic-workflow-for-infrastructure-changes`,content:`**Review Your Changes Locally:**  
Run \`terraform -chdir=environments/<root> plan\` to generate an execution plan.
This command will show you what changes will be made to align the actual
infrastructure with your code.`},{heading:`basic-workflow-for-infrastructure-changes`,content:`**Open a Pull Request against \`stable\`:**  
The **Terraform workflow** runs format, init, validate and plan for both roots
and posts one comment per root with the plan. Pull requests never apply.`},{heading:`basic-workflow-for-infrastructure-changes`,content:`**Cost Estimation with Infracost:**  
When you open a pull request, our **Infracost workflow** is triggered
automatically. This workflow calculates the estimated cost impact of your
changes and posts a report in the pull request comments, so you can review
any potential cost implications before merging.`},{heading:`basic-workflow-for-infrastructure-changes`,content:`If you want to run Infracost locally, you can install it by following the
official documentation.`},{heading:`basic-workflow-for-infrastructure-changes`,content:"**Apply the Changes:**  \nAfter your changes have been reviewed and approved, merge the pull request.\nThe push to `stable` runs the plans again, then waits for a maintainer to\napprove the GitHub **`production`** environment. Once approved, it applies\n`k3s` first and `legacy` second. You don't run `terraform apply` yourself."},{heading:`basic-workflow-for-infrastructure-changes`,content:`**Drift Detection:**  
A nightly **Drift workflow** runs to detect any discrepancies between the
current Terraform state and the actual state in Azure. If this workflow
detects a drift from what the \`terraform plan\` output would predict, it
automatically opens an issue for further investigation.
At the moment it only checks the \`legacy\` root.`},{heading:`basic-terraform-cli-commands`,content:"Always pick a root with `-chdir`, e.g. `terraform -chdir=environments/k3s plan`.\nRunning Terraform at the repository root does nothing useful."},{heading:`basic-terraform-cli-commands`,content:"**`terraform init`**  \nInitializes the working directory containing the Terraform configuration files."},{heading:`basic-terraform-cli-commands`,content:`This has to be run as soon as you clone the repository or when you pull changes
that include new modules or providers. Locally, add
\`-backend-config=use_oidc=false\` (OIDC is only for GitHub Actions).`},{heading:`basic-terraform-cli-commands`,content:"**`terraform plan`**  \nGenerates an execution plan showing what changes will be applied to the infrastructure."},{heading:`basic-terraform-cli-commands`,content:"**`terraform apply`**  \nApplies the changes defined in your Terraform configuration to the cloud environment.\nIn practice the Terraform workflow does this for you after the `production` approval."},{heading:`basic-terraform-cli-commands`,content:"**`terraform destroy`**  \nDestroys the resources managed by Terraform, useful for tearing down test environments or decommissioning infrastructure."},{heading:`basic-terraform-cli-commands`,content:"If you ever happen to be as much as tempted of using `terraform destroy`, you\nbetter be **SURE AS SHIT** about what you are doing. Never run it without\n`-chdir`, and remember the K3s data disks have `prevent_destroy` for a reason. Make sure to review the\nimplications thoroughly before proceeding."},{heading:`basic-terraform-cli-commands`,content:`> *One does not simply destroy PoliNetwork with one command.*`},{heading:`basic-terraform-cli-commands`,content:`By following these steps and leveraging our automated workflows, you ensure that
infrastructure changes are managed in a consistent, cost-aware, and controlled
manner.`},{heading:`references`,content:`Terraform Documentation`},{heading:`references`,content:`Microsoft Azure Documentation`},{heading:`references`,content:`Infracost Documentation`},{heading:`references`,content:`Terraform Repository`}],headings:[{id:`what-is-terraform`,content:`What is Terraform?`},{id:`why-we-use-terraform`,content:`Why We Use Terraform`},{id:`how-terraform-works`,content:`How Terraform Works`},{id:`terraform-code-vs-terraform-state-vs-azure-state`,content:`Terraform Code vs. Terraform State vs. Azure State`},{id:`terraform-implementation-overview`,content:`Terraform Implementation Overview`},{id:`repository-overview`,content:`Repository Overview`},{id:`infrastructure-structure`,content:`Infrastructure Structure`},{id:`state-management`,content:`State Management`},{id:`access-and-authorization`,content:`Access and Authorization`},{id:`funding-and-nonprofit-considerations`,content:`Funding and Nonprofit Considerations`},{id:`making-changes-to-the-infrastructure`,content:`Making Changes to the Infrastructure`},{id:`basic-workflow-for-infrastructure-changes`,content:`Basic Workflow for Infrastructure Changes`},{id:`basic-terraform-cli-commands`,content:`Basic Terraform CLI Commands`},{id:`references`,content:`References`}]},o=[{depth:2,url:`#what-is-terraform`,title:(0,n.jsx)(n.Fragment,{children:`What is Terraform?`})},{depth:3,url:`#why-we-use-terraform`,title:(0,n.jsx)(n.Fragment,{children:`Why We Use Terraform`})},{depth:3,url:`#how-terraform-works`,title:(0,n.jsx)(n.Fragment,{children:`How Terraform Works`})},{depth:3,url:`#terraform-code-vs-terraform-state-vs-azure-state`,title:(0,n.jsx)(n.Fragment,{children:`Terraform Code vs. Terraform State vs. Azure State`})},{depth:2,url:`#terraform-implementation-overview`,title:(0,n.jsx)(n.Fragment,{children:`Terraform Implementation Overview`})},{depth:3,url:`#repository-overview`,title:(0,n.jsx)(n.Fragment,{children:`Repository Overview`})},{depth:3,url:`#infrastructure-structure`,title:(0,n.jsx)(n.Fragment,{children:`Infrastructure Structure`})},{depth:3,url:`#state-management`,title:(0,n.jsx)(n.Fragment,{children:`State Management`})},{depth:3,url:`#access-and-authorization`,title:(0,n.jsx)(n.Fragment,{children:`Access and Authorization`})},{depth:3,url:`#funding-and-nonprofit-considerations`,title:(0,n.jsx)(n.Fragment,{children:`Funding and Nonprofit Considerations`})},{depth:2,url:`#making-changes-to-the-infrastructure`,title:(0,n.jsx)(n.Fragment,{children:`Making Changes to the Infrastructure`})},{depth:3,url:`#basic-workflow-for-infrastructure-changes`,title:(0,n.jsx)(n.Fragment,{children:`Basic Workflow for Infrastructure Changes`})},{depth:3,url:`#basic-terraform-cli-commands`,title:(0,n.jsx)(n.Fragment,{children:`Basic Terraform CLI Commands`})},{depth:2,url:`#references`,title:(0,n.jsx)(n.Fragment,{children:`References`})}];function s(e){let t={a:`a`,blockquote:`blockquote`,br:`br`,code:`code`,em:`em`,h2:`h2`,h3:`h3`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components},{Callout:r}=t;return r||l(`Callout`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h2,{id:`what-is-terraform`,children:`What is Terraform?`}),`
`,(0,n.jsx)(t.p,{children:`Terraform is an open-source Infrastructure as Code (IaC) tool developed by
HashiCorp. It allows you to define, provision, and manage the infrastructure
using a declarative configuration language. This means you describe the desired
state of the infrastructure, and Terraform takes care of creating and updating
the resources to match that state.`}),`
`,(0,n.jsxs)(r,{type:`important`,children:[(0,n.jsxs)(t.p,{children:[`This documentation assumes you already have the Terraform CLI installed on your
local machine. If you need help setting up Terraform, please refer to the
`,(0,n.jsx)(t.a,{href:`https://learn.hashicorp.com/tutorials/terraform/install-cli`,children:`official documentation`}),`.`]}),(0,n.jsxs)(t.p,{children:[`You'll also need to be logged in with the Azure CLI and have the necessary
permissions to manage the resources in our Azure subscription (more on this
`,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/setup#azure-cli`,children:`here`}),`).`]}),(0,n.jsx)(t.p,{children:`Once you have logged in to the Azure CLI, select the subscription and export it
for the provider:`}),(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`az`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` account`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` set`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#005CC5`,"--shiki-dark":`#79B8FF`},children:` --subscription`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:` <`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`subscription-i`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`d`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`export`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` ARM_SUBSCRIPTION_ID`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`=<`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`subscription-id`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`>`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`export`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` TF_VAR_subscription_id`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#D73A49`,"--shiki-dark":`#F97583`},children:`=`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`"`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:`$ARM_SUBSCRIPTION_ID`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`"`})]})]})})}),(0,n.jsxs)(t.p,{children:[`More about this in the `,(0,n.jsx)(t.a,{href:`https://github.com/PoliNetworkOrg/terraform/#local-checks`,children:`repository README`}),`.`]})]}),`
`,(0,n.jsx)(t.h3,{id:`why-we-use-terraform`,children:`Why We Use Terraform`}),`
`,(0,n.jsx)(t.p,{children:`Our organization leverages Terraform to manage our Azure cloud infrastructure for several important reasons:`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Consistency:`}),` Defining our infrastructure as code ensures that every environment is configured the same way, reducing the chance of human error.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Automation:`}),` Terraform automates the provisioning and modification of resources, streamlining our deployment processes.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Version Control:`}),` Storing Terraform configurations in version control systems allows us to track changes, collaborate effectively, and revert to previous versions if needed.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Modularity:`}),` Terraform encourages breaking down the infrastructure into reusable modules, which simplifies management and enhances maintainability.`]}),`
`]}),`
`,(0,n.jsx)(t.h3,{id:`how-terraform-works`,children:`How Terraform Works`}),`
`,(0,n.jsxs)(r,{type:`warning`,children:[(0,n.jsxs)(t.p,{children:[`To run terraform commands you need to have the right permissions and credentials.
If you are not sure about your permissions, please contact the IT department (but
if you have to ask you probably shouldn't run `,(0,n.jsx)(t.code,{children:`apply`}),` yourself anyway).`]}),(0,n.jsxs)(t.p,{children:[`If you haven't yet set up the Azure CLI please refer to the `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/setup#azure-cli`,children:`setup guide`}),`.`]})]}),`
`,(0,n.jsx)(t.p,{children:`Terraform operates through a simple yet powerful workflow:`}),`
`,(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Write:`}),` You define the infrastructure in configuration files (typically with a `,(0,n.jsx)(t.code,{children:`.tf`}),` extension).`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Plan:`}),` Running `,(0,n.jsx)(t.code,{children:`terraform plan`}),` generates an execution plan, showing you the changes Terraform will make to achieve the desired state.`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsx)(t.strong,{children:`Apply:`}),` Executing `,(0,n.jsx)(t.code,{children:`terraform apply`}),` implements the changes, creating or updating the infrastructure accordingly.`]}),`
`]}),`
`,(0,n.jsxs)(r,{type:`danger`,children:[(0,n.jsx)(t.p,{children:`Running Terraform commands can modify the cloud infrastructure.`}),(0,n.jsx)(t.p,{children:(0,n.jsx)(t.strong,{children:`THIS CAN INCUR COSTS OR CAUSE DOWNTIME AND PERMANENT DATA LOSS IF NOT DONE PROPERLY.`})}),(0,n.jsxs)(t.p,{children:[`Always review the execution plan (`,(0,n.jsx)(t.code,{children:`terraform plan`}),`) before applying changes.`]})]}),`
`,(0,n.jsx)(t.h3,{id:`terraform-code-vs-terraform-state-vs-azure-state`,children:`Terraform Code vs. Terraform State vs. Azure State`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Terraform Code:`}),(0,n.jsx)(t.br,{}),`
`,`This consists of the configuration files that describe your desired
infrastructure. These files are the blueprint for what you want the infrastructure to look like.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Terraform State:`}),(0,n.jsx)(t.br,{}),`
`,`The state file (we have two of them, see `,(0,n.jsx)(t.a,{href:`#state-management`,children:`State Management`}),`) records the current state
of the infrastructure as managed by Terraform. This file is critical because
it maps your configuration to the real-world resources, tracks dependencies,
and allows Terraform to detect what needs to change during updates. Our state
file is stored remotely (in an Azure Storage Account) and is locked using
Azure's integrated leasing mechanism to prevent concurrent modifications.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Azure State:`}),(0,n.jsx)(t.br,{}),`
`,`This is the actual state of resources deployed in the Azure environment.
While Terraform keeps track of these resources via its state file, the real
configuration and runtime details exist within Azure. The Terraform state acts
as an intermediary, ensuring that the desired state (from the Terraform code)
and the actual state (in Azure) are in sync. If resources are modified directly
in Azure without updating Terraform, discrepancies may occur, highlighting the
importance of using Terraform as the single source of truth.`]}),`
`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`This clear separation between code, Terraform state, and the actual cloud state
is key to maintaining a reliable and predictable infrastructure.`}),`
`,(0,n.jsx)(t.h2,{id:`terraform-implementation-overview`,children:`Terraform Implementation Overview`}),`
`,(0,n.jsxs)(t.p,{children:[`Welcome to the documentation for the `,(0,n.jsx)(t.strong,{children:`polinetworkorg/terraform`}),` repository.
This page provides an in-depth look at our Terraform implementation on
`,(0,n.jsx)(t.strong,{children:`Microsoft Azure`}),`, detailing the architecture of our infrastructure and the
key modules that make it up. While this overview highlights our main components,
it’s important to note that there are alternative approaches to similar problems,
and our setup is tailored to our current needs.`]}),`
`,(0,n.jsx)(t.h3,{id:`repository-overview`,children:`Repository Overview`}),`
`,(0,n.jsxs)(t.p,{children:[`The `,(0,n.jsx)(t.strong,{children:`polinetworkorg/terraform`}),` repository is our centralized solution for
provisioning and managing cloud infrastructure on Azure. Its default branch is
`,(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`stable`})}),`.`]}),`
`,(0,n.jsxs)(t.p,{children:[`The code is split into two independent `,(0,n.jsx)(t.strong,{children:`root modules`}),` (the folders you run
`,(0,n.jsx)(t.code,{children:`terraform`}),` in). Each root owns its resources and has its own state file; a root
can only read the other's resources through data sources, never declare them.`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsxs)(t.strong,{children:[(0,n.jsx)(t.code,{children:`environments/k3s`}),`:`]}),` the production K3s platform. It defines:`,`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`the `,(0,n.jsx)(t.code,{children:`k3s01`}),` VM (Debian 13 ARM64) and its two data disks, `,(0,n.jsx)(t.code,{children:`disk-k3s-fast`}),`
(Premium SSD v2, 64 GB) and `,(0,n.jsx)(t.code,{children:`disk-k3s-standard`}),` (Standard SSD, 128 GB);`]}),`
`,(0,n.jsxs)(t.li,{children:[`the network: `,(0,n.jsx)(t.code,{children:`vnet-k3s`}),` (`,(0,n.jsx)(t.code,{children:`10.43.0.0/16`}),`), a NAT Gateway for outbound traffic,
and an NSG that denies all inbound traffic;`]}),`
`,(0,n.jsxs)(t.li,{children:[`the Key Vaults `,(0,n.jsx)(t.code,{children:`kv-pn-apps`}),` (application secrets) and `,(0,n.jsx)(t.code,{children:`kv-pn-infra`}),`
(platform secrets);`]}),`
`,(0,n.jsx)(t.li,{children:`the managed identities, including the one External Secrets uses through
workload identity federation, and the public OIDC issuer the cluster's
service-account tokens are verified against.`}),`
`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[(0,n.jsxs)(t.strong,{children:[(0,n.jsx)(t.code,{children:`environments/legacy`}),`:`]}),` everything from before the migration: the old AKS
cluster and its Kubernetes/Helm resources (ArgoCD, Longhorn, Kubernetes
Dashboard, MariaDB, ...), plus shared resources such as the resource group
`,(0,n.jsx)(t.code,{children:`rg-polinetwork`}),`, the backup storage account `,(0,n.jsx)(t.code,{children:`polinetworkbackups`}),` and the budgets.`]}),`
`]}),`
`,(0,n.jsxs)(t.p,{children:[`What runs `,(0,n.jsx)(t.em,{children:`inside`}),` the VM is not managed here: see `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/cloud-infrastructure/k3s-node`,children:`K3s Node`}),` and `,(0,n.jsx)(t.a,{href:`/docs/infrastructure/getting-started/cloud-infrastructure/flux`,children:`Flux`}),`.`]}),`
`,(0,n.jsxs)(r,{type:`info`,children:[(0,n.jsx)(t.p,{children:`While the choices made in this implementation reflect our specific requirements
and constraints, it's worth noting that other approaches exist for managing
cloud infrastructure with Terraform.`}),(0,n.jsx)(t.p,{children:`Our modular design, state management strategy,
and access controls are tailored to our current operational needs and funding
situation—but they are not set in stone. Please feel free to reach out to the
IT department if you have any questions or suggestions.`})]}),`
`,(0,n.jsx)(t.h3,{id:`infrastructure-structure`,children:`Infrastructure Structure`}),`
`,(0,n.jsx)(t.p,{children:`Our repository is organized to clearly separate concerns and promote reusability.
While the exact folder structure may vary, a typical layout looks like this:`}),`
`,(0,n.jsx)(n.Fragment,{children:(0,n.jsx)(t.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>`,children:(0,n.jsxs)(t.code,{children:[(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:`📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` polinetworkorg/terraform/`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` environments/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`        # Root modules: run terraform here, with -chdir`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` k3s/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`             # K3s node, network, Key Vaults, identities (k3s.tfstate)`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   └─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` legacy/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`          # Old AKS platform and shared resources (state.tfstate)`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` modules/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`             # Modules used by the legacy root`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` aks/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`             # Azure Kubernetes Service`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` argocd/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`          # ArgoCD installation`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` shared/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`          # Backup storage account, budgets`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   ├─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` 📁`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` storage/`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`         # Azure Storage Account where the Terraform state is kept`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` │`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`   └─`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` [other `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`modules]`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`     # Additional modules for specific services`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├──`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` README.md`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`              # General repository documentation`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` ├──`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:` STATE_MIGRATION.md`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#6A737D`,"--shiki-dark":`#6A737D`},children:`     # How the state was split between the two roots`})]}),`
`,(0,n.jsxs)(t.span,{className:`line`,children:[(0,n.jsx)(t.span,{style:{"--shiki-light":`#6F42C1`,"--shiki-dark":`#B392F0`},children:` └──`}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#24292E`,"--shiki-dark":`#E1E4E8`},children:` [other `}),(0,n.jsx)(t.span,{style:{"--shiki-light":`#032F62`,"--shiki-dark":`#9ECBFF`},children:`files]`})]})]})})}),`
`,(0,n.jsx)(t.h3,{id:`state-management`,children:`State Management`}),`
`,(0,n.jsxs)(t.p,{children:[`We use an `,(0,n.jsx)(t.strong,{children:`Azure Storage Account`}),` for managing the Terraform state. The state
files are stored within a dedicated container named `,(0,n.jsx)(t.code,{children:`terraform-state`}),`,
as defined in our `,(0,n.jsx)(t.strong,{children:`storage`}),` module:`]}),`
`,(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:`Root`}),(0,n.jsx)(t.th,{children:`State file`})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`environments/legacy`})}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`state.tfstate`})})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`environments/k3s`})}),(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:`k3s.tfstate`})})]})]})]}),`
`,(0,n.jsx)(t.p,{children:`The integrated leasing mechanism provided
by the Azure Storage Account is used for state locking, ensuring that concurrent
Terraform operations do not conflict with each other.`}),`
`,(0,n.jsx)(t.h3,{id:`access-and-authorization`,children:`Access and Authorization`}),`
`,(0,n.jsxs)(t.p,{children:[`Given the critical nature of our infrastructure, modifications (e.g., running
`,(0,n.jsx)(t.code,{children:`terraform apply`}),`) are restricted to personnel with sufficient clearance. As an
association, any infrastructure changes require approval from either the Head of
the IT Department or the Directive Council. All authorization is managed through
`,(0,n.jsx)(t.strong,{children:`Microsoft's Entra ID system`}),`, ensuring that only properly authenticated and
authorized users can perform these operations.`]}),`
`,(0,n.jsx)(t.h3,{id:`funding-and-nonprofit-considerations`,children:`Funding and Nonprofit Considerations`}),`
`,(0,n.jsxs)(t.p,{children:[`As a nonprofit organization, we benefit from a `,(0,n.jsx)(t.strong,{children:`Microsoft Azure Grant for Nonprofits`}),`,
which provides us with a budget of `,(0,n.jsx)(t.strong,{children:`€2000 per year`}),`. This support helps offset
our cloud costs and underpins our commitment to maintaining a robust and scalable
infrastructure.`]}),`
`,(0,n.jsxs)(r,{type:`info`,children:[(0,n.jsx)(t.p,{children:`This is one of the core reasons we are structured as a nonprofit organization, and why
we use Azure as our cloud provider.`}),(0,n.jsxs)(t.p,{children:[`You can find more about our benefits `,(0,n.jsx)(t.a,{href:`https://www.microsoft.com/en-us/nonprofits/azure`,children:`here`}),`.`]}),(0,n.jsxs)(t.p,{children:[`If you have access to the adminorg account, you can check the current status of
our Azure grant `,(0,n.jsx)(t.a,{href:`https://www.microsoftazuresponsorships.com/`,children:`here`}),`.`]})]}),`
`,(0,n.jsx)(t.h2,{id:`making-changes-to-the-infrastructure`,children:`Making Changes to the Infrastructure`}),`
`,(0,n.jsx)(t.p,{children:`This section provides a basic guide on how to update our infrastructure using
Terraform and introduces some of the automated workflows that help us maintain
consistency and control.`}),`
`,(0,n.jsx)(t.h3,{id:`basic-workflow-for-infrastructure-changes`,children:`Basic Workflow for Infrastructure Changes`}),`
`,(0,n.jsxs)(t.ol,{children:[`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Edit the Terraform Code:`}),(0,n.jsx)(t.br,{}),`
`,`Modify the relevant configuration files to define your desired changes in the
infrastructure. Most changes belong to `,(0,n.jsx)(t.code,{children:`environments/k3s`}),`.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Review Your Changes Locally:`}),(0,n.jsx)(t.br,{}),`
`,`Run `,(0,n.jsx)(t.code,{children:`terraform -chdir=environments/<root> plan`}),` to generate an execution plan.
This command will show you what changes will be made to align the actual
infrastructure with your code.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsxs)(t.strong,{children:[`Open a Pull Request against `,(0,n.jsx)(t.code,{children:`stable`}),`:`]}),(0,n.jsx)(t.br,{}),`
`,`The `,(0,n.jsx)(t.strong,{children:`Terraform workflow`}),` runs format, init, validate and plan for both roots
and posts one comment per root with the plan. Pull requests never apply.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Cost Estimation with Infracost:`}),(0,n.jsx)(t.br,{}),`
`,`When you open a pull request, our `,(0,n.jsx)(t.strong,{children:`Infracost workflow`}),` is triggered
automatically. This workflow calculates the estimated cost impact of your
changes and posts a report in the pull request comments, so you can review
any potential cost implications before merging.`]}),`
`,(0,n.jsx)(r,{type:`tip`,children:(0,n.jsxs)(t.p,{children:[`If you want to run Infracost locally, you can install it by following the
`,(0,n.jsx)(t.a,{href:`https://www.infracost.io/docs/`,children:`official documentation`}),`.`]})}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Apply the Changes:`}),(0,n.jsx)(t.br,{}),`
`,`After your changes have been reviewed and approved, merge the pull request.
The push to `,(0,n.jsx)(t.code,{children:`stable`}),` runs the plans again, then waits for a maintainer to
approve the GitHub `,(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`production`})}),` environment. Once approved, it applies
`,(0,n.jsx)(t.code,{children:`k3s`}),` first and `,(0,n.jsx)(t.code,{children:`legacy`}),` second. You don't run `,(0,n.jsx)(t.code,{children:`terraform apply`}),` yourself.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:`Drift Detection:`}),(0,n.jsx)(t.br,{}),`
`,`A nightly `,(0,n.jsx)(t.strong,{children:`Drift workflow`}),` runs to detect any discrepancies between the
current Terraform state and the actual state in Azure. If this workflow
detects a drift from what the `,(0,n.jsx)(t.code,{children:`terraform plan`}),` output would predict, it
automatically opens an issue for further investigation.
At the moment it only checks the `,(0,n.jsx)(t.code,{children:`legacy`}),` root.`]}),`
`]}),`
`]}),`
`,(0,n.jsx)(t.h3,{id:`basic-terraform-cli-commands`,children:`Basic Terraform CLI Commands`}),`
`,(0,n.jsxs)(t.p,{children:[`Always pick a root with `,(0,n.jsx)(t.code,{children:`-chdir`}),`, e.g. `,(0,n.jsx)(t.code,{children:`terraform -chdir=environments/k3s plan`}),`.
Running Terraform at the repository root does nothing useful.`]}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`terraform init`})}),(0,n.jsx)(t.br,{}),`
`,`Initializes the working directory containing the Terraform configuration files.`]}),`
`,(0,n.jsx)(r,{type:`tip`,children:(0,n.jsxs)(t.p,{children:[`This has to be run as soon as you clone the repository or when you pull changes
that include new modules or providers. Locally, add
`,(0,n.jsx)(t.code,{children:`-backend-config=use_oidc=false`}),` (OIDC is only for GitHub Actions).`]})}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`terraform plan`})}),(0,n.jsx)(t.br,{}),`
`,`Generates an execution plan showing what changes will be applied to the infrastructure.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`terraform apply`})}),(0,n.jsx)(t.br,{}),`
`,`Applies the changes defined in your Terraform configuration to the cloud environment.
In practice the Terraform workflow does this for you after the `,(0,n.jsx)(t.code,{children:`production`}),` approval.`]}),`
`]}),`
`,(0,n.jsxs)(t.li,{children:[`
`,(0,n.jsxs)(t.p,{children:[(0,n.jsx)(t.strong,{children:(0,n.jsx)(t.code,{children:`terraform destroy`})}),(0,n.jsx)(t.br,{}),`
`,`Destroys the resources managed by Terraform, useful for tearing down test environments or decommissioning infrastructure.`]}),`
`,(0,n.jsxs)(r,{type:`danger`,children:[(0,n.jsxs)(t.p,{children:[`If you ever happen to be as much as tempted of using `,(0,n.jsx)(t.code,{children:`terraform destroy`}),`, you
better be `,(0,n.jsx)(t.strong,{children:`SURE AS SHIT`}),` about what you are doing. Never run it without
`,(0,n.jsx)(t.code,{children:`-chdir`}),`, and remember the K3s data disks have `,(0,n.jsx)(t.code,{children:`prevent_destroy`}),` for a reason. Make sure to review the
implications thoroughly before proceeding.`]}),(0,n.jsxs)(t.blockquote,{children:[`
`,(0,n.jsx)(t.p,{children:(0,n.jsx)(t.em,{children:`One does not simply destroy PoliNetwork with one command.`})}),`
`]})]}),`
`]}),`
`]}),`
`,(0,n.jsx)(t.p,{children:`By following these steps and leveraging our automated workflows, you ensure that
infrastructure changes are managed in a consistent, cost-aware, and controlled
manner.`}),`
`,(0,n.jsx)(t.h2,{id:`references`,children:`References`}),`
`,(0,n.jsxs)(t.ul,{children:[`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://www.terraform.io/docs/index.html`,children:`Terraform Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://docs.microsoft.com/en-us/azure/`,children:`Microsoft Azure Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://www.infracost.io/docs/`,children:`Infracost Documentation`})}),`
`,(0,n.jsx)(t.li,{children:(0,n.jsx)(t.a,{href:`https://github.com/polinetworkorg/terraform`,children:`Terraform Repository`})}),`
`]})]})}function c(e={}){let{wrapper:t}=e.components||{};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(s,{...e})}):s(e)}function l(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as _markdown,c as default,r as frontmatter,a as structuredData,o as toc};