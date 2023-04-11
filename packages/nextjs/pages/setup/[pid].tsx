import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Link,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from "@mui/material";
import { BigNumber, ethers, utils } from "ethers";
import { useAccount } from "wagmi";
import AddLiquidityForm from "~~/components/AddLiquidityForm";
import PositionManager from "~~/components/PositionManager";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { UserPositions } from "~~/services/store/slices/querySlice";
import { useAppStore } from "~~/services/store/store";

const epochToDateAndTime = (epochTime: number) => {
  const dateObj = new Date(epochTime * 1000);
  const date = dateObj.toLocaleDateString();
  const time = dateObj.toLocaleTimeString();

  return `${date} ${time}`;
};

interface SetupCardProps {
  web3: any;
  farmingContractAddress: string;
  children?: React.ReactNode;
}
type FarmingSetup = {
  infoIndex: BigNumber;
  active: boolean;
  startBlock: BigNumber;
  endBlock: BigNumber;
  lastUpdateBlock: BigNumber;
  deprecatedObjectId: BigNumber;
  rewardPerBlock: BigNumber;
  totalSupply: BigNumber;
};

type FarmingSetupInfo = {
  blockDuration: BigNumber;
  startBlock: BigNumber;
  originalRewardPerBlock: BigNumber;
  minStakeable: BigNumber;
  renewTimes: BigNumber;
  liquidityPoolTokenAddress: string;
  mainTokenAddress: string;
  involvingETH: boolean;
  setupsCount: BigNumber;
  lastSetupIndex: BigNumber;
  tickLower: number;
  tickUpper: number;
};

type FarmingSetupResult = [FarmingSetup, FarmingSetupInfo];

const SetupCard: React.FC<SetupCardProps> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [lptokenAddress, setLptokenAddress] = useState("");
  const [tickLower, setTickLower] = useState("0");
  const [tickUpper, setTickUpper] = useState("0");
  const [involvingETH, setInvolvingETH] = useState(false);
  const [mainTokenAddress, setMainTokenAddress] = useState("");
  const { executeQuery } = useAppStore(state => state.querySlice);
  const [userPositions, setUserPositions] = useState<Array<UserPositions>>([]);
  const [liquidity, setLiquidity] = useState(0);
  const [displayData, setDisplayData] = useState<any>({});
  // @dev
  // name arbitrarly set in contracts.json
  const contractName = "FarmMainRegularMinStake";
  const functionName = "setup";
  const { pid } = router.query;

  function isFarmingSetupResult(value: any): value is FarmingSetupResult {
    return Array.isArray(value) && value.length === 2 && "active" in value[0] && "blockDuration" in value[1];
  }

  const { data, error, refetch } = useScaffoldContractRead<"FarmMainRegularMinStake", "setup">({
    contractName: "FarmMainRegularMinStake",
    functionName: "setup",
    args: [ethers.BigNumber.from(pid)], // Replace with the actual arguments for the function
  });
  useEffect(() => {
    if (isFarmingSetupResult(data)) {
      // Destructure the result into FarmingSetup and FarmingSetupInfo
      const [farmingSetup, farmingSetupInfo] = data;
      const displayData = {
        startBlock: epochToDateAndTime(
          farmingSetup.startBlock ? Number(utils.formatEther(farmingSetup.startBlock)) : 0,
        ),
        rewardPerBlock: utils.formatEther(farmingSetup.rewardPerBlock?.toString() || "0"),
        totalSupply: utils.formatEther(farmingSetup.totalSupply?.toString() || "0"),
        involvingEth: farmingSetupInfo.involvingETH ? farmingSetupInfo.involvingETH : farmingSetupInfo.involvingETH,
        lpTokenAddress: farmingSetupInfo.liquidityPoolTokenAddress,
        MainToken: farmingSetupInfo.mainTokenAddress,
        minStakeableAmount: utils.formatEther(farmingSetupInfo.minStakeable?.toString() || "0"),
        tickLower: farmingSetupInfo.tickLower,
        tickUpper: farmingSetupInfo.tickUpper,
      };

      setDisplayData(displayData);

      // Now you can access the properties without TypeScript errors
      console.log("DISPLAYDATA", displayData);
    } else {
      // Handle the case when the result is not of the expected type
      console.error("Unexpected result type");
    }
  }, [data]);
  const variableNames = {
    startBlock: "Start Block",
    rewardPerBlock: "Reward per Block",
    totalSupply: "Total Supply",
    involvingEth: "Involving ETH",
    lpTokenAddress: "LP Token Address",
    MainToken: "Main Token",
    minStakeableAmount: "Min Stakeable Amount",
    tickLower: "Tick Lower",
    tickUpper: "Tick Upper",
  };
  // Uses Graph Protocol to fetch existing indexed positions
  console.log("userPositions:", userPositions);
  const handleExecuteQuery = async (address: string) => {
    const result = await executeQuery(address);
    setUserPositions(result.user?.positions || []);
  };
  useEffect(() => {
    if (address) {
      handleExecuteQuery(address);
      console.log("account?.address:", address);
    }
  }, [address]);
  // Checks graph query result if user has a position else returns a string this happens when user has no position
  const positionId = userPositions?.length > 0 ? userPositions[0].id : 0;
  // Get univ3 pool data
  // Get univ3 pool data
  const {
    data: claimData,
    error: claimError,
    refetch: claimRefetch,
  } = useScaffoldContractRead<"FarmMainRegularMinStake", "calculateFreeFarmingReward">({
    contractName: "FarmMainRegularMinStake",
    functionName: "calculateFreeFarmingReward",
    args: [ethers.BigNumber.from(positionId), true], // Replace with the actual arguments for the function
  });
  const {
    data: posData,
    error: posError,
    refetch: posRefetch,
  } = useScaffoldContractRead<"FarmMainRegularMinStake", "position">({
    contractName: "FarmMainRegularMinStake",
    functionName: "position",
    args: [ethers.BigNumber.from(positionId)], // Replace with the actual arguments for the function
  });

  console.log("Pool", posData);
  const tokenId = posData ? posData.tokenId.toString() : 0;

  const {
    data: pool,
    error: poolerror,
    refetch: poolRefetch,
  } = useScaffoldContractRead<"UniswapV3NonfungiblePositionManagerABI", "positions">({
    contractName: "UniswapV3NonfungiblePositionManagerABI",
    functionName: "positions",
    args: [ethers.BigNumber.from(tokenId)], // Replace with the actual arguments for the function
  });
  useEffect(() => {
    if (displayData) {
      setLptokenAddress(displayData.lpTokenAddress);
      setTickLower(displayData.tickLower);
      setTickUpper(displayData.tickUpper);
      setInvolvingETH(displayData.involvingEth);
      setMainTokenAddress(displayData.MainToken);
    }
  }, [displayData]);

  return (
    <Card>
      <CardHeader title="Data" />
      <CardContent>
        {data && (
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Variable Name</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(variableNames).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row">
                      {value}
                    </TableCell>
                    <TableCell>{displayData[key]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Typography variant="body2" component="p">
          {children}
        </Typography>
      </CardContent>
      <PositionManager
        positionId={positionId}
        liquidityPool={pool}
        pendingReward={claimData}
        position={posData}
        pool={pool}
      />
      <AddLiquidityForm
        lptokenAddress={lptokenAddress}
        tickLower={tickLower}
        tickUpper={tickUpper}
        involvingETH={involvingETH}
        mainTokenAddress={mainTokenAddress}
        positionId={positionId}
        pool={pool}
      />
    </Card>
  );
};
export default SetupCard;
