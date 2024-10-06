---
title: Gcloud Cloud Storage Apis are not we thought they were
created_on: 2024-10-05
description: In this blog I go over the recent findings I have had related to Gcloud Storage APIs
tags: ["blog", "GCP", "Cloud Storage", "RestAPIs", "Confusing", "Claude-Helped-me-Edit-It"]
posterImage: /images/gcp/cloustorage/buckets-buckets-buckets.webp
authors: ['ganesht049@gmail.com']
---

![Confusing Bucket Story](/images/gcp/cloustorage/buckets-buckets-buckets.webp)

### GCP Cloud Storage APIs are a bit confusing

Wow, I am posting this after a very long time, Hope I make it an interesting one.

Well if you don't know it yet I ought to tell you this before beginning this story,
I work as a DevOps Engineer and I have setup a good bunch of infrastructure for a decent
sized company and work with supporting engineers a week in every month nowadays (Earlier
it used to be all the time.)

But anyway, this story begins when on a Friday evening just before we were about to
say bye bye to work and go off for a weekend. A very cool senior of ours we will call him
Raphael (for not leaking his name out), raised a message in our support channel mentioning
that he was seeing bucket contents of a bucket which is in production folder and production
environment on the development folder and development environment project.

At first, not gonna lie, I thought Raphael like every time is just messing with us, and probably
nothing has happened, he just has a weird Browser syncing issue and thats it. I ended up
dismissing his message by telling him it shouldn't be happening. Maybe just refresh your browser. 

But before I had dismissed his message a colleague of mine had asked him out of curiosity what
is the URL at which he was seeing this issue. He shared it.

This is where the fun started. Now I cannot share the exact URLs because I would be leaking
company property but I will share what it looked like because the concept is of importance.

The URL he shared looked something like this

```
https://console.cloud.google.com/storage/browser/our-bucket-in-direct-prod/some/path/that/i/cant/share/20241004;tab=objects?pageState=(%22StorageObjectListTable%22:(%22f%22:%22%255B%255D%22,%22s%22:%5B(%22i%22:%22objectListDisplayFields%2FtimeCreated%22,%22s%22:%221%22),(%22i%22:%22displayName%22,%22s%22:%220%22)%5D))&invt=Abd3Gw&project=project-inside-dev&prefix=&forceOnObjectsSortingFiltering=true
```

And the UI that he was seeing looked something like this

![Buckets Mishap](/images/gcp/cloustorage/bucket-mishap.png)

Now this looked interesting since he had a URL to back it up.

I quickly jumped on the URL to confirm his findings and found out he was correct, I was able
to see the buckets content from inside the development folder while the bucket was all the way
in a completely different folder.

I quickly came up to the conclusion that maybe the project names don't matter to the GCP Storage APIs
as long as it has the proper bucket name and you have proper IAM permissions it will list you
the bucket contents.

