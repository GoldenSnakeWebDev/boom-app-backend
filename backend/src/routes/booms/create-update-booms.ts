import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { Boom, BoomType } from "./../../models/boom";
import { validateRequest } from "../../middlewares/validate-request";
import { BadRequestError } from "../../errors/bad-request-error";
import { Network } from "./../../models/network";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

/**
 * @openapi
 * /api/v1/booms:
 *   post:
 *     tags:
 *        - Booms
 *     description: Enables  users to create a boom.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: network
 *          description: Choose your network
 *        - name: boom_type
 *          description: Please provide your boom type
 *        - name: description
 *          description: Boom Description
 *        - name: image_url
 *          description: Boom Image URL
 *        - name: title
 *          description: Boom Title
 *        - name: quantity
 *          description: Quantity
 *        - name: fixed_price
 *          description: Boom Fixed Price
 *        - name: price
 *          description: Boom Price
 *       - name: location
 *          description: What is your location
 *     responses:
 *       200:
 *         description: . Successfully created a boom
 */
router.post(
  "/api/v1/booms",
  [
    body("network")
      .notEmpty()
      .withMessage(
        "please provide the network on which you want eventually mint the boom"
      ),
    body("image_url").notEmpty().withMessage("Please provide your boom image"),
    body("title").notEmpty().withMessage("Please provide your boom title"),
    body("quantity")
      .notEmpty()
      .withMessage("Please provide your boom quantity"),
    body("fixed_price")
      .notEmpty()
      .withMessage("Please provide your boom fixed price"),
  ],
  validateRequest,
  requireAuth,
  async (req: Request, res: Response) => {
    let {
      boom_type,
      description,
      network,
      image_url,
      quantity,
      fixed_price,
      title,
      price,
      tags,
    } = req.body;

    // perform checks
    if (!Object.values(BoomType).includes(boom_type)) {
      throw new BadRequestError("Your boom type is not found");
    }

    const existNework = Network.findOne({ network, is_active: true });

    if (!existNework) {
      throw new BadRequestError("Network not found or is not active");
    }

    if (tags) {
      tags = tags.split(/[_/:\-;\\]+/);
    }

    const boom = new Boom({
      description,
      boom_type,
      network,
      image_url,
      user: req.currentUser?.id!,
      quantity,
      fixed_price,
      title,
      price,
      tags,
    });

    await boom.save();

    res.status(201).json({
      status: "success",
      message: "Successfully create a new boom",
      boom,
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/:id:
 *   patch:
 *     tags:
 *        - Booms
 *     description: Enables  users to update a boom.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: network
 *          description: Choose your network
 *        - name: boom_type
 *          description: Please provide your boom type
 *        - name: description
 *          description: Boom Description
 *        - name: image_url
 *          description: Boom Image URL
 *        - name: title
 *          description: Boom Title
 *        - name: quantity
 *          description: Quantity
 *        - name: fixed_price
 *          description: Boom Fixed Price
 *        - name: price
 *          description: Boom Price
 *     responses:
 *       200:
 *         description: . Successfully created a boom
 */
router.patch(
  "/api/v1/booms:id",
  [
    body("network")
      .notEmpty()
      .withMessage(
        "please provide the network on which you want eventually mint the boom"
      ),
    body("image_url").notEmpty().withMessage("Please provide your boom image"),
    body("title").notEmpty().withMessage("Please provide your boom title"),
    body("quantity")
      .notEmpty()
      .withMessage("Please provide your boom quantity"),
    body("fixed_price")
      .notEmpty()
      .withMessage("Please provide your boom fixed price"),
  ],
  async (req: Request, res: Response) => {
    let {
      boom_type,
      description,
      network,
      image_url,
      quantity,
      fixed_price,
      title,
      price,
      tags,
    } = req.body;

    // perform checks
    if (!Object.values(BoomType).includes(boom_type)) {
      throw new BadRequestError("Your boom type is not found");
    }

    const existNework = Network.findOne({ network, is_active: true });

    if (!existNework) {
      throw new BadRequestError("Network not found or is not active");
    }

    const boomMinted = await Boom.findOne({
      _id: req.params.id,
      is_minted: true,
    });

    if (boomMinted) {
      throw new BadRequestError("You are  not allowed to edit a minted NFT");
    }

    if (tags) {
      tags = tags.split(/[_/:\-;\\]+/);
    }

    const boom = await Boom.findByIdAndUpdate(req.params.id, {
      description,
      network,
      image_url,
      quantity,
      fixed_price,
      title,
      tags,
      price,
    });

    res.status(200).json({
      status: "success",
      message: "Successfully updated your  boom",
      boom,
    });
  }
);

/**
 * @openapi
 * /api/v1/react-to-booms/:id:
 *   patch:
 *     tags:
 *        - Booms
 *     description: Enables  users to react to boom.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: react_type
 *          description: Please provide your reaction type
 *     responses:
 *       200:
 *         description: . Successfully reacted to the boom
 */
router.patch(
  "/api/v1/react-to-booms/:id",
  [
    body("react_type")
      .notEmpty()
      .withMessage("please provide the reaction type"),
  ],
  requireAuth,
  async (req: Request, res: Response) => {
    let { react_type } = req.body;
    console.log("App", req.params.id);

    const boomMinted: any = await Boom.findById(req.params.id);

    if (!boomMinted) {
      throw new BadRequestError("The provided boom does not exist");
    }

    if (react_type === "likes") {
      if (!boomMinted?.reactions?.likes.includes(req.currentUser?.id!)) {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $push: { "reactions.likes": req.currentUser?.id! },
          },
          { new: true }
        );
      } else {
      }
    } else if (react_type === "loves") {
      if (!boomMinted?.reactions?.loves.includes(req.currentUser?.id!)) {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $push: { "reactions.loves": req.currentUser?.id! },
          },
          { new: true }
        );
      } else {
      }
    } else if (react_type === "smiles") {
      if (!boomMinted?.reactions?.smiles.includes(req.currentUser?.id!)) {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $push: { "reactions.smiles": req.currentUser?.id! },
          },
          { new: true }
        );
      } else {
      }
    } else if (react_type === "rebooms") {
      if (!boomMinted?.reactions?.rebooms.includes(req.currentUser?.id!)) {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $push: { "reactions.rebooms": req.currentUser?.id! },
          },
          { new: true }
        );
      } else {
      }
    } else if (react_type === "reports") {
      if (!boomMinted?.reactions?.reports.includes(req.currentUser?.id!)) {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $push: { "reactions.reports": req.currentUser?.id! },
          },
          { new: true }
        );
      } else {
      }
    }

    await boomMinted.save();

    res.status(200).json({
      status: "success",
      message: `Successfully ${react_type}`,
      boom: boomMinted,
    });
  }
);

export { router as BoomCreateUpdateRoutes };
