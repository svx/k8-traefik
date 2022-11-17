---
sidebar_position: 2
id: deployment
title: Deployment
sidebar_label: 2. Deployment
description: Deployment and Exposition
keywords: [traefik, k8, proxy, deployment]
---

In the second part of the tutorial you will deploy Traefik and the needed permissions (first part of the tutorial) to your Kubernetes cluster.

This will deploy the Traefik dashboard, and you will use Kubernetes native Ingress resources as router definitions to route incoming requests.

---

:::info
If you prefer to use Helm, please refer to the [official Traefik documentation about it](https://doc.traefik.io/traefik/getting-started/install-traefik/#use-the-helm-chart "Link to official Traefik docs about Helm")
:::

A [ingress controller](https://traefik.io/glossary/kubernetes-ingress-and-ingress-controller-101/#what-is-a-kubernetes-ingress-controller)
is a software that runs in the same way as any other application on a cluster.

To start Traefik on the Kubernetes cluster,
a [`Deployment`](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/deployment-v1/) resource must exist to describe how to configure
and scale containers horizontally to support larger workloads.

Create a file called `02-traefik.yml` and paste the following `Deployment` content:

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

The deployment contains an important attribute for customizing Traefik: `args`.
These arguments are the static configuration for Traefik.

From here, it is possible to enable the dashboard, configure entry points, select dynamic configuration providers, etc.

For more information, please check the [official configuration docs](https://doc.traefik.io/traefik/reference/static-configuration/cli/ "Link to official static CLI docs").

In this deployment, the static configuration enables the Traefik dashboard, and uses Kubernetes native Ingress resources as router definitions to route incoming requests.

:::info

- When there is no entry point in the static configuration, Traefik creates a default one called `web` using the port `80` routing HTTP requests.
- When enabling the [`api.insecure`](https://doc.traefik.io/traefik/operations/api/#insecure "link to Traefik docs") mode, Traefik exposes the dashboard on the port `8080`."
:::

## Service

A deployment manages scaling and then can create lots of containers, called [Pods](https://kubernetes.io/docs/concepts/workloads/pods/).
Each Pod is configured following the `spec` field in the deployment.

Given that, a Deployment can run multiple Traefik Proxy Pods, a piece is required to forward the traffic to any of the instance:
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

In the last step of this part of the tutorial, you will use `kubectl` to apply the configuration to your cluster.

```shell
kubectl apply -f 00-role.yml \
              -f 00-account.yml \
              -f 01-role-binding.yml \
              -f 02-traefik.yml \
              -f 02-traefik-services.yml
````

## Recap

In this part of the tutorial you created a ingress deployment file (`02-traefik.yml`) for Traefik, created a service resource (`02-traefik-services.yml`) and applied
all resource files to your Kubernetes cluster.

Continue with the third part to learn about how to use your deployed Traefik with an application.
