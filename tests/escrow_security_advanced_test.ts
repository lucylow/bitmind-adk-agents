import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals, assert } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

/**
 * Advanced Security Tests for Escrow Contract
 * Following Stacks and Hiro best practices
 * 
 * Test Categories:
 * 1. Authorization & Access Control
 * 2. Edge Cases & Boundary Conditions
 * 3. Reentrancy Prevention (Clarity built-in)
 * 4. Token Transfer Safety
 * 5. State Consistency
 * 6. Emergency Controls (Pause/Unpause)
 */

// ============================================
// 1. AUTHORIZATION TESTS
// ============================================

Clarinet.test({
  name: "Security: Unauthorized user cannot release funds",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;
    const attacker = accounts.get("wallet_4")!;

    const invoiceId = 100;
    const amount = 5000000;

    // Setup: Create and fund invoice
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(amount), types.principal(payer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(amount),
          types.principal(payer.address),
          types.principal(`${deployer.address}.escrow-secure`),
        ],
        payer.address
      ),
      Tx.contractCall("escrow-secure", "deposit-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // Attack: Unauthorized user tries to release funds
    block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "release-funds", [types.uint(invoiceId)], attacker.address),
    ]);

    // Should fail with ERR-NOT-ARBITER-OR-PAYER
    block.receipts[0].result.expectErr().expectUint(104);
  },
});

Clarinet.test({
  name: "Security: Arbiter can release funds (authorized)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 101;
    const amount = 3000000;

    // Setup
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(amount), types.principal(payer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(amount),
          types.principal(payer.address),
          types.principal(`${deployer.address}.escrow-secure`),
        ],
        payer.address
      ),
      Tx.contractCall("escrow-secure", "deposit-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // Arbiter releases funds (should succeed)
    block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "release-funds", [types.uint(invoiceId)], arbiter.address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    // Verify payee received funds
    const balance = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(payee.address)],
      payee.address
    );
    balance.result.expectOk().expectUint(amount);
  },
});

// ============================================
// 2. EDGE CASES & BOUNDARY CONDITIONS
// ============================================

Clarinet.test({
  name: "Edge Case: Cannot create invoice with zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 200;

    const block = chain.mineBlock([
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(0), // ZERO amount
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);

    // Should fail with ERR-INVALID-AMOUNT
    block.receipts[0].result.expectErr().expectUint(110);
  },
});

Clarinet.test({
  name: "Edge Case: Cannot create invoice with excessive amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 201;
    const hugeAmount = 999999999999999; // Exceeds MAX-INVOICE-AMOUNT

    const block = chain.mineBlock([
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(hugeAmount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);

    // Should fail with ERR-INVALID-AMOUNT
    block.receipts[0].result.expectErr().expectUint(110);
  },
});

Clarinet.test({
  name: "Edge Case: Cannot create duplicate invoice ID",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 202;
    const amount = 1000000;

    // Create first invoice
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Try to create second invoice with same ID
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId), // DUPLICATE ID
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);

    // Should fail with ERR-INVOICE-EXISTS
    block.receipts[0].result.expectErr().expectUint(100);
  },
});

// ============================================
// 3. STATE CONSISTENCY TESTS
// ============================================

Clarinet.test({
  name: "State: Cannot release funds from unfunded invoice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 300;
    const amount = 2000000;

    // Create invoice but DON'T fund it
    let block = chain.mineBlock([
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Try to release funds without funding
    block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // Should fail with ERR-NO-FUNDS
    block.receipts[0].result.expectErr().expectUint(103);
  },
});

Clarinet.test({
  name: "State: Invoice status transitions correctly through lifecycle",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 301;
    const amount = 4000000;

    // Step 1: Create invoice - status should be OPEN (0)
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(amount), types.principal(payer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);

    let invoice = chain.callReadOnlyFn(
      "escrow-secure",
      "get-invoice",
      [types.uint(invoiceId)],
      payer.address
    );
    let invoiceData = invoice.result.expectOk().expectTuple();
    assertEquals(invoiceData['status'], types.uint(0)); // STATUS-OPEN

    // Step 2: Fund invoice - status should be FUNDED (1)
    block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(amount),
          types.principal(payer.address),
          types.principal(`${deployer.address}.escrow-secure`),
        ],
        payer.address
      ),
      Tx.contractCall("escrow-secure", "deposit-funds", [types.uint(invoiceId)], payer.address),
    ]);

    invoice = chain.callReadOnlyFn(
      "escrow-secure",
      "get-invoice",
      [types.uint(invoiceId)],
      payer.address
    );
    invoiceData = invoice.result.expectOk().expectTuple();
    assertEquals(invoiceData['status'], types.uint(1)); // STATUS-FUNDED

    // Step 3: Release funds - status should be RELEASED (2)
    block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);

    invoice = chain.callReadOnlyFn(
      "escrow-secure",
      "get-invoice",
      [types.uint(invoiceId)],
      payer.address
    );
    invoiceData = invoice.result.expectOk().expectTuple();
    assertEquals(invoiceData['status'], types.uint(2)); // STATUS-RELEASED
  },
});

