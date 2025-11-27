import { AuthClient } from "@icp-sdk/auth/client";
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";

const createAuthClient = (): Promise<AuthClient> =>
  AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  });

const createClient = async (): Promise<{
  agent: HttpAgent;
  user: Principal;
}> => {
  const authClient = await createAuthClient();

  const agent = await HttpAgent.create({
    host: "https://icp-api.io",
    identity: authClient.getIdentity(),
  });

  return {
    agent,
    user: authClient.getIdentity().getPrincipal(),
  };
};

const transfer = async ({
  ledgerCanisterId,
  owner,
  amount,
  fee,
}: {
  ledgerCanisterId: string;
  owner: string;
  amount: bigint;
  fee?: bigint;
}) => {
  const { agent } = await createClient();

  const { transfer } = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerCanisterId),
  });

  await transfer({
    to: { owner: Principal.fromText(owner), subaccount: [] },
    amount,
    fee,
  });
};

console.log("************** Hello transfer ****************");

(async () => {
  await transfer({
    ledgerCanisterId: "LEDGER_ID",
    owner: "DESTINATION_ACCOUNT_PRINCIPAL",
    amount: 1234n,
  });
})();
