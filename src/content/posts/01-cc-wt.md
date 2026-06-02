---
title: 'Building my own wc Tool in Rust'
date: 2024-06-18T18:08:37-03:00
draft: false
---

I found myself not really excited to code anything and that was really bothering me. I was always excited to code something, learning something new and not being able to enjoy it or have the motivation to do it was really driving me crazy. I don't really know what was the cause but I can't do anytthing, I felt like I was justing being lazy, tried to read a book, or take a time for myself but nothing really helped. So I started to serching for a new project that I cloud make and be excited about, nothing really caught my eye, same basic projects as aways, frontend projects are either too simple or have some gimmic that I didn't really care at the moment, backend projects are always CRUD at this point. I was really lost, I didn't know what to do, I was really sad about it.

In my search for something to do I found [Codding Challenges](https://codingchallenges.fyi) a blog made by John Crickett, I really liked the idea of weekly challengs, that shouldn't take too much time and at the same time being interesting. I started to look at the challenges and I cloudn't decide on wich one to do, so I went to the frist one, Write your own wc. I really liked to do this challeng and want to share with you some intersting things I learned and discoverd along the way.

Frist of all, if you don't know about wc (I also didn't never used) ws is a program that count the number of bytes, characters, lines and words on a file (or stream, same thing on linux). You certanly can use it on your terminal, or look for the man page of it. Also I found the [The Art of Unix Programming](https://codingchallenges.fyi/blog/art-of-unix-programming) to be an phylosophy that align with my way of thinking, so I really was eager to start.

The plan was to make a program that could:

- Count the number of bytes, characters, lines, and words in a file.
- Handle command-line options to specify what to count.
- Read from standard input if no file is specified.

I really liked rust and I found this project to be an perfect excuse to use it. Rust has a REALLY type system, and I really like it, so the frist thing I did was to create a struct to represent all the data that I thought I would need to get from the input.

```rust
struct Stats {
    pub bytes: usize,
    pub chars: usize,
    pub lines: usize,
    pub max_line_lenght: usize,
    pub words: usize,
    pub path: String,
}
```

I started implementing the dumb part of the way of reading a file and learning how to process the command line arguments and so on, I thing is not that intersing, at least the majority of it, we will see how I managed the flags later.
The frist feature of the program that I implemented was the `-c` option, pretty straightforward: count the number of bytes. I achived this by counting the lenght of the input vector, since I opended the file and read it to a vector of chars.

```rust
impl Stats {
    pub fn new(chars: Vec<u8>, path: String) -> Self {
        let mut stats = Stats {
            bytes: chars.len(),
            chars: 0,
            lines: 0,
            max_line_length: 0,
            words: 0,
            path,
        };
        stats
    }
}
```

With that crossed out of the way, the next, thing to do was the `-l` option, count the number of lines. too easy, just count the `\n`:

```rust
for c in chars {
    if c == '\n' {
        stats.lines += 1;
    }
}
```

`-w` option was harder, we required detecting word boundaries in order to count the words. A state machine did the trick:

```rust
let mut in_word = false;
for c in chars {
    if !c.is_whitespace() {
        in_word = true;
    } else if in_word {
        stats.words += 1;
        in_word = false;
    }
}
```

The `-m` option counts the number of characters. This is straightforward unless the locale supports multibyte characters. For simplicity, I treated each byte as a character, just the lenght of the array.
With all of that out the way, lets talk about the flags. My idea was quite simple, I read the arguments, if the argument starts with a `-` I treat it as a flag, if not is a file path, flags can be combined, so you have the option to pass either `-c -l -w` or `-clw` and it will work the same way. I also added a check to see if the flag is valid, if not it will panic.

```rust
let args = env::args().skip(1); // Skips the frist argument in the command (most likely the binary name i.e: ccwd ....)
    let mut flags: Vec<char> = vec![];
    let mut files_paths: Vec<String> = vec![];
    let avaliable_flags = ['c', 'm', 'l', 'L', 'w']; // All avaliable flags

    for arg in args {
        if arg.starts_with('-') { // if the argument start if a - it must be a flag or multiple flags
            for flag in arg.chars().skip(1) { // skiping the -
                flags.push(flag);
            }
        } else { // otherwise is treated like a file path
            files_paths.push(arg);
        }
    }

    let invalid_flag = flags.iter().find(|flag| !avaliable_flags.contains(flag));
```

If no options are provided, the tool should count bytes, lines, and words by default:

```rust
if flags.is_empty() {
    flags.push('c');
    flags.push('l');
    flags.push('w');
}
```

The last thing to do was to implement the default behaviour of the wc if no file is provided, it should read from stdin, pretty easy to do, check if we don't have any elements in the array from earlier and read from stdin.

```rust
let number_of_files = files_paths.len();

if number_of_files < 1 {
    let mut buffer = Vec::new();
    match io::stdin().read_to_end(&mut buffer) {
        Ok(_) => {
            stats.push(Stats::new(buffer, "".to_string()));
        },
        Err(err) => { panic!("Error reading from stdin: {err}")}
    }
}
```

Building wc, was not particularly difficult, the main problems that I encountered were related to me not knowing rust well enought. But I really enjoyed making a simple tool like this. This made me realize that I don't need a complex project or something hard to enjoy programming or solve problems, I just need to be excited about it. I really liked the idea of coding challenges and I will try to do more of them in the future.

Feel free to check out the complete source code on my [GitHub repository](https://github.com/Krymancer/ccwc). I hope this post inspires you to tackle similar challenges and build your own command-line tools.

Take care folks!
