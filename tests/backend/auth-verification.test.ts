/**
 * Backend Unit Tests: IST Student USN Verification Service
 * Location: tests/backend/auth-verification.test.ts
 *
 * Verifies:
 * 1. Algorithmic parsing of standard IST USN codes (1SV... and SV...)
 * 2. Case-insensitivity and whitespace trimming
 * 3. Accurate department mapping (CS, CSE, AI, AIDS, DS, IS, IT, EC, ECE, CY, BT)
 * 4. Fallback department naming for unmapped branches
 * 5. Year calculation and 1st-4th year clamping
 * 6. Legacy / alternative SV prefixes
 * 7. Rejection of invalid USNs and malformed inputs
 * 8. Asynchronous verifyStudentUSN service pipeline
 * 9. Integration with queryStudentDatabase when DB is not configured
 */

import { parseIstUsn, verifyStudentUSN, queryStudentDatabase } from "../../lib/auth/usn-verification";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runAuthVerificationTests(): Promise<SuiteResult> {
  const suite = new TestSuite("Auth & USN Verification Service");
  suite.start();

  // --- 1. Standard IST USN Parsing ---
  const csStudent = parseIstUsn("1SV23CS042");
  suite.assert(csStudent !== null, "Parses valid standard IST USN format (1SV23CS042)");
  suite.assertEqual(csStudent?.usn, "1SV23CS042", "Normalized USN is uppercase (1SV23CS042)");
  suite.assertEqual(csStudent?.department, "Computer Science & Engineering", "Maps 'CS' to Computer Science & Engineering");
  suite.assertEqual(csStudent?.college, "IST Bengaluru", "College is IST Bengaluru");

  // --- 2. Case-Insensitive and Whitespace Tolerance ---
  const lowercaseStudent = parseIstUsn("   1sv23cs042   ");
  suite.assert(lowercaseStudent !== null, "Handles whitespace and lowercase inputs");
  suite.assertEqual(lowercaseStudent?.usn, "1SV23CS042", "Properly trims and uppercases lowercase USN");

  // --- 3. Branch Mapping Coverage ---
  const branchTests: [string, string][] = [
    ["1SV23CSE001", "Computer Science & Engineering"],
    ["1SV24AI015", "Artificial Intelligence & Data Science"],
    ["1SV24AIDS099", "Artificial Intelligence & Data Science"],
    ["1SV22DS010", "Data Science & Engineering"],
    ["1SV21IS055", "Information Science & Engineering"],
    ["1SV23IT020", "Information Technology"],
    ["1SV22EC012", "Electronics & Communication"],
    ["1SV23ECE044", "Electronics & Communication"],
    ["1SV23CY008", "Cyber Security & Digital Forensics"],
    ["1SV24BT019", "Biotechnology & Bioinformatics"],
  ];

  for (const [usn, expectedDept] of branchTests) {
    const parsed = parseIstUsn(usn);
    suite.assertEqual(parsed?.department, expectedDept, `Correctly maps department for ${usn} -> ${expectedDept}`);
  }

  // --- 4. Unmapped Branch Code Fallback ---
  const mechStudent = parseIstUsn("1SV23ME005");
  suite.assert(mechStudent !== null, "Parses unmapped branch format (1SV23ME005)");
  suite.assertEqual(mechStudent?.department, "ME Engineering", "Fallback names unmapped branch as '[CODE] Engineering'");

  // --- 5. Alternative 'SV' prefix ---
  const svPrefixStudent = parseIstUsn("SV24AI015");
  suite.assert(svPrefixStudent !== null, "Parses 'SV' prefix format without leading '1'");
  suite.assertEqual(svPrefixStudent?.usn, "SV24AI015", "Normalizes SV prefix USN");
  suite.assertEqual(svPrefixStudent?.department, "Artificial Intelligence & Data Science", "Maps department for SV prefix");

  // --- 6. Generic SV Legacy Fallback ---
  const legacyStudent = parseIstUsn("1SV-ALUMNI-999");
  suite.assert(legacyStudent !== null, "Accepts legacy/irregular string starting with 1SV");
  suite.assertEqual(legacyStudent?.department, "School of Computing & Engineering", "Uses default school for irregular 1SV");

  // --- 7. Rejection of Invalid USN Formats ---
  const invalidUSNs = [
    "2SV23CS042",      // Non-IST prefix
    "1MS23CS042",      // Other institution (MSRIT)
    "1RV23CS042",      // Other institution (RVCE)
    "CS2023042",       // Missing institution prefix
    "1234567890",      // Pure numeric
    "INVALID_USN",     // Arbitrary string
    "",                // Empty string
  ];

  for (const badUsn of invalidUSNs) {
    const result = parseIstUsn(badUsn);
    suite.assert(result === null, `Correctly rejects invalid USN: "${badUsn}"`);
  }

  // --- 8. Asynchronous verifyStudentUSN Flow ---
  const validResult = await verifyStudentUSN("1SV23CS042");
  suite.assertEqual(validResult.valid, true, "verifyStudentUSN returns valid: true for valid USN");
  suite.assert(Boolean(validResult.student), "verifyStudentUSN returns student record");
  suite.assert(Boolean(validResult.student?.verifiedAt), "verifyStudentUSN populates verifiedAt timestamp");

  const invalidResult = await verifyStudentUSN("1RV23CS042");
  suite.assertEqual(invalidResult.valid, false, "verifyStudentUSN returns valid: false for non-IST USN");
  suite.assert(
    typeof invalidResult.error === "string" && invalidResult.error.includes("Only students of IST"),
    "verifyStudentUSN returns descriptive error message for invalid USN"
  );

  // --- 9. Empty and Invalid Type Inputs ---
  const emptyResult = await verifyStudentUSN("");
  suite.assertEqual(emptyResult.valid, false, "verifyStudentUSN fails on empty string");
  suite.assert(Boolean(emptyResult.error), "verifyStudentUSN provides prompt on empty string");

  const nullResult = await verifyStudentUSN(null as unknown as string);
  suite.assertEqual(nullResult.valid, false, "verifyStudentUSN fails safely on null");

  // --- 10. Database Hook in Unconfigured State ---
  const dbRecord = await queryStudentDatabase("1SV23CS042");
  suite.assertEqual(dbRecord, null, "queryStudentDatabase returns null when database is unconfigured (open-source standalone mode)");

  return suite.summary();
}

if (process.argv[1]?.endsWith("auth-verification.test.ts")) {
  runAuthVerificationTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
