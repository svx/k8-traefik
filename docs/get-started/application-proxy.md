---
sidebar_position: 3
id: application-proxy
title: Application Proxy
sidebar_label: 3. Application Proxy
description: Example of Traefik as reverse proxy in Kubernetes
keywords: [traefik, k8, proxy, permissions]
---

In the third and last part, you will deploy a application to your Kubernetes cluster.
This application will use Traefik as reverse proxy on Kubernetes.

You will use the example application [traefik/whoami](https://github.com/traefik/whoami "Link to example application on GitHub"),
the principles are applicable to any other application.

---

## Deployment

The `whoami` application is a basic HTTP server running on port 80 which answers host-related information to the incoming requests.

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
Find more information on [ingress controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/),
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
- Use [IngressRoute CRD](https://doc.traefik.io/traefik/providers/kubernetes-crd/ "Kubernetes Ingress controller")
- Protect [ingresses with TLS (Transport Layer Security)](https://doc.traefik.io/traefik/routing/providers/kubernetes-ingress/#enabling-tls-via-annotations "Ingresses with TLS")
<!-- markdownlint-enable -->
## Recap

In the third and last part of the tutorial you created a `Deployment`, a `Service` and a `Ingress` for an example application
and deployed the application to your Kubernetes cluster.

Once the deployment was done, you were able to verify in the Traefik dashboard that the application is running and you tested the application with cURL.
