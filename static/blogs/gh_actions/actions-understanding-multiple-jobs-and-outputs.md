---
title: GH Actions - Multiple Jobs and Outputs
created_on: 2024-06-10
description: GH Actions Variables - Understanding Multi Job actions and Outputs
tags: ['Github', 'Github Actions', 'Devops', 'Automation', 'CI/CD']
posterImage: /images/gh-actions/github-actions-variables.webp
authors: ['ganesht049@gmail.com']
---

![Github Actions Variables](/images/gh-actions/github-actions-variables.webp)

### GH Actions Variables - Understanding Multi Job actions and Outputs

> Note ->
> 
> This repository contains all the code that I go through over in this blog 
> https://github.com/gat786/actions-repository

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

#### Workflows with multiple jobs

Let's start with thinking about an action that can do multiple things at once
that do not depend on each other in any case. You can run define jobs that do
different things at the same time, as jobs run in parallel by default it will
end up saving you time when they complete their execution.

For Example ->

<script src="https://gist.github.com/gat786/403e00d047889ed1de56135448f48b3f.js"></script>

In the above example of an action you see that we are running three jobs that 
build binaries for all the different operating systems that are used mostly i.e.
Windows, Linux and MacOs and uploads it as an Artifact. 

Since they don't depend on each other they can be ran parallely and that is
the reason why we are using three different jobs. You might also see that we
are setting environment variables on each job and also checking out (cloning)
our repository in each job, reason being that each job runs as a seperate
container and has no context of other jobs that are running along side the
workflow and needs to clone its own files and the files that are left after
the job is completed are dumped out by the runner after it is done executing.

This when you see it in the execution page of action will look something like 
this 👇

![Multiple jobs executing parallel visual](/images/gh-actions/multi-execution.png)

The point that a job does not carry forward any of the other property of any
other job unless specifically given it as an input is a feature that most
companies use to seperate execution context. You can load all the context at the
start of the execution of job and as soon as it ends and new one starts you 
will have a clean slate and all the context would be gone.

#### Multiple Jobs that depend on each other

It is also important at times that you run some jobs after a previous job has
completed. You can do that by defining dependencies by using the `needs`
keyword. Each Job can have a `needs` keyword in its definition which tells the 
runner that this particular job depends upon some other job and runner will wait
until the dependent job has completed execution to continue with its next steps.

For Example -> 

<script src="https://gist.github.com/gat786/cbf9c91fa08cf9a580d93ea56d25cdb0.js"></script>

Here in the above example you see that the final job that is the one what 
downloads all the archives from previous steps and creates a combined archive
consisting of all the files previously created. As it has the needs keyword and
it defines all the three jobs as a dependency the archive all results job is 
only ran when all the other dependent jobs have completed execution.

Visually it would look something like this on actions summary page 👇

![Multiple jobs executing parallel visual with dependencies](/images/gh-actions/multi-execution-with-deps.png)

See that visually as well you can see that the Upload Archive is shown as a 
dependent on the previous 3 steps which run as parallel. 


And just like this you can run many jobs step by step which all depend on each 
other to accomplish your necessary tasks.


Lets look at other parts that I want to go over here, In my previous blog we 
talked about environment variables I want to dig more deep into those here.
We had learnt that we can define env variables at different stages of a workflow,
For Example :-

<script src="https://gist.github.com/gat786/4b7bda47cc305e86f2a37685f2f3dbbd.js"></script>

The outputs of these commands would be 

```
$ echo "I am $NAME, I live in $PLACE and my favorite color is $COLOR"
I am Ganesh, I live in Virar and my favorite color is Orange

$ echo "You wouldn't know my favorite color: $COLOR, but you will know my name: $NAME and place: $PLACE"
You wouldn't know my favorite color: , but you will know my name: Ganesh and place: Virar
```

You can also set the variables from within one step and those will also be 
accessible throughout the entire job.
For Example :-

<script src="https://gist.github.com/gat786/a04285afc792b887d9af582f42f8fe5a.js"></script>

which will give you an output like -

```
$ echo "fav fruit - $FAVOURITE_FRUIT" # Available to read across all the jobs in the same job \
  echo "fav passtime: $FAVOURITE_PASSTIME" \
  echo "fav game: $FAVOURITE_GAME"

fav fruit - MANGO
fav passtime: READING
fav game: CRICKET
```

#### Github Outputs

Notice that as we speaking about different things, none of the things which 
are present in one job are accessible to another job, all the jobs have no 
context of their sibling jobs data or processes by default, the only way to
pass some information from a job to another job is to use something known as
Github Outputs.

For every job you can define some outputs that the job will expose and you
can use those outputs in the other job that depends upon it. Notice that it
can be only used by another job which depends on it. Lets see an example ->

<script src="https://gist.github.com/gat786/e4fac3dbdb7a88db7972852b4f34b89e.js"></script>

Outputs are string values that should be used to values which are generated
in one of the steps and those which you want to export it to some other step
to make some decision or otherwise. Outputs can be also exported across Jobs 
using something like this ->

<script src="https://gist.github.com/gat786/9266f0ba690e61692f3c80974a66c9e2.js"></script>

Notice that we used the `needs` keyword here, when you are exporting an output
to another job, it becomes necessary that the job which is requiring output is
dependent on the job that creates it.

I hope that makes it clear how multiple jobs can be executed in a manner you like
and also how you can make it share some context so that it can make it your 
life a bit easier.

Thank you for going through this, lemme know in the comments if you did learn 
something after reading this and if you found something confusing please do ping
me with your questions.
