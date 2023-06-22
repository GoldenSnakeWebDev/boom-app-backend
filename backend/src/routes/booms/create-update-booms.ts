import { Router, Request, Response } from "express";
import { body } from "express-validator";
import {
  Boom,
  BoomType,
  User,
  Network,
  SyncBank,
  NetworkType,
  NotificationType,
  Notification,
} from "../../models";
import { validateRequest } from "../../middlewares";
import { BadRequestError } from "../../errors";
import { requireAuth } from "../../middlewares";
import { updateWalletBalance } from "../../utils/sync-bank";
import { ITransactionType } from "../../models/transaction";
import { onSignalSendNotification } from "./../../utils/on-signal";
import { BoomVersion } from "../../models/boom-version";

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
 *        - name: timestamp
 *          description:  Provide the timestamp in the format e.g '11/25/2022, 5:12:29 PM'
 *        - name: price
 *          description: Boom Price
 *        - name: location
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
    body("tags")
      .notEmpty()
      .withMessage("Please add some tags, seperated with @/;/,"),
    body("title").notEmpty().withMessage("Please provide your boom title"),
    body("timestamp")
      .notEmpty()
      .withMessage("please provide the device timestamp"),
    body("location").notEmpty().withMessage("please provide the  location"),
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
      location,
      timestamp,
      boom_state,
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
      tags = tags
        .split(/[_/:\-;\/@/,/;/#\\]+/)
        .map((item: string) => `@${item}`);
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
      location,
      price,
      boom_state,
      tags,
      created_at: new Date(timestamp),
    });

    await boom.save();

    await Notification.create({
      message: `Successfully created a boom`,
      user: req.currentUser?.id,
      boom: boom.id,
      notification_type: NotificationType.BOOM,
    });
    await onSignalSendNotification({
      contents: {
        en: `You have successfully created a boom`,
        es: `You have successfully created a boom`,
      },
      include_external_user_id: [req.currentUser?.device_id!],
      name: "Boom Creation",
    });

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
      boom_state,
      tags,
      token_id
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

    // if (tags && tags.length > 0) {
    //   tags = tags.split(/[_/:\-;\\]+/);
    // }

    const boom = await Boom.findByIdAndUpdate(req.params.id, {
      description,
      network,
      image_url,
      quantity,
      fixed_price,
      title,
      tags,
      price,
      boom_state,
      token_id
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
    let { react_type, timestamp } = req.body;

    if (!timestamp) {
      timestamp = Date.now();
    }
    console.log("App", req.params.id);

    const boomMinted: any = await Boom.findById(req.params.id);

    const boomOwner = await User.findById(boomMinted.user);

    if (!boomOwner) {
      throw new BadRequestError("The boom user is not found!!");
    }

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

        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has liked your boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has liked  your boom`,
            es: `${req.currentUser?.username} has liked  your boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Reaction",

        });
      } else {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { "reactions.likes": req.currentUser?.id! },
          },
          { new: true }
        );
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has disliked  your boom`,
          timestamp: new Date(timestamp),
        });

        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has disliked your boom`,
            es: `${req.currentUser?.username} has disliked your boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Reaction",

        });
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

        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has loved your boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has loved your boom`,
            es: `${req.currentUser?.username} has loved your boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Reaction",
        });
      } else {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { "reactions.loves": req.currentUser?.id! },
          },
          { new: true }
        );
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has disliked your boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has disliked your boom`,
            es: `${req.currentUser?.username} has disliked your boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Reaction",
        });
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
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has smiled at your Boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has smiled at your Boom`,
            es: `${req.currentUser?.username} has smiled at your Boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Smiled Reaction",
        });
      } else {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { "reactions.smiles": req.currentUser?.id! },
          },
          { new: true }
        );
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} is sad about your boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} is sad about your boom`,
            es: `${req.currentUser?.username} is sad about your boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Sad Reaction",
        });
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

        // add to user rebooms and show more rebooms to renny
        await User.findByIdAndUpdate(req.currentUser?.id!, {
          $push: { rebooms: boomMinted.id },
        });
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has re-boomed your Boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has re-boomed your Boom`,
            es: `${req.currentUser?.username} has re-boomed your Boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Re-Boom Reaction",

        });
      } else {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { "reactions.rebooms": req.currentUser?.id! },
          },
          { new: true }
        );
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} is re-boomed`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} is re-boomed`,
            es: `${req.currentUser?.username} is re-boomed`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Reboom Reaction",

        });
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
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has reported your boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has reported your boom`,
            es: `${req.currentUser?.username} has reported your boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Report Reaction",

        });
      } else {
        await Boom.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { "reactions.reports": req.currentUser?.id! },
          },
          { new: true }
        );
        // TODO: Notification
        await Notification.create({
          notification_type: NotificationType.BOOM,
          user: boomMinted.user,
          boom: req.params.id,
          message: `${req.currentUser?.username} has withheld the reporting on your boom`,
          timestamp: new Date(timestamp),
        });
        await onSignalSendNotification({
          contents: {
            en: `${req.currentUser?.username} has withheld the reporting on your boom`,
            es: `${req.currentUser?.username} has withheld the reporting on your boom`,
          },
          include_external_user_id: [boomOwner.device_id!],
          name: "Withheld Reaction",

        });
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

/**
 * @openapi
 * /api/v1/by-booms-with-sync-coins:
 *   post:
 *     tags:
 *        - Booms
 *     description: Enables  users to by an NFT using Sync Bank Coins.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: boom
 *          description: Please provide your ID
 *     responses:
 *       200:
 *         description: . Enables  users to by an NFT using Sync Bank Coins
 */

router.post(
  "/api/v1/by-booms-with-sync-coins",
  [
    body("boom").notEmpty().withMessage("Please provide your boom information"),
    body("timestamp").notEmpty().withMessage("Provide a timestamp for buying a boom"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { boom, timestamp } = req.body;
    const existBoom = await Boom.findById(boom);

    if (!existBoom) {
      throw new BadRequestError("This boom does not exist");
    }

    const oldOwner = await User.findById(existBoom.user);

    if (!oldOwner) {
      throw new BadRequestError("The boom owner does not exist");
    }

    // DEDUCT SYNC WALLET AMOUNTS

    const syncBank = await SyncBank.findOne({ user: req.currentUser?.id! });

    if (!syncBank) {
      throw new BadRequestError("Your sync bank does not exist");
    }

    const network = await Network.findById(existBoom.network);

    let networkType: any;
    if (!network) {
      throw new BadRequestError("Your boom does belong in any of the network");
    }

    if (network.symbol === "BNB") {
      networkType = NetworkType.BINANCE;
    } else if (network.symbol === "") {
      networkType = NetworkType.TEZOS;
    } else if (network.symbol === "") {
      networkType = NetworkType.POLYGON;
    }

    console.log("Network: ", networkType);

    // end of deducting  wallet amount

    const update = await updateWalletBalance({
      userId: req.currentUser?.id!,
      amount: parseFloat(existBoom?.price ? existBoom?.price : "0"),
      transaction_type: ITransactionType.WITHDRAW,
      networkType: networkType,
    });

    if (!update.success) {
      throw new BadRequestError("Buying transaction was not successful");
    }

    const currentVersions = existBoom.quantity;

    let boomVersion = await BoomVersion.findOne({ boom: existBoom.id });

    if (!boomVersion) {
      await Boom.create({
        description: existBoom.description,
        boom_type: existBoom.boom_type,
        network: existBoom.network,
        image_url: existBoom.image_url,
        user: req.currentUser?.id!,
        quantity: 1,
        fixed_price: existBoom.fixed_price,
        title: existBoom.title,
        location: existBoom.location,
        price: existBoom.price,
        tags: existBoom.tags,
        created_at: new Date(timestamp),
      })
      boomVersion = await BoomVersion.create({ boom: existBoom.id, minted_versions: 1 });
    } else {

      if (boomVersion.minted_versions! >= currentVersions!) {
        throw new BadRequestError("You can't buy this boom. It is out of stock")
      }
      await Boom.create({
        description: existBoom.description,
        boom_type: existBoom.boom_type,
        network: existBoom.network,
        image_url: existBoom.image_url,
        user: req.currentUser?.id!,
        quantity: 1,
        fixed_price: existBoom.fixed_price,
        title: existBoom.title,
        location: existBoom.location,
        price: existBoom.price,
        tags: existBoom.tags,
        created_at: new Date(timestamp),
      })
      boomVersion = await BoomVersion.findByIdAndUpdate(boomVersion.id, { minted_version: boomVersion.minted_versions! + 1 }, { new: true })
    }


    await Boom.findByIdAndUpdate(
      existBoom.id,
      {
        user: req.currentUser?.id!,
        quantity: existBoom?.quantity! - boomVersion?.minted_versions!
      },
      { new: true }
    );

    // OLD OWNER's Notification
    await Notification.create({
      message: `${req.currentUser?.username} has bought your boom successfully at ${network.symbol} ${existBoom.price}`,
      user: oldOwner.id,
      boom: existBoom.id,
      notification_type: NotificationType.BOOM,
    });

    await onSignalSendNotification({
      contents: {
        en: `${req.currentUser?.username} has bought your boom successfully at ${network.symbol} ${existBoom.price}`,
        es: `${req.currentUser?.username} has bought your boom successfully at ${network.symbol} ${existBoom.price}`,
      },
      include_external_user_id: [oldOwner.device_id!],
      name: "Boom Bought",
    });

    // New Owner's Notification
    await Notification.create({
      message: `You have successfully bought a boom`,
      user: req.currentUser?.id,
      boom: existBoom.id,
      notification_type: NotificationType.BOOM,
    });

    await onSignalSendNotification({
      contents: {
        en: `You have successfully bought a boom`,
        es: `You have successfully bought a boom`,
      },
      include_external_user_id: [req.currentUser?.device_id!],
      name: "Boom Bought",
    });

    res.status(200).json({
      status: "success",
      message: "Successfully bought an NFT",
    });
  }
);

/**
 * @openapi
 * /api/v1/booms/:id:
 *   delete:
 *     tags:
 *        - Booms
 *     description: Owner to delete a boom.
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Successfully soft deleted your boom
 */
router.delete(
  "/api/v1/booms/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const boom = await Boom.findById(req.params.id);

    if (!boom) {
      throw new BadRequestError("The boom you trying to delete does not exist");
    }

    if (boom.user.toString() !== req.currentUser?.id!) {
      throw new BadRequestError(
        "You cannot delete the boom. You are not the owner"
      );
    }

    /* await Boom.findByIdAndDelete(req.params.id);*/
    await Boom.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );

    res.status(204).json({
      status: "success",
      message: `Successfully delete your boom`,
    });
  }
);
export { router as BoomCreateUpdateRoutes };
