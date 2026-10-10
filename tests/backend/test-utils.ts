/**
 * Test Utilities and Lightweight Assertion Harness
 * ZenithenOpen Backend Test Suite
 */

export interface SuiteResult {
  name: string;
  passed: number;
  failed: number;
  failures: string[];
}

export class TestSuite {
  public name: string;
  public passed: number = 0;
  public failed: number = 0;
  public failures: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  public start(): void {
    console.log(`\n==================================================`);
    console.log(`SUITE: ${this.name}`);
    console.log(`==================================================`);
  }

  public assert(condition: boolean, description: string): void {
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      this.passed++;
    } else {
      console.error(`  ✗ [FAIL] ${description}`);
      this.failed++;
      this.failures.push(description);
    }
  }

  public assertEqual<T>(actual: T, expected: T, description: string): void {
    const condition = actual === expected;
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      this.passed++;
    } else {
      console.error(`  ✗ [FAIL] ${description} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`);
      this.failed++;
      this.failures.push(`${description} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`);
    }
  }

  public assertDeepEqual<T>(actual: T, expected: T, description: string): void {
    const condition = JSON.stringify(actual) === JSON.stringify(expected);
    if (condition) {
      console.log(`  ✓ [PASS] ${description}`);
      this.passed++;
    } else {
      console.error(`  ✗ [FAIL] ${description} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`);
      this.failed++;
      this.failures.push(`${description} (Deep equality mismatch)`);
    }
  }

  public summary(): SuiteResult {
    console.log(`--------------------------------------------------`);
    console.log(`Suite [${this.name}]: ${this.passed} passed, ${this.failed} failed`);
    console.log(`--------------------------------------------------`);
    return {
      name: this.name,
      passed: this.passed,
      failed: this.failed,
      failures: this.failures,
    };
  }
}
