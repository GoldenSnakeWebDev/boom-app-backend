import axios from "axios";
import { config } from "../config";

export const crossChainMint = async () => {
  try {
    const { data } = await axios.post(
      `https://staging.crossmint.com/api/2022-06-09/collections/default/nfts`,
      {
        metadata: {
          name: "Omambia Testing",
          image:
            "https://imgs.search.brave.com/M_2XH8-GiuxDFVrMDqeCyJ9hnGoMZnokSMTNZrmVE8U/rs:fit:724:225:1/g:ce/aHR0cHM6Ly90c2U0/Lm1tLmJpbmcubmV0/L3RoP2lkPU9JUC4x/UEk3ZjFuMENYdlli/LWg1cFJzLXZnSGFF/MiZwaWQ9QXBp",
          description: "Testing",
        },
        recipient: "email:omambia@ngeni.io:polygon",
      },
      {
        headers: {
          "x-client-secret": config.CROSSMINT.CLIENT_SECRET,
          "x-project-id": config.CROSSMINT.PROJECT_ID,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("data", data);
  } catch (error) {
    console.log(error);
  }
};
