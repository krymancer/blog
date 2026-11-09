---
title: 'Why turn something that could be a spreadsheet into a vibecoded app?'
date: 2026-11-09T12:00:00-03:00
draft: false
---

I was always on team "this software could just be a spreadsheet, this is really just complicating things". I still pretty much think that most of the things I've seen, and the problems they solve, could just be a spreadsheet, but something changed. What changed was the complicated part: the development and maintenance of those systems. Nowadays, with AI and vibecoding, we don't really have those limitations anymore, and that opened my mind to some experiments. I want to tell you why I think it's a great thing to have an app instead of a spreadsheet for (almost) everything.

## The spreadsheet

It's literally the smartest thing we have done in computing: data, code and visualization, hot reload, instant changes and results. It can be as complicated as it needs to be, and as simple as well. That was literally why, for so long, I didn't understand finance apps, trackers, to-do lists; anything that could remotely be put in a table was a spreadsheet in my mind.

It's still a pretty great way to do things, and BETTER YET, IT IS DOCUMENTATION AND REQUIREMENTS. You can just give a spreadsheet as input to an LLM and have it build the system from there, without having to do all the explaining, because it can infer what you need and mean for everything. Inputs are clear and outputs are clearer, so it's literally a no-brainer.

We don't have to build the extensive UI and logic by hand anymore. That's what the spreadsheet did for us: convenience. Now that this isn't holding us back anymore, it's just so much better to have an app specific to something.

Another great thing about spreadsheets is that they are generic: you can do everything with them and it will work. The bad part is that something that does a lot of things can never do one thing and do it great. An app certainly will, and you can make it as integrated with your workflow and way of thinking as you want (more on that later). This is just too good to miss out on.

## Vibecoding

I don't know about you guys, but I was not really welcoming of vibecoding. I took pride in what I did and in the languages I learned. I liked to tinker, and it shaped me into the developer I am. I learned C, Rust and Zig, and really liked them. I used languages and frameworks like JavaScript and .NET for work, and wherever I needed fast prototyping or just convenience.

That said, I started tinkering with it, and I believe I have a good point to make here, so let me speak my mind, please. I don't believe we should be doing mindless vibecoding on products and software the way we are right now. It makes AI slop very prominent and products overall bad and full of bugs, and nobody likes that. BUT, and HEAR ME OUT, why does it matter for internal tools? Specifically crafted for your obscure use case and optimized for your way of using it? IT DOES FUCKING NOT! That's my point: vibecode away, my friend. [We already spent hours, days or weeks automating something that took 5 minutes to do by hand once a month](https://xkcd.com/1205/), so why not do this with everything we can?

Doing your finances? Create a better UI to upload photos or PDFs of your credit card, energy or internet bills. That way it's more fun and you will (maybe) not forget (I certainly did before LOL). Tracking job applications? (I HAVE A BLOG POST ABOUT THIS COMING LATER.) Why not integrate job listings and have an ATS automatically score your CV against the job description?

I mean, we are in the future. We don't need to automate everything and use every single drop of AI, but if it's already using your water, why not benefit from it? I guess that's my take.

## The monster under the bed

Maintenance. That's the word that's probably in your mind right now, and I get it, but it comes from your paranoid brain. You probably use JavaScript with a full 30k dependencies at your day job, so this kind of thing runs through your mind automatically. But I have a counterpoint: why do you need to worry about that?

You can containerize and self-host your tools in Docker, on a homelab or even on an old laptop. You don't even have to make them accessible from the internet; just use Tailscale (it's great, BTW). If nobody else can reach it, there's no one to hack it, and nothing forces you to update it. If it works today, it will work next year.

Keeping your tools simple is the answer to maintaining them. Ask your agent for a boring stack: few dependencies, pinned versions, SQLite or plain files instead of some fancy database. Have it write a README explaining how the thing works, so future you (or future agent) doesn't have to figure it out again.

Your data is yours, too. Make the app export to CSV and back up the database file. Worst case, you are right back at the spreadsheet you started with, so you lost nothing.

And remember, you are the only user. There's no SLA. If it's down for a day, nobody is going to open a ticket. If it breaks for real, you can throw it away and rebuild it in an afternoon, because the spreadsheet (your requirements, remember?) is still there.

Other than that, just talk with your agent. Bugs can be fixed in seconds and new features added just as fast. Try requesting a feature in a product and waiting months or years for it, or adding a new column to a spreadsheet with lots of tabs and VLOOKUPs (PROCV for my fellow Brazilians) pointing at it. It's a nightmare.

## Conclusion

So that's kind of it. Spreadsheets are still great and work for every major app. I mean, you can go through any list of startups and they will either be a marketplace, a Fiverr for influencers and marketing, or something that could just be a spreadsheet. But when it comes to tools that make your life easier, anything that removes friction, makes you happy, or even makes you proud of having built something just for you is always the best choice. AI is just a tool, so let's use it.

Code is still super fun to write, and you can keep it as a hobby: code without AI, do systems programming, learn something new. And since AI kind of sits between the developer and the code nowadays, go do something with your hands in the real world, something you can see and interact with. Buy an Arduino or an ESP, blink an LED, wire up a sensor, automate your life with Home Assistant. There's nothing like watching something you built move in front of you.

Despite everything, it's still a good time to be alive!
