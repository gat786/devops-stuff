---
title: Using SSH Keys to Make Connectivity Simpler and Secure
created_on: 2026-05-03
description: |
  This blogs delves into details about how you can use SSH Keys to 
  authenticate yourself into a VM and then use the same keys to authenticate 
  to GitHub from that VM.
tags: ['Github', 'Secure Shell', 'Security', 'Encryption', 'Authentication']
posterImage: /images/ssh/secure-ssh-terminal.png
authors: ['ganesht049@gmail.com']
---

![Cartoonish representation of a person using ssh on a computer terminal emulator](/images/ssh/secure-ssh-terminal.png)

## Using SSH Keys to Make Connectivity Simpler and Secure

### Introduction and Defining the Problem Statement

If you don't know me, then heres a quick intro - I am a DevOps Engineer by
profession which means that I am tasked a lot to ssh into a system and try to
figure out what is going on in it and if it is something fishy I have to often
fix it. Along with all of this, we often have to write code that works on
different architecture and or verify that the code which is written works
same across different variations of computer oses. This makes it so that we have
to use a lot of machines throughout our day 1 of which is our own machine and
then we login to remote machiens to take control, access the situation and
then deal with it. 

I in my career had always had this one issue which I did not have a proper 
solution to in my head and always ended up taking routes which were not ideal 
to say the least the issue being - How do I write code from different machines 
ensuring the fact that I am properly authenticated as well as the code that I
commit to different repositories from different machines have my signature so 
that it passes the corp checks as well as while doing all of this I also have 
to make sure that the mechanisms I use to get through these are safe and 
non-probelmatic for me to use.

I recently found a solution for it and I dont know if it is well known within
the industry or not and for that reason I wanted to write a blog about it and
share with the people I know.

### Defining the problem a bit more

![Confused Individual](/images/ssh/confused-individual.png)

Whenever you are accessing a system that is not yours and you are expected to
code from it or on it, there are a lot of security concerns involved, from my
perspective atleast the ones which are applicable are -

1. How do you login to that VM?
2. How to authenticate with the code provider safely and securely when onto such
a VM (GitHub or GitLab for e.g.)?
3. How to confirm Identity within that VM such that you are able to
commit code with your signatures (Signing the commits that you make)?
4. How to make the secure Git Access as well as Commit Signature available
on a Remote VM?

All of these turns out can be solved a very simple Open Source Program that
we all use knowingly or unknowingly with a little bit more controlled usage
of it

### The Solution

**Using OpenSSH and its friendly tools to its full potential.**

Lets begin with doing the most important thing that is needed for all of the
upcoming things that we are going to do. 

#### Generate an SSH Private and Public Key

