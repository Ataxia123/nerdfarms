import { useEffect, useState } from "react";
import { getTargetNetwork } from "../../utils/scaffold-eth";
import { useProvider } from "wagmi";

type GeneratedContractType = {
  address: string;
  abi: any[];
};

/**
 * @dev use this hook to get a deployed contract from `yarn deploy` generated files.
 * @param contractAddress - address if deoployed pool
 * @returns {GeneratedContractType | undefined} object containing contract address and abi or undefined if contract is not found
 */

export const useDeployedPoolInfo = (contractAddress: string | undefined | null) => {
  const configuredChain = getTargetNetwork();
  const contractName = "UniswapV3Pool";
  const [deployedPoolData, setDeployedPoolData] = useState<undefined | GeneratedContractType>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const provider = useProvider({ chainId: configuredChain.id });

  useEffect(() => {
    const getDeployedContractInfo = async () => {
      setIsLoading(true);
      let ContractData;
      try {
        ContractData = require("~~/contracts/hardhat_contracts.json");

        const contractsAtChain = ContractData[configuredChain.id as keyof typeof ContractData];
        const contractsData = contractsAtChain?.[0]?.contracts;
        const deployedContract = contractsData?.[contractName as keyof typeof contractsData];

        if (!deployedContract || !contractName || !provider) {
          return;
        }
        if (!contractAddress) {
          return;
        }
        const code = await provider.getCode(contractAddress);
        // If contract code is `0x` => no contract deployed on that address
        if (code === "0x" || !contractsData || !(contractName in contractsData)) {
          return;
        }
        setDeployedPoolData(contractsData[contractName]);
      } catch (e) {
        // Contract not deployed or file doesn't exist.
        setDeployedPoolData(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    getDeployedContractInfo();
  }, [configuredChain.id, contractName, provider]);

  return { data: deployedPoolData, isLoading };
};
