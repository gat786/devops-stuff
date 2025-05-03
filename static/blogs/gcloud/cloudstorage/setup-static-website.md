---
title: How to host a static webapp on GCP using Cloud Storage
created_on: 2025-04-30
description: I want to go through terraform code that you would require to setup a static web app on GCP.
tags: ["blog", "GCP", "Cloud Storage"]
posterImage: /images/gcp/cloustorage/ghibli-browsing-static-webapp.webp
authors: ['ganesht049@gmail.com']
---

![Ghibli Static Web App](/images/gcp/cloustorage/ghibli-browsing-static-webapp.png)

> I generated the above image using ChatGPT and I found it is so cute.

## Introduction

I recently saw a request being raised at my work about setting up a Static Web
App on our Cloud Infrastructure that we have on GCP. I thought it would be a
great idea to try to set it up myself on a weekend and learn about how it can
be done and so here this goes.

Static Web Apps (SWA) were a booming concept when I was beginning my career and I dont
know if they still are, because I changed ships and I now believe building Platform
is much easier than building a website. Well anyways, A nerd is still something
which I am and I love to be nerdy with my work. SWA are as their name suggests,
a bunch of files which represent a website and they can be just put up any server
connected to internet and configured correctly to behave like a website. It does
not need the server to do anything and mostly it is a website that does all of its
work on the client side.

React is a great library/framework/toolkit (do you understand my feelings about
difficulties in the frontend world, I haven't even talked about JS yet :D) to
build such websites. If you have ever written a simple HTML file and wrote some
CSS to style it up, with some javascript to make it interactive, you have already
built a static web app (the OG way).

## Prerequisites

- A GCP account
- A GCP project
- Access on that GCP project to create resources like
  - Cloud Storage
  - Cloud CDN
  - IAM roles
  - Forwarding rules
- Terraform installed on your local machine.
- A static web app (I have written two files index.html and error.html that
I will be assuming is an actual website :D)
- A will to learn and try out new things.


## Getting our hands dirty with some Terraform

We will have to create the following resources

1. A Cloud Storage bucket

```hcl
resource "google_storage_bucket" "static_website" {
  name     = "my-first-static-website-on-gcp"
  # you should choose a region close to you (doesn't actually matter because
  # we are going to enable CDN)
  location = "asia-south1"

  lifecycle {
    prevent_destroy = true
  }

  website {
    main_page_suffix = "index.html"
    not_found_page   = "error.html"
  }
}
```

2. A Cloud Storage bucket IAM policy

```hcl
resource "google_storage_bucket_iam_member" "static_website" {
  bucket = google_storage_bucket.static_website.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
```

> Doing the above will already make your website available to the public.
You can visit it using the URL
> `http://storage.googleapis.com/<bucket_name>/index.html` and it will
load up in your browser like a normal website, although I believe you will
start facing issues like inability to load CSS and JS files because they are
on a different path, and website accepts them to be present at root.


To truly set it up like a website behind an ip address you need

3. A Compute Backend Bucket Service

```hcl
resource "google_compute_backend_bucket" "static_website" {
  name        = "static-website-backend"
  bucket_name = google_storage_bucket.static_website.name
  enable_cdn  = true
}
```

```hcl
