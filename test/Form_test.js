import { createSandbox } from "./test_utils";

describe("Form", () => {
    let sandbox;

    beforeEach(() => {
        sandbox = createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });
});
