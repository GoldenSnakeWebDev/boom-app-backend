import { Request, Response, Router } from "express";
import { ApiResponse } from "./../../utils/api-response";
import { requireAuth } from "../../middlewares/require-auth";
import { Transaction } from "../../models/transaction";

const router = Router();

/**
 * @openapi
 * /api/v1/transactions:
 *   post:
 *     tags:
 *        - Transactions
 *     description: Allows to access all transactions happening in his/her sync bank
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Returns alist transactions.
 */
router.get(
  "/api/v1/transactions",
  requireAuth,
  async (req: Request, res: Response) => {
    const response = new ApiResponse(
      Transaction.find({ user: req.currentUser?.id }),
      req.query
    )
      .filter()
      .sort()
      .limitFields();

    const transactions = await response.paginate().query;

    res.status(200).json({
      status: "success",
      transactions,
      page: response.page_info,
      count: response.query.count.length,
    });
  }
);

export { router as ListTransactionsRoutes };
