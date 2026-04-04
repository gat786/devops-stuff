---
title: Using Pack CLI to build container images for Cloud Run Functions on Github Actions
created_on: 2026-04-04
description: In this blog, I go through the procedure of how you can build Docker images for Cloud Run Functions exactly the way Google does it on Cloud Build, but in your own CI/CD environment, i.e., GitHub Actions.
tags: ['Github', 'Github Actions', 'Devops', 'Automation', 'CI/CD', 'Cloud Build', 'Cloud Run Functions']
posterImage: /images/gh-actions/gh-actions-pack-cli-cloud-run-functions.png
authors: ['ganesht049@gmail.com']
---

![Cartoonish Portrayal of Actions using Pack CLI to build docker image](/images/gh-actions/gh-actions-pack-cli-cloud-run-functions.png)

## Introduction

When deploying pieces of code/scripts to Cloud Run Functions, you often want the
procedure to be as seamless as possible. You want things to be easy, visible to
developers, and also fulfill your company's security policies, which are set up
for deploying things in various environments. When doing it the way GCP recommends,
i.e., using `gcloud run deploy`, you lose a lot of that capability. The gcloud
CLI now takes over the code, sends it to a CI/CD procedure on Cloud Build (which
you don't get to write/control), and then a magical new version of that service
becomes visible on Google Cloud. You also lose the ability to sign & attest images
because you no longer control the CI/CD behavior.

> How do we tackle this issue? What's the possible solution?

> Enter Buildpacks Pack CLI. ✨

[Buildpacks CLI](https://buildpacks.io) is actually the tool that GCP uses within
Cloud Build to build container images when you deploy them to Cloud Run Functions
or Cloud Functions. (I'm not sure if Google built it themselves or not.) They also
provide documentation on how to use the Pack CLI yourself:

https://docs.cloud.google.com/docs/buildpacks/build-function

I took inspiration from this and decided to implement it using GitHub Actions.

## Example Functions

I wrote a few example functions (the Java one was copied from Google's examples
repository) to demonstrate that Buildpacks can build function images for all of
them without requiring any changes on either the CI/CD side or the developer side.
It all just works.

https://github.com/gat786/buildpack-examples

## Flow of GH Action building the Images

The main steps that build the Docker images are as follows:

```yaml
steps:
  - name: Install Pack Cli
    shell: bash
    run: |
      sudo add-apt-repository ppa:cncf-buildpacks/pack-cli
      sudo apt-get update
      sudo apt-get install pack-cli

  - name: checkout
    uses: actions/checkout@v6

  - name: build
    shell: bash
    working-directory: ${{ matrix.languages }}
    run: |
      pack build --builder gcr.io/buildpacks/builder ${{ matrix.languages }}-function
````

Check the entire GitHub Actions workflow [here](https://github.com/gat786/buildpack-examples/blob/main/.github/workflows/buildpacks.yaml).

Basically, we install the Pack CLI using the official PPA repositories and invoke
the build command with the `--builder` flag, which specifies the Google-specific
builder. Notice that I am using `{{ matrix.languages }}` because I have three
different examples of functions in three different languages, and I am using the
GitHub Actions strategy matrix to build all of them at the same time.

The images built are available here:

* `ghcr.io/gat786/buildpack-samples-nodejs-function:latest`
* `ghcr.io/gat786/buildpack-samples-python-function:latest`
* `ghcr.io/gat786/buildpack-samples-java-function:latest`

You can run them on your machine using the command:

`docker run -p 8080:8080 ghcr.io/gat786/buildpack-samples-java-function:latest`

This will start the container on your local machine, after which you can invoke:

```bash
curl localhost:8080
```

which will execute the serverless function.

## Extensibility benefits

Now, when you automate or control the process in which the Docker image is built,
you can control many things that would be difficult when using the `gcloud run deploy`
command. For example (from my experience):

1. You can perform Binary Authorization (binauthz) attestations directly in 
your CI/CD pipelines to validate the images.
2. You can swap the base image that Pack CLI uses by default with a custom one
built internally by your company, allowing you to bake in required dependencies.
For example, our company once required a specific version of an ODBC driver to
be present in the base image.

## My personal usage experience

I deployed this solution on infrastructure that supported about 4–5 engineers
actively building and maintaining around 50 Cloud Functions in production.
The entire process was smooth and transparent to them, and they never raised
any issues regarding the procedure.
