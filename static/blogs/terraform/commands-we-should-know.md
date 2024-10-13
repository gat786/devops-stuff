---
title: |
   Terraform - Commands that would ease your Life (If you work with 
   Infrastructure a lot)
created_on: 2024-10-13
description: |
   This blog aims to highlight some interesting terraform commands that I 
   learnt that I think everyone should know about.
tags: ['Terraform', 'Infrastructure', 'Commands', 'CLI', 'Automation']
posterImage: /images/terraform/terraform-commands.webp
authors: ['ganesht049@gmail.com']
---


![Terraform - Commands that would ease your Life (If you work with
   Infrastructure a lot)](/images/terraform/terraform-commands.webp)

### Terraform - Commands that would ease your Life (If you work with Infrastructure a lot)

For the past few weeks I have been working with terraform a lot and dealt with
a lot of weird terraform state configurations and figured out solutions to a 
good chunk of those issues that made me learn some very interesting commands 
that I didn't previously know about. I wanted to tell you all about these 
commands so I am writing this blog. I must say that I only didn't about the 
import command most others I already but I am writing this blog anyways to
increase engagement I guess. Let's goo!

Let us begin, 

1. Terraform Console -

   This is a very interesting command I never really knew about it. I found
   out about this when a colleague of mine shared a command that utlised it. 
   We were testing out different ways with which we could write a condition 
   that would check whether a map is empty or not, and it was difficult for 
   him to say it in words and he just shared this command instead.

   ```hcl
   echo 'length({})' | terraform console
   ```

   This looked really interesting to me for multiple reasons 

   * I didn't really know about terraform console.
   * I thought length only worked on lists or sets, apparently it works on
   maps as well.

   We ended up using a condition like this 

   ```hcl
   echo 'signum(length({"key": "value"}))' | terraform console
   ```

   because length returns how many items are there in the list and it can go over
   1 as well if there exists more than 1 items. but we wanted to know if there
   exists items in the map or not, so as long as length is `> 0` it is all good
   for us, this is what `signum` does. If the number is `>0` it will always 
   return `1` if it is 0, it will return 0. If it is `< 0` it will return `-1`.
   We knew that lengths answer will always be either 0 or more than 0, which
   would give us what we want.

   What this command does is take your code as an input from stdin and execute
   it how terraform plan or terraform apply would do.

   And even if you use it within a terraform workspace it can act as a tool for
   you to play around with your local terraform state by accessing local variables,
   read created resource objects, or run some functions inline and see output like
   a REPL. 

   ![Terraform console workspace example](/images/terraform/terraform-console-local-state.png)


2. Terraform fmt

   To be honest I have used this command in the past but I don't remember using
   it always. But it is a great command indeed. You can run inside your terraform
   workspace and it will format your HCL code like `black` would do for your
   python code. Really handy when you want to quickly make sure that all of your 
   code is pretty and follows a standard. 

   You can also add the `--recursive` flag and then it would format the files in
   current folder as well as in the folders of current directory. 

   Must use.

3. Terraform state

   This command is really critical and can enable you to burn your state file down
   if you do not use it correctly so please use it with caution and only in places
   where you are a 100% sure that it would work.

   This command in itself cannot do anything because it is unusable but it has a 
   bunch of subcommands which are really useful lets go over them one by one.

   1. terraform state list

      Terraform stores all the resources that it creates and the properties with 
      which they are created in a json file and you might not ever see them if your
      organisation uses Terraform Cloud or some preconfigured backend. But with this
      command you can query that statefile and actually list how many resources your
      terraform state currently has. 

      It will list all the terraform resources addresses in which those resources are
      stored in the state json file. 

      > If you run some terraform code without backend configured you will see a 
      .tfstate file which is being referred to as the state file here.

   2. terraform state show

      Now that you have a list of resources and their addresses visible and listed 
      to you, you can query a single resource at a time and know the exact 
      properties you have defined on it and what terraform believes is on the
      actual infra. 

      The exact state of a resource is what gets compared with actual infrastructure
      on different cloud providers whenever you run a terraform plan or terraform

      apply. If terraform finds that there is a difference between what you have
      defined in state and what you have in actual world then it will use the 
      credentials it has been configured with and try to create the desired world
      scenario.


      ![Terraform state show and list](/images/terraform/terraform-state-list-show.png)

   3. terraform state pull

      The earlier command gave you state of a single resource, this will pull
      the entire state file and dump it on your console. I have really found it
      useful when I needed to understand what a module creates by default. 

      Like for example we have many complicated modules that by default do as 
      the organisation best policies suggests and as a developer if you don't
      want to think about a perfect solution you can just enter the required
      values and the module will create the resource depending upon a lot of 
      defaults that have been prechosen for the org. 

      While it makes it easier for devs to create resources it hides from the
      Infrastructure person what the code actually does, viewing the state 
      can help.

   4. terraform state push

      > WARNING - this command if used without proper thinking could cause harm
      to the infrastructure state management.

      You can also override the state which exists in your remote manually. 
      Yes you can. You can pull the state, modify it according to your liking
      and then repush it. 
      
      I have never really used it but I think it might be useful for someone.

   5. terraform state mv
      
      This is a command that can help you move state data of a resources from
      1 address in the state file to another address in the statefile.

      Actual usage of this command will look like

      ```sh
      terraform state mv 'CURR_ADDRESS' 'MOVE_TO_ADDRESS'
      ```

      I have found this command really useful in scenarios where we made some
      modifications to how a resource was created for example 

      ```hcl
      resource "aws_eip" "elastic_ip" {
         **** IP params ***
      }
      ```

      to

      ```hcl
      resource "aws_eip" "elastic_ip" {
         count = (SOME_CONDITION) ? 1 : 0
         **** SAME IP params ***
      }
      ```

      but now terraform detects this as a list of ips rather than a resource
      and it will try to destroy the earlier one and try to recreate the
      same one but put it under a list of ip resources. It sometimes becomes
      necessary to move the state rather than delete and recreate it.

   6. terraform state rm

      This command does exactly as you thought it would work. It removes the 
      configuration for a resource which terraform has in its states when you 
      want to do so.

      For example it has a syntax like

      ```sh
      terraform state rm ADDR_1
      ```

      and when you use it, it will become something like this ->

      ```sh
      terraform state rm 'aws_eip.elastic_ip'
      ```

4. Terraform import

   While this is listed here at the very bottom this is by no chance a thing you
   should ignore. It is a very important command that can help you import preexisting
   infra (infra which was created from any other method and does not exists in
   terraform state) into terraform state.

   its syntax is exactly like the `state mv` command but rather than having two
   terraform state addresses it has a unique resource id and a terraform state 
   address where you want to import that resource into.

   Make sure you create a resource definition for the resource that you want to import
   into terraform before trying to import a resource using this.

   For Example it has a syntax like this

   ```sh
   terraform import TERRAFORM_ADDRESS PROVIDER_UNIQUE_ID
   ```

   you would use it like

   ```sh
   terraform import 'google_service_account.app_service_account' \
      'projects/your-project/serviceAccounts/test-service-account@your-project.iam.gserviceaccount.com'
   ```

   and yes make sure you have a definition like this 

   ```hcl
   resource "google_service_account" "app_service_account" {
      name = "test-service-account"
      ***** OTHER PARAMS  *****
   }
   ```

   This command will do its job and then you can manage this resource like you
   have created it using terraform. 


Wow, It was good list of things and I hope you found some of these things
useful.

Let me know in the comments if you tried it or will try it and any of these
things make your job easier.

I will find something interesting again and write something down again.
Until then, byeee!

Thank you!
