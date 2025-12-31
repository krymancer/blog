+++
title = 'My First Zig API'
date = 2024-06-05T20:50:06-03:00
+++

There's this event, which is conceived by Zanfranceschi. Essentially, Zan gave us a specification that we followed to implement an API. For this first quarter edition of 2024, we have a kind of "Bank" where some pre-registered clients check their statements and make transactions. If you want to read more details, I invite you to take a look at the repository of the [event](https://github.com/zanfranceschi/rinha-de-backend-2024-q1), where you can find the specifications along with the rest of the participation instructions and related information.

With the API created, the idea is to use a load balancer to manage two instances of the API. This edition focuses on data consistency. We used docker-compose to deploy images for the instances, the load balancer, and also a database. As of the writing of this article (07/03/2024), we still don't have what will be used to obtain the results from each API. However, for now, we're using [Gatling](https://gatling.io/) to conduct stress tests and some validations, and we're using p75 to get an idea of how the API behaves (if you're not familiar with p75, take a look [here](https://en.wikipedia.org/wiki/Percentile)).

The first thing I usually do to solve this kind of thing is to create the API in memory for some initial tests, mainly for validation purposes and to check if everything is okay and according to the specification. At this point, I had already decided to write the API in a language I didn't have much experience with, such as Go, Rust, or Zig. But looking at the other submissions, there were already many APIs in Go and Rust, so I tried to diversify and chose Zig. Considering that I already had experience in Rust and Go, it would be interesting to write my first program in Zig.

[Zig](https://ziglang.org/) is a relatively new language, so not all of its content and documentation are as elaborate. I relied extensively on reading and understanding source code. Despite everything, Zig has a [Std lib](https://ziglang.org/documentation/master/std/#A;std) that is quite comprehensive. That's where I started my adventure. I tried to use [std.http](https://ziglang.org/documentation/master/std/#A;std:http), and I didn't have a very good experience with it. The API isn't very beginner-friendly, so I tried to look for a framework. The first framework I tried to use was [Zap](https://github.com/zigzap/zap/), which is much easier to use than std.http. However, I missed some features, such as the utilization of router parameters, but nothing that prevented me from using it. I wrote a small URL parser with [std.Tokenizer](https://ziglang.org/documentation/master/std/#A;std:zig.Tokenizer) (as I mentioned, the std lib is quite comprehensive), and I managed to make the first functional version of the API with in-memory data.

But then the self-inflicted issues started: memory leaks, deadlocks, and inconsistencies because I wasn't using locks or anything in the requests. Even though this had nothing to do with the framework, I ended up looking for another framework and stumbled upon [http.zig/httpz](https://github.com/karlseguin/http.zig/), which the developer [karlseguin](https://github.com/karlseguin) also had a [library to use with Postgres](https://github.com/karlseguin/pg.zig), which was the database I already planned to use.

The migration was quite smooth, mainly because there wasn't really a migration; I decided to start from scratch, [as you can see in this commit](https://github.com/Krymancer/rinha-de-backend-2024-q1-zig/commit/150847e36e4760e4951468b85aca32b4cf2ab61f). But that wasn't a bad thing; with the knowledge I had gained using Zap, I was much faster and managed to implement everything back in record time.

The connection with the database was also very smooth; I owe a lot to [karlseguin](https://github.com/karlseguin) for making everything easier with his libraries. I didn't have any problems integrating the API with the database; the only part where I had some difficulty was using the record type from Postgres, which was returned by a stored procedure I was using in the database. Since the API had a method to receive raw data, I "solved" this problem by writing a small parser that used [std.mem.readInt](https://ziglang.org/documentation/master/std/#A;std:mem.readInt) to convert the bytes into integers, as that was all I needed. But since I wasn't sure if this was a good idea, I created an [issue in the pg.zig repo](https://github.com/karlseguin/pg.zig/issues/11) to ask, and within hours, the creator of the library made a PR that made using Postgres records trivial (as always, karlseguin saved me).

After solving these problems, I created a docker-compose along with a database and an instance of Nginx and started performing stress tests.

Not surprisingly, I had some more memory leaks, which was to be expected in my first experience; it's also been a few years since I programmed in C++ and C, so I was rusty. I managed to avoid the leak and a deadlock by deallocating a result from a database query that I had forgotten about and also deallocating an array list (similar to the vector in C++).

With these changes, I managed to achieve incredible results, in my opinion.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5l7bqakj8xccu2nan8dm.jpeg)

4ms p75, much better than I anticipated.

I just want to thank Zanfranceschi, Karlseguin, and the Zig community on Discord, where some people answered some of my doubts. Writing this API in Zig was a great experience, and I really loved the language, and I hope to create many cool things with it in the future!
