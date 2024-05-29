---
title: Introduction to GH Actions
created_on: 2024-05-29
description: This blogs gives a person introduction to what GH Actions are and what you can achieve by using it
tags: ['Github', 'Github Actions', 'Devops', 'Automation', 'CI/CD']
posterImage: /images/gh-actions/logo.png
authors: ['ganesht049@gmail.com']
---


![Github Actions Workflow Example](/images/gh-actions/overview-actions-simple.png)

### Github Actions - What it is and How it works.

Github Actions is an awesome thing to learn and do things with. It is the most
accessible DevOps Automation Tool since it comes prebundled with Github and 
anyone having a Github Account and a repository on it can use it makes it super
handy in my opinion and everyone should understand and try to use it whenever
they can in my opinion.

Github Actions is a service provided by Github using which you can run tasks
automatically when certain triggers are triggered in your repository.

For Example -
1. As soon as you push some code you can have a pipeline which compiles and
builds your applications.
2. As soon as you raise a PR an action can check code quality of added code.
3. An action which automatically runs after every few minutes to do something
   completely random

The final part of this list of examples is what makes me excited about it.
Although the first two are the reason why most people use it.

We can go through an example here that shows you how to build a pipeline that
can build your app and run it.

For us to do that we need to understand how you can create actions and how to
define steps that will be carried out in that action (i.e. what that action 
will do when its executed.)

#### Where to Define the Actions.

All the Actions can be described as a YAML file inside the `.github/workflows`
folder. You can learn more about how a YAML file is created [here](https://www.linode.com/docs/guides/yaml-reference/).

So if you want to create your first action you can create a file names
`.github/workflows/first-action.yaml` and voila you will have a action file
ready to define your actions.


#### Structure of a Github Action. 

Widely speaking Github Action file has 3 main parts. 

1. Action Information and Metadata.
2. Trigger Definitions.
3. Action Steps Definitions.

And it would look something like this 

<script src="https://gist.github.com/gat786/77b5fa9d41ee8445cc1d71b8b8318c04.js"> </script>
