import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, FormControlLabel, Grid, TextField, Typography } from "@material-ui/core";
import { BigNumber, ethers, utils } from "ethers";
import { useAccount, useProvider } from "wagmi";
import { IntegerInput } from "~~/components/scaffold-eth/Input/IntegerInput";
import { useEthPrice, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useUniswapPool } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useAccountBalance } from "~~/hooks/scaffold-eth/useAccountBalance";
import useAllowance from "~~/hooks/scaffold-eth/useAllowance";
import { useScaffoldERCWrite } from "~~/hooks/scaffold-eth/useScaffoldERCWrite";
import { useAppStore } from "~~/services/store/store";

function AddLiquidityForm(props: any) {
  const { lptokenAddress, tickLower, tickUpper, involvingETH, mainTokenAddress, positionId, liquidityPool, pool } =
    props;
  const addressZero = ethers.constants.AddressZero;
  const [showPositionOwner, setShowPositionOwner] = useState(false);
  const { tempSlice } = useAppStore();
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [positionOwner, setPositionOwner] = useState("");
  const [amount0Min, setAmount0Min] = useState("");
  const [amount1Min, setAmount1Min] = useState("");
  const [percentageSetting, setPercentageSetting] = useState(";"); // default to 1%
  const [lastUpdatedField, setLastUpdatedField] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  // set state for bignumber
  const [approvalAmount, setApprovalAmount] = useState<BigNumber>(BigNumber.from(0));
  const [approvalAddress, setApprovalAddress] = useState("");
  // create e const for the array of token addresses, that will also contain the input value and approval state
  const [tokenAddresses, setTokenAddresses] = useState([
    { address: "", value: 0, allowance: 0, approved: false },
    { address: "", value: 0, allowance: 0, approved: false },
  ]);
  const contractName = "FarmMainRegularMinStake"; //can change name to actual name but must match contracts.
  const account = useAccount();
  const address = account?.address;
  const { balance, price, isError, onToggleBalance, isEthBalance } = useAccountBalance(account.address);
  const addr = lptokenAddress;
  const eth = useEthPrice();
  //get contract address from deployedContractInfo
  const deployedContractInfo = useDeployedContractInfo(contractName);
  const contractAddress = deployedContractInfo.data?.address;
  console.log("contractAddress:", contractAddress);
  // Get univ3 pool data
  const unipool = useUniswapPool(addr, tickLower, tickUpper, involvingETH, eth);
  console.log("unipool:", unipool);
  // Define an interface for the unipool object
  interface UnipoolData {
    cursorData: {
      currentTickPrice: string;
      formattedCursorNumber: number;
      tickCurrentUSDPrice: number;
      tickLowerUSDPrice: number;
      tickUpperUSDPrice: number;
      token0Address: string;
      token1Address: string;
    };
  }
  // Use a type assertion to cast unipool to the UnipoolData type
  const unipoolData = unipool as UnipoolData;
  // Destructure unipoolData to get each variable
  try {
    if (unipoolData.cursorData !== null) {
      const {
        cursorData,
        cursorData: {
          currentTickPrice,
          formattedCursorNumber,
          tickCurrentUSDPrice,
          tickLowerUSDPrice,
          tickUpperUSDPrice,
          token0Address,
          token1Address,
        },
      } = unipoolData;
      // Get the current price of the pool
      const price = parseFloat(currentTickPrice);
      // Set the token addresses to the state using token0Address and token1Address
      if (tokenAddresses[0].address === "") {
        setTokenAddresses([
          { address: token0Address, value: 0, allowance: 0, approved: false },
          { address: token1Address, value: 0, allowance: 0, approved: false },
        ]);
      }
      // Set the current price to the state
      if (currentPrice == 0) {
        setCurrentPrice(price);
      } else {
        console.log("currentPrice", currentPrice);
      }
    }
  } catch (e) {
    console.log("error:", e);
  }
  // Handles Inputs for tokens: Token A is derived from Token B
  const handleAmount0Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount0(e.target.value);
    setLastUpdatedField("amount0");
    if (currentPrice && !isNaN(parseFloat(e.target.value))) {
      setAmount1((parseFloat(e.target.value) * currentPrice).toString());
    }
  };
  const handleAmount1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount1(e.target.value);
    setLastUpdatedField("amount1");
    if (currentPrice && !isNaN(parseFloat(e.target.value))) {
      setAmount0((parseFloat(e.target.value) / currentPrice).toString());
    }
  };
  // Scaffold Contract Write takes contract and function + args (Touple) and should handle the transaction
  useEffect(() => {
    const calculateMinAmounts = () => {
      const amount0Value = parseFloat(amount0);
      const amount1Value = parseFloat(amount1);
      const percentage = parseFloat(percentageSetting);
      if (isNaN(amount0Value) || isNaN(amount1Value) || isNaN(percentage)) {
        // Handle invalid input values
        return;
      }
      const amount0MinValue = amount0Value - amount0Value * percentage;
      const amount1MinValue = amount1Value - amount1Value * percentage;
      // Set the minimum amount values
      setAmount0Min(amount0MinValue.toFixed(4));
      setAmount1Min(amount1MinValue.toFixed(4));
    };
    calculateMinAmounts();
  }, [amount0, amount1, percentageSetting]);
  // update the existing token info state with token 0 and token 1 with amount0 and amount1 input values avoid infinite loops
  useEffect(() => {
    if (amount0 && amount1) {
      setTokenAddresses(prev => {
        // Check if the amounts have changed before updating the state
        if (prev[0].value !== Number(amount0) || prev[1].value !== Number(amount1)) {
          const firstToken = { ...prev[0], value: Number(amount0) };
          const secondToken = { ...prev[1], value: Number(amount1) };
          return [firstToken, secondToken];
        } else {
          // If the amounts have not changed, return the previous state
          return prev;
        }
      });
    }
  }, [amount0, amount1, tokenAddresses]);
  //... use tokenAddresses to check if approved and update the staet of the token addresses
  const updateTokenAllowances = useCallback((updatedTokens: any) => {
    setTokenAddresses(updatedTokens);
  }, []);
  const { allowance } = useAllowance({
    tokens: tokenAddresses,
    owner: address ? address : "",
    spender: contractAddress ? contractAddress : "",
    onAllowanceFetched: updateTokenAllowances,
  });
  console.log("allowance", allowance);
  const isApproved = useMemo(() => {
    return tokenAddresses.every(token => token.approved);
  }, [tokenAddresses]);
  // determine which token index (approved = false)
  const tokenIndex = useMemo(() => {
    return tokenAddresses.findIndex(token => !token.approved);
  }, [tokenAddresses]);
  console.log("tokenIndex", tokenIndex);
  console.log("allowance", tokenAddresses);
  //...if approved, show add liquidity button...
  //handle add liquidity
  const functionNameToCall = positionId ? "addLiquidity" : "openPosition";

  // FarmingPositionRequest interface
  interface FarmingPositionRequest {
    setupIndex: BigNumber;
    amount0: BigNumber;
    amount1: BigNumber;
    positionOwner: string;
    amount0Min: BigNumber;
    amount1Min: BigNumber;
  }

  const request: FarmingPositionRequest = {
    setupIndex: ethers.BigNumber.from(tempSlice.pid),
    amount0: ethers.BigNumber.from(amount0),
    amount1: ethers.BigNumber.from(amount1),
    positionOwner: positionOwner || addressZero,
    amount0Min: BigNumber.from(amount0Min),
    amount1Min: BigNumber.from(amount1Min),
  };

  // Wrapper hook for the openPosition function
  // Wrapper hook for the openPosition function
  const useOpenPosition = (request: FarmingPositionRequest, value?: string) => {
    return useScaffoldContractWrite({
      contractName: contractName, // Replace with your contract name
      functionName: "openPosition",
      args: [request],
      value,
    });
  };

  const UseAddLiquidity = (request: FarmingPositionRequest, positionId: BigNumber, value?: string) => {
    return useScaffoldContractWrite({
      contractName: contractName, // Replace with your contract name
      functionName: "addLiquidity",
      args: [positionId, request],
      value,
    });
  };

  const value = involvingETH === true ? amount0 : "0";

  const { writeAsync, isMining, ...otherProps } = useOpenPosition(request, value);
  const { writeAsync: addAsync } = UseAddLiquidity(request, positionId, value);

  const handleClick = async () => {
    if (functionNameToCall === "openPosition") {
      await writeAsync();
    } else {
      await addAsync();
    }
  };
  useEffect(() => {
    if (tokenIndex !== -1) {
      const approvalAddress = tokenAddresses[tokenIndex]?.address ? tokenAddresses[tokenIndex].address : "0x";
      const approvalAmount = tokenAddresses[tokenIndex].value
        ? ethers.utils.parseUnits(
            tokenAddresses[tokenIndex].value.toString(),
            18, // change to tokenDecimals if needed
          )
        : ethers.utils.parseUnits("0", 18);
      setApprovalAmount(approvalAmount);
      setApprovalAddress(approvalAddress);
    } else {
      const approvalAddress = "0x";
      setApprovalAmount(ethers.utils.parseUnits("0", 18));
      setApprovalAddress(approvalAddress);
    }
  }, [tokenIndex, tokenAddresses]);
  const { isLoading: isApproving, writeAsync: approveAsync } = useScaffoldERCWrite(approvalAddress, "approve", [
    contractAddress,
    // 5000 in wei
    approvalAmount,
  ]);
  const { isLoading: claimLoading, writeAsync: claimAsync } = useScaffoldContractWrite({
    contractName: contractName,
    functionName: "withdrawReward",
    args: [positionId],
  });
  const wargs = [positionId ? BigNumber.from(positionId) : "0x", pool ? pool.liquidity : "0"];
  const gasLimit = "500000";
  const { isLoading: withdrawLoading, writeAsync: withdrawAsync } = useScaffoldContractWrite({
    contractName: contractName,
    functionName: "withdrawLiquidity",
    args: [positionId ? BigNumber.from(positionId) : BigNumber.from("0"), pool ? pool.liquidity : "0"],
  });
  console.log("Arguments for Withdrawal", wargs);
  const handleWithdraw = async () => {
    if (!withdrawLoading) await withdrawAsync();
  };
  const withdrawReward = async () => {
    if (!claimLoading) await claimAsync();
  };
  const handleTokenApproval = async () => {
    if (!isApproving) await approveAsync();
    // Add any additional logic after token approval if needed
  };
  return (
    <Grid container direction="column" alignItems="center">
      <Typography variant="h6" style={{ marginTop: "20px" }}>
        Add Liquidity
      </Typography>
      <form>
        <div> lpTokenAddress: {addr}</div>
        <div> Setup Index: {tempSlice.pid} </div>
        <div> Position ID: {positionId} </div>
        <div> Current Price: {currentPrice} </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={showPositionOwner}
                onChange={e => setShowPositionOwner(e.target.checked)}
                color="primary"
              />
            }
            label="Specify Position Owner"
          />
        </div>
        <TextField
          label="Amount 0"
          variant="outlined"
          type="number"
          value={amount0}
          onChange={handleAmount0Change}
          style={{ margin: "20px 0" }}
        />
        <TextField
          label="Amount 1"
          variant="outlined"
          type="number"
          value={amount1}
          onChange={handleAmount1Change}
          style={{ margin: "20px 0" }}
        />
        <div style={{ margin: "20px 0" }}>
          <Typography variant="subtitle1">Choose a minimum amount setting:</Typography>
          <div>
            <Button
              variant="contained"
              color={percentageSetting === "0.01" ? "primary" : "default"}
              onClick={() => setPercentageSetting("0.01")}
            >
              0.1%
            </Button>
            <Button
              variant="contained"
              color={percentageSetting === "0.05" ? "primary" : "default"}
              onClick={() => setPercentageSetting("0.05")}
            >
              1%
            </Button>
            <Button
              variant="contained"
              color={percentageSetting === "0.1" ? "primary" : "default"}
              onClick={() => setPercentageSetting("0.1")}
            >
              5%
            </Button>
          </div>
        </div>
        {showPositionOwner && (
          <TextField
            label="Position Owner"
            variant="outlined"
            type="text"
            value={positionOwner}
            onChange={e => setPositionOwner(e.target.value)}
            style={{ margin: "20px 0" }}
          />
        )}
        <TextField
          label="Amount 1 Minimum"
          variant="outlined"
          type="number"
          value={amount0Min}
          onChange={e => setAmount0Min(e.target.value)}
          style={{ margin: "20px 0" }}
          disabled
        />
        <TextField
          label="Amount 1 Minimum"
          variant="outlined"
          type="number"
          value={amount1Min}
          onChange={e => setAmount1Min(e.target.value)}
          style={{ margin: "20px 0" }}
          disabled
        />
        <div>
          <Button variant="contained" color="primary" onClick={handleClick} disabled={isMining || !isApproved}>
            {isMining ? "Loading..." : "Add Liquidity"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleWithdraw}
            disabled={withdrawLoading || !positionId}
          >
            {withdrawLoading ? "Loading..." : "Withdraw Liquidity"}
          </Button>
          <div>
            <Button variant="contained" color="primary" onClick={handleTokenApproval} disabled={isApproved}>
              {isApproved ? "Tokens Approved" : "Approve Tokens"}
            </Button>
            <Button variant="contained" color="primary" onClick={withdrawReward}>
              Claim Reward
            </Button>
          </div>
        </div>
        <div>
          <div>Balance: {balance}</div>
          <div>Price: {eth}</div>
          <div>Error: {isError ? "true" : "false"}</div>
          <button onClick={onToggleBalance}>Toggle Balance Display</button>
          <div>Displaying balance in {isEthBalance ? "ETH" : "Token"}</div>
        </div>
      </form>
    </Grid>
  );
}

export default AddLiquidityForm;
