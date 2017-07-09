# NSOAP: Native Syntax Object Access Protocol

NSOAP is a Remote Procedure Call (RPC) and URL convention that uses familiar JavaScript syntax for method invocation and parameter passing. In addition to web services, NSOAP conventions can also be used for client-side routing in React, Angular etc.

Attempting to explain it without code is futile. Let's go straight to the examples.

# Invoking Functions

Invoke a function that adds two numbers
```bash
# returns 30
curl http://www.example.com/addTwoNumbers(10,20)
```

Use parameters
```bash
curl http://www.example.com/addTwoNumbers(x, y)?x=10&y=20
```

Pass full objects
```bash
curl http://www.example.com/addTodo({title:"bring milk",assignee:"me"})
```

Pass objects with a parameters
```bash
curl http://www.example.com/addTodo(x)?x=({title:"bring milk",assignee:"me"})
```

# Parameter Type Inference

NSOAP supports parameter type inference for strings, numbers and booleans.
In the following example, name is inferred as a string, age as a number and autoRenew as a boolean.

```bash
curl http://www.example.com/register(name, age, autoRenew)?name="Jeswin"&age=20&autoRenew=true
```

A string does not need quoting if the value is not a valid boolean or a number.
```bash
curl http://www.example.com/register(name, age, autoRenew)?name=Jeswin&age=20&autoRenew=true
```

However, inside objects, strings need to be quoted.
```bash
# Strings need to be quoted
curl http://www.example.com/addTodo(x)?x=({title:"bring milk",assignee:"me"})
```

# Use HTTP GET, POST, PUT whatever.

Any HTTP method (GET, POST, PUT) can be used to make an RPC. But applications are allowed to restrict certain HTTP
methods for security reasons. As a general principle, allow GET while fetching data. And prefer POST while changing
data.

```bash
# Using POST
curl --data "x=10&y=20" http://www.example.com/addTwoNumbers(x, y)
```

# Getting Values

Get a value.
```bash
# returns "Good day"
curl http://www.example.com/greeting
```

# Organizing code with Namespaces

Invoke a function defined on an object.
```bash
# returns 400
curl http://www.example.com/math.square(20)
# OR
curl http://www.example.com/math.square(x)?x=20
```

# Headers and Cookies

By default, key-value pairs defined via headers and cookies are treated as variables.
```bash
# returns 400
curl --header "x:20" http://www.example.com/math.square(x)
```

However, applications are allowed to turn off this behavior.

# Case-sensitivity

NSOAP is case-sensitive. So the following is an error
```bash
# Error. 'x' is not the same as 'X'
curl http://www.example.com/squareRoot(x)?X=100
```

# Hyphens, whitespace etc.

HTTP headers and cookie keys allow characters which are invalid for variable naming in most languages. For instance,
"session-id" is not a valid variable name in most languages. In such cases, the application can choose to ignore them or convert it into a predefined convention such as PascalCase or camelCase.

For instance, the express-nsoap node module with default options will convert it into camelCase while routing.
```
# This works, because node-nsoap converts first-name to firstName
curl --header "first-name:Jeswin" http://www.example.com/echo(firstName)
```
