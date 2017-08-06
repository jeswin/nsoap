import nsoap, { RoutingError } from "../nsoap";
import should from "should";

const app = {
  index() {
    return "Home page!";
  },
  about() {
    return "NSOAP Test Suite";
  },
  static: "NSOAP Static File",
  unary(arg) {
    return arg + 10;
  },
  binary(x, y) {
    return x + y;
  },
  divide(x, y) {
    return x / y;
  },
  tripletAdder(x,y,z) {
    return x + y + z;
  },
  namespace: {
    binary(x, y) {
      return x + y;
    }
  },
  nested: {
    namespace: {
      binary(x, y) {
        return x + y;
      }
    }
  },
  json(input) {
    return input.x + 20;
  },
  throw(a) {
    throw new Error("Exception!");
  },
  chainAdder1(x) {
    return {
      chainAdder2(y) {
        return x + y;
      }
    };
  },
  infer(_bool, _num, _str) {
    return {
      _bool,
      _num,
      _str
    };
  },
  promiseToAdd(x, y) {
    return Promise.resolve(x + y);
  },
  functionOnPromise(x, y) {
    return Promise.resolve({
      adder(z) {
        return x + y + z;
      }
    });
  },
  defaultFunction(x, y) {
    return {
      index() {
        return x + y;
      }
    };
  },
};

describe("NSOAP", () => {
  it("Calls a parameter-less function", async () => {
    const result = await nsoap(app, "about", [], {});
    result.should.equal("NSOAP Test Suite");
  });

  it("Gets the value of a property", async () => {
    const result = await nsoap(app, "static", [], {});
    result.should.equal("NSOAP Static File");
  });

  it("Calls a unary function", async () => {
    const result = await nsoap(app, "unary(10)", [], {});
    result.should.equal(20);
  });

  it("Throws an exception", async () => {
    const result = nsoap(app, "throw(10)", [], {});
    return result.then(
      () => {
        throw new Error("Exception was expected but not thrown.");
      },
      err => {}
    );
  });

  it("Calls a binary function", async () => {
    const result = await nsoap(app, "binary(10,20)", [], {});
    result.should.equal(30);
  });

  it("Calls a unary function with variables", async () => {
    const result = await nsoap(app, "unary(x)", [{ x: 10 }], {});
    result.should.equal(20);
  });

  it("Calls a binary function with variables", async () => {
    const result = await nsoap(app, "binary(x,y)", [{ x: 10, y: 20 }], {});
    result.should.equal(30);
  });

  it("Calls a binary function with literals and variables", async () => {
    const result = await nsoap(app, "binary(x,20)", [{ x: 10 }], {});
    result.should.equal(30);
  });

  it("Calls a binary function in a namespace", async () => {
    const result = await nsoap(app, "namespace.binary(10,20)", [], {});
    result.should.equal(30);
  });

  it("Calls a binary function in a nested namespace", async () => {
    const result = await nsoap(app, "nested.namespace.binary(10,20)", [], {});
    result.should.equal(30);
  });

  it("Accepts JSON arguments", async () => {
    const result = await nsoap(app, "json(obj)", [{ obj: { x: 10 } }], {});
    result.should.equal(30);
  });

  it("Adds parenthesis if omitted", async () => {
    const result = await nsoap(app, "about", [], {});
    result.should.equal("NSOAP Test Suite");
  });

  it("Calls the default function", async () => {
    const result = await nsoap(app, "", [], { index: "index" });
    result.should.equal("Home page!");
  });

  it("Calls chained functions", async () => {
    const result = await nsoap(app, "chainAdder1(10).chainAdder2(20)", [], {});
    result.should.equal(30);
  });

  it("Infers types", async () => {
    const result = await nsoap(app, "infer(true, 20, Hello)", [], {});
    (typeof result._bool).should.equal("boolean");
    (typeof result._num).should.equal("number");
    (typeof result._str).should.equal("string");
  });

  it("Is Case-sensitive", async () => {
    const result = await nsoap(app, "unary(x)", [{ X: 100, x: 10 }], {});
    result.should.equal(20);
  });

  it("Resolves a Promise", async () => {
    const result = await nsoap(
      app,
      "promiseToAdd(x,y)",
      [{ x: 10, y: 20 }],
      {}
    );
    result.should.equal(30);
  });

  it("Calls a function on the resolved value of a Promise", async () => {
    const result = await nsoap(
      app,
      "functionOnPromise(x,y).adder(100)",
      [{ x: 10, y: 20 }],
      {}
    );
    result.should.equal(130);
  });

  it("Calls default function on object", async () => {
    const result = await nsoap(app, "defaultFunction(10,20)", [], {
      index: "index"
    });
    result.should.equal(30);
  });

  it("Passes additional args to handler", async () => {
    const result = await nsoap(app, "defaultFunction(10)", [], {
      index: "index",
      args: [20]
    });
    result.should.equal(30);
  });

  it("Prepends additional args", async () => {
    const result = await nsoap(app, "divide(10)", [], {
      index: "index",
      prependArgs: true,
      args: [20]
    });
    result.should.equal(2);
  });

  it("Returns the notFound error if the handler is missing", async () => {
    const result = await nsoap(app, "nonExistantFunction(10)");
    result.should.be.instanceof(RoutingError);
    result.type.should.equal("NOT_FOUND");
  });
});
