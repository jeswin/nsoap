# NSOAP: Native Syntax Object Access Protocol

NSOAP is a radically simpler Remove Procedure Call (RPC) convention that can be used in place of
patterns such as REST or SOAP. It allows programmers to treat RPCs with the same syntax they use
for the rest of their code.

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

Any HTTP method (GET, POST, PUT) can be used to make an RPC.
But applications are allowed to restrict certain HTTP methods for security reasons.
As a general principle, allow GET which fetching data. And prefer POST while changing data.

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

# Headers and cookies

By default, key-value pairs defined via headers and cookies are treated as variables.

```bash
# returns 400
curl --header "x:20" http://www.nsoap.org/math.square(x)
```

However, applications can choose to not support this.

# Casing and Special Characters



This is again application defined.










## Headers
Headers are not part of the protocol. Feel free to






Isotropy HTTP services calling convention
---
Isotropy comes with an radically simpler RPC (Remove Procedure Call) convention, that can be used in place of normal HTTP methods. It allows programmers to leave behind the complexities of the HTTP protocol, HTTP methods, cookies etc. Urls look like plain method calls.


Invoke with parameters

Pass full objects as well
```bash
curl http://www.example.com/addTodo({ title:"bring milk", assignee: "me" })
```

Pass full objects via a parameter
```bash
curl http://www.example.com/addTodo(todo)?todo={ title:"bring milk", assignee: "me" })
```

Methods are callable via GET or POST and you can use most common Content-Types such as application/x-www-form-urlencoded, multipart/form-data or application/json.

Example of invoking a method via HTTP POST
```bash
curl --data "x=10&y=20" http://www.example.com/addTwoNumbers(x, y)
```

It is not mandatory that you use the Isotropy RPC Calling Convention, but that is the default.
Other mechanisms will be added in future.

to simplify Remote Procedure Calls by taking awa


> Programs must be written for people to read, and only incidentally for machines to execute - Abelson and Sussman
