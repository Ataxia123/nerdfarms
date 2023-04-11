import { useCallback, useEffect, useState } from "react";
import { useScaffoldERC20Read } from "./useScaffoldERC20Read";
import { useScaffoldERCWrite } from "./useScaffoldERCWrite";
import { BigNumber, ethers } from "ethers";

type UseAllowanceProps = {
  tokens: { address: string; value: BigNumber; approved: boolean }[];
  owner: string;
  spender: string;
  onAllowanceFetched: (
    updatedTokens: { address: string; value: BigNumber; allowance: BigNumber; approved: boolean }[],
  ) => void;
};

type AllowanceItem = {
  address: string;
  allowance: BigNumber;
  value: BigNumber;
  approved: boolean;
};

const useAllowance = ({ tokens, owner, spender, onAllowanceFetched }: UseAllowanceProps) => {
  const [allowance, setAllowances] = useState<AllowanceItem[]>([]);
  const allowance0 = useScaffoldERC20Read(tokens[0].address, "allowance", [owner, spender]);
  const allowance1 = useScaffoldERC20Read(tokens[1].address, "allowance", [owner, spender]);

  //console log token0 address, token1 address, spender and tokn values
  console.log("Allowance Inputs", { tokens, spender, allowance0, allowance1 });

  const fetchAllowances = useCallback(async () => {
    const allowancesPromises = tokens.map(async token => {
      const allowance = token.address === tokens[0].address ? allowance0.data : allowance1.data;
      const tokenValueInWei = ethers.utils.parseUnits(token.value.toString(), 18);
      return {
        address: token.address, // Change 'token' to 'address'
        value: token.value,

        //add allowance convert from bigNumber type to number avoid overflow
        allowance: allowance ? allowance : 0,

        approved: allowance ? allowance.gte(tokenValueInWei) : false, // Change 'approved' type from 'any' to 'boolean'
      };
    });

    const allowances = await Promise.all(allowancesPromises);
    const updatedTokens = allowances; // No need to map tokens again since we already added the 'approved' property in the first step

    onAllowanceFetched(updatedTokens);
    setAllowances(allowances);
  }, [tokens, owner, spender]);

  useEffect(() => {
    fetchAllowances();
  }, [JSON.stringify(tokens.map(token => token.value)), owner, spender]);

  console.log("Allowance Outputs", { allowance });
  return { allowance };
};

export default useAllowance;

// const [approveLoading, setApproveLoading] = useState(false);
// const onTokenApproval = useCallback(
//   async (tokenAddress:string) => {
//     setApproveLoading(true);
//     try {
//       const token = tokens.find((t) => t.address === tokenAddress);
//       if (!token) {
//         throw new Error('Token not found');
//       }

//       const index = tokens.findIndex((t) => t.address === tokenAddress);
//       const tokenValue = values[index] === null ? BigNumber.from(2).pow(256).sub(1) : values[index];

//       useScaffoldERCWrite('approve', tokenAddress, [spender, tokenValue]);
//       onApproval();

//       // Update allowance for the approved token
//       setAllowances((prevState) =>
//         prevState.map((item) =>
//           item.token === tokenAddress
//             ? { ...item, approvedAmount: tokenValue }
//             : item
//         )
//       );
//     } catch (e) {
//       throw e;
//     } finally {
//       setApproveLoading(false);
//     }
//   },
//   [tokens, spender, values, onApproval]
// );

// return { approveLoading, onTokenApproval, allowances };
