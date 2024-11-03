---
title: Understanding GCP IAM Members, Bindings and Policies.
created_on: 2024-11-03
description: |
   This blog aims to showcase the understanding that I gained after
   playing around with GCP IAM settings using Terraform
tags: 
  - Terraform
  - Infrastructure
  - Commands
  - CLI
  - Automation
  - IAM
  - GCP
posterImage: /images/terraform/gcp-iam-member-binding-policy.webp
authors: ['ganesht049@gmail.com']
---

![GCP IAM members, bindings and policies](/images/terraform/gcp-iam-member-binding-policy.webp)

### GCP IAM Members, Bindings and Policies

I was recently working on GCP IAM policies and this change was gonna impact the
entire organisations IAM policies at a larger level. I found it really confusing 
at a level that I needed to take a step back and understand the very basics to
the core before doing any modifications to the infrastructure.

This lead me to thing, I should write a blog about it, so here it goes.

The code that I am playing around in this repository can be seen on my personal
[playground git repository](https://github.com/gat786/iam-member-policies)

Generally speaking IAM policies are use to bind Identities to certain roles 
and permissions so that they are able to act and perform their responsibilities.

For example if you are a data engineer at a company and that company had their 
infra on GCP you would be granted permissions to connect to CloudSQL instances,
move data round in the Cloud Storage buckets, connect to vms etc. All these
permissions which will be granted to you will be granted using IAM policies.

> IAM is Identity and Access Management

In order to understand IAM you would need to understand these things -

1. Roles
  
  Roles in GCP are a set or permissions which are either predefined or you can
  define it yourself and attach it to Identities to grant them the permissions
  you want to grant them. Roles have a name and all the names that are predefined
  in GCP follow a common format

  ```
  roles/APINAME.ROLENAME
  ```

  For example a role which grants permissions to grant read only access to a secret
  has a name of 

  ```
  roles/secretmanager.secretAccessor
  ```

2. Principal or the Identity

  A Principal or an Identity is anyone whom you want to grant a certain 
  permission or a role.

  A Principal can be a User, Service Account or a Group. Principals are generally
  identified by an email address that is associated with them.

3. Policy Resource.

  You can attach policlies to some resources in GCP according to which you
  can control access to things in your environment. For Example a GCP Project
  is a policy resource at which if you attach a role to an identity, it is 
  applicable to every resource that lives in that project.

4. Targetted Resource

  The Permission that you are going to give to an identity has to be over a 
  particular resource for it to be applicable, i.e. there should be an existing
  resource over which you are granting a permission to an identity. This can be
  different than the Policy Resource.

  Not all the resources that live in a GCP Project can have a policy attached 
  to them so at times you need to attach a role to an entire project because you
  cannot grant them on an individual resource itself. For example the 
  `cloudsql.instanceUser` and `cloudsql.client` roles. ([Reference 1](https://cloud.google.com/iam/docs/understanding-roles#cloudsql.instanceUser), 
  [Reference 2](https://cloud.google.com/iam/docs/understanding-roles#cloudsql.client))

5. Conditions

  As we saw in the earlier points not all resources can have a IAM Policy
  attached then how to apply a role to a resource which cannot have policy on
  its own, the answer is that you grant it on a project or a resource which is 
  on a higher hierarchy and then attach proper conditions to it so that you
  control the flow of permissions.

  For Example -

  ```
    condition {
      title      = "Constrained CloudSQL Instance User"
      expression = "resource.name==projects/PROJECT_NAME/instances/INSTANCE_NAME"
    }
  ```

  or an even better way would be 

  ```
    condition {
      title      = "Constrained CloudSQL Instance User"
      expression = "resource.name in ${jsonencode(local.sa_cloudsql_client_instances)}"
    }
  ```

6. Resource Hierarchy

  There exists a hierarchy of resources in GCP to control permissions in a 
  top to bottom manner in your GCP infrastructure. i.e. a top to bottom resource
  hierachy is something in which if you attach a role to the most significant 
  resource it gets automatically applied to any resource that is in the lesser
  significance than it.

  In order to properly control the permissions on resources which themselves 
  cannot hold a policy you need to be able to understand the best place to attach
  them and in GCP. I.e if your target resource cannot have a policy on its own 
  the best policy resource to attach the permission would be the one which is 
  just above your targetted resources in the resource hierarchy.

  For example if you attach a secretAccessor role on the project level it gets 
  applicable to all the secrets that are in it, unless there is a condition specified.

  You should read about resource hierarchy if you want to understand more 
  [here](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy).

  A simple diagram depicting resource hierarchy looks like this 

  ![GCP Resource Hierarchy](/images/gcp/gcp-resource-hierarchy.png)


While these things make up a structure that controls permissions in a GCP managed
infrastructure the actual implementation of this happens on IAM API's and created
using IAM Policies. Each resource that you want to control access to can be controlled
using IAM Policies that are either a. directly attached on it or b. attached on a
resource that are at a higher level in the GCP Resource Hierarchy.

Each Such policy looks something like this

```
> g projects get-iam-policy curious-checking-stuff --format json 
{
  "bindings": [
    {
      "members": [
        "serviceAccount:service-***PROJECT_NUM***@gcp-sa-artifactregistry.iam.gserviceaccount.com"
      ],
      "role": "roles/artifactregistry.serviceAgent"
    },
    {
      "members": [
        "serviceAccount:service-***PROJECT_NUM***@compute-system.iam.gserviceaccount.com"
      ],
      "role": "roles/compute.serviceAgent"
    },
    {
      "members": [
        "serviceAccount:***PROJECT_NUM***-compute@developer.gserviceaccount.com",
        "serviceAccount:***PROJECT_NUM***@cloudservices.gserviceaccount.com"
      ],
      "role": "roles/editor"
    },
    {
      "members": [
        "user:ganesht049@gmail.com"
      ],
      "role": "roles/owner"
    }
  ],
  "etag": "BwYmA_Ah2Ys=",
  "version": 1
}
```

In the above example you can see that we are querying a policy that is attached 
to a project resource. This policy has 3 items in it, `bindings`, `etag` and 
`version`. The bindings is the most important because it is what describes the
current permission structure for that project resource.

You will see that bindings is actually a list of objects in which each one is
called a binding. A binding is a specific object that specifies a role that is
attached to a list of principals either with condition or without conditions.

This is a type of a document which GCP maintains to know whether an Identity
has access to do something which is trying to do or not. Once you understand 
all of these things we can get into nitty gritty of actually attaching a policy 
somewhere and see the magic of how we can control access properly.

Let's start -

To begin this journey we start by creating an almost empty project so that we 
have an empty project policy so that we can clearly see how our iam changes 
affect the policy.

Terraform provider of GCP provides three different resources for you to be able
to control and modify this policy at any resource. For Example to control this
policy at project level you have

1. gcp_project_iam_policy
2. gcp_project_iam_policy_binding
3. gcp_project_iam_policy_member

[Read here more](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_project_iam)

You will find similar terraform resources for all the GCP Resources that support
attaching IAM policies, for example 
[Secret Manager](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret_iam)
[Pub Sub](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/pubsub_topic_iam)
[Service Account](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_service_account_iam)

If you use either one of these 3 tf resources you will change GCP IAM Policy 
that is associated with that specific resource. When using the project related
tf resources you will modify the policy that we saw earlier in our blog.

Lets start by playing with each of these to explain their uses.

1. gcp_project_iam_policy

  According to official docs -

  >  Authoritative. Sets the IAM policy for the project and replaces any 
  existing policy already attached.

  So if we were to create a policy like this

  ```
  data "google_iam_policy" "policy_for_project" {
    binding {
      role = "roles/owner"
      members = [
        "user:ganesht049@gmail.com"
      ]
    }
  }

  resource "google_project_iam_policy" "policy_for_project" {
    project     = var.project
    policy_data = data.google_iam_policy.policy_for_project.policy_data
  }

  ```

  It will replace the entire policy that is attached to project resource.

  We already saw the project iam policy when starting this blog. Let's try to
  apply this and see how it behaves. (I know its a risky move and will remove
  my access from the project as well i.e. I am making sure that atleast I will
  have the owner role on the project so that I can recover anything else after
  this).

  Don't do this on any production or critical project.

  After we apply this we can see that the project policy has changed to be

  ```
  > g projects get-iam-policy curious-checking-stuff --format json
  {
    "bindings": [
      {
        "members": [
          "user:ganesht049@gmail.com"
        ],
        "role": "roles/owner"
      }
    ],
    "etag": "BwYmBmsFodo=",
    "version": 1
  }
  ```

2. gcp_project_iam_policy_binding

  According to the docs -

  > Authoritative for a given role. Updates the IAM policy to grant a role to a 
  list of members. Other roles within the IAM policy for the project are 
  preserved.

  This changes a specific binding that is inside the project iam policy. Which binding
  it changes is matched by 
  

