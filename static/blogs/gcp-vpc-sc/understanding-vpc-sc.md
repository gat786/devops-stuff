---
title: Understanding VPC Service Controls
created_on: 2024-05-05
description: In this blog we go through what VPC SC is and how it can be used to secure your GCP resources.
tags: ["blog", "GCP", "VPC SC", "security", "networking"]
posterImage: /images/vpc-sc/cartoon-protector.webp
authors: ['ganesht049@gmail.com']
---


![Body Guard protecting computers](/images/vpc-sc/cartoon-protector.webp)


### VPC Security Controls (VPC SC)

> VPC Service Perimeters function like a firewall for GCP APIs. Choose which 
> projects you wish to be part of the perimeter and which services you want to 
> be protected by it. 

The above mentioned quote is taken from GCP Console of VPC SC Homepage as is
and it pretty much sums it up.

But theres more to it that I would like to discuss in this blog.

VPC SC can help you secure your GCP APIs by creating a perimeter around 
it. You can mention which services that you want to restrict and define the 
perimeter that you want around it. 


For Example -

In any particular organisation you will have different environments.

Each environment will have their resources. i.e. 
1. Secret Manager
2. Pub/Sub
3. Cloud SQL & Storage
4. KMS

Ideally you would want the services which are in the same environment to be able to 
access GCP Services from the same environment and not from other environments.


While you can achieve this by using IAM roles and permissions, but 
IAM is more identity based control while VPC SC is more context based control 
over those same GCP APIs. Doing so will also help you stop cross environment 
API access even when IAM permissions are configured to allow it. This can help 
prevent access to GCP APIs which you do not want to be ever used across 
environments etc.

You can control flow of API Traffic and monitor Access patters by 
reading/understanding Cloud Audit Logs which VPC SC generates.

In these below images I try to showcase how access to GCP APIs in 
Organisations those who have VPC SC vs those who do not have VPC  SC would 
look like.

![VPC SC Enabled](/images/vpc-sc/no-perimeter.png)

*This image showcases how GCP API calls would look like in an*
*organisation which do not have VPC SC perimeters*

![VPC SC Disabled](/images/vpc-sc/with-perimeter.png)

*This image showcases how GCP API calls would look like in an*
*organisation which does have VPC SC perimeters*

In the above images I am trying to convey that you can use VPC SC as a method 
to protect GCP APIs from being accessed from outside the perimeter even when
they have been granted IAM permissions to access the resources so in a way
you can combine VPC SC and IAM to protect your resources on GCP being accessed 
from outside a secure perimeter which you do not want it to be accessed.

#### Parts of VPC SC.

To make all of this complex security of your resources GCP uses a bunch of 
terms which you need to understand. I try to make describe them in a simple
manner below.

1. **Service Perimeter** - This is the perimeter which you define around your 
   GCP APIs. You can define which projects you want to be part of the perimeter
   and which services you want to be protected by it.

   VPC Networks or Projects can be part of a Service Perimeter.
   
2. **Resources** - The VPC Networks and Projects which are part of the Service 
   Perimeter are called Resources. Any VMS or Nodes which are part of the
   VPC Network or Project can access the Restricted services within the perimeter.

3. **Restricted Services** - These are the GCP APIs which you want to protect
    by the Service Perimeter. These services will only be available to 
    Resources from within the perimeter. 

    i.e. Resources from within the perimeter cannot access the Restricted 
    Service that live outside the perimeter nor resources outside the 
    perimeter can access the Restricted Service that live inside the 
    perimeter.

4. **Access Levels** - These are a set of attributes that a request must meet 
    to be allowed to access a service. You can define these attributes in 
    the Access Level and then assign the Access Level to the Service Perimeter.

    i.e. You can define an Access Level which says that only these service accounts
    when requesting from outside the Perimeter can access the Restricted Service.

    or 

    You can define an Access Level which says that only these IP Addresses 
    when requesting from outside the Perimeter can access the Restricted Service.

5. **Egress & Ingress Control** - These are the rules which you can define to 
    allow the flow of traffic from within two different organisations.
   
