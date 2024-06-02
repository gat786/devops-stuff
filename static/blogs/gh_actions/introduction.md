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

<script src="https://gist.github.com/gat786/77b5fa9d41ee8445cc1d71b8b8318c04.js?theme=dark"> </script>

Notice that in the above embed we have 3 sections which I have marked using 
`# comments` i.e. metadata, trigger and jobs section.

Lets go over these 1 by 1.

1. Metadata -
   
   Metadata section actually contains the content that is usually used to 
   describe the Github Action. You can have a `name` and then a `run-name`
   the main difference between them is `name` is shown in the list when you
   click on Actions tab in a repository and `run-name` can be used to specify
   names for a particular execution instance as it can include event-specific
   information in it. 

   For Example -

   Name - `Build Action`

   Run Name - `Build Action #34`


2. Triggers -
   
   Triggers section is used to define when do you want for this Action to
   be executed. Triggers can be of a lot of different types like 

   * Push (tags, branches)
   * Pull Request (updates)
   * Manual Dispatch
   * Workflow Call

3. Jobs -
   
   Jobs are the actual series of actions that get executed when this action
   is triggered. These are list of Jobs which individually have list of steps
   in them which get executed when the action is executed.


There are other sections in a Github Actions File that you can create but
these 3 are the most important ones. I will talk about other fields in my 
upcoming blogs. But Lets now see at Jobs in a little bit more detail.

Jobs item in a action is a collection of Job item which in turn is a list of
steps. All the jobs defined in a action run parallelly by default but if you
want you can run then sequentially by defining dependency of a job on another
by using the `needs` field inside a job definition. Each Job runs on a runner
which can be specified using `runs-on` field of the job definition.

Each job as previously mentioned is a list of steps and the steps are executed
sequentially as they are defined inside a job. Each step can be a predefined
action or a script that you have defined either in the workflow itself or 
somewhere in your codebase. For Example if you look at the gist we have 
embedded up a few lines above you will that the very first step is `Checkout`
which is actually an action which is defined in the repository 
<a href="https://github.com/actions/checkout" target="_blank">actions/checkout</a>
