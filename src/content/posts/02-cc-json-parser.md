---
title: 'Building a JSON Parser in Rust'
date: 2024-06-18T22:22:57-03:00
draft: false
---

### Introduction
I recently took on a challenge to build my own JSON parser in Rust. This project was a fantastic opportunity to dive deep into parsing techniques, which are crucial for everything from simple data formats to building compilers. You can find the full details of the challenge [here](https://codingchallenges.fyi/challenges/challenge-json-parser) and the source code in my [GitHub repository](https://github.com/Krymancer/cc-json-parser).

### The Challenge
The challenge was structured to incrementally build a JSON parser, starting with simple JSON objects and progressively handling more complex structures. Here's a step-by-step breakdown of the process.

### Step Zero: Thinking about the problem and data structure
Being honest I never really implement anything like a parser, my first idea was to count the curly braces and see if they are even (what passes the frist checks for this code challenge). But when I need to parse key-values I started to strugle. Then I took two steps backs and search about parser and remember that compiles do use tokens and parser in order to work so I started in creating a structre to handle all possible tokens in a json, and rust type system really helped me:

```rust
    enum Token {
    CurlyOpen,
    CurlyClose,
SquareOpen,
    SquareClose,
    Colon,
    Comma,
    String(String),
    Number(f64),
    Bool(bool),
    Null,
}
```

This struct contains all the possible tokens that we will need, I took then from the [json.org](https://www.json.org/json-en.html) website, that have a really great visual representation of how parsing a json file works. 

### Step One: Tokenizing the input
The frist step was to get each character of the file and iterate them to create a array of tokens to be fed in a parser. Most of the tokens are straightfoward like curly braces, braces, colons and commas, but values like string, numbers, boolean and nulls required a little more work, I will not show each one because is mostly iterate throug chars making sure that the value is expected, like in string that started with `"` and finishes with `"`, numbers can not have trailing zeros and so on. But I had some troubles that I found during testing that I find interesting and will metion latter.

```rust
fn tokenize(input: String) -> Result<Vec<Token>> {
    // some checks and initialization ...
    while let Some(&ch) = chars.peek() {
        match ch {
            '{' => {
                tokens.push(Token::CurlyOpen);
                chars.next();
            }
            '}' => {
                tokens.push(Token::CurlyClose);
                chars.next();
            }
            '[' => {
                tokens.push(Token::SquareOpen);
                chars.next();
            }
            ']' => {
                tokens.push(Token::SquareClose);
                chars.next();
            }
            ':' => {
                tokens.push(Token::Colon);
                chars.next();
            }
            ',' => {
                tokens.push(Token::Comma);
                chars.next();
            }
            '"' => {
                tokens.push(Token::String(tokenize_string(&mut chars)?));
            }
            '0'..='9' | '-' => {
                tokens.push(Token::Number(tokenize_number(&mut chars)?));
            }
            't' | 'f' => {
                tokens.push(Token::Bool(tokenize_bool(&mut chars)));
            }
            'n' => {
                tokenize_null(&mut chars);
                tokens.push(Token::Null);
            }
            _ if ch.is_whitespace() => {
                chars.next();
            }
            _ => return Err(anyhow!("Unexpected character: {}", ch)),
        }
    }

    Ok(tokens)
}
```

### Step Two: Parsing the tokens
For parsing I had to use a struct to hold the values, using the json.org example I got all the possible values and created the following struct:

```rust
pub enum JsonValue {
    Object(Vec<(String, JsonValue)>),
    Array(Vec<JsonValue>),
    String(String),
    Number(f64),
    Bool(bool),
    Null,
}
```
With this struct I created a function that parse the a Token array. When testing I noticed that json.org has tests for depth. I didn't know that json had a maximum depth, this is in place to prevent some attacks, we can learn more in depth about this searching, this is pretty known actually and I'm sure someone can explain way better than me so let's keep going. 

The function `parse_tokens` make sure that is only one root token and we made the check if is a object or an array also, since json only can have arrays or object as root nodes.
Here I already parse the object before checking, this is not ideal but is good enouth for the frist time so I didn't bother.

```rust
fn parse_tokens(tokens: Vec<Token>) -> Result<JsonValue> {
    let mut iter = tokens.iter().peekable();
    let value = parse_value(&mut iter, 0)?;

    // Check if there are any remaining tokens after the top-level value
    if iter.peek().is_some() {
        return Err(anyhow!("Extra tokens after top-level value"));
    }

    match value {
        JsonValue::Object(_) | JsonValue::Array(_) => Ok(value),
        _ => Err(anyhow!(
            "A JSON payload should be an object or array, not a string."
        )),
    }
}
```
The magic happens in the `parse_value` function:

```rust
fn parse_value<'a, I>(tokens: &mut std::iter::Peekable<I>, depth: usize) -> Result<JsonValue>
where
    I: Iterator<Item = &'a Token>,
{
    if depth > MAX_DEPTH {
        return Err(anyhow!("Exceeded maximum nesting depth"));
    }

    match tokens.peek() {
        Some(Token::CurlyOpen) => parse_object(tokens, depth),
        Some(Token::SquareOpen) => parse_array(tokens, depth),
        Some(Token::String(_)) => {
            if let Some(Token::String(s)) = tokens.next() {
                Ok(JsonValue::String(s.clone()))
            } else {
                Err(anyhow!("Expected a string"))
            }
        }
        Some(Token::Number(_)) => {
            if let Some(Token::Number(n)) = tokens.next() {
                Ok(JsonValue::Number(*n))
            } else {
                Err(anyhow!("Expected a number"))
            }
        }
        Some(Token::Bool(_)) => {
            if let Some(Token::Bool(b)) = tokens.next() {
                Ok(JsonValue::Bool(*b))
            } else {
                Err(anyhow!("Expected a boolean"))
            }
        }
        Some(Token::Null) => {
            tokens.next(); // Consume the Null token
            Ok(JsonValue::Null)
        }
        _ => Err(anyhow!("Unexpected token")),
    }
}
```

this basicly take care of objects, arrays, strings, numbers, booleans and null values, converting the tokens to an actuall value in rust.

### Step Three: Parsing Nested Objects and Arrays
The next step was to handle JSON objects containing other objects and arrays. This required implementing recursive parsing functions, keeping in mind the depth:

```rust
fn parse_object<'a, I>(tokens: &mut std::iter::Peekable<I>, depth: usize) -> Result<JsonValue>
where
    I: Iterator<Item = &'a Token>,
{
    let mut object = Vec::new();
    tokens.next(); // Consume the '{'
    loop {
        match tokens.peek() {
            Some(Token::CurlyClose) => {
                tokens.next(); // Consume the '}'
                break;
            }
            Some(Token::String(_)) => {
                if let Some(Token::String(key)) = tokens.next() {
                    if let Some(Token::Colon) = tokens.next() {
                        let value = parse_value(tokens, depth + 1)?;
                        object.push((key.clone(), value));
                        match tokens.peek() {
                            Some(Token::Comma) => {
                                tokens.next(); // Consume the ','
                                if let Some(Token::CurlyClose) = tokens.peek() {
                                    return Err(anyhow!("Trailing comma in object"));
                                }
                            }
                            Some(Token::CurlyClose) => {
                                tokens.next(); // Consume the '}'
                                break;
                            }
                            _ => return Err(anyhow!("Expected ',' or '}' after object value")),
                        }
                    } else {
                        return Err(anyhow!("Expected ':' after key in object"));
                    }
                }
            }
            _ => return Err(anyhow!("Expected string key or '}' in object")),
        }
    }
    Ok(JsonValue::Object(object))
}

fn parse_array<'a, I>(tokens: &mut std::iter::Peekable<I>, depth: usize) -> Result<JsonValue>
where
    I: Iterator<Item = &'a Token>,
{
    let mut array = Vec::new();
    tokens.next(); // Consume the '['
    loop {
        match tokens.peek() {
            Some(Token::SquareClose) => {
                tokens.next(); // Consume the ']'
                break;
            }
            Some(_) => {
                let value = parse_value(tokens, depth + 1)?;
                array.push(value);
                match tokens.peek() {
                    Some(Token::Comma) => {
                        tokens.next(); // Consume the ','
                        if let Some(Token::SquareClose) = tokens.peek() {
                            return Err(anyhow!("Trailing comma in array"));
                        }
                    }
                    Some(Token::SquareClose) => {
                        tokens.next(); // Consume the ']'
                        break;
                    }
                    _ => return Err(anyhow!("Expected ',' or ']'")),
                };
            }
            _ => return Err(anyhow!("Expected value or ']'")),
        };
    }
    Ok(JsonValue::Array(array))
}
```

### Step Four: Testing and Validation
Finally, I added my own tests to ensure the parser handles both valid and invalid JSON correctly. I also used the JSON test suite from json.org to validate the parser:

```rust
#[cfg(test)]
mod tests {
    use crate::parser::{parse_json, JsonValue};

    #[test]
    fn test_invalid_path() {
        let path = String::from("invalid/path");
        let result = parse_json(path);
        assert!(result.is_err());
        if let Err(e) = result {
            assert_eq!(e.to_string(), "Failed to read File");
        }
    }

    #[test]
    fn test_step1_valid() {
        let path = String::from("./tests/step1/valid.json");
        let result = parse_json(path).expect("Error parsing JSON");
        assert_eq!(result, JsonValue::Object(vec![]));
    }

    // Additional tests for other steps...
}
```

### Step Five: Testing and fixing...
When testing I found two problems that needed I little work to work, strings and numbers.

My problem with strings was enconded characters, the frist way that I was checking for strings was to look for the end '"' putting each character in between into the strings, but I found an test that had:

```json
{
    "key": "\""
}
```
My parser broke, but when making an special case for this I found that I was not at all accouting for escaped chars so I rewrite the function to account for those:

```rust
fn tokenize_string(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<String> {
    let mut result = String::new();
    chars.next(); // Skip opening (") quote

    while let Some(&ch) = chars.peek() {
        match ch {
            '\\' => {
                chars.next(); // Skip the backslash
                if let Some(&escaped_char) = chars.peek() {
                    match escaped_char {
                        '"' => result.push('"'),
                        '\\' => result.push('\\'),
                        '/' => result.push('/'),
                        'b' => result.push('\x08'), // Backspace rust don't like \b in char
                        'f' => result.push('\x0C'), // Form feed rust don't like \f in char
                        'n' => result.push('\n'),
                        'r' => result.push('\r'),
                        't' => result.push('\t'),
                        'u' => {
                            let unicode_sequence = tokenize_unicode_sequence(chars)?;
                            result += &unicode_sequence;
                        }
                        _ => return Err(anyhow!("Invalid escape sequence: \\{}", escaped_char)),
                    }
                    chars.next(); // Skip the escaped character
                } else {
                    return Err(anyhow!("Unexpected end of input after escape character"));
                }
            }
            '"' => {
                chars.next(); // Skip closing (") quote
                break; // Closing quote found
            }
            _ if ch.is_whitespace() && ch != ' ' => {
                return Err(anyhow!(
                    "Invalid unescaped whitespace character in string: {}",
                    ch
                ));
            }
            _ => {
                result.push(ch);
                chars.next();
            }
        }
    }

    Ok(result)
}
```

for some reason rust didn't like that I put `'\b'` and `'\f'` into the push function so I used the ascii values instead. This also acount for whitespaces in the strings, the only whitespace allowed is `' '` space itself, tabs and others must be escaped in json.

I also found that I was not parsing unicode sequeces and they are a little different:

```rust
fn tokenize_unicode_sequence(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<String> {
    let mut result = String::new();

    chars.next(); // Skip 'u'
    let mut unicode_sequence = String::new();
    for _ in 0..4 {
        if let Some(&hex_digit) = chars.peek() {
            if hex_digit.is_ascii_hexdigit() {
                unicode_sequence.push(hex_digit);
                chars.next();
            } else {
                return Err(anyhow!("Invalid Unicode escape sequence"));
            }
        } else {
            return Err(anyhow!(
                "Unexpected end of input in Unicode escape sequence"
            ));
        }
    }

    if let Ok(unicode_char) =
        u16::from_str_radix(&unicode_sequence, 16).map(|u| char::from_u32(u as u32))
    {
        if let Some(c) = unicode_char {
            result.push(c);
        } else {
            return Err(anyhow!("Invalid Unicode character"));
        }
    } else {
        return Err(anyhow!("Invalid Unicode escape sequence"));
    }

    Ok(result)
}
```

This took care of the errors that I had with strings, now we go for numbers. Frist of all, I totally forgot `e` AND `E` can be in numbers, they represent scientific notation (e=10^n) like 2e5 is the same as 2 * 10^5. Also json don't allow leading zeros in numbers so I accounted for that. This got a simple function a lot complex but the end result (not at all perfect) was not too bad:

```rust
fn tokenize_number(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64, anyhow::Error> {
    let mut result = String::new();
    let mut is_first_char = true;
    let mut has_dot = false;

    while let Some(&ch) = chars.peek() {
        match ch {
            '0'..='9' => {
                if is_first_char && ch == '0' {
                    chars.next(); // Consume the '0'
                    if let Some(&next_ch) = chars.peek() {
                        match next_ch {
                            '.' => {
                                // Handle 0.x numbers
                                result.push('0');
                            }
                            '0'..='9' => return Err(anyhow!("Invalid number with leading zero")),
                            _ => {
                                result.push('0'); // Just 0
                                break;
                            }
                        }
                    } else {
                        result.push('0'); // Just 0
                        break;
                    }
                } else {
                    result.push(ch);
                    chars.next();
                }
            }
            '.' => {
                if has_dot {
                    return Err(anyhow!("Multiple decimal points in number"));
                }
                result.push(ch);
                chars.next();
                has_dot = true;
            }
            '-' | '+' if is_first_char => {
                result.push(ch);
                chars.next();
            }
            'e' | 'E' => {
                result.push(ch);
                chars.next();
                // After 'e' or 'E', we should expect a digit or a sign
                if let Some(&next_ch) = chars.peek() {
                    if next_ch == '-' || next_ch == '+' || next_ch.is_digit(10) {
                        result.push(next_ch);
                        chars.next();
                    } else {
                        return Err(anyhow!("Invalid character after exponent"));
                    }
                } else {
                    return Err(anyhow!("Exponent without digits"));
                }
            }
            _ => break,
        }
        is_first_char = false;
    }

    if let Some(ch) = result.chars().last() {
        if matches!(ch, 'e' | 'E' | '.' | '-' | '+') {
            return Err(anyhow!("Invalid number"));
        }
    }

    match result.to_lowercase().parse() {
        Ok(number) => Ok(number),
        Err(..) => Err(anyhow!("Number is invalid")),
    }
}
```

### Conclusion
Building a JSON parser from scratch was a challenging but rewarding experience. It provided valuable insights into parsing techniques and Rust programming. You can check out the complete source code and try the parser yourself by visiting my [GitHub repository](https://github.com/Krymancer/cc-json-parser).

I hope this post inspires you to take on similar challenges and deepen your understanding of parsing and Rust. Happy coding!
