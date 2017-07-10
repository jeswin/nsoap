# Using NSOAP with Express

Installation

```bash
npm install nsoap-react
# OR
yarn add nsoap-react
```

## Create your app

```javascript
import nsoap from "nsoap-react";

const GreetComponent = () => <div>Hello</div>;
const ParentComponent = () => <div>Hello</div>;
const ChildComponent = () => <div>Hello</div>;

const app = {
  greet: (name, age) => <GreetComponent />,
  actors: (year) => <ParentComponent><ChildComponent year={year} /></ParentComponent>,
}

ReactDOM.render(nsoap(app), mountNode);
```


## Test your app

```bash
curl
```
