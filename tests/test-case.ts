export interface ITestCase {
  reason?: string;
  [x: string]: any;
}

export function testCase<T extends ITestCase>(cases: T[], callback: (c: T) => void) {
  cases.forEach((c, i) => {
    c.reason = `case #(${i + 1})${c.reason ? ` - ${c.reason}` : ""}`;
    callback(c);
  });
}
