import { Request, Response, Router } from "express";
import { body } from "express-validator";
import pinataSDK from "@pinata/sdk";

import { requireAuth, validateRequest } from "./../../middlewares";
import { config } from "./../../config";
import { uploadDocument } from "../helper";
import { createReadStream, unlinkSync } from "fs";
import { buildFilterQuery } from "./../../utils";
import { Boom } from "../../models/boom";
import { BadRequestError } from "../../errors/bad-request-error";

const router = Router();

router.post(
  "/api/v1/tezos/mint",

  uploadDocument,
  [body("title").notEmpty().withMessage("Please provide NFT title")],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    let { file, body } = req;

    try {
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Please provide a file",
        });
      }

      let { filename } = file;

      let pinata = new pinataSDK(
        config.PINATA_API_KEY,
        config.PINATA_SECRET_API_KEY
      );

      await pinata.testAuthentication().catch((_err: any) =>
        res.status(400).json({
          success: false,
          message: "Pinata authentication failed",
        })
      );

      // creates a readable stream of the file

      let full_url = req.protocol + "://" + req.get("host");

      let file_name = `${full_url}/${config.FOLDER_NAME}/${filename}`;

      let {
        title,
        description,
        tags,
        category,
        type,
        creators,
        symbol,
      }: {
        title: string;
        description: string | undefined;
        tags: string | undefined;
        category: string | undefined;
        type: string | undefined;
        creators: string[];
        symbol: string | undefined;
      } = body;
      let readableStreamForFile = createReadStream(file_name);

      let keyvalues = {
        description,
        tags,
        category,
        type,
        creators,
        symbol,
      };
      keyvalues = buildFilterQuery(keyvalues) as any;

      let options: any = {
        pinataMetadata: {
          name: title,
          keyvalues,
        },
      };

      let pinnedFile = await pinata.pinFileToIPFS(
        readableStreamForFile,
        options
      );

      let { IpfsHash, PinSize } = pinnedFile;

      if (IpfsHash && PinSize < 1) {
        return res.status(400).json({
          success: false,
          message: "Failed to pin file to IPFS",
        });
      }

      // Remove file from server
      unlinkSync(file_name);

      let metadata = {
        ...keyvalues,
        name: title,
        symbol: symbol || "BOOM",
        artifactUri: `ipfs://${IpfsHash}`,
        displayUri: `ipfs://${IpfsHash}`,
        decimals: 0,
        // TODO: ADD BOOM LOGO HERE
        thumbnailUri: "https://tezostaquito.io/img/favicon.png",
        is_transferable: true,
        shouldPreferSymbol: false,
      };

      let pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: `${title}-metadata`,
        },
      });

      if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize < 1) {
        return res.status(400).json({
          success: false,
          message: "Failed to pin metadata to IPFS",
        });
      }

      return res.status(200).json({
        success: true,
        message: {
          imageHash: IpfsHash,
          metadataHash: pinnedMetadata.IpfsHash,
        },
      });
    } catch (error: any) {
      console.error(error);
    }

    return res.status(200).send({ message: "Minting NFT" });
  }
);

/**
 * @openapi
 * /api/v1/evms-prepare-url:
 *   post:
 *     tags:
 *        - EVM Prepare URL
 *     description: Follow uses.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: boom
 *          description: The boom ID
 *     responses:
 *       200:
 *         description: . Prepared image url you can use it to mint NFT.
 */

router.post(
  "/api/v1/evms-prepare-url",

  uploadDocument,
  [body("boom").notEmpty().withMessage("Please your boom ")],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    let { file, body } = req;

    try {
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Please provide a file",
        });
      }

      let { filename } = file;

      let pinata = new pinataSDK(
        config.PINATA_API_KEY,
        config.PINATA_SECRET_API_KEY
      );

      await pinata.testAuthentication().catch((_err: any) =>
        res.status(400).json({
          success: false,
          message: "Pinata authentication failed",
        })
      );

      // creates a readable stream of the file

      let full_url = req.protocol + "://" + req.get("host");

      const boom = await Boom.findById(body.id);

      if (!boom) {
        throw new BadRequestError("Boom Not found");
      }
      let file_name = `${full_url}/${config.FOLDER_NAME}/${filename}`;

      let readableStreamForFile = createReadStream(file_name);

      let keyvalues = {
        ...boom.toObject(),
      };
      keyvalues = buildFilterQuery(keyvalues) as any;

      let options: any = {
        pinataMetadata: {
          name: boom.title,
          keyvalues,
        },
      };

      let pinnedFile = await pinata.pinFileToIPFS(
        readableStreamForFile,
        options
      );

      let { IpfsHash, PinSize } = pinnedFile;

      if (IpfsHash && PinSize < 1) {
        return res.status(400).json({
          success: false,
          message: "Failed to pin file to IPFS",
        });
      }

      // Remove file from server
      unlinkSync(file_name);

      let metadata = {
        ...keyvalues,
        name: boom.title,
        symbol: "BOOM",
        artifactUri: `ipfs://${IpfsHash}`,
        displayUri: `ipfs://${IpfsHash}`,
        decimals: 0,
        // TODO: ADD BOOM LOGO HERE
        thumbnailUri: "https://tezostaquito.io/img/favicon.png",
        is_transferable: true,
        shouldPreferSymbol: false,
      };

      let pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: {
          name: `${boom.title}-metadata`,
        },
      });

      if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize < 1) {
        return res.status(400).json({
          success: false,
          message: "Failed to pin metadata to IPFS",
        });
      }

      return res.status(200).json({
        success: true,
        message: {
          imageHash: IpfsHash,
          metadataHash: pinnedMetadata.IpfsHash,
        },
      });
    } catch (error: any) {
      console.error(error);
    }

    return res.status(200).send({
      success: false,
      message: { imageHash: "", metadataHash: "" },
    });
  }
);

export { router as TezosMintAndURLPrep };
