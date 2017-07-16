# NSOAP: Native Syntax Object Access Protocol

NSOAP is a Remote Procedure Call (RPC) and URL convention that uses familiar JavaScript syntax for method invocation and parameter passing. In addition to web services, NSOAP conventions can also be used for client-side routing in React, Angular etc. The NSOAP project provides routers for Express, Koa and React. Contributions invited for other platforms.  

Attempting to explain it without code is futile. Let's go straight to the examples. Examples are available for server-side routing with NSOAP-Express, NSOAP-Koa and client-side routing with NSOAP-React.

# Initializing your App: The App Object

The App Object contains all the "routes" the application will respond to.

```javascript
// This example assumes Express JS
const express = require("express");
const nsoap = require("nsoap-express");

const app = express();

const myApp = {
  addTwoNumbers(x, y) {
    return x + y;
  }
}

app.use(nsoap(myApp));
```

# Invoking Functions

Invoke a function that adds two numbers

```bash
curl "http://www.example.com/addTwoNumbers(10,20)"
```

Arguments can be strings, numbers or booleans. If they are strings, they must still be valid JavaScript identifiers.

```bash
# numeric argument
curl "http://www.example.com/addTwoNumbers(10,20)"
# boolean argument
curl "http://www.example.com/findAll(true)"
# string argument
curl "http://www.example.com/search(thomas)"
```

Use parameter variables.

```bash
# numeric
curl "http://www.example.com/addTwoNumbers(x,y)?x=10&y=20"
# string
curl "http://www.example.com/search(x)?x=thomas"
```

If the argument is a string and it contains spaces or other characters, you will need to quote and encode them. They can only be passed via parameter variables.

```bash
# Have spaces? Must quote and encode.
# %22 is double quote, %20 is space
# x = "thomas jacob"
curl "http://www.example.com/search(x)?x=%22thomas%20jacob%22"
```

You may pass full JSON objects via parameter variables.

```bash
# x = { "title": "bring milk", "assignee": "me" })
# encodeURIComponent(x)
curl "http://www.example.com/findTodo(x)?x=
%7B%20%22title%22%3A%20%22bring%20milk%22%2C%20%22assignee%22%3A%20%22me%22%20%7D"
```

# Returning a response

Applications are expected to return the response to be sent to the client.

```javascript
const myApp = {
  addTwoNumbers(x, y, { request, response }) {
    return x + y;
  },
}
```

In case there is an error, throw an exception.

```javascript
const myApp = {
  addTwoNumbers(x, y, { request, response }) {
    if (typeof  x === "undefined" || typeof y === "undefined") {
      throw new Error("Invalid value.")
    } else {
      return x + y;
    }
  },
}
```

# On the server, use GET, POST, PUT whatever.

Arguments passed via the query string need to be URI encoded as seen in examples above. Arguments passed via HTTP method body are parsed with JSON.parse; so they need to be valid. For examples, see the documentation for NSOAP-Express or NSOAP-Koa.

```bash
# Using POST with JSON content type
curl -H "Content-Type: application/json" -X POST -d '{"x":10,"y":20}' "http://www.example.com/addTwoNumbers(x,y)"
# Using POST with url encoding.
curl --data "x=10&y=20" "http://www.example.com/addTwoNumbers(x,y)"
```

# Organizing code with Namespaces

Invoke a function defined on an object. This allows organizing the code into namespaces similar to directories.

```bash
curl "http://www.example.com/math.square(20)"
# OR
curl "http://www.example.com/math.square(x)?x=20"
# returns 400
```

# Parenthesis

Parenthesis may be omitted if the function can be called without arguments. If the url refers to an object instead of a function, its value is simply returned.

```bash
curl "http://www.example.com/default"
# is the same as
curl http://www.example.com/default()
```

# Default Functions

Routers will provide Applications an option to specify the default function to be called when the url omits the function name. Routers should use "index" if no default function is specified.

If the url points to the root (in other words, if the path = "/"), the default function is invoked on the App object.

```bash
# Assuming that the default function name has not been changed
curl "http://www.example.com/"
# is the same as
curl http://www.example.com/index()
```

# Function Chaining

Chained function calls work the same way you expect it to work. The following url invokes the getAccounts function on the result of the customer function. If the function returns a Promise (or a Future), the Promise is resolved and the subsequent function or object is accessed on the resolved value.

```bash
curl "http://www.example.com/customer(100).getAccounts(2017)"
#OR
curl "http://www.example.com/customer(custId).getAccounts(year)?custId=100&year=2017"
```

# Parameter Type Inference

NSOAP supports parameter type inference for strings, numbers and booleans. In the following example, the function parameters are inferred as string, number, boolean and number.

```bash
curl "http://www.example.com/search(Jeswin,20,true,x)?x=100"
```

# Case-sensitivity

NSOAP is case-sensitive. So the following will not assign 100 to the parameter 'x'.
```bash
# Error. 'x' is not the same as 'X'
curl "http://www.example.com/squareRoot(x)?X=100"
```

# Advanced Default Functions

If the return value is an object, and it contains a property with the same name as the default function name, and if the value of the property is a function, it is invoked.

That may sound confusing, let's look at an example. Assume that the default function name is unchanged, or "index". The addTwoNumbers() function returns an object with a property named "index" which is a function. Since it matches the default function name, it is invoked.

```javascript
// The app
const myApp = {
  addTwoNumbers(x, y) {
    return {
      index() {
        return x + y;
      }
    }
  },
}
```

```bash
curl "http://www.example.com/addTwoNumbers(10,20)"
# returns 30
```

This allows for more powerful chained functions. The following script can now respond to "www.example.com/getCustomer(1)" and "www.example.com/getCustomer(1).getTotalPurchases()"

```javascript
// The app
const myApp = {
  getCustomer(id) {
    return {
      index() {
        return id === 1 ? { name: "Jeswin" } : { name: "Thomas" }
      },
      getTotalPurchases() {
        return id === 1 ? 100 : 200;
      }
    }
  },
}
```

```bash
# will return { name: "Jeswin" }
curl "http://www.example.com/getcustomer(1)"

# will return 100
curl "http://www.example.com/getcustomer(1).getTotalPurchases()"
```

# HTTP Headers and Cookies

By default, key-value pairs defined via headers and cookies are treated as variables. However, applications are allowed to turn off this behavior.

```bash
# returns 400
curl --header "x:20" "http://www.example.com/math.square(x)"
```

Cookies are disabled by default in NSOAP routers. They must be explicitly enabled in methods which require them. See Router Documentation (Express, Koa) on how to enable cookies.

# Order of searching parameters in a Request

NSOAP routers will attempt to find parameter values in the following Order

- Headers
- Querystring
- body
- Cookies (later)

This means that if a parameter say "x" is defined in the Headers and in the Body, the value found in Headers will take precedence.

# Security implications of ignoring HTTP methods

You should not be relying on HTTP methods to secure your API. Pass session tokens explicitly to functions which need to be secured.

```bash
curl --header "session-token:AD332DA12323AAA" "http://www.example.com/placeOrder(itemId, quantity, sessionToken)?itemId=200&quantity=3"
```

Since cookies are disabled by default, session tokens cannot be sent via an CSRF attack. After due consideration, applications may enable cookies for functions which do not modify data.