// ============================================
// 4. TOKEN TRANSFER SAFETY
// ============================================

Clarinet.test({
  name: "Safety: Contract balance updates correctly after all operations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 400;
    const amount = 6000000;
    const escrowPrincipal = `${deployer.address}.escrow-secure`;

    // Initial escrow balance should be 0
    let balance = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(escrowPrincipal)],
      deployer.address
    );
    balance.result.expectOk().expectUint(0);

    // Create, fund, and release
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(amount), types.principal(payer.address)],
        deployer.address
      ),
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(amount),
          types.principal(payer.address),
          types.principal(escrowPrincipal),
        ],
        payer.address
      ),
      Tx.contractCall("escrow-secure", "deposit-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // Escrow should hold the amount
    balance = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(escrowPrincipal)],
      deployer.address
    );
    balance.result.expectOk().expectUint(amount);

    // Release funds
    block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // Escrow balance should be back to 0
    balance = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(escrowPrincipal)],
      deployer.address
    );
    balance.result.expectOk().expectUint(0);

    // Payee should have the full amount
    balance = chain.callReadOnlyFn(
      "mock-token",
      "get-balance",
      [types.principal(payee.address)],
      deployer.address
    );
    balance.result.expectOk().expectUint(amount);
  },
});

// ============================================
// 5. EMERGENCY CONTROLS (GOVERNANCE)
// ============================================

Clarinet.test({
  name: "Governance: Contract pause prevents new invoices",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 500;
    const amount = 1000000;

    // Admin proposes pause
    let block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "propose-pause", [], deployer.address),
    ]);
    const actionId = block.receipts[0].result.expectOk().expectUint();

    // Admin approves pause (needs 2 approvals including proposer)
    block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "approve-pause", [types.uint(actionId)], deployer.address),
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Try to create invoice while paused
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
    ]);

    // Should fail with ERR-CONTRACT-PAUSED
    block.receipts[0].result.expectErr().expectUint(107);
  },
});

Clarinet.test({
  name: "Governance: Only admins can pause contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const attacker = accounts.get("wallet_4")!;

    // Non-admin tries to propose pause
    const block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "propose-pause", [], attacker.address),
    ]);

    // Should fail with ERR-NOT-ADMIN
    block.receipts[0].result.expectErr().expectUint(108);
  },
});

// ============================================
// 6. PROPERTY-BASED TESTS (Invariants)
// ============================================

Clarinet.test({
  name: "Property: Total tokens in system remain constant",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const payer = accounts.get("wallet_1")!;
    const payee = accounts.get("wallet_2")!;
    const arbiter = accounts.get("wallet_3")!;

    const invoiceId = 600;
    const amount = 7000000;
    const escrowPrincipal = `${deployer.address}.escrow-secure`;

    // Mint tokens - total supply increases
    let block = chain.mineBlock([
      Tx.contractCall(
        "mock-token",
        "mint",
        [types.uint(amount), types.principal(payer.address)],
        deployer.address
      ),
    ]);

    // Check total: payer balance + escrow balance + payee balance should equal minted amount
    const getTotalBalance = () => {
      const payerBal = chain.callReadOnlyFn(
        "mock-token",
        "get-balance",
        [types.principal(payer.address)],
        deployer.address
      ).result.expectOk() as any;

      const escrowBal = chain.callReadOnlyFn(
        "mock-token",
        "get-balance",
        [types.principal(escrowPrincipal)],
        deployer.address
      ).result.expectOk() as any;

      const payeeBal = chain.callReadOnlyFn(
        "mock-token",
        "get-balance",
        [types.principal(payee.address)],
        deployer.address
      ).result.expectOk() as any;

      return Number(payerBal.value) + Number(escrowBal.value) + Number(payeeBal.value);
    };

    // After mint: total should equal amount
    assertEquals(getTotalBalance(), amount);

    // Create and fund invoice
    block = chain.mineBlock([
      Tx.contractCall(
        "escrow-secure",
        "create-invoice",
        [
          types.uint(invoiceId),
          types.principal(payee.address),
          types.uint(amount),
          types.principal(`${deployer.address}.mock-token`),
          types.principal(arbiter.address),
          types.uint(99999999),
          types.none(),
        ],
        payer.address
      ),
      Tx.contractCall(
        "mock-token",
        "transfer",
        [
          types.uint(amount),
          types.principal(payer.address),
          types.principal(escrowPrincipal),
        ],
        payer.address
      ),
      Tx.contractCall("escrow-secure", "deposit-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // After funding: total should still equal amount
    assertEquals(getTotalBalance(), amount);

    // Release funds
    block = chain.mineBlock([
      Tx.contractCall("escrow-secure", "release-funds", [types.uint(invoiceId)], payer.address),
    ]);

    // After release: total should STILL equal amount (conservation of tokens)
    assertEquals(getTotalBalance(), amount);
  },
});

console.log("✅ All advanced security tests defined");



