# NSOAP: Native Syntax Object Access Protocol

NSOAP is an intuitive Remove Procedure Call (RPC) convention that can be used in place of patterns such as REST or SOAP. It allows programmers to call remote methods and objects with the same syntax they use for the rest of their code.

Let's go straight to some examples.

# Functions

Invoke a function that adds two numbers
```bash
# returns 30
curl http://www.nsoap.org/addTwoNumbers(10,20)
```

Use parameters
```bash
curl http://www.nsoap.org/addTwoNumbers(x, y)?x=10&y=20
```

Pass full objects
```bash
curl http://www.example.com/addTodo({title:"bring milk",assignee:"me"})
```

Pass objects with a parameters
```bash
curl http://www.example.com/addTodo(x)?x=({title:"bring milk",assignee:"me"})
```

# HTTP GET, POST, PUT whatever.

Any HTTP method (GET, POST, PUT) can be used to make an RPC.But applications are allowed to restrict certain HTTP
methods for security reasons. As a general principle, allow GET while fetching data. And prefer POST while changing
data.

```bash
# Using POST
curl --data "x=10&y=20" http://www.nsoap.org/addTwoNumbers(x, y)
```

# Values

Get a value.
```bash
# returns "Good day"
curl http://www.nsoap.org/greeting
```

# Namespaces

Invoke a function defined on an object.
```bash
# returns 400
curl http://www.nsoap.org/math.square(20)
```

# Headers and Cookies

By default, key-value pairs defined via headers and cookies are treated as variables.
```bash
# returns 400
curl --header "x:20" http://www.nsoap.org/math.square(x)
```

However, applications are allowed to turn off this behavior.

# Case-sensitivity

NSOAP is case-sensitive. So the following is an error
```bash
# Error. 'x' is not the same as 'X'
curl http://www.nsoap.org/squareRoot(x)?X=100
```

# Hyphens, whitespace etc.

HTTP headers and cookie keys allow characters which are invalid for variable naming in most languages. For instance,
"session-id" is not a valid variable name in most languages. In such cases, the application can choose to ignore them or convert it into a predefined convention such as PascalCase or camelCase.

For instance, the express-nsoap node module with default options will convert it into camelCase while routing.
```
# This works, because node-nsoap converts first-name to firstName
curl --header "first-name:Jeswin" http://www.nsoap.org/echo(firstName)
```
