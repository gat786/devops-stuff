---
title: GH Actions (Multiple Jobs, using Secrets, Variables and Outputs)
created_on: 2024-06-10
description: GH Actions Variables - Understanding Multi Job actions, using Secrets, Variables and Outputs
tags: ['Github', 'Github Actions', 'Devops', 'Automation', 'CI/CD']
posterImage: /images/gh-actions/github-actions-variables.webp
authors: ['ganesht049@gmail.com']
---

![Github Actions Variables](/images/gh-actions/github-actions-variables.webp)

### GH Actions Variables - Understanding Multi Job actions, using Secrets, Variables and Outputs



We already talked about how a basic GitHub Action is structured. In this blog, 
I wanted to go over more details on how you can deal with environment variables, 
jobs that you want to run in parallel vs. synchronously, and using credentials 
that you want to keep secret and safe within a GitHub Action.

Since GitHub Actions is a CI/CD tool, most of the time you are using it to 
automate repetitive tasks that you want to happen automatically. Sometimes, the 
tasks you want to run may be simple, and you don't have to think about them 
that much—just write them step by step. But sometimes they are complicated, and
you would want them to happen in a specific order, and even fail in an order if
something goes wrong.

Let's start with thinking about an action that can do multiple things at once
that do not depend on each other in any case. You can run define jobs that do
different things at the same time, as jobs run in parallel by default it will
end up saving you time when they complete their execution.

For Example ->

<script src="https://gist.github.com/gat786/403e00d047889ed1de56135448f48b3f.js"></script>
