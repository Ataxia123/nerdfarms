// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   makeStyles,
// } from "@material-ui/core";
// import { utils } from "ethers";
// import { ethers } from "ethers";
// import { useAccount } from "wagmi";
// import AddLiquidityForm from "~~/components/AddLiquidityForm";
// import PositionManager from "~~/components/PositionManager";
// import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
// import { UserPositions } from "~~/services/store/slices/querySlice";
// import { useAppStore } from "~~/services/store/store";

// const epochToDateAndTime = (epochTime: number) => {
//   const dateObj = new Date(epochTime * 1000);
//   const date = dateObj.toLocaleDateString();
//   const time = dateObj.toLocaleTimeString();

//   return `${date} ${time}`;
// };

// const useStyles = makeStyles(theme => ({
//   card: {
//     maxWidth: 500,
//     margin: "20px auto",
//     cursor: "pointer",
//     padding: "20px",
//     backgroundColor: "#f7f7f7",
//   },
//   header: {
//     backgroundColor: "#3f51b5",
//     color: "#fff",
//     padding: "10px 20px",
//     textAlign: "center",
//   },
//   content: {
//     padding: "20px",
//   },
//   table: {
//     margin: "10px auto",
//   },
//   tableCell: {
//     padding: "10px",
//   },
//   tableHeader: {
//     fontWeight: "bold",
//   },
// }));

// interface SetupCardProps {
//   web3: any;
//   farmingContractAddress: string;
//   children?: React.ReactNode;
// }

const SetupCard = {
  // const SetupCard: React.FC<SetupCardProps> = () =>
  //   // {
  //   //   /*//children*/
  //   // },
  //   {
  //   const { address, isConnected } = useAccount();
  //   const classes = useStyles();
  //   const router = useRouter();
  //   const [lptokenAddress, setLptokenAddress] = useState("");
  //   const [tickLower, setTickLower] = useState("0");
  //   const [tickUpper, setTickUpper] = useState("0");
  //   const [involvingETH, setInvolvingETH] = useState(false);
  //   const [mainTokenAddress, setMainTokenAddress] = useState("");
  //   const { executeQuery } = useAppStore(state => state.querySlice);
  //   const [userPositions, setUserPositions] = useState<Array<UserPositions>>([]);
  //   const [liquidity, setLiquidity] = useState(0);
  //   // @dev
  //   // name arbitrarly set in contracts.json
  //   const contractName = "FarmMainRegularMinStake";
  //   const functionName = "setup";
  //   const { pid } = router.query;
  //   const contract = useScaffoldContractRead({
  //     contractName,
  //     functionName,
  //     args: [pid],
  //   });
  //   const data = contract?.data;
  //   console.log("contract", contract);
  //   const variableNames = {
  //     startBlock: "Start Block",
  //     rewardPerBlock: "Reward per Block",
  //     totalSupply: "Total Supply",
  //     involvingEth: "Involving ETH",
  //     lpTokenAddress: "LP Token Address",
  //     MainToken: "Main Token",
  //     minStakeableAmount: "Min Stakeable Amount",
  //   };
  //   console.log("data", data);
  //   // Uses Graph Protocol to fetch existing indexed positions
  //   console.log("userPositions:", userPositions);
  //   const handleExecuteQuery = async (address: string) => {
  //     const result = await executeQuery(address);
  //     setUserPositions(result.user?.positions || []);
  //   };
  //   useEffect(() => {
  //     if (address) {
  //       handleExecuteQuery(address);
  //       console.log("account?.address:", address);
  //     }
  //   }, [address]);
  //   // Checks graph query result if user has a position else returns a string this happens when user has no position
  //   const positionId = userPositions?.length > 0 ? userPositions[0].id : null;
  //   // Get univ3 pool data
  //   const position = useScaffoldContractRead("FarmMainRegularMinStake", "position", [positionId]);
  //   const pendingReward = useScaffoldContractRead("FarmMainRegularMinStake", "calculateFreeFarmingReward", [
  //     positionId,
  //     true,
  //   ]);
  //   const tokenId = position.data?.tokenId;
  //   const pool = useScaffoldContractRead("UniswapV3NonfungiblePositionManagerABI", "positions", [tokenId]);
  //   console.log("POOL", pool.data ? pool.data.liquidity.toString() : "notFound");
  //   //parse pending reward into number with 18 decimals
  //   const liquidityPool = pool.data ? pool.data.liquidity.toString() : "notFound";
  //   console.log("POSITIONMANAGER", positionId, position);
  //   useEffect(() => {
  //     if (data) {
  //       setLptokenAddress(data.lpTokenAddress);
  //       setTickLower(data.tickLower);
  //       setTickUpper(data.tickUpper);
  //       setInvolvingETH(data.involvingEth);
  //       setMainTokenAddress(data.MainToken);
  //     }
  //   }, [data]);
  //   return (
  //     <Card className={classes.card}>
  //       <CardHeader className={classes.header} title="Data" />
  //       <CardContent className={classes.content}>
  //         {data && (
  //           <TableContainer component={Paper}>
  //             <Table className={classes.table} aria-label="simple table">
  //               <TableHead>
  //                 <TableRow>
  //                   <TableCell className={classes.tableHeader}>Variable Name</TableCell>
  //                   <TableCell className={classes.tableHeader}>Value</TableCell>
  //                 </TableRow>
  //               </TableHead>
  //               <TableBody>
  //                 {Object.entries(variableNames).map(([key, value]) => (
  //                   <TableRow key={key}>
  //                     <TableCell className={classes.tableCell} component="th" scope="row">
  //                       {value}
  //                     </TableCell>
  //                     <TableCell className={classes.tableCell}>{data[key]}</TableCell>
  //                   </TableRow>
  //                 ))}
  //               </TableBody>
  //             </Table>
  //           </TableContainer>
  //         )}
  //         <Typography variant="body2" component="p">
  //           {children}
  //         </Typography>
  //       </CardContent>
  //       <PositionManager
  //         positionId={positionId}
  //         liquidityPool={liquidityPool}
  //         pendingReward={pendingReward}
  //         position={position}
  //         pool={pool}
  //       />
  //       <AddLiquidityForm
  //         lptokenAddress={lptokenAddress}
  //         tickLower={tickLower}
  //         tickUpper={tickUpper}
  //         involvingETH={involvingETH}
  //         mainTokenAddress={mainTokenAddress}
  //         positionId={positionId}
  //         pool={pool}
  //       />
  //     </Card>
  //   );
};

export default SetupCard;
