# Using NSOAP with Express

Installation

```bash
npm install nsoap-express
# OR
yarn add nsoap-express
```

## Create your app

```javascript
import nsoap from "nsoap-express";

const app = {
  greet: (name, age) => {
    return `Hello, ${age}-year old ${name}!`;
  },
  echo: (text) => {
    return text;
  },
  admin: {

  }
}

app.use(nsoap(app));
```


## Test your app

```bash
curl
```
