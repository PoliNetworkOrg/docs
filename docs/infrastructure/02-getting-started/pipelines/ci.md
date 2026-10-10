---
sidebar_position: 1
title: CI
---

## Continuous Integration

The first step of our CI processes is the GitHub Actions workflow in each repository. For example, the [web](https://github.com/PoliNetworkOrg/web/tree/main/.github/workflows) repository has:

- `test.yml`, which typechecks and lints pushes to `main` and pull requests;
- `docker.yml`, which on every push to `main` builds the Docker image for `amd64` and `arm64` and publishes it to GHCR as `ghcr.io/polinetworkorg/web:latest`.

Our K3s node is ARM64, so the `arm64` build is required. Keep publishing a
multi-arch `latest` manifest when you set up a new repository.

The [polinetwork-cd](https://github.com/polinetworkorg/polinetwork-cd) repository has its own CI too: the **Ansible** workflow lints the playbooks and builds every Flux path with `kustomize` on each pull request. See [K3s Node](../cloud-infrastructure/02-k3s-node.md#ci).
