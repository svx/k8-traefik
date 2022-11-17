---
sidebar_position: 1
id: tutorial
title: Tutorial
sidebar_label: Tutorial
description: Step-by-step tutorial for using Traefik as reverse proxy with Kubernetes
keywords: [traefik, k8, proxy, permissions]
---

This tutorial provides a step-by-step introduction about how to run an applications behind [Traefik Proxy](https://doc.traefik.io/traefik/ "Link to documentation of Traefik Proxy") as in a Kubernetes environment.

<!-- markdownlint-disable -->
You will learn about the basics required to start Traefik such as [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/ "Link to website of Ingress Controller"), [Ingresses](https://kubernetes.io/docs/concepts/services-networking/ingress/ "Link to k8 docs about ingresses"), [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ "Link to k8 docs about deployments"), static, and dynamic configuration.

## Prerequisite

The tutorial prerequisites base knowledge and understanding of Kubernetes, Ingress Controller, Ingresses, Deployments, Helm, static, and dynamic configuration and Traefik.

If you are new to these topics do not worry! 
Check the links below to discover more about the principles of Traefik and Kubernetes

- [Traefik documentation](https://doc.traefik.io/traefik/ "Link to documentation of Traefik Proxy")
- [Kubernetes documentation](https://kubernetes.io/docs/home/ "Link to documentation of Traefik Proxy")
- [Helm](https://helm.sh/ "Link to website of Helm") (optional)

---

## Create ClusterRole

To use the Kubernetes API, Traefik needs permissions.
You will use the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/ "Link to documentation about the Kubernetes API") for doing so.

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
You can checkout the [full file reference](https://raw.githubusercontent.com/svx/k8-traefik/main/reference/rbac.yaml "Link to full file reference on GitHub") for `00-role.yml` on GitHub.
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

- `roleRef` is the Kubernetes reference to the role created in `00-role.yml`
- `subjects` is the list of accounts reference."

In this tutorial, `subjects` only contains the account created in `00-account.yml`.

:::info
If you prefer to use Helm, please refer to the [official Traefik documentation about it](https://doc.traefik.io/traefik/getting-started/install-traefik/#use-the-helm-chart "Link to official Traefik docs about Helm")
:::

A [Ingress Controller](https://traefik.io/glossary/kubernetes-ingress-and-ingress-controller-101/#what-is-a-kubernetes-ingress-controller)
is a software that runs in the same way as any other application on a cluster.

To start Traefik on the Kubernetes cluster,
a [*Deployment*](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/) resource must exist to describe how to configure
and scale containers horizontally to support larger workloads.

Create a file called `02-traefik.yml` and paste the following content:

```yaml tab="02-traefik.yml"
kind: Deployment
apiVersion: apps/v1
metadata:
  name: traefik-deployment
  labels:
    app: traefik

spec:
  replicas: 1
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      serviceAccountName: traefik-account
      containers:
        - name: traefik
          image: traefik:v2.9
          args:
            - --api.insecure
            - --providers.kubernetesingress
          ports:
            - name: web
              containerPort: 80
            - name: dashboard
              containerPort: 8080
```

The *Deployment* contains an important attribute for customizing Traefik: `args`.
These arguments are the static configuration for Traefik.

From here, it is possible to enable the dashboard, configure entry points, select dynamic configuration providers, etc.

For more information, please check the [official configuration docs](https://doc.traefik.io/traefik/reference/static-configuration/cli/ "Link to official static CLI docs").

In this *Deployment*, the static configuration enables the Traefik dashboard, and uses Kubernetes native Ingress resources as router definitions to route incoming requests.

:::info

- When there is no entry point in the static configuration, Traefik creates a default one called `web` using the port `80` routing HTTP requests.
- When enabling the [`api.insecure`](https://doc.traefik.io/traefik/operations/api/#insecure "link to Traefik docs") mode, Traefik exposes the dashboard on the port `8080`.
:::

A *Deployment* manages scaling and then can create multiple containers, called [Pods](https://kubernetes.io/docs/concepts/workloads/pods/).
Each Pod is configured following the `spec` field in the *Deployment* configuration.

Given that, a *Deployment* can run multiple Traefik Proxy Pods, a piece is required to forward the traffic to any of the instance:
namely a [`Service`](https://kubernetes.io/docs/concepts/services-networking/service/ "Link to Kubernetes docs about services").

Create a file called `02-traefik-services.yml` and insert the two `Service` resources:

```yaml tab="02-traefik-services.yml"
apiVersion: v1
kind: Service
metadata:
  name: traefik-dashboard-service

spec:
  type: LoadBalancer
  ports:
    - port: 8080
      targetPort: dashboard
  selector:
    app: traefik
---
apiVersion: v1
kind: Service
metadata:
  name: traefik-web-service

spec:
  type: LoadBalancer
  ports:
    - targetPort: web
      port: 80
  selector:
    app: traefik
```

:::note
It is possible to expose a service in different ways!

Depending on your working environment and use case, the `spec.type` might change.

<!-- markdownlint-disable -->
It is **strongly** recommended to understand the available [service types](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types "Link to Kubernetes doc about service types") before proceeding to the next step.
<!-- markdownlint-enable -->
:::

## Apply Configuration

In the next step, you will use `kubectl` to apply the configuration to your cluster.

```shell
kubectl apply -f 00-role.yml \
              -f 00-account.yml \
              -f 01-role-binding.yml \
              -f 02-traefik.yml \
              -f 02-traefik-services.yml
````

## Application Proxy

The [whoami](https://github.com/traefik/whoami "Link to example application on GitHub") application is a HTTP server running on port 80 which answers host-related information to the incoming requests.

Start by creating a file called `03-whoami.yml` and paste the following content:

```yaml tab="03-whoami.yml"
kind: Deployment
apiVersion: apps/v1
metadata:
  name: whoami
  labels:
    app: whoami

spec:
  replicas: 1
  selector:
    matchLabels:
      app: whoami
  template:
    metadata:
      labels:
        app: whoami
    spec:
      containers:
        - name: whoami
          image: traefik/whoami
          ports:
            - name: web
              containerPort: 80
```

## Service

Continue by creating the following `Service` resource in a file called `03-whoami-services.yml`:

```yaml tab="03-whoami-services.yml"
apiVersion: v1
kind: Service
metadata:
  name: whoami

spec:
  ports:
    - name: web
      port: 80
      targetPort: web
      
  selector:
    app: whoami
```

Traefik is notified when an Ingress resource is created, updated, or deleted.
This makes the process dynamic.

The Ingresses are, in a way, the [dynamic configuration](https://doc.traefik.io/traefik/providers/kubernetes-ingress/ "Link to official Traefik docs about Kubernetes Ingresses") for Traefik.

:::tip
Find more information on [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/),
and [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) in the official Kubernetes documentation.
:::

Create a file called `04-whoami-ingress.yml` and insert the `Ingress` resource:

```yaml tab="04-whoami-ingress.yml"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: whoami-ingress
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: whoami
            port:
              name: web
```

This file configures Traefik to redirect any incoming requests starting with `/` to the `whoami:80` service.

At this point, all the configurations are ready!

In the last step of this part of the tutorial, you will use `kubectl` to apply the configuration to your cluster.

```shell
kubectl apply -f 03-whoami.yml \
              -f 03-whoami-services.yml \
              -f 04-whoami-ingress.yml
```

You should be able to access the `whoami` application and the Traefik dashboard.

Load the dashboard on a web browser: [`http://localhost:8080`](http://localhost:8080 "Link to localhost on port 8080 for the Traefik dashboard").
<!-- markdown-link-check-disable -->
![Traefik Dashboard](/img/webui-dashboard.png 'Traefik Dashboard')
<!-- markdown-link-check-enable -->
And now access the `whoami` application with cURL:

```shell
curl -v http://localhost/
Hostname :  6e0030e67d6a
IP :  127.0.0.1
IP :  ::1
IP :  172.17.0.27
IP :  fe80::42:acff:fe11:1b
GET / HTTP/1.1
Host: 0.0.0.0:32769
User-Agent: curl/7.35.0
Accept: */*
```

## Continue Reading
<!-- markdownlint-disable -->
- [Filter the ingresses](https://doc.traefik.io/traefik/providers/kubernetes-ingress/#ingressclass "Link to Traefik docs about Ingress Class") to use with [IngressClass](https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class "Link to Kubernetes docs about Ingress Class")
- Use [IngressRoute CRD](https://doc.traefik.io/traefik/providers/kubernetes-crd/ "Kubernetes Ingress Controller")
- Protect [ingresses with TLS (Transport Layer Security)](https://doc.traefik.io/traefik/routing/providers/kubernetes-ingress/#enabling-tls-via-annotations "Ingresses with TLS")
<!-- markdownlint-enable -->
## Recap

In this tutorial you learned the basics about how to configure, deploy and use Traefik as reverse proxy with Kubernetes.
