import { useEffect, useState } from "react";
import { Token } from "@uniswap/sdk-core/dist/";
import { tickToPrice } from "@uniswap/v3-sdk/dist/";
import { useScaffoldPoolRead } from "~~/hooks/scaffold-eth";

const VOID_ETHEREUM_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Add this constant to handle ETH address

export const useUniswapPool = (
  addr: string,
  tickLower: number,
  tickUpper: number,
  involvingETH: boolean,
  ethPrice: number,
) => {
  const [poolData, setPoolData] = useState({});
  const fee = useScaffoldPoolRead(addr, "fee");
  const slot = useScaffoldPoolRead(addr, "slot0");
  const token0Address = useScaffoldPoolRead(addr, "token0");
  const token1Address = useScaffoldPoolRead(addr, "token1");
  console.log("TICKDATA", slot);

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        if (fee && slot && token0Address && token1Address && tickLower !== undefined && tickUpper !== undefined) {
          const token0 = new Token(1, token0Address.data, 18); // assuming 18 decimal places
          const token1 = new Token(1, token1Address.data, 18);

          const tickLowerPrice = tickToPrice(token0, token1, tickLower).toSignificant(15);
          const tickUpperPrice = tickToPrice(token1, token0, tickUpper).toSignificant(15);
          const currentTickPrice = tickToPrice(
            token0,
            token1,
            parseInt(slot.data.tick ? slot.data.tick : slot.data[1]),
          ).toSignificant(15);

          console.log("TICKDATA", {
            tickLowerPrice,
            tickUpperPrice,
            currentTickPrice,
          });

          const isToken0ETH = token0Address.data.toLowerCase() === VOID_ETHEREUM_ADDRESS.toLowerCase();
          const isToken1ETH = token1Address.data.toLowerCase() === VOID_ETHEREUM_ADDRESS.toLowerCase();

          if (involvingETH === true) {
            const ethIndex = isToken0ETH ? 0 : 1;

            const tickLowerUSDPrice = parseFloat(tickLowerPrice) * ethPrice;
            const tickUpperUSDPrice = parseFloat(tickUpperPrice) * ethPrice;
            const tickCurrentUSDPrice = parseFloat(currentTickPrice) * ethPrice;

            const tickLowerPriceFloat = parseFloat(tickLowerPrice);
            const tickUpperPriceFloat = parseFloat(tickUpperPrice);
            const currentTickPriceFloat = parseFloat(currentTickPrice);

            const cursorNumber =
              (1 /
                ((Math.sqrt(tickLowerPriceFloat * tickUpperPriceFloat) -
                  Math.sqrt(tickUpperPriceFloat * currentTickPriceFloat)) /
                  (currentTickPriceFloat - Math.sqrt(tickUpperPriceFloat * currentTickPriceFloat)) +
                  1)) *
              100;
            const formattedCursorNumber = ethIndex === 1 ? 100 - cursorNumber : cursorNumber;

            console.log("USD Price Data", {
              tickLowerUSDPrice,
              tickUpperUSDPrice,
              tickCurrentUSDPrice,
            });

            const cursorData = {
              tickLowerUSDPrice,
              tickUpperUSDPrice,
              tickCurrentUSDPrice,
              formattedCursorNumber,
              currentTickPrice,
              token0Address: token0Address.data,
              token1Address: token1Address.data,
            };

            setPoolData({ ...poolData, cursorData });
          } else {
            const tickLowerPriceFloat = parseFloat(tickLowerPrice);
            const tickUpperPriceFloat = parseFloat(tickUpperPrice);
            const currentTickPriceFloat = parseFloat(currentTickPrice);

            const cursorNumber =
              (1 /
                ((Math.sqrt(tickLowerPriceFloat * tickUpperPriceFloat) -
                  Math.sqrt(tickUpperPriceFloat * currentTickPriceFloat)) /
                  (currentTickPriceFloat - Math.sqrt(tickUpperPriceFloat * currentTickPriceFloat)) +
                  1)) *
              100;

            console.log("Cursor Number (non-USD)", { cursorNumber });

            setPoolData({ ...poolData, cursorNumber });
          }
        }
      } catch (e) {
        console.log("Error in useUniswapPool", e);
      }
    };

    fetchPoolData();
  }, [addr, tickLower, tickUpper]);

  return poolData;
};
