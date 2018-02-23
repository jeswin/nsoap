import "mocha";
import "should";
import nsoap, { RoutingError } from "../nsoap";

const app = {
  index() {
    return "Home page!";
  },
  about() {
    return "NSOAP Test Suite";
  },
  static: "NSOAP Static File",
  unary(arg: number) {
    return arg + 10;
  },
  binary(x: number, y: number) {
    return x + y;
  },
  divide(x: number, y: number) {
    return x / y;
  },
  tripletAdder(x: number, y: number, z: number) {
    return x + y + z;
  },
  namespace: {
    binary(x: number, y: number) {
      return x + y;
    }
  },
  nested: {
    namespace: {
      binary(x: number, y: number) {
        return x + y;
      }
    }
  },
  json(input: { x: number }) {
    return input.x + 20;
  },
  throw(a: any) {
    throw new Error("Exception!");
  },
  chainAdder1(x: number) {
    return {
      chainAdder2(y: number) {
        return x + y;
      }
    };
  },
  infer(_bool: boolean, _num: number, _str: string) {
    return {
      _bool,
      _num,
      _str
    };
  },
  async promiseToAdd(x: number, y: number) {
    return x + y;
  },
  async functionOnPromise(x: number, y: number) {
    return {
      adder(z: number) {
        return x + y + z;
      }
    };
  },
  defaultFunction(x: number, y: number) {
    return {
      index() {
        return x + y;
      }
    };
  },
  *generatorFunction(x: number, y: number) {
    yield 1;
    yield 2;
    yield 3;
    yield x;
    return y * 2;
  },
  async *asyncGeneratorFunction(x: number, y: number) {
    yield await 1;
    yield await 2;
    yield 3;
    yield x;
    return y * 2;
  }
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

  it("Substitutes dots for slashes", async () => {
    const result = await nsoap(app, "nested/namespace/binary(10,20)", [], { useSlash: true });
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

  it("Invokes a generator function", async () => {
    const result = await nsoap(app, "generatorFunction(10,20)");
    result.should.equal(40);
  });

  it("Invokes an async generator function", async () => {
    const result = await nsoap(app, "asyncGeneratorFunction(10,20)");
    result.should.equal(40);
  });

  it("Calls modifyHandler() before all member access", async () => {
    let counter = 0;
    const result = await nsoap(app, "chainAdder1(10).chainAdder2(20)", [], {
      modifyHandler(key: string, i: number) {
        counter++;
        return i;
      }
    });
    result.should.equal(30);
    counter.should.equal(2);
  });

  it("Calls onNextValue() every time a generator yields", async () => {
    let sum = 0;
    const result = await nsoap(app, "generatorFunction(10,20)", [], {
      onNextValue(i: number) {
        sum += i;
      }
    });
    result.should.equal(40);
    sum.should.equal(16);
  });

  it("Calls onNextValue() every time an async generator yields", async () => {
    let sum = 0;
    const result = await nsoap(app, "asyncGeneratorFunction(10,20)", [], {
      onNextValue(i: number) {
        sum += i;
      }
    });
    result.should.equal(40);
    sum.should.equal(16);
  });
});
