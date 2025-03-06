---
title: "Terraform"
description: "Detailed overview of our Azure-based infrastructure managed via the polinetworkorg/terraform repository."
---

## What is Terraform?

Terraform is an open-source Infrastructure as Code (IaC) tool developed by
HashiCorp. It allows you to define, provision, and manage your infrastructure
using a declarative configuration language. This means you describe the desired
state of your infrastructure, and Terraform takes care of creating and updating
the resources to match that state.

### Why We Use Terraform

Our organization leverages Terraform to manage our Azure cloud infrastructure for several important reasons:

- **Consistency:** Defining our infrastructure as code ensures that every environment is configured the same way, reducing the chance of human error.
- **Automation:** Terraform automates the provisioning and modification of resources, streamlining our deployment processes.
- **Version Control:** Storing Terraform configurations in version control systems allows us to track changes, collaborate effectively, and revert to previous versions if needed.
- **Modularity:** Terraform encourages breaking down the infrastructure into reusable modules, which simplifies management and enhances maintainability.

### How Terraform Works

Terraform operates through a simple yet powerful workflow:

1. **Write:** You define your infrastructure in configuration files (typically with a `.tf` extension).
2. **Plan:** Running `terraform plan` generates an execution plan, showing you the changes Terraform will make to achieve the desired state.
3. **Apply:** Executing `terraform apply` implements the changes, creating or updating your infrastructure accordingly.

### Terraform Code vs. Terraform State vs. Azure State

- **Terraform Code:**  
  This consists of the configuration files that describe your desired
  infrastructure. These files are the blueprint for what you want your infrastructure to look like.

- **Terraform State:**  
  The state file (commonly named `terraform.tfstate`) records the current state
  of the infrastructure as managed by Terraform. This file is critical because
  it maps your configuration to the real-world resources, tracks dependencies,
  and allows Terraform to detect what needs to change during updates. Our state
  file is stored remotely (in an Azure Storage Account) and is locked using
  Azure's integrated leasing mechanism to prevent concurrent modifications.

- **Azure State:**  
  This is the actual state of resources deployed in your Azure environment.
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
design that breaks down the overall architecture into focused components. Some
of the primary modules include:

- **aks:** Defines all resources related to our Azure Kubernetes Service (AKS) instance.
- **mariadb:** Manages the main MariaDB database.
- **monitoring:** Sets up our monitoring stack using Grafana and Prometheus.
- **argocd:** Configures our ArgoCD installation for GitOps-driven deployments.

There are also additional modules in the repository that handle specific
applications or services, but these are not detailed in this general overview.

### Infrastructure Structure

Our repository is organized to clearly separate concerns and promote reusability.
While the exact folder structure may vary, a typical layout looks like this:

```bash
polinetworkorg/terraform/
├── modules/
│   ├── aks/             # Module for Azure Kubernetes Service resources
│   ├── mariadb/         # Module for the main MariaDB database
│   ├── monitoring/      # Module for monitoring (Grafana + Prometheus)
│   ├── argocd/          # Module for ArgoCD installation
│   └── [other modules]  # Additional modules for specific services
├── storage/             # Module for Azure Storage Account for state management
│   └── state.tfstate    # Terraform state file container (in a 'terraform-state' container)
├── environments/        # Environment-specific configurations (e.g., dev, prod)
├── main.tf              # Main Terraform configuration file
├── variables.tf         # Variables definition file
├── outputs.tf           # Outputs definition file
└── README.md            # General repository documentation
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

### Acknowledgements and Alternative Approaches

While the choices made in this implementation reflect our specific requirements
and constraints, it's worth noting that other approaches exist for managing
cloud infrastructure with Terraform. Our modular design, state management strategy,
and access controls are tailored to our current operational needs and funding
situation—but they are not set in stone. We continuously review and update our
practices as our needs evolve.

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

- **`terraform plan`**  
  Generates an execution plan showing what changes will be applied to your infrastructure.

- **`terraform apply`**  
  Applies the changes defined in your Terraform configuration to your cloud environment.

- **`terraform destroy`**  
  Destroys the resources managed by Terraform, useful for tearing down test environments or decommissioning infrastructure.

By following these steps and leveraging our automated workflows, you ensure that
infrastructure changes are managed in a consistent, cost-aware, and controlled
manner.
