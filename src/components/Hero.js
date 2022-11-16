import React from "react";
import styles from "./Hero.module.css";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Hero() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <h1>
            Traefik Proxy and Kubernetes <br />
            </h1>
            <Link
              className={clsx(
                "button button--primary button--lg",
                styles.getStartedButton
              )}
              // to="/get-started/k8s.md"
              to={useBaseUrl("/welcome")}
            >
              Get Started
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="https://github.com/svx/k8-traefik"
            >
              <img
                className={styles.githubIcon}
                src={useBaseUrl("/img/github.svg")}
                alt="GitHub Logo"
              />{" "}
              <span className={styles.githubButtonText}>GitHub</span>
            </Link>
            <p className="padding-top--md">
              A guide about using using Traefik Proxy with Kubernetes
            </p>
          </div>
          <div className="col col--6">
            <img
              className={styles.logo}
              src={useBaseUrl("/img/hero.png")}
              alt="Gotenberg Hero Logo"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
