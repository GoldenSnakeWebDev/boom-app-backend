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

export { router as BoomCreateUpdateRoutes };