Meanwhile, My colleague (Let's call him Chad) who dug into this by asking the URL also found
something interesting, while I went the browser way of investigation he went console mode and
quickly shared with me a command

```sh
gcloud storage ls --recursive gs://that-bucket-in-direct-prod --project=that-project-inside-dev
```

Mind you that we also have a VPC SC Firewall defined in our organisation that stops requests
from development folder landing into production folder yet this went through somehow.

I don't know why but this was interesting to me as I knew that I could have gotten finer details
using this method but I never thought about it. Anyway as soon as he shared me this query I knew
what I had to do, I authenticated my Gcloud CLI as well and flared this command with a verbosity
level of 8

```
gcloud storage ls --recursive gs://that-bucket-in-direct-prod --project=that-project-in-dev --verbosity debug
DEBUG: Running [gcloud.storage.ls] with arguments: [--project: "that-project-in-dev", --verbosity: "debug", -R: "True", PATH:1: "['gs://that-bucket-in-direct-prod']"]
gs://that-bucket-in-direct-prod/:
DEBUG: Starting new HTTPS connection (1): storage.googleapis.com:443
DEBUG: https://storage.googleapis.com:443 "GET /storage/v1/b/that-bucket-in-direct-prod/o?alt=json&fields=prefixes%2Citems%2Fname%2Citems%2Fsize%2Citems%2Fgeneration%2CnextPageToken&delimiter=%2F&includeFoldersAsPrefixes=True&maxResults=1000&projection=noAcl HTTP/1.1" 200 291

gs://that-bucket-in-direct-prod/somepath/:
DEBUG: Starting new HTTPS connection (1): storage.googleapis.com:443
DEBUG: https://storage.googleapis.com:443 "GET /storage/v1/b/that-bucket-in-direct-prod/o?alt=json&fields=prefixes%2Citems%2Fname%2Citems%2Fsize%2Citems%2Fgeneration%2CnextPageToken&delimiter=%2F&includeFoldersAsPrefixes=True&maxResults=1000&prefix=Collector%2F&projection=noAcl HTTP/1.1" 200 149
gs://that-bucket-in-direct-prod/Collector/collector_export.csv.zip

gs://that-bucket-in-direct-prod/someotherpath/:
DEBUG: Starting new HTTPS connection (1): storage.googleapis.com:443
DEBUG: https://storage.googleapis.com:443 "GET /storage/v1/b/that-bucket-in-direct-prod/o?alt=json&fields=prefixes%2Citems%2Fname%2Citems%2Fsize%2Citems%2Fgeneration%2CnextPageToken&delimiter=%2F&includeFoldersAsPrefixes=True&maxResults=1000&prefix=CoreRiskBridge%2F&projection=noAcl HTTP/1.1" 200 2364
```

This was really interesting. 

I found out that the APIs didn't use the project name anywhere I could just put anything here.

```
gcloud storage ls --recursive gs://that-bucket-in-direct-prod --project=some-rubbish-garbage --verbosity debug
DEBUG: Running [gcloud.storage.ls] with arguments: [--project: "some-rubbish-garbage", --verbosity: "debug", -R: "True", PATH:1: "['gs://that-bucket-in-direct-prod']"]
gs://that-bucket-in-direct-prod/:
DEBUG: Starting new HTTPS connection (1): storage.googleapis.com:443
DEBUG: https://storage.googleapis.com:443 "GET /storage/v1/b/that-bucket-in-direct-prod/o?alt=json&fields=prefixes%2Citems%2Fname%2Citems%2Fsize%2Citems%2Fgeneration%2CnextPageToken&delimiter=%2F&includeFoldersAsPrefixes=True&maxResults=1000&projection=noAcl HTTP/1.1" 200 291

gs://that-bucket-in-direct-prod/somepath/:
DEBUG: Starting new HTTPS connection (1): storage.googleapis.com:443
DEBUG: https://storage.googleapis.com:443 "GET /storage/v1/b/that-bucket-in-direct-prod/o?alt=json&fields=prefixes%2Citems%2Fname%2Citems%2Fsize%2Citems%2Fgeneration%2CnextPageToken&delimiter=%2F&includeFoldersAsPrefixes=True&maxResults=1000&prefix=Collector%2F&projection=noAcl HTTP/1.1" 200 149
gs://that-bucket-in-direct-prod/Collector/collector_export.csv.zip

gs://that-bucket-in-direct-prod/someotherpath/:
DEBUG: Starting new HTTPS connection (1): storage.googleapis.com:443
DEBUG: https://storage.googleapis.com:443 "GET /storage/v1/b/that-bucket-in-direct-prod/o?alt=json&fields=prefixes%2Citems%2Fname%2Citems%2Fsize%2Citems%2Fgeneration%2CnextPageToken&delimiter=%2F&includeFoldersAsPrefixes=True&maxResults=1000&prefix=CoreRiskBridge%2F&projection=noAcl HTTP/1.1" 200 2364
```

and it would still give me the answers I want.

I quickly went and checked the API Specs of Cloud Storage and it was very interesting for me to see this

[Objects Listing API Spec](https://cloud.google.com/storage/docs/json_api/v1/objects/list)
[Buckets Listing API Spec](https://cloud.google.com/storage/docs/json_api/v1/buckets/list)

For listing the objects the storage APIs only need the correct bucket name and if you are properly 
authenticated they should list you the objects which are inside them. For Listing buckets though,
you need a Project name. I find it interesting and probably would have never guessed it if 
this incident wouldn't have happened. 

While I was writing this document I found out that they (GCP) had writtten this in their Documentation
very clearly, I hate to say it but I think I didn't read it with enough consciousness I guess.

Here's what the documentation says -

--------------------------------------------------

> Bucket names reside in a single namespace that is shared by all Cloud Storage users. This means that:
> Every bucket name must be globally unique.

> If you try to create a bucket with a name that already belongs to an existing bucket, such as example-bucket, Cloud Storage responds with an error message.

> Bucket names are publicly visible.

> Don't use user IDs, email addresses, project names, project numbers, or any personally identifiable information (PII) in bucket names because anyone can probe for the existence of a bucket.

> Once you delete a bucket, anyone can reuse its name for a new bucket.

> The time it takes a deleted bucket's name to become available again is typically on the order of seconds; however, keep in mind the following:

> If you delete the project that contains the bucket, which effectively deletes the bucket as well, the bucket name may not be released for weeks or longer.
> If a new bucket with the same name is created in a different location and within 10 minutes of the old bucket's deletion, requests made to the new bucket during this 10 minute timeframe might fail with a 404-Bucket Not Found error.
> If your requests go through the XML API, attempts to create a bucket that reuses a name in a new location might fail with a 404-Bucket Not Found error for up to 10 minutes after the old bucket's deletion.
> You can use a bucket name in a DNS record as part of a CNAME or A redirect.

> In order to do so, your bucket name should conform to standard DNS naming conventions. This means that your bucket name should not use underscores (_) or have a period next to another period or dash. For example, .., -., and .- are invalid character combinations within DNS names.

--------------------------------------------------

[Link to the complete document](https://cloud.google.com/storage/docs/buckets#considerations)

Anyway, it is still a mystery how Raphael ended up landing in that page with that URL.
I wrote all of these things that I have written here and sent it to him as a message.
And thanks to Chad for bringing my tired Friday Evening brain to start thinking and come
up with some reasonable answer to this situation. 

My main concern was how did he get the URL in the first place, I don't think he found the
buckets listed on the dev project and it is probably a mistake in copying and pasting
the URL.

Anyways I hope you found this interesting as well as learnt something, see you next time.
