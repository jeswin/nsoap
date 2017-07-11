import nsoap from "../nsoap";
import should from "should";

const app = {
  about: "NSOAP Test Suite"
};

function getMockHandler() {
  let result;

  return {
    then(_result) {
      result = _result;
    },
    getResult() {
      return result;
    }
  };
}

describe("NSOAP", () => {
  it("should route to a value", () => {
    const handler = getMockHandler();
    nsoap(app, "about", handler.then);
    handler.getResult().should.equal("NSOAP Test Suite");
  });
});
