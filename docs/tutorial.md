---
sidebar_position: 1
id: tutorial
title: Tutorial
sidebar_label: Tutorial
description: Step-by-step tutorial for using Traefik as reverse proxy with Kubernetes
keywords: [traefik, k8, proxy, permissions]
---

This tutorial provides a step-by-step introduction on how to run an application behind [Traefik Proxy](https://doc.traefik.io/traefik/ "Link to documentation of Traefik Proxy") in Kubernetes.

<!-- markdownlint-disable -->
The tutorial assumes base knowledge and understanding of:

- [Kubernetes](https://kubernetes.io/ "link to website of Kubernetes")
- [Ingress Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/ "Link to website of Ingress Controller")
- [Ingresses](https://kubernetes.io/docs/concepts/services-networking/ingress/ "Link to k8 docs about ingresses")
- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ "Link to k8 docs about deployments")
- [Traefik](https://doc.traefik.io/traefik/ "Link to Traefik documentation")
<!-- markdownlint-disable -->

Check the links below to discover more about the principles of Traefik and Kubernetes.

- [Traefik documentation](https://doc.traefik.io/traefik/ "Link to documentation of Traefik Proxy")
- [Kubernetes documentation](https://kubernetes.io/docs/home/ "Link to documentation of Traefik Proxy")
- [Helm](https://helm.sh/ "Link to website of Helm") (optional)

### Requirements

Please make sure you have the following requirements already working:

- A [Kubernetes cluster](https://kubernetes.io/ "link to website of Kubernetes")
- [`kubectl`](https://kubernetes.io/docs/reference/kubectl/ "Link to docs about kubectl")
- `curl`
- [Helm](https://helm.sh/ "Link to website of Helm") (optional)

---

## 1. Permissions And Access

Kubernetes works with [Role-based access control](https://kubernetes.io/docs/reference/access-authn-authz/rbac/ "Link to Kubernetes docs about RABA")(*RBAC*) which a method of regulating access to computer or network resources based on the roles of individual users within your organization.

An *RBAC* Role or *ClusterRole* contains rules that represent a set of permissions.

The role is then bound to an account used by an application, in this case, Traefik Proxy.

You will use the [Kubernetes API](https://kubernetes.io/docs/concepts/overview/kubernetes-api/ "Link to documentation about the Kubernetes API") for that.

### 1.1 Create A Cluster Role


Create a file called `00-role.yml` with the following content:

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
You can check the full file reference for `00-role.yml` on [GitHub](https://raw.githubusercontent.com/svx/k8-traefik/main/reference/rbac.yaml "Link to full file reference on GitHub").
<!-- markdownlint-enable -->

---

### 1.2 Configure A Service Account

In the next step you will create a dedicated [*ServiceAccount*](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/ "Link to Kubernetes docs about ServiceAccounts") for Traefik.

<!-- markdownlint-disable -->
A [*ServiceAccount*](https://kubernetes.io/docs/reference/kubernetes-api/authentication-resources/service-account-v1/#ServiceAccount "Link to ServiceAccount API docs") provides an identity for processes that run in a [Pod](https://kubernetes.io/docs/concepts/workloads/pods/ "Link to Kubernetes docs about Pods"), and maps to a *ServiceAccount* object.
<!-- markdownlint-enable -->

Create a file called `00-account.yml` with the following content:

```yaml title="00-account.yml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: traefik-account
```

---

### 1.3 Create A Cluster Role Binding

<!-- markdownlint-disable -->
After creating *ClusterRole*, you assign it to a user or group of users by creating a [*ClusterRoleBinding*](https://kubernetes.io/docs/reference/kubernetes-api/authorization-resources/cluster-role-binding-v1/#ClusterRoleBinding "Link to Kubernetes docs about role binding").
This will grant permissions to the cluster for the *ServiceAccount* you created in the previous step.
<!-- markdownlint-enable -->

In this tutorial, `subjects` (see the example below) only contains the *ServiceAccount* created in `00-account.yml`.

Create a file called `01-role-binding.yml` with the following content:

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
- `subjects` is the list of accounts reference

---

## 2. Traefik Deployment

:::note
<!-- markdownlint-disable -->
If you prefer Helm to manage Kubernetes applications, please refer to the [official Traefik documentation about it](https://doc.traefik.io/traefik/getting-started/install-traefik/#use-the-helm-chart "Link to official Traefik docs about Helm").
<!-- markdownlint-enable -->
:::

A [Ingress Controller](https://traefik.io/glossary/kubernetes-ingress-and-ingress-controller-101/#what-is-a-kubernetes-ingress-controller)
acts as a reverse proxy and load balancer to reduce complexity of Kubernetes traffic routing.
It provides a bridge between Kubernetes services and external ones.

<!-- markdownlint-disable -->
A [*Deployment*](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/ "Link to Kubernetes docs about Deployments") in Kubernetes describes how to create or modify instances of the Pods that hold a containerized application.
It can create multiple containers (Pods).
Each Pod is configured following the `spec` field in the *Deployment* configuration.
<!-- markdownlint-enable -->
To start Traefik on the Kubernetes cluster, a *Deployment* resource must exist.

The *Deployment* contains an important attribute for customizing Traefik: `args`.

These arguments are the static configuration for Traefik.

You can use `args` to enable the dashboard, configure entry points, select dynamic configuration providers, etc.

For more information, please check the [official configuration docs](https://doc.traefik.io/traefik/reference/static-configuration/cli/ "Link to official static CLI docs").

In this *Deployment*, the static configuration enables the Traefik dashboard, and uses Kubernetes native Ingress resources as router definitions to route incoming requests.

:::info

- When there is no entry point in the static configuration, Traefik creates a default one called *web* using the port `80` routing HTTP requests.
- When enabling the [`api.insecure`](https://doc.traefik.io/traefik/operations/api/#insecure "Link to Traefik docs") mode, Traefik exposes the dashboard on the port `8080`.
:::

Create a file called `02-traefik.yml` and with the following content:

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
          # highlight-start
          args:
            - --api.insecure
            - --providers.kubernetesingress
          # highlight-end
          ports:
            - name: web
              containerPort: 80
            - name: dashboard
              containerPort: 8080
```

---

### 2.1 Create A Service

<!-- markdownlint-disable -->
Given that, a *Deployment* can run multiple Traefik Proxy Pods, a [*Service*](https://kubernetes.io/docs/concepts/services-networking/service/ "Link to Kubernetes docs about services") is required to forward the traffic to any of the instances.
<!-- markdownlint-enable -->

Create a file called `02-traefik-services.yml` and insert the two *Service* resources:

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
    - port: 80 
      targetPort: web
  selector:
    app: traefik
```

:::note
It is possible to expose a *Service* in different ways!

Depending on your working environment and use case, the `spec:type` might change.

<!-- markdownlint-disable -->
It is **important** to understand the available [*ServiceTypes*](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types "Link to Kubernetes doc about ServiceTypes") before proceeding to the next step.
<!-- markdownlint-enable -->
:::

---

### 2.2 Deploy The Traefik Configuration

Use `kubectl` to apply the configuration to your cluster:

```shell
kubectl apply -f 00-role.yml \
              -f 00-account.yml \
              -f 01-role-binding.yml \
              -f 02-traefik.yml \
              -f 02-traefik-services.yml
```

---

## 3. Proxying Applications

For this tutorial, you will deploy and use the example [traefik/whoami](https://github.com/traefik/whoami "Link to example application on GitHub") application.

The application is a HTTP server running on port `80` which answers host-related information to the incoming requests.

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

---

### 3.1 Create A Service Resource

<!-- markdownlint-disable -->
In Kubernetes, a [*Service*](https://kubernetes.io/docs/concepts/services-networking/service/#service-resource "Link to Kubernetes docs about service resources") is an abstraction which defines a logical set of Pods and a policy by which to access them (sometimes this pattern is called a micro-service).
<!-- markdownlint-enable -->

Continue by creating the following *Service* resource in a file called `03-whoami-services.yml`:

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

---

### 3.2 Create An Ingress

Ingresses are, in a way, the [dynamic configuration](https://doc.traefik.io/traefik/providers/kubernetes-ingress/ "Link to official Traefik docs about Kubernetes Ingresses") for Traefik.

:::tip
Find more information on [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/),
and [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) in the official Kubernetes documentation.
:::

Create a file called `04-whoami-ingress.yml` and insert the *Ingress* resource:

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

This file configures Traefik to redirect any incoming requests starting with `/` to the `whoami:80` *Service*.

At this point, all the configurations are ready.

---

### 3.3 Deploy The Application

Use `kubectl` to apply the configuration of the application to your cluster:

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
```

```shell
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

---

## 4. Continue Reading
<!-- markdownlint-disable -->
- [Filter the ingresses](https://doc.traefik.io/traefik/providers/kubernetes-ingress/#ingressclass "Link to Traefik docs about Ingress Class") to use with [IngressClass](https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-class "Link to Kubernetes docs about Ingress Class")
- Use [IngressRoute CRD](https://doc.traefik.io/traefik/providers/kubernetes-crd/ "Kubernetes Ingress Controller")
- Protect [ingresses with TLS (Transport Layer Security)](https://doc.traefik.io/traefik/routing/providers/kubernetes-ingress/#enabling-tls-via-annotations "Ingresses with TLS")
<!-- markdownlint-enable -->

---

## 5. Recap

In this tutorial you learned the basics about how to configure, deploy and use Traefik as reverse proxy with Kubernetes.
