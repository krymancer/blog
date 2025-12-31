+++
title = 'Back to BUZZness'
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

| Metric | Before | After Phase 2 | After Phase 3 | Total Improvement |
|--------|--------|---------------|---------------|-------------------|
| FPS (1000 bees) | 4-7 | 43-44 | 48-53 | **~12x** |
| Frame time | 800-900ms spikes | 22-25ms | 18-22ms | **~45x** |
| Frame spikes | Constant | None | None | Eliminated |

So I actually went ahead and implemented some new ideas, and the results are way better than I expected. I was aiming for 60 FPS with 10k bees.

The biggest win was **staggered AI updates**. The idea is simple: instead of running the full behavior logic for all bees every time, I split them into 4 groups and only update one group per frame. But still update all bees every frame, just the expensive behavior (finding flowers, checking targets) happens on 1/4 of them at a time.

```zig
const STAGGER_GROUPS: usize = 4;
var currentStaggerGroup: usize = 0;

if (beeIndex % STAGGER_GROUPS != currentStaggerGroup) {
    moveTowards(position, targetPos, deltaTime);
    continue;
}
// ... behavior
```

This alone reduced per-frame work by like 75%. The deltaTime is scaled to compensate so bees don't move slower.

I also pre-built a render list for bees. Before, I was doing HashMap lookups for each bee during rendering - position, sprite, scale, AI state. Now I build a flat array with just the data I need to draw, then loop through it. Same texture for all bees means raylib batches them automatically.

```zig
const BeeRenderData = struct {
    x: f32,
    y: f32,
    scale: f32,
    carryingPollen: bool,
};
var beeRenderList: [16384]BeeRenderData = undefined;
```

Some other stuff that helped:

- **HashMap pre-allocation** - I was getting random frame spikes and couldn't figure out why. Turns out the HashMaps were resizing during gameplay. Pre-allocating capacity for 16k entities fixed it.
- **O(1) entity counting** - I was iterating all bees just to count them for the UI. `HashMap.count()` exists, not sure why I wasn't using it.
- **Conditional scale sync** - The scale sync system was updating every bee every frame even when you're not zooming. Added a check for when grid scale actually changes.
- **Frustum culling on the grid** - When zoomed in, lots of tiles are off-screen. Skip drawing them.

The flower growth system was also allocating memory every frame because I was using `queryEntitiesWithFlowerGrowth()` which copies entities into a new list. Switched to a direct iterator, zero allocations.

| Metric | Before (1k bees) | After (10k bees) |
|--------|------------------|------------------|
| FPS | 48-53 | **120-150** |
| Frame time | 18-22ms | **5-10ms** |
| Bees | 1,000 | **10,000** |

So yeah, 10x more entities running at 2-3x better frame times.

Things I thought I'd need but didn't:
- Multithreading - single thread is fast enough
- GPU instancing - raylib's automatic batching works when you draw same texture consecutively  
- Spatial partitioning - the grid HashMap was enough

The lesson here is: stop doing stupid things before trying to do smart things.
