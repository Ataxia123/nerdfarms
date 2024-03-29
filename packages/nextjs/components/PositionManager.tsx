import { useState } from "react";
import { Button, Table } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

const PositionManager = (props: any) => {
  const { positionId, position, pendingReward, pool } = props;

  //parse pending reward into number with 18 decimals

  const liquidityPool = pool ? pool.toString() : "notFound";

  const parsedPendingReward = pendingReward > 0 ? ethers.utils.formatUnits(pendingReward, 18) : "notFound";

  console.log("POSITIONMANAGER", positionId, position);

  // Result: ["0x69eF61AFc3AA356e1ac97347119d75cBdAbEF534", 1, 16969625, 481551, 0]
  //   {
  //     "components": [
  //       { "internalType": "address", "name": "uniqueOwner", "type": "address" },
  //       { "internalType": "uint256", "name": "setupIndex", "type": "uint256" },
  //       { "internalType": "uint256", "name": "creationBlock", "type": "uint256" },
  //       { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
  //       { "internalType": "uint256", "name": "reward", "type": "uint256" }
  return (
    <div>
      <h1>Position Manager</h1>
      <p>Position ID: {positionId}</p>
      <p>Position: {position ? position.toString() : "notFound"}</p>
      <p>Liquidity Pool: {liquidityPool}</p>
      <p>Pending Reward: {pendingReward ? parsedPendingReward : "notFound"} OS</p>
    </div>
  );
};

export default PositionManager;
