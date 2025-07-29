---
title: How I Setup CI/CD for services running on Cloud Run
created_on: 2025-07-28
description: Cloud run being a serverless compute platform is something that people will find difficult dealing with proper CI/CD solutions. I myself was in a similar boat and wanted to create a solution myself. After reading a bunch of documents and doing some personal research I did manage to set something up myself and in this blog i wanted to go over those here.
tags:
  - GCP
  - Cloud
  - Cloud-Run
  - Serverless
  - CI/CD
  - Actions
  - Automation
posterImage: /images/gcp/cloud-run-cartoon.png
authors:
  - ganesht049@gmail.com
---
![Cloud Run Automation](/images/gcp/cloud-run-cartoon.png)

# Strategy on continously deploying to Cloud Run

I work with GCP for my company and we introduced Cloud Functions to one of our
departments since they wanted a compute option which they can trigger at fixed
schedules and which would run out of the box without having to manage any
infrastructure around it. It worked well with that department and they had no
complaints about it. The people in this department were not very tech savvy or
developers I should say, so their liking meant that it was really very easy thing
to set up and use.

Days went by and we started to see similar types of requests raised by engineers
in our teams, the teams which had full fledged engineers and they wanted to
deploy something similar. My mind went straight to Cloud Functions and I
wanted to bring it home, although we did the setup on the other department, it
was not very CI/CD like, meaning there was no build pipeline we would configure
or have different versions of the code to deploy, it was a simple zip created
using terraform and terraform would replace the entire function each time any
code change was detected.

While this worked in that department, we wanted to have the full fledged CI/CD
capabilities meaning

1. Terraform that can create service and we can use it to delete it whenever we
want to.
2. We set up a build pipeline which is different than terraform and we use it to
update the code in the service.
3. We have the benefits of creating and deleting services using terraform as well
as benefits of deploying multiple revisions using the CI/CD pipeline.
4. Using the build pipeline we can also create tags for each release so that we
know and keep a track of which image was created for which code change.

This all sounds very appealing and something that any company would love to have.

![Visual representation of a company looking at this](/images/cat-shiny-eyes.gif)
*^^Me looking at this list and wondering if I will be able to do it*

But alas GCP by itself does not provide any direct way to do this.
There is a concept of defining a service using YAML files but I doubt any dev
would want to write and manage such [YAML files](https://cloud.google.com/sdk/gcloud/reference/run/services/replace)
as well as how would we configure CI/CD for it?. Theres no ArgoCD for it.

Anyways, I started to think if I will be able to do this myself and was excited
to do so. I quickly spun up a new repository and started to write the code that
I think would solve it just to prove that it can be done. I was able to set that
up and gain confidence from my team about it and recently I was able to bring it
to production and now we have a fully working CI/CD pipeline for Cloud Run.
Although it is done now but I wanted to write this blog post to share the learnings
and the code that I wrote to achieve this.

Lets go over the steps that I took to achieve this.

## Step 1: Create a Cloud Run service using Terraform

Inorder to create a Cloud Run service using Terraform, we need to define the
service in a Terraform file. Heres a sample Terraform file that creates a
Cloud Run service:

```hcl
resource "google_cloud_run_v2_service" "default-run-deployment" {
  name     = var.app_name
  location = var.region
  project  = data.google_project.cloudrun-host.project_id

  template {
    containers {
      image = var.app_container

      dynamic "env" {
        for_each = var.env_variables
        content {
          name  = env.key
          value = env.value
        }
      }
    }
    service_account = local.run_service_account_email
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version
    ]
  }
}
```

> This is a sample terraform code and not the exact code that I used in my
> project. I have removed some of the variables and added some comments to make
> it easier to understand.

Now notice that we are using a variable `app_container` to define the container
and then we are using the `lifecycle` block to ignore changes to the `image`
field. This is important because we will be updating the image using a build
pipeline.

## Step 2: Create a build pipeline to build the container image

Heres the GH Actions workflow that I created to build the container image:

```yaml
name: Build and Deploy to Cloud Run

on:
  push:
    branches:
      - main

env:
  GCP_PROJECT_ID: "gcp-project-id"
  REGISTRY_REGION: "asia-southeast1"
  REGISTRY_PROJECT: "gcp-project-id"
  REGISTRY_NAME: docker-registry
  SERVICE_NAME: cloudrun-service
  CONTAINER_NAME: asia-southeast1-docker.pkg.dev/gcp-project-id/docker-registry/cloudrun-service

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    outputs:
      IMAGE_TAG: ${{ steps.build-image.outputs.IMAGE_TAG }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Pack CLI
        run: |
          wget https://github.com/buildpacks/pack/releases/download/v0.38.1/pack-v0.38.1-linux.tgz
          tar -xzf pack-v0.38.1-linux.tgz
          sudo mv pack /usr/local/bin/pack

      - name: Login to GCP
        uses: google-github-actions/auth@v2.1.10
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_JSON }}
          access_token_lifetime: 300s
          token_format: access_token

      - name: Configure Docker
        run: |
          gcloud auth configure-docker \
            ${{ env.REGISTRY_REGION }}-docker.pkg.dev

      - name: Build Svelte app using Pack
        id: build-image
        working-directory: acefitness-admin-ui
        run: |
          pack build --builder=gcr.io/buildpacks/builder \
            $CONTAINER_NAME:$GITHUB_SHA \
            --publish

          echo "IMAGE_TAG=$CONTAINER_NAME:$GITHUB_SHA" >> $GITHUB_OUTPUT

      - name: Check if Cloud Run service exists
        id: check-exists
        run: |
          if gcloud run services describe ${{ env.SERVICE_NAME }} --region asia-southeast1 --format=json > /dev/null 2>&1; then
            echo "Service exists"
            echo "SERVICE_EXISTS=true" >> $GITHUB_OUTPUT
          else
            echo "Service does not exist"
            echo "SERVICE_EXISTS=false" >> $GITHUB_OUTPUT
          fi

      - name: Deploy to Cloud Run
        if: steps.check-exists.outputs.SERVICE_EXISTS == 'true'
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: ${{ env.SERVICE_NAME }}
          region: asia-southeast1
          image: ${{ steps.build-image.outputs.IMAGE_TAG }}
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_JSON }}
          suffix: ${{ github.sha }}

```

Now when you create a new service terraform deploys a standard cloud run docker
image that is provided by Google themselves and then terraform is set up in such
a way that it ignores changes to the image field. This means that we are free to
patch the image field using the build pipeline that we created above and terraform
will not override it.

I have tested this extensively and it works well. In the middle I also wanted to
use revision-suffixes inorder to name each revision in such a way that it is eaier
to identify which revision is which. But I found that it is not possible to
use revision-suffixes because if you use revision-suffixes, terraform will not be
able to change fields like `env_variables` of a service afterwards. I also found
that network settings cannot be changed if you use revision-suffixes. Rest of the
things I found to be working well. I wonder what is the issue behind the select few
where it fails to work.

On my official setup for my company we setup many other features that make it more
secure and reliable. But the basics of what i wanted to share can be achieved
using the above code. Let me know if you have any questions or if you want to
ask me anything about it. I will be happy to help. Thanks for reading this.
