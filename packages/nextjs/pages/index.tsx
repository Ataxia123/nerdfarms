import React, { useEffect, useState } from "react";
import Head from "next/head";
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
import { utils } from "ethers";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useAppStore } from "~~/services/store/store";

const Home: NextPage = () => {
  const { tempSlice } = useAppStore();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const contractName = "FarmMainRegularMinStake";
  const functionName = "setups";
  const { data } = useScaffoldContractRead({ contractName, functionName });

  useEffect(() => {
    if (address) {
      tempSlice.setAddress(address);
    }
  }, [address, tempSlice]);

  const handleClick = (setupId: string) => {
    tempSlice.setPID(setupId);
    router.push(`/setup/${setupId}`);
  };

  console.log("data", data, "userData", userData);
  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>
      {tempSlice.address && (
        <div className="flex w-full items-center flex-col mt-6 space-y-1">
          <p className="m-0 font-semibold text-lg">Your Address is : </p>
          <Address address={tempSlice.address} />
        </div>
      )}
      {data && (
        <Grid container spacing={4} justifyContent="center">
          {data?.map((setup: any) => (
            <Grid
              key={setup.infoIndex.toString()}
              item
              xs={12}
              sm={6}
              md={4}
              onClick={() => handleClick(setup.infoIndex.toString())}
            >
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    PID
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {setup.infoIndex.toString()}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Reward Per Block
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {utils.formatEther(setup.rewardPerBlock?.toString())}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    End Block
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {setup.endBlock?.toNumber()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default Home;
