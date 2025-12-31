+++
title = 'Devlog Buzz'
date = 2025-07-21T01:27:14-03:00
draft = false
+++

Back in my journey of trying to learn zig on one of those days when I couldn't get myself to sleep I thought, why not make a game using zig? Yes, the question is always "why?" and the answer is always "why not?"

So another one of my phases began, I started looking into some lib or anything that I cloud make an 2d game, I was thinking in using [SDL](https://libsdl.org/) as I already use it in the past with C++, but I remembered [raylib](https://www.raylib.com/index.html) and found out about [raylib-zig](https://github.com/Not-Nik/raylib-zig) and was an sign for me to start.

I don't remember how much thought I put in the game idea, but I come up with and management game where you have to try and keep the game running for the most time you can. I was aiming for something simple, both to play and to implement. So I come up with buzzness-tyccon 

![](attachments/Pasted%20image%2020250722175220.png)

I spent the majority of the early stages of the time working to make the isometric grid, being isometric was the core concept of the idea, for some reason I was way into it. I though that was going to be much simple that it was. It involved some math, the math wasn't so bad, but I was making it harder for myself not really understanding zig and mixing int numbers and floats, I will make a more in depth devlog about the grid system and the isometric rendering because is so interesting, but it needs a separated post.

Other nice part that I implemented was the flowers, I made some assets in aesprite, I did make the grid tile (the grass cube) sprite in aesprite as well. I implemented three types of flowers, each one with 4 different stages of maturity, and with a simple bee sprite and a random walk in direction of the nearest fully grown flower I have the basic concept of the game working.

Fully grown flowers produces pollen that bees would harvest to make honey and you can produce more bees. This was the frist PoC that I got from the game. I really liked and iterations later I have something that I liked, this includes some features like:

- camera movements, drag to move and zoom
- bees that got pollen will spawn more flowers randomly 
- bees and flowers have an lifespan (the idea here is that if all flowers die, is game over)
- move entities to use a grid system (more on this in another post)

And I do have somethings planned to work one:

- Refactoring entities to use ECS (Entity Component System)
- Using an event system instead of checking in main update event loop
- Configuration system, removing magic numbers and allow users to select screen size, and other configurations both via ui and settings file
- Error handling 
- Better in-game debug tools

I will make more posts about both what I already made to this game and some of these improvements, in the mean time fell free to [check the game repo](https://github.com/Krymancer/buzzness-tycoon/) any suggestions and help is appreciated.

Peace out nerds.