import { HttpAgent } from "@dfinity/agent";
import { SnsGovernanceCanister, SnsNeuronPermissionType } from "@dfinity/sns";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";

export { SnsGovernanceCanister } from "@dfinity/sns";

const createAuthClient = (): Promise<AuthClient> =>
  AuthClient.create({
    idleOptions: {
      disableIdle: true,
      disableDefaultIdleCallback: true,
    },
  });

export const addControllerToMyNeurons = async (canisterId: string, principal: string) => {
  const authClient = await createAuthClient();

  const agent = new HttpAgent({
    host: "https://icp-api.io",
    identity: authClient.getIdentity(),
  });

  const x = SnsGovernanceCanister.create({
    canisterId: Principal.fromText(canisterId),
    agent,
  });

  const neurons = await x.listNeurons({ principal: authClient.getIdentity().getPrincipal(), limit: 1000 });
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
