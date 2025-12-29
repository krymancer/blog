+++
title = '09 10x Improvment Game'
date = 2025-12-29T15:39:00-03:00
draft = false
+++

To be fair, I did not work on the game for a while, and since the last time I wrote about in here I had made A LOT of changes, I implemented ECS instead of using a more OO approach and basically rewrote the entire thing. I was trying to make the gameplay more exciting so I was pretty invested on writing code for the bee behavior (I shoud give you some background here but the game was kinda an POC and nothing really worked, you can [read the other post about it ]({{< relref "03-devlog-buzz" >}}))

Anyway, I got i bit carried away and I made bees interact with each other, flowers and the map, this caused some really slow operations, that was noticeable in my more modest laptop instead of my main machine, I was getting something like 1500fps with my PC and around 300 with my laptop and as soon as I finishing doing some cool things with the behavior with 500 bees I cloud get 30 fps, yikes.

So I was searching what I was doing wrong to see what I can do to improve this, the first this I did was to create some metrics that I can compare, so I did create a logger and generate csv files with timestamps, number of bees, frame times and fps.

The baseline was that with 1000 bees in my laptop I was getting 4-7 FPS and 800ms+ frame times. with that I began finding issues, the first thing I noticed was, the `QueryIterator` that I was using create new iterators and those allocations maybe was causing bottlenecks, but it didn't really help, but was a nice improvement having direct iterations instead of creating new ones.

I also noticed that I was using an function `countBeesNearFlower()` for some of the behavior and this was 0(n), considering the 1000 bees and running in each frame this was not ideal, to say the least, so I added an HashMap to track bees targeting each flower with some QoL methods to incriment, decrement, and get target count for each flower, this improve from O(n) to O(1), even with this, the performance did not improve was I was hopping, so the bottleneck was in something else.

After all that, still getting 700ms+ spikes, I did not found the main issue.

With an clear head, after an night of sleep I notice my mistake, 10x performance improvements does not comes when you do something smart, it's when you stop doing something stupid, I had an method to make bees go to an flower to collect pollen, `findNearestFlower()`  was called EVERY FRAME, for EVERY BEE, iterating on ALL FLOWERS. 

```
1000 bees × ~100 flowers = 100,000+ iterations per frame
```

I did try to prevent all bees for checking at the same time with a grace period, but this wasn't really a solution, we still have O(bees * flowers) so nothing really happened.

Caching it is, the solution for all problems (not really, but in this case yes), Caching the entities lookups meaning that instead of iterationg all the tame we oly need to build the cache one time (O(flowers)) and use it for the bee queries so:

**Before:**
```
Frame work = O(searching_bees × all_flowers)
           = 500 bees × 100 flowers  
           = 50,000 iterations
```

**After:**
```
Frame work = O(all_flowers) + O(searching_bees × cached_flowers)
           = 100 + (500 × ~30 available flowers)
           = 15,100 iterations
```

with this we got from 4-7 FPS to 43-44 FPS, a huge improvement and finally I was happy with this result.

For good measure I had some ideas and implement somethings, for example, frustum culling, to do not render entities that wasn't in the viewport, skipping them, I also added an grip position hash map to O(1) flower lookup, that we used on some methods in the bee behavior, for pollination.

With all of that we hit 48-53 FPS with 1000 bees.

So long story short:

1. **Per-frame flower caching** - Eliminated O(bees × flowers) searches.
2. **Flower target count HashMap** - O(1) bee density checks instead of O(bees).
3. **Grid position HashMap** - O(1) spatial lookups for pollination checks.
4. **Search cooldown** - Reduces redundant searches when no flowers available.
5. **Frustum culling** - Skips rendering off-screen bees.
6. **Metrics system** - Critical for identifying the real bottleneck.

What didn't really helped:

1. **Direct iterators for lifespan/scale_sync** - Minimal impact. These weren't the bottleneck.
2. **Initial search cooldown without caching** - Helped but didn't solve the core O(n²) problem.

| Metric | Before | After Phase 2 | After Phase 3 | Total Improvement |
|--------|--------|---------------|---------------|-------------------|
| FPS (1000 bees) | 4-7 | 43-44 | 48-53 | **~12x** |
| Frame time | 800-900ms spikes | 22-25ms | 18-22ms | **~45x** |
| Frame spikes | Constant | None | None | Eliminated |

Still I have some ideas to improve this even more, I think that 1000 bees are excessive for the gameplay plans I have today but is nice to have the peace of mind that it is running great on a modest machine, still I want to hit at least 60 fps with 10k bees.

- **Spatial hashing for bee-to-bee queries** - If bees need to interact with each other
- **Staggered updates** - Update different bee groups on different frames
- **Job system** - Parallelize bee AI updates across CPU cores
- **GPU instancing** - Batch bee rendering into a single draw call
