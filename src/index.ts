import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { ICManagementCanister } from "@dfinity/ic-management";
import type { CanisterStatusResponse } from "@dfinity/ic-management/dist/types/types/ic-management.responses";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { SnsGovernanceCanister, SnsNeuronPermissionType } from "@dfinity/sns";
import { assertNonNullish } from "@dfinity/utils";

export { SnsGovernanceCanister } from "@dfinity/sns";

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

export const addControllerToMyNeurons = async ({
  canisterId,
  principal,
}: {
  canisterId: string;
  principal: string;
}) => {
  const { agent, user } = await createClient();

  const x = SnsGovernanceCanister.create({
    canisterId: Principal.fromText(canisterId),
    agent,
  });

  const neurons = await x.listNeurons({
    principal: user,
    limit: 1000,
  });
  neurons.forEach(async (neuron) => {
    const neuronId = neuron.id[0];
    if (neuronId) {
      await x.addNeuronPermissions({
        neuronId,
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
        ],
        principal: Principal.fromText(principal),
      });
    }
  });

  return x;
};

export const transfer = async ({
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

export const canisterStatus = async ({
  canisterId,
}: {
  canisterId: string;
}): Promise<CanisterStatusResponse> => {
  const { agent } = await createClient();

  const { canisterStatus: canisterStatusApi } = ICManagementCanister.create({
    agent,
  });

  const cId = Principal.fromText(canisterId);

  return await canisterStatusApi(cId);
};

export const addController = async ({
  canisterId,
  controllerId,
}: {
  canisterId: string;
  controllerId: string;
}): Promise<void> => {
  // Cannot happen in TypeScript but, can when used in the console if developer do not pass the appropriate parameters
  assertNonNullish(controllerId);
  assertNonNullish(canisterId);

  const { agent } = await createClient();

  const { updateSettings, canisterStatus: canisterStatusApi } =
    ICManagementCanister.create({
      agent,
    });

  const cId = Principal.fromText(canisterId);

  const {
    settings: { controllers },
  } = await canisterStatusApi(cId);

  await updateSettings({
    canisterId: cId,
    settings: {
      controllers: [...controllers.map((c) => c.toText()), controllerId],
    },
  });
};
