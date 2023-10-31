# signals
Signal - is a simple lib with realization of Signal with relative helpers.

## Installation:
As a dependency in your npm package:
- `npm install @hlobka/signals`

Examples:
- Simple Signal example:
  - ```typescript
    const signal = new Signal<string>();
    let signalResult = "no result";
    signal.add(value => {
        signalResult = value;
    }, this);
    signal.emit("Hello World");
    console.log("signal triggered with: ", signalResult);
    ```
- Async Signal:
  - ```TypeScript
    const signal = new Signal<string>();
    setTimeout(() => {
      signal.emit("Hello World");
    }, 10);
    const promiseResult = await signal.promise();
    console.log("signal triggered with: ", promiseResult);```
- Filter
  - ```TypeScript
    const signal = new Signal<string>();
    setTimeout(() => {
        signal.emit("UnExpected Signal");
        signal.emit("Expected Signal");
    }, 10);
    const promiseResult = await signal
      .filter(payload => payload == "Expected Signal")
      .promise();
    console.log("signal triggered with: ", promiseResult);```
