import { forTestPurposesOnly } from "./Controllers/Orgs.js";

test("This should return hello", () => {
    expect(forTestPurposesOnly()).toBe(1);
});
