import { execute } from "../../../.graphclient";
import { gql } from "graphql-tag";
import { TAppSliceCreator, TAppStore } from "~~/services/store/storeTypes";

export type UserPositions = {
  id: string;
};

export type User = {
  id: string;
  positions: Array<UserPositions>;
};

export type ExampleQueryResult = {
  user: User | null;
};

export type QuerySlice = {
  executeQuery: (address: string) => Promise<ExampleQueryResult>;
};

const myQuery = gql`
  query ExampleQuery($address: ID!) {
    user(id: $address) {
      id
      positions(first: 10) {
        id
      }
    }
  }
`;

export const createQuerySlice: TAppSliceCreator<QuerySlice> = () => ({
  executeQuery: async (address: string): Promise<ExampleQueryResult> => {
    try {
      const result = await execute(myQuery, { address });
      return result.data as ExampleQueryResult;
    } catch (error) {
      console.error(error);
      return { user: null };
    }
  },
});
