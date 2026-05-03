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

If you don't know me, then here's a quick intro - I am a DevOps Engineer by
profession, which means that I am often tasked with SSHing into systems and trying to
figure out what is going on in them, and if something is fishy, I often have to
fix it. Along with all of this, we often have to write code that works on
different architectures and verify that the code that is written works the
same across different operating systems. This means that we have to use a lot
of machines throughout our day, one of which is our own machine, and then we
log in to remote machines to take control, assess the situation, and then deal
with it.

In my career, I had always had this one issue for which I did not have a proper
solution in my head and always ended up taking routes that were not ideal,
to say the least. The issue being - how do I write code from different machines
while ensuring that I am properly authenticated, and that the code I commit to
different repositories from different machines carries my signature so that it
passes the corporate checks, while also making sure that the mechanisms I use
to achieve this are safe and non-problematic for me to use?

I recently found a solution for it, and I don't know if it is well known within
the industry or not. For that reason, I wanted to write a blog about it and
share it with the people I know.

### Defining the problem a bit more

![Confused Individual](/images/ssh/confused-individual.png)

Whenever you are accessing a system that is not yours and you are expected to
code from it or on it, there are a lot of security concerns involved. From my
perspective, at least the ones that are applicable are -

1. How do you log in to that VM?
2. How do you authenticate with the code provider safely and securely on such
   a VM (GitHub or GitLab, for example)?
3. How do you confirm identity within that VM such that you are able to
   commit code with your signatures (signing the commits that you make)?
4. How do you make secure Git access as well as commit signing available
   on a remote VM?

All of these can be solved by a very simple open-source program that
we all use knowingly or unknowingly, with a little more controlled usage
of it.

### The Solution

**Using OpenSSH and its friendly tools to their full potential.**

Let's begin by doing the most important thing that is needed for all of the
upcoming things that we are going to do.

#### Generate an SSH Private and Public Key

```sh
ssh-keygen -t ed25519 -C "your_email@example.com"
````

Run the above command and follow the steps to generate an SSH key for
yourself. Use your preferred email address in the command above. It will ask if
you want to protect the private key with a password, which you should do, and
you should also choose a strong password for it.

Now, after you have generated a key pair, the `ssh-keygen` CLI generates two
different files which contain two different parts of the same key, i.e. the
private part of it and the public part of the key. You can generally copy and
share the public part of your key, and it is generally the way that people
will be able to recognise you when you use SSH keys. But for the private keys,
you generally want to protect them as much as you can. If you are very security
conscious, you should consider using an HSM module like a YubiKey and moving the
private key onto it.

Read more about that process [here](https://developers.yubico.com/SSH/)

With all that said and done, let's begin to answer some questions -

#### Setting up access to a Linux VM using SSH Keys

Once you have an SSH key pair, you can use the key pair to log in to any accessible
Linux host by simply making the target Linux host aware of your public key.

That is, you will log in to the target VM host, copy the contents of your public
key file into the file called

```sh
/home/YOUR_LINUX_USER/.ssh/authorized_keys
```

An example command that does this looks like this

```sh
gat786@lima-test-ssh:~$ echo "ssh-ed25519 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gRhSUH+AAAAAAAAAAAAAA gat786@Mac" >> .ssh/authorized_keys
```

Once you have done this, you can simply log out of that machine and try logging
in again by passing the private counterpart of the public key you pasted on the
Linux VM for authentication.

```sh
ssh -i /Users/gat786/.ssh/my_private_key 127.0.0.1 -p 64699
```

I provided custom public key content as well as a private key name, because
you cannot copy the command as is and you will have to use your own public
key contents as well as private key file name for this authentication to work.

#### How to authenticate with the code provider safely and securely when onto such a VM (GitHub or GitLab for e.g.)?

GitHub and GitLab both support using SSH keys as a mechanism for
authenticating yourself to the platform. The procedure to set up SSH
authentication is described below.

Procedure for GitHub - [here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account#adding-a-new-ssh-key-to-your-account)
Procedure for GitLab - [here](https://docs.gitlab.com/user/ssh/#verify-your-ssh-connection)

When you read the docs, you will realise that the procedure is very similar to how
we did it for the Linux machine. We get the public key file content and provide
it to GitHub as well as GitLab so that when we try to clone a repository using
the SSH mechanism, they are able to authenticate us using the private key file
that confirms our identity.

Once you set these up, you should be able to log in to these portals using
nothing but your SSH private keys, and that would allow you to get rid of those
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

Just like you added the keys for authentication, GitHub and GitLab also allow
you to add an SSH key to their platform which they can use to validate your
commits. On GitLab, it's actually easier to just add one public key and then select
the type as `Authentication & Signing`, while on GitHub you will have to add the
same public key twice, once for `Authentication` and then the other time for
setting up `Signing`.

Once you set those public keys up, you can configure the Git CLI to use an SSH key
for signing commits and push the code as you would normally do.

For example, this is how you configure the CLI

```sh
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/examplekey.pub
```

Then, while writing the commit, you can add `-S` to indicate that you want this
commit to be signed.

```sh
git commit -S -m "My commit msg"
```

#### How to make secure Git Access as well as Commit Signature available on a Remote VM?

The above two steps that we defined will allow us to connect to the Git provider
and also write secure, verifiable commits to it. The problem now is - how
do we make all of the above niceties available on the remote VM?

The solution -> `SSH Agents`, we configure an agent locally and then when
connecting to a remote VM we forward our local agent to that VM by using the `-A`
flag with the `ssh` command. SSH agents are programs/daemons that run in the
background and keep a hold of your private keys so that you can use them when
needed with ease, i.e. passwordless once unlocked, and also forward them to
remote machines.

> Disclaimer - SSH Agents start automatically in most modern OSes except Windows.
> You should be aware of that and enable it before trying the below steps.

First, let's configure the agent running locally and make it aware of our
newly created private key. You can do that as below

```sh
ssh-add /home/YOUR_USER/.ssh/your_private_key
```

This will make it so that your agent now has a hold of your key and uses it to
process SSH authentication requests on your behalf. You can list all the keys that
are loaded by the `ssh-agent` by running `ssh-add -l`. The keys added to `ssh-agent`
get automatically cleared after every reboot and that is by design.
You can remove a key added to the agent by running `ssh-add -d /home/USER/.ssh/key_file`
command.

Once the key is added to your local agent, initiate a new connection to the
remote VM and pass the `-A` flag to the SSH connection request.

```sh
ssh -A -i /home/USERNAME/.ssh/your_private_key 127.0.0.1 -p 64699
```

and once you are on the remote VM you can run

```sh
ssh-add -l
```

to list the SSH keys available to the agent on that remote VM and confirm that
your key pair is available there as well. Once you have the key pair available,
you can configure the Git client on the remote VM as we did on our local machine
and clone repositories, commit signed commits, push changes etc. with ease.

### Conclusion

I wish I knew this architecture earlier because it would have solved so many
of my frustrations before, and that is the reason I am writing this blog. I hope you
understood all of the information I shared and that it is useful for your work. If it is
or not, do write a comment and let me know, it would be very appreciated.
