import { useDeployedPoolInfo } from "./useDeployedPoolInfo";
import type { Abi } from "abitype";
import { BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in deployed contract contract abi, address automatically
 * @param contractName - deployed contract name
 * @param functionName - name of the function to be called
 * @param args - args to be passed to the function call
 * @param readConfig - extra wagmi configuration
 */
export const useScaffoldPoolRead = <TReturn extends BigNumber | string | boolean = any>(
  contractAddress: string,
  functionName: string,
  args?: any[],
  readConfig?: Parameters<typeof useContractRead>[0],
) => {
  const configuredChain = getTargetNetwork();
  const { data: deployedPoolData } = useDeployedPoolInfo(contractAddress);

  return useContractRead({
    chainId: configuredChain.id,
    functionName,
    address: contractAddress,
    abi: deployedPoolData?.abi as Abi,
    watch: true,
    args,
    ...readConfig,
  }) as Omit<ReturnType<typeof useContractRead>, "data"> & {
    data: TReturn;
  };
};
