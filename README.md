# NSOAP: Native Syntax Object Access Protocol

NSOAP is a Remote Procedure Call (RPC) and URL convention that uses familiar JavaScript syntax for method invocation and parameter passing. In addition to web services, NSOAP conventions can also be used for client-side routing in React, Angular etc. The NSOAP project provides routers for Express, Koa and React. Contributions invited for other platforms.  

Attempting to explain it without code is futile. Let's go straight to the examples.

# Invoking Functions

Invoke a function that adds two numbers
```bash
curl "http://www.example.com/addTwoNumbers(10,20)"
# returns 30
```

Use parameters.
```bash
curl "http://www.example.com/addTwoNumbers(x,y)?x=10&y=20"
```

Arguments can be strings. Quote and URI encode them if they contain spaces or are invalid JavaScript variable names.
```bash
# thomas is treated as a literal "thomas"
curl "http://www.example.com/login(thomas)"

# Have spaces? Must quote.
# %22 is double quote, %20 is space
curl "http://www.example.com/login(%22thomas%20jacob%22)"
```

Pass full objects in the URI, but they need to be encoded
```bash
# x = { "title": "bring milk", "assignee": "me" })
# encodeURIComponent(x)
curl "http://www.example.com/findTodo(x)?x=
%7B%20%22title%22%3A%20%22bring%20milk%22%2C%20%22assignee%22%3A%20%22me%22%20%7D"
```

# Organizing code with Namespaces

Invoke a function defined on an object.
This allows organizing the code into namespaces similar to directories.

```bash
curl "http://www.example.com/math.square(20)"
# OR
curl "http://www.example.com/math.square(x)?x=20"
# returns 400
```

# Parenthesis

Parenthesis may be omitted if the function can be called without arguments.

```bash
curl "http://www.example.com/default"
# is the same as
curl http://www.example.com/default()
```

# Function Chaining

Chained function calls work the same way you expect it to work.
The following url invokes the getAccounts function on the result of the customer function.
```bash
curl "http://www.example.com/customer(100).getAccounts(2017)"
```

# Parameter Type Inference

NSOAP supports parameter type inference for strings, numbers and booleans.
In the following example, the function parameters are identified as string, number and boolean.

```bash
curl "http://www.example.com/search(Jeswin,20,true)"
```

# Case-sensitivity

NSOAP is case-sensitive. So the following will not assign 100 to the parameter 'x'.
```bash
# Error. 'x' is not the same as 'X'
curl "http://www.example.com/squareRoot(x)?X=100"
```

# On the server, use GET, POST, PUT whatever.

Arguments passed via the query string need to be URI encoded as seen in examples above. Arguments passed via HTTP method body are parsed with JSON.parse; so they need to be valid. For examples, check the documentation of NSOAP-Express or NSOAP-Koa.

```bash
# Using POST with url encoding.
curl --data "x=10&y=20" "http://www.example.com/addTwoNumbers(x,y)"
```

# HTTP Headers and Cookies

By default, key-value pairs defined via headers and cookies are treated as variables.
However, applications are allowed to turn off this behavior.
```bash
# returns 400
curl --header "x:20" "http://www.example.com/math.square(x)"
```

Cookies are disabled by default in NSOAP routers for security reasons.
This policy needs more discussion.

# Hyphens, whitespace etc.

HTTP headers and cookie keys allow characters which are invalid for variable naming in most languages. For instance, "session-id" is not a valid variable name in most languages. NSOAP routers must offer applications the ability convert them into camelCase, PascalCase, snake_case, lowercase or UPPERCASE.

```bash
# This works, because node-nsoap converts first-name to firstName
curl --header "first-name:\"Jeswin\"" "http://www.example.com/echo(firstName)"
```
