import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";

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

  const agent = new HttpAgent({
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