```
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Run the above following command and follow the steps to generate an SSH Key for
yourself, use your preferred email address in the command above, it will ask if
you want to protect the private key with a password, which you should do and also
choose a strong password for it.

Now after you have generated a Key-pair, the ssh-keygen cli generates two 
different files which contain two different contents of the same key, i.e.
private part of they and public part of the key. You can generally copy and
share the public part of your key and it is generally the way that people
will be able to recognise you when you use SSH Keys. But for the Private Keys,
you generally want to protect them as much as you can, if you are very security
concious you should consider using an HSM module like yubikey and moving the
private key onto it.

Read more about that process [here](https://developers.yubico.com/SSH/)

With all that said and done, lets begin to answer some questions -

#### Setting up access to a Linux VM using SSH Keys

Once you have an SSH Key Pair, you can use the key pair to login to any accessible
Linux host by simply making the target Linux host aware about your public key.

That is, you will log in to the target VM Host, copy the contents of your public
key file into the file called 

```
/home/YOUR_LINUX_USER/.ssh/authorized_keys
```

an example command that does this looks like this 

```
gat786@lima-test-ssh:~$ echo "ssh-ed25519 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gRhSUH+AAAAAAAAAAAAAA gat786@Mac" >> .ssh/authorized_keys
```

Once you have done this, you can simply logout of that machine and try logging 
in again by passing the private counterpart of the public key you pasted on the
linux vm for authenticating. 

```
ssh -i /Users/gat786/.ssh/my_private_key 127.0.0.1 -p 64699
```

I provided a custom public key content as well as private key name, because 
you cannot copy the command as is and you will have to use your own public 
key contentsas well as private key file name for this authentication to work.


#### How to authenticate with the code provider safely and securely when onto such a VM (GitHub or GitLab for e.g.)? 

GitHub and GitLab both support using SSH Keys as a mechanism towards
authenticating yourself to the platform, the procedure to setup SSH 
Authentication is described as below

Procedure for Github - [here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account#adding-a-new-ssh-key-to-your-account)
Procedure for GitLab - [here](https://docs.gitlab.com/user/ssh/#verify-your-ssh-connection)

When you read the docs you will realise that the procedure is very similar to how
we did it for the Linux Machine, we get the Public Key File content and provide
it to GitHub as well as GitLab so that when we try to clone a repository using
the SSH mechanism they are able to authenticate us using the Private Key file
that confirms our identity.

Once you set these up you should be able to login to these portals using
nothing but your SSH Private Keys and that would allow you to get rid of those
PAT tokens that you might have lying around on your systems.

You can test the connection to GitHub and GitLab as below

```sh
ssh -T git@github.com
```

```sh
ssh -T git@gitlab.com
```

They both will print a message that will indicate your account username as 
well as a welcome and authentication successful message.

Moving on to next - 

#### How to confirm Identity within that VM such that you are able to commit code with your signatures (Signing the commits that you make)?


Just like you added the Keys for Authentication, GitHub and GitLab also allow
you to add an SSH Key to their platform which they can use to validate your
commits. On GitLab its actually easier to just add one public key and then select
the type as `Authentication & Signing` while on GitHub you will have to add the
same public key twice, once for `Authentication` and then other time for setting
up `Signing`

Once you set those Public Keys up, you can configure the Git CLI to use SSH Key
for signing commits and push the code as you would normally do. 

For E.g. this is how you configure the CLI

```sh
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/examplekey.pub
```

then while writing the commit you can add the `-S` to indicate that you want this
commit to be signed. 

```sh
git commit -S -m "My commit msg"
```

#### How to make the secure Git Access as well as Commit Signature available on a Remote VM?

The above two steps that we defined will allow us to connect to Git Provider 
and also write secure, verifiable commits to them, the problem now is that how
do we do make all of the above niceties available on the remote VM.

The solution -> `SSH Agents`, we configure an agent locally and then when 
connecting to a remote VM we forward our local agent to that VM by using `-A` 
flag with the `SSH` command. SSH Agents are programs/daemons that run in the
background and keep a hold of your private keys so that you can use them when
needed with ease i.e. passwordless if once unlocked and also forward it to
remote machines.

> Disclaimer - SSH Agents start automatically in most modern OSes barring Windows
> You should be aware and enable it before trying below steps.

First, lets configure the agent running locally and make it aware about our 
newly created private key. You can do that as below 

```sh
ssh-add /home/YOUR_USER/.ssh/your_private_key
```

This will make it so that your agent now has a hold of your key and use it to 
process SSH authenticate requests on your behalf. You can list all the keys that
are loaded by the ssh-agent by running `ssh-add -l`. The Keys added to ssh-agent
get automatically cleared after every reboot and that is by design. 
You can remove a key added to the agent by running `ssh-add -d /home/USER/.ssh/key_file`
command.

Once the key is added to your local agent, initiate a new connection to the 
remote VM and pass the `-A` flag to the ssh connection request.

```sh
ssh -A -i /home/USERNAME/.ssh/your_private_key 127.0.0.1 -p 64699
```

and once you are on the remote vm you can run 

```sh
ssh-add -l
```

to list the SSH keys available to the agent on that remote vm and confirm that
your key pair is available here as well. Once you have the keypair available
you can configure the Git Client on remote vm as we did on our local machine
and clone repositories, commit signed commits, push changes etc with ease.

### Conclusion

I wish I knew this architecture before and because it would have solved so many
of my frustrations before and that is the reason I am writing this blog. I hope you
understood all of the information I shared and it is useful for your work. If it is
or not do write a comment and let me know, it would be very appreciated.
