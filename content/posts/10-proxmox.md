+++
title = '"Homelab" with Proxmox'
date = 2026-03-16T23:31:07-03:00
draft = false
+++

Some days ago I remembered that I had written a Discord bot using [Netcord](https://netcord.dev/) and [Lavalink4NET](https://lavalink4net.com/), probably because [Groovy](https://groovy.bot/) was forced to shut down for legal reasons and, quite frankly, most Discord bots sucked. Anyway, having this and not liking the pricing for a VPS, I got an excuse to get an old laptop so I could install [Proxmox](https://www.proxmox.com/en/), something that I had wanted to do for some time but never really got into.

This way I can have something running 24/7 costing almost nothing.

But first things first, I needed to rewrite a big part of the code since the libraries I used had changed quite a bit. I also containerized the application using the official Lavalink Docker image and got everything working using docker-compose. And since we were at it, I also updated everything to dotnet 10 (yay). No really big deal — AI is great at this type of thing. Unfortunately, the libs are not very well known, so the AI wasn't really helping with that, but after I fixed everything it was smooth sailing.

With Proxmox running, I tried to make it work using WiFi and it was a mess. I haven't done network configuration on Linux by hand for a long time and I messed everything up so badly that I literally scrapped the idea and just got a cable — much simpler and easier, and at the end of the day more stable, since I can more easily set a fixed IP and configure a DNS to proxmox.local or something instead of typing the IP address.

Then with everything set up, I saw the magic. I was able to spin up a CT (container) in Proxmox and set it up with a GitHub Actions runner and Docker. This, paired with my CI/CD in the repository, means that I can open a PR, merge, and everything will be deployed automatically! Just perfect — now I can iterate on the Discord bot and test super easily since Docker is using multi-stage builds and the CI/CD takes so little time that I don't really mind.