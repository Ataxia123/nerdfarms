import { useDeployedERC20Info } from "./useDeployedERC20Info";
import { utils } from "ethers";
import { useContractWrite, useNetwork } from "wagmi";
import { getParsedEthersError } from "~~/components/scaffold-eth/Contract/utilsContract";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractWrite hook(with config prepared by usePrepareContractWrite hook) which loads in deployed contract abi and address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param args - arguments for the function
 * @param value - value in ETH that will be sent with transaction
 */
export const useScaffoldERCWrite = (tokenAddress: string, functionName: string, args?: any[], value?: string) => {
  const contractName = "Erc20";
  const configuredChain = getTargetNetwork();
  const { data: deployedERC20Data } = useDeployedERC20Info(tokenAddress);
  const { chain } = useNetwork();
  const writeTx = useTransactor();

  const wagmiContractWrite = useContractWrite({
    mode: "recklesslyUnprepared",
    chainId: configuredChain.id,
    address: tokenAddress,
    abi: deployedERC20Data?.abi,
    args,
    functionName,
    overrides: {
      value: value ? utils.parseEther(value) : undefined,
    },
  });

  const sendContractWriteTx = async () => {
    if (!deployedERC20Data) {
      notification.error("Target Contract is not deployed, did you forgot to run `yarn deploy`?");
      return;
    }
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== configuredChain.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (wagmiContractWrite.writeAsync) {
      try {
        await writeTx(wagmiContractWrite.writeAsync());
      } catch (e: any) {
        const message = getParsedEthersError(e);
        notification.error(message);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  return {
    ...wagmiContractWrite,
    // Overwrite wagmi's write async
    writeAsync: sendContractWriteTx,
  };
};
