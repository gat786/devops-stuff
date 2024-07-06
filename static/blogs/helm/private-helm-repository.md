---
title: Setting up Private Helm repositories
created_on: 2024-07-06 
description: How to host helm charts in a private repositories easily.
tags: ['GCP', 'Terraform', 'Helm', 'Artifact Registry', 'DevOps']
posterImage: /images/helm/helm-gcp-ar-handshake.png
authors: ['ganesht049@gmail.com']
---


![Helm & GCP & Artifact Registry shaking hands](/images/helm/helm-gcp-ar-handshake.png)

### Introduction

As a Devops Engineer we have to write helm charts and work on getting them 
deployed to our clusters all the time. I have had to do that many times in a
day but a unique situation I faced recently was to create like a base helm
chart which can then be added to other charts as a dependency and the ability
to manage that base helm chart seperate from our application helm charts.

The reason for that is fairly common and I think every DevOps Engineer might have
faced it sometimes in their careers and found out some solutions to it. While the
problem looks simple to solve, the main issue I faced was how to setup a repository
like such and how to use it. We were using Google Cloud Platforms Artifact 
Registry as our storage for helm charts and I found no documentations (or maybe 
I didn't search for it hard enough) describing how to use a OCI 
(Open Container Initiative) repository to store helm charts and then use it as a 
base for other charts. Well I decided to dirty my hands and find out myself.

### Setting up a Helm Repository

Setting up a repository for helm charts is very easy on [Artifact Registry](https://cloud.google.com/artifact-registry)
You can create a registry simply using a bash script like this 

> Make sure you have Artifact Registry API enabled on the project where you are
> trying to do this.

```sh
#!/bin/bash

# Update the values to what you want them to be
REPO_NAME="custom_repo_name"
FORMAT="docker"
REGION="asia-south1"
DESCRIPTION="Docker repository to store helm charts"
PROJECT_ID="curious-reactor" 


gcloud artifacts repositories create $REPO_NAME --repository-format=$FORMAT \
  --location=$REGION --description=$DESCRIPTION \
  --project=$PROJECT_ID
```

While Helm Repositories are a bit different than docker repositories, but 
[recently helm (from helm version 3.8)](https://helm.sh/docs/topics/registries/) has started supporting use of repositories
which are based up on OCI implementation.

You can also do this using terraform like this 

```
resource "google_artifact_registry_repository" "my-repo" {
  location      = "asia-south1"
  repository_id = "custom_repo_name"
  description   = "Repository to store my helm charts"
  format        = "DOCKER"
}
```

### Using the repository

Once you have the repository setup, you will have to make sure that you have 
appropriate perms to perform operations on it. You will need either `roles/artifactregistry.reader` 
to read artifacts stored on your repository or `roles/artifactregistry.writer`
to write artifacts to your repository

Read this for more information about the different 
[predefined roles](https://cloud.google.com/artifact-registry/docs/access-control#permissions) 
GCP provides for us to use.


1. Authenticate your repository -
   
   Since the OCI (Open Container Initiative) repositories are primarily used for
   storing docker images. Authentication with them also is easier using the 
   Docker CLI. Helm supports the use of authentication that Docker uses inorder
   to use the OCI repositories. Inshort you need to authenticate your Docker CLI
   and BOOM that authentication will also work with your Helm CLI.

   Using this command you can do so.

   ```
   #!/bin/bash
   # authenticate GCloud CLI
   gcloud auth login

   # configure docker auth, if you want to authenticate for multiple regions 
   # you can use a comma seperated value like asia-south1-docker.pkg.dev,europe-west1-docker.pkg.dev
   gcloud auth configure-docker asia-south1-docker.pkg.dev
   ```

2. Use the Helm CLI to package and upload your chart.
   
   Create a chart like this

   ```
   helm create base_chart
   ```

   Modify your chart according to your liking.

   Package your chart.

   ```
   helm package base_chart/
   ```

   This will create a tar-gzipped version of your chart in your local directory.

   Upload your chart to Artifact Registry -

   ```
   CHART_NAME="base_chart"
   VERSION="0.1.0"
   REGION="asia-south1"
   PROJECT="curious-checker"
   REPOSITORY_NAME="custom_repo_name"

   helm push $CHART_NAME-$VERSION.tgz oci://$REGION-docker.pkg.dev/$PROJECT/$REPOSITORY_NAME
   ```

   This command will take the tar-gzipped version of file and upload it to 
   artifact registry and then we can use this as a dependency on our application
   chart.

3. Create an Application Chart
   
   Just like we created the base chart we can create an application chart.

   ```
   helm create app_chart
   ```

   Modify the app chart's `Chart.yaml` to include our base chart as a dependency
   for this app chart.

   ```yaml
    apiVersion: v2
    name: parent
    description: A Helm chart for Kubernetes
    type: application
    version: 0.1.0
    appVersion: "1.16.0"
    dependencies:
      - name: child
        version: "0.2.0"
        repository: "oci://asia-south1-docker.pkg.dev/curious-checker/base_chart"
   ```

   Once you have a chart mentioned as a dependency you can define the values that 
   this child chart needs under the value of its name.

   For Example if your chart name is `child` and it is defined as a dependency on 
   your application chart, all the values that you define under the key `child` 
   in your application chart `values.yaml` get used as values for the child chart.

4. Build your application chart
   
   Inorder to build your chart, you need to make sure that you have dependencies
   correctly build and downloaded, you can do that so -

   ```bash
    helm dependency update
    helm dependency build
   ```

   You can now template your app chart, build a package and then deploy it 
   wherever you want.

   ```sh
   helm template . 

   # debug 
   helm template . --debug
   ```


This is all you need to setup to have a helm repository working. I had a fun 
time while working on this and I hope you did too learn a lot after reading this.

Make sure to comment out any questions you might have. If any.

Thank you!! for reading it throughout.

Like always you can find all of the code that I have written [here](https://github.com/gat786/dependency-chart)
