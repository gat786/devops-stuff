---
title: Using GCP Service account on a VM on AWS without creating Credentials Json File
created_on: 2025-08-25
description: |
  In this blog we go through a setup that helps us Authenticate as a Service
  account of GCP on a VM that lives on AWS. It makes it so that we authenticate
  using temporary credentials generated on AWS side and generate temporary GCP
  credentials using them. All in all no need to create permanent or long living
  secrets and manage the hassle of storing them securely and risking an attack.
tags:
  - security
  - aws
  - gcp
  - iam
  - workload-identity-federation
  - oidc
  - saml
posterImage: /images/gcp/boy-aws-gcp-identity.png
authors: ['ganesht049@gmail.com']
---


![A Boy using a Computer that is Workload Identity Federated](/images/gcp/boy-aws-gcp-identity.png)

Workload Identity Federation is a technology of Google and is prevalent on GCP
using which you can configure a workload that is running on GCP or somewhere
else (if it meets some requirements), to safely use local (specific to that workload)
temporary credentials and  authenticate itself as a GCP Service Account and
use the credentials to access GCP resources.

Now how does it all work? Basically the idea is that there is something on that
workload (it maybe an Identity, a x509 certificate, a Kubernetes Service Account
complete list present [here](https://cloud.google.com/iam/docs/workload-identity-federation-with-other-clouds))
that you configure on GCP side to trust and let it assume identity of a GCP
Service Account. Google SDKs will fetch the temporary credentials that is
present on that workload that identifies and verifies that the workload is
what it claims to be, and then uses that credentials to reach out to GCP and
assume GCP Service Account identity.

![External Identity Providers that you can use with WIF](/images/gcp/external-identities-gcp.png)

Crazy tech, but they have managed to keep it very simple (atleast I think it is
simple, it might be confusing, but thats what I am trying to solve here). It
involves of a developer (DevOps Professional mostly, but you can do it too,
I trust you, just dont tell your boss about me) setting up things like

1. Workload Identity Pool

  It is basically a virtual grouping of workloads that you want to
  authenticate to GCP, it provides you with a logical seperation so that
  you can separate between different kinds of workloads that are able to
  access your infrastructure and properly setup rules and regulations in
  which these workloads should exist and follow. You can have multiple pools
  for different teams that exist on your infrastructure, or for different
  environments that you guys support, depends on how you want to use it.

2. Workload Identity Provider

  Provider is the actual resource on GCP that has the details regarding how
  and what details are used from the incoming request from the resource to
  consider it eligible to assume a GCP service account role. i.e. if we
  have a Workload Identity Pool for AWS, then the provider attached to
  it will have some mappings which will convert the provided attributes from
  AWS temporary token to something which can be used within GCPs IAM.

  For example AWS has a term called ARN -> which is something not present on
  GCP, but each ARN has things inside of it which can be considered as a thing
  that is present on GCP. Lets see this ARN for example

  ```
  arn:aws:ec2:ap-south-1:AWS_ACCOUNT_ID:instance/i-randominstanceid
  ```

  the above ARN contains information that it is of an `ec2` instance, the
  instance is in `ap-south-1` region and we also see `AWS_ACCOUNT_ID` along
  with a unique instance id of that VM. All of these things have equivalent
  things on GCP but a ARN like thing is not so prevalent.

  A provider can consists of mappings which uses these details within an ARN
  and map them into GCP specific things that then you can use to configure proper
  authorisation.

3. Setting up the Service Account.

  Once we have a pool and provider setup, once we authenticate on GCP that
  thing will be known as a principal and we can allow a particular principal
  thus authenticated to assume the identity of this Service Account.

Now once we know the basic information regarding the resources needed for
setting up WIF, setting it up for AWS is very easy since you dont actually need
to setup anything special on AWS side and everything on GCP side can be
configured that so that your AWS EC2 instance can assume a GCP SAs identity.

Lets begin, shall we??


## Creating a Workload Identity Pool

Creating a Workload Identity Pool is a few lines of code on terraform

```
resource "google_iam_workload_identity_pool" "name" {
  workload_identity_pool_id = "wif-pool-aws"
  description               = "A pool for federating identities from AWS EC2 instances."
}
```

This resource actually only needs a unique id, and everything else is actually
cofigured on the Workload Identity Pool Provider.

## Creating a Workload Identity Pool Provider

Creating a Workload Identity Pool Provider requires a little bit tricky. We need
to define which attributes that we get from AWS side workload, gets mapped to what
attribute on GCP side so that later down the line, GCPs IAM can authenticate and
according to the conditions that we define in the same provider make sure that the
caller indeed match the specification we want.

I dont know what all information AWS workloads provides to GCP when authenticating
so I am unsure what all options you can use here but the default ones that are
provided by GCP in the documentation should do the job for us for and they are

```hcl
resource "google_iam_workload_identity_pool_provider" "aws_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.name.workload_identity_pool_id
  workload_identity_pool_provider_id = "wif-pool-aws-provider"

  aws {
    account_id = "your-aws-account-id"
  }

  attribute_mapping = {
    "google.subject"             = "assertion.arn"
    "attribute.aws_account"      = "assertion.account"
    "attribute.aws_role"         = "assertion.arn.extract('assumed-role/{role}/')"
    "attribute.aws_ec2_instance" = "assertion.arn.extract('assumed-role/{role_and_session}').extract('/{session}')"
  }
}
```

We are creating an AWS provider for the account id that we provide, i.e. a workload
from a different account will not be able to use this provider, and also ->

In the above example you can see that we are mapping

* arn -> google.subject
* aws_account -> account
* aws_role -> extracting it from the arn
* aws_ec2_instance -> extracting it from the arn again

Once you have such a provider setup, when authenticating from AWS since it is our
IdP (Identity Provider) will provide the assertion part, and we map it to the
attribute part, so that when we think about GCP side we know what values coming
from AWS side map to what values on GCP.

A reference of data that AWS Secure Token Service provides with the assertion part
can be seen [here](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html#API_AssumeRole_ResponseElements).
When setting up authentication we will make sure that on AWS we have a Role
created for our VM and attached to it, and then on GCP side we make sure that
the VM that is on AWS and trying to access our GCP resources is truly attached with
that role on AWS side, thereby authenticating it with AWS provided
credentials on GCP.


3. Setting up Workload Identity User role on the Service Account

Inorder for the instance on AWS to assume a identity on GCP its necessary that
we have some identity already present on GCP that allows Principals from AWS to
act as it. We do it in this step. For example inorder to create an service account
and allow the pricipals from a particular AWS role to assume it as a user we do
the below things.

```hcl
resource "google_service_account" "account_for_aws" {
  account_id = "wif-account-for-aws"
}

# GCP Project number - 0123456789 make sure to replace it with your own project
# number, you can find your project number using the command `gcloud projects list`

resource "google_service_account_iam_binding" "wif_association" {
  service_account_id = google_service_account.account_for_aws.id
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "principalSet://iam.googleapis.com/projects/0123456789/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.name.workload_identity_pool_id}/attribute.aws_role/${local.aws_role_name}"
  ]
}
```

There it is, once you have this type of a setup, you can create multiple service
accounts and allow principals from AWS to assume them as users.

Each principle you can consider from the above example is any identity that is coming
from AWS side, which has a specific role that we mention inside the `members` field of
Service Account IAM Binding resource.

Different serviceaccounts can be configured to allow different principals i.e. VMS
with a specific role will be only allowed to assume a service account on GCP for which
the principleset is already configured.

Amazing, now how do we actually use this setup?

Very simple, inorder to properly utilise this setup we need

1. A config file generated from GCP that tells the Google SDKs how to
authenticate with GCP using the workload identity federation. You can generate
it like below:

```
gcloud iam workload-identity-pools create-cred-config \
    projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID \
    --service-account=$SERVICE_ACCOUNT_EMAIL \
    --aws \
    --enable-imdsv2 \
    --output-file=$FILEPATH.json
```

When you generate this, you will see that this config file will look like this

```json
{
  "universe_domain": "googleapis.com",
  "type": "external_account",
  "audience": "//iam.googleapis.com/projects/MY_AWS_ACC_ID/locations/global/workloadIdentityPools/MY_POOL/providers/MY_PROVIDER",
  "subject_token_type": "urn:ietf:params:aws:token-type:aws4_request",
  "token_url": "https://sts.googleapis.com/v1/token",
  "credential_source": {
    "environment_id": "aws1",
    "region_url": "http://169.254.169.254/latest/meta-data/placement/availability-zone",
    "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials",
    "regional_cred_verification_url": "https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15",
    "imdsv2_session_token_url": "http://169.254.169.254/latest/api/token"
  },
  "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/my-gcp-svc-account@my-gcp-project.iam.gserviceaccount.com:generateAccessToken"
}
```

If you notice this file does not contain any sensitive information, you can safely
share it with your team members, put it inside your codebase and let loose.

What this file contains is, information regarding which Workload Identity Pool the
sdks should use, which provider to use (remember we provided aws account id in it),
which GCP service account to impersonate (this on GCP side will verify the identity
of the AWS account), and URLs from which the SDKs can fetch the VM/instance specific
temporary credentials from AWS, these credentials are then passed on to GCP to
impersonate the GCP service account.

You want to download this file and make sure that this file
is present on the workload which you are trying to authenticate. Once it is
there, make sure that the path at which this file is present is added as an environment variable.

like

export GOOGLE_APPLICATION_CREDENTIALS=/path/to/file.json

Once this is setup, you can get started with using any GCP SDK specific code
and execute it and it will authenticate with GCP automatically.

For example, if you have a `main.py` file:

```py
from google.cloud import storage
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

BUCKET_NAME = "your-bucket-identifier"

def main(event, context):
    print(f"reading list of files from gcs buckets {BUCKET_NAME}")

    gcs_client = storage.Client()

    bucket= gcs_client.get_bucket(BUCKET_NAME)

    for bucket_object in bucket.list_blobs():
        print(bucket_object)

if __name__ == '__main__':
    main(None, None)
```

You just need to make sure that `google-cloud-storage` is installed. You can
just run `python main.py`, and it will automatically do its job.


If you want to
specifically use the gcloud cli, then an extra command would be needed i.e.

```sh
$ gcloud auth login --cred-file=/path/to/config.json
```

Once you run this command successfully, it will print out a message like below:

```
> You are already authenticated with 'your-svc-account-email'.
Do you wish to proceed and overwrite existing credentials?

Do you want to continue (Y/n)?


Authenticated with external account credentials for: [your-svc-account-email].
Your current project is [your-project-id].  You can change this setting by running:
  $ gcloud config set project PROJECT_ID
```

And you will be able to use the gcloud cli commands to interact with GCP resources as well.

Woohoo! We did it! We successfully configured Workload Identity Federation with AWS.
