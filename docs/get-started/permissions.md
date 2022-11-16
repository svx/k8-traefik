---
sidebar_position: 1
id: permissions
title: Permissions
sidebar_label: 1. Permissions
description: Permissions and access
keywords: [traefik, k8, proxy, permissions]
---

In the first part of the tutorial you will configure Kubernetes permissions to grant access to Traefik.

This is done via the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/ "Link to documentation about the Kubernetes API").

---

## Create ClusterRole

To use the Kubernetes API, Traefik needs permissions.
This [permission mechanism](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) is based on roles defined by the cluster administrator.
The role is then bound to an account used by an application, in this case, Traefik Proxy.

The first step is to create a [`ClusterRole`](https://kubernetes.io/docs/reference/kubernetes-api/authorization-resources/cluster-role-v1/#ClusterRole).
This role specifies available resources, permissions and actions for the role.

Create a file called `00-role.yml`, with the following content:

```yaml title="00-role.yml"
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: traefik-role

rules:
  - apiGroups:
      - ""
    resources:
      - services
      - endpoints
      - secrets
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
      - networking.k8s.io
    resources:
      - ingresses
      - ingressclasses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - extensions
      - networking.k8s.io
    resources:
      - ingresses/status
    verbs:
      - update
```

<!-- markdownlint-disable -->
You can checkout the full file reference for `00-role.yml` in the [official Traefik documentation](https://doc.traefik.io/traefik/reference/dynamic-configuration/kubernetes-crd/#rbac "Link to reference in the official Traefik docs")
<!-- markdownlint-enable -->

## Configure Service Account

In the next step you will create a dedicated [service account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/ "Link to Kubernetes docs about service accounts") for Traefik.

Create a file called `00-account.yml`, with the following [`ServiceAccount`](https://kubernetes.io/docs/reference/kubernetes-api/authentication-resources/service-account-v1/#ServiceAccount "Link to ServiceAccount API docs") content:

```yaml title="00-account.yml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: traefik-account
```

## ClusterRoleBinding

<!-- markdownlint-disable -->
Now, bind the role on the account to apply the permissions and rules on the latter, this is done with a [`ClusterRoleBinding`](https://kubernetes.io/docs/reference/kubernetes-api/authorization-resources/cluster-role-binding-v1/#ClusterRoleBinding "Link to Kubernetes docs about role binding").
<!-- markdownlint-enable -->

Create a file called `01-role-binding.yml`, with the following content:

```yaml title="01-role-binding.yml"
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: traefik-role-binding
# highlight-start
roleRef:
# highlight-end
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: traefik-role
# highlight-start
subjects:
# highlight-end
  - kind: ServiceAccount
    name: traefik-account
    namespace: default # Using "default" because we did not specify a namespace when creating the ClusterAccount.
```

:::info

- `roleRef` is the Kubernetes reference to the role created in `00-role.yml`
- `subjects` is the list of accounts reference."

In this guide, `subjects` only contains the account created in `00-account.yml`.
:::

## Recap

In this part of the tutorial you created a ClusterRole, a ServiceAccount and a ClusterRoleBinding.

These are the first steps needed for Traefik.

Continue with the next part of the tutorial to learn how to deploy these files.
