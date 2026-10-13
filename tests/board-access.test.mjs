import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BOARD_ACCOUNTS,
  getBoardAccount,
  isBoardUser,
} from "../lib/auth/board-accounts.ts";

test("exactly five distinct accounts can access the board", () => {
  assert.equal(BOARD_ACCOUNTS.length, 5);
  assert.equal(new Set(BOARD_ACCOUNTS.map(({ email }) => email)).size, 5);
  for (const { email } of BOARD_ACCOUNTS) {
    assert.equal(
      isBoardUser({ email, app_metadata: { narfid_board_member: true } }),
      true,
    );
  }
});

test("missing and unrelated authenticated users are denied", () => {
  assert.equal(isBoardUser(null), false);
  assert.equal(isBoardUser(undefined), false);
  assert.equal(
    isBoardUser({
      email: "visitor@nerfed.example",
      app_metadata: { narfid_board_member: true },
    }),
    false,
  );
});

test("email alone or client-editable user metadata cannot grant access", () => {
  const email = BOARD_ACCOUNTS[0].email;
  assert.equal(isBoardUser({ email }), false);
  assert.equal(
    isBoardUser({ email, user_metadata: { narfid_board_member: true } }),
    false,
  );
  assert.equal(
    isBoardUser({ email, app_metadata: { narfid_board_member: "true" } }),
    false,
  );
});

test("revoking administrator-managed membership denies future checks", () => {
  const user = {
    email: BOARD_ACCOUNTS[0].email,
    app_metadata: { narfid_board_member: true },
  };
  assert.equal(isBoardUser(user), true);
  user.app_metadata.narfid_board_member = false;
  assert.equal(isBoardUser(user), false);
});

test("email normalization does not admit lookalike domains", () => {
  assert.equal(
    getBoardAccount(" CHAIRMAN@NERFED.EXAMPLE ")?.email,
    BOARD_ACCOUNTS[0].email,
  );
  assert.equal(
    getBoardAccount("chairman@nerfed.example.attacker.com"),
    undefined,
  );
  assert.equal(getBoardAccount("chairman@nerfed-example.com"), undefined);
});
