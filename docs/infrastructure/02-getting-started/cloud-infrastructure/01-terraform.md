---
title: "Terraform"
description: "Detailed overview of our Azure-based infrastructure managed via the polinetworkorg/terraform repository."
---

## What is Terraform?

Terraform is an open-source Infrastructure as Code (IaC) tool developed by
HashiCorp. It allows you to define, provision, and manage the infrastructure
using a declarative configuration language. This means you describe the desired
state of the infrastructure, and Terraform takes care of creating and updating
the resources to match that state.

:::important
This documentation assumes you already have the Terraform CLI installed on your
local machine. If you need help setting up Terraform, please refer to the
[official documentation](https://learn.hashicorp.com/tutorials/terraform/install-cli).

You'll also need to be logged in with the Azure CLI and have the necessary
permissions to manage the resources in our Azure subscription (more on this
[here](../setup#azure-cli--kubectl)).

Once you have logged in to the Azure CLI, you need to set the necessary
environment variables by running this command at the root of the repository:

```sh
source ./access_key.sh
```

More about this in the [repository README](https://github.com/PoliNetworkOrg/terraform/?tab=readme-ov-file#notes).
:::

### Why We Use Terraform

Our organization leverages Terraform to manage our Azure cloud infrastructure for several important reasons:

- **Consistency:** Defining our infrastructure as code ensures that every environment is configured the same way, reducing the chance of human error.
- **Automation:** Terraform automates the provisioning and modification of resources, streamlining our deployment processes.
- **Version Control:** Storing Terraform configurations in version control systems allows us to track changes, collaborate effectively, and revert to previous versions if needed.
- **Modularity:** Terraform encourages breaking down the infrastructure into reusable modules, which simplifies management and enhances maintainability.

### How Terraform Works

:::warning
To run terraform commands you need to have the right permissions and credentials.
If you are not sure about your permissions, please contact the IT department (but
if you have to ask you probably shouldn't run `apply` yourself anyway).

If you haven't yet set up the Azure CLI please refer to the [setup guide](../setup#azure-cli--kubectl).
:::

Terraform operates through a simple yet powerful workflow:

1. **Write:** You define the infrastructure in configuration files (typically with a `.tf` extension).
2. **Plan:** Running `terraform plan` generates an execution plan, showing you the changes Terraform will make to achieve the desired state.
3. **Apply:** Executing `terraform apply` implements the changes, creating or updating the infrastructure accordingly.

:::danger
Running Terraform commands can modify the cloud infrastructure.

**THIS CAN INCUR COSTS OR CAUSE DOWNTIME AND PERMANENT DATA LOSS IF NOT DONE PROPERLY.**

Always review the execution plan (`terraform plan`) before applying changes.
:::

### Terraform Code vs. Terraform State vs. Azure State

- **Terraform Code:**  
  This consists of the configuration files that describe your desired
  infrastructure. These files are the blueprint for what you want the infrastructure to look like.

- **Terraform State:**  
  The state file (which we named `state.tfstate`) records the current state
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

## Terraform Implementation Overview

Welcome to the documentation for the **polinetworkorg/terraform** repository.
This page provides an in-depth look at our Terraform implementation on
**Microsoft Azure**, detailing the architecture of our infrastructure and the
key modules that make it up. While this overview highlights our main components,
it’s important to note that there are alternative approaches to similar problems,
and our setup is tailored to our current needs.

### Repository Overview

The **polinetworkorg/terraform** repository is our centralized solution for
provisioning and managing cloud infrastructure on Azure. It follows a modular
design that breaks down the overall architecture into focused components. To give
you a rough idea of what is in there, here are some of the primary modules:

- **aks:** Defines all resources related to our Azure Kubernetes Service (AKS) instance.
- **mariadb:** Manages the main MariaDB database.
- **monitoring:** Sets up our monitoring stack using Grafana and Prometheus.
- **argocd:** Configures our ArgoCD installation for GitOps-driven deployments.
- **storage:** Handles the Azure Storage Account where the Terraform state is stored.

There are also additional modules in the repository that handle specific
applications or services, but these are not detailed in this general overview.

:::info
While the choices made in this implementation reflect our specific requirements
and constraints, it's worth noting that other approaches exist for managing
cloud infrastructure with Terraform.

Our modular design, state management strategy,
and access controls are tailored to our current operational needs and funding
situation—but they are not set in stone. Please feel free to reach out to the
IT department if you have any questions or suggestions.
:::

### Infrastructure Structure

Our repository is organized to clearly separate concerns and promote reusability.
While the exact folder structure may vary, a typical layout looks like this:

```bash
📁 polinetworkorg/terraform/
 ├─ 📁 modules/             # All modules are kept in a dedicated directory
 │   ├─ 📁 aks/             # Module for Azure Kubernetes Service resources
 │   ├─ 📁 mariadb/         # Module for the main MariaDB database
 │   ├─ 📁 monitoring/      # Module for monitoring (Grafana + Prometheus)
 │   ├─ 📁 argocd/          # Module for ArgoCD installation
 │   ├─ 📁 storage/         # Module for Azure Storage Account where the state.tfstate is kept
 │   └─ [other modules]     # Additional modules for specific services
 ├── main.tf                # Main Terraform configuration file
 ├── variables.tf           # Variables definition file
 ├── outputs.tf             # Outputs definition file
 ├── README.md              # General repository documentation
 └── [other files]          
```

### State Management

We use an **Azure Storage Account** for managing the Terraform state. The state
file (`state.tfstate`) is stored within a dedicated container named `terraform-state`,
as defined in our **storage** module. The integrated leasing mechanism provided
by the Azure Storage Account is used for state locking, ensuring that concurrent
Terraform operations do not conflict with each other.

### Access and Authorization

Given the critical nature of our infrastructure, modifications (e.g., running
`terraform apply`) are restricted to personnel with sufficient clearance. As an
association, any infrastructure changes require approval from either the Head of
the IT Department or the Directive Council. All authorization is managed through
**Microsoft's Entra ID system**, ensuring that only properly authenticated and
authorized users can perform these operations.

### Funding and Nonprofit Considerations

As a nonprofit organization, we benefit from a **Microsoft Azure Grant for Nonprofits**,
which provides us with a budget of **€2000 per year**. This support helps offset
our cloud costs and underpins our commitment to maintaining a robust and scalable
infrastructure.

:::info
This is one of the core reasons we are structured as a nonprofit organization, and why
we use Azure as our cloud provider.

You can find more about our benefits [here](https://www.microsoft.com/en-us/nonprofits/azure).

If you have access to the adminorg account, you can check the current status of
our Azure grant [here](https://www.microsoftazuresponsorships.com/).
:::

## Making Changes to the Infrastructure

This section provides a basic guide on how to update our infrastructure using
Terraform and introduces some of the automated workflows that help us maintain
consistency and control.

### Basic Workflow for Infrastructure Changes

1. **Edit the Terraform Code:**  
   Modify the relevant configuration files to define your desired changes in the
   infrastructure.

2. **Review Your Changes Locally:**  
   Run `terraform plan` to generate an execution plan. This command will show
   you what changes will be made to align the actual infrastructure with your
   code.

3. **Cost Estimation with Infracost:**  
   When you open a pull request, our **Infracost workflow** is triggered
   automatically. This workflow calculates the estimated cost impact of your
   changes and posts a report in the pull request comments, so you can review
   any potential cost implications before merging.
   :::tip
   If you want to run Infracost locally, you can install it by following the
   [official documentation](https://www.infracost.io/docs/).
   :::

4. **Apply the Changes:**  
   After your changes have been reviewed and approved, merge the pull request
   and run `terraform apply` to implement the changes. This command updates the
   Azure resources to match the configuration defined in your code.

5. **Drift Detection:**  
   A nightly **Drift workflow** runs to detect any discrepancies between the
   current Terraform state and the actual state in Azure. If this workflow
   detects a drift from what the `terraform plan` output would predict, it
   automatically opens an issue for further investigation.

### Basic Terraform CLI Commands

- **`terraform init`**  
  Initializes the working directory containing the Terraform configuration files.
  :::tip
  This has to be run as soon as you clone the repository or when you pull changes
  that include new modules or providers.
  :::

- **`terraform plan`**  
  Generates an execution plan showing what changes will be applied to the infrastructure.

- **`terraform apply`**  
  Applies the changes defined in your Terraform configuration to the cloud environment.

- **`terraform destroy`**  
  Destroys the resources managed by Terraform, useful for tearing down test environments or decommissioning infrastructure.

  :::danger
  If you ever happen to be as much as tempted of using `terraform destroy`, you
  better be **SURE AS SHIT** about what you are doing. Make sure to review the
  implications thoroughly before proceeding.
  > *One does not simply destroy PoliNetwork with one command.*
  :::

By following these steps and leveraging our automated workflows, you ensure that
infrastructure changes are managed in a consistent, cost-aware, and controlled
manner.

## References

- [Terraform Documentation](https://www.terraform.io/docs/index.html)
- [Microsoft Azure Documentation](https://docs.microsoft.com/en-us/azure/)
- [Infracost Documentation](https://www.infracost.io/docs/)
- [Terraform Repository](https://github.com/polinetworkorg/terraform)
