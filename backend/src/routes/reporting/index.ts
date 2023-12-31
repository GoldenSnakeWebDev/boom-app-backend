import {Request, Response, Router} from "express"
import {Report} from "../../models"
import {requireAuth} from "../../middlewares";
import {ApiResponse} from "../../utils/api-response";

const router = Router()


/**
 * @openapi
 * /api/v1/reporting:
 *   get:
 *     tags:
 *        - Reporting
 *     description: Provide a list all reported users
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: Provide a list all reported users
 */
router.get("/api/v1/reporting", async(req: Request, res: Response) => {
    const response  = new ApiResponse(Report.find(), req.query);
    const reporting = await response.query;
    res.status(200).json({
        status: "success",
        reporting
    })
})

/**
 * @openapi
 * /api/v1/reporting/user:
 *   post:
 *     tags:
 *        - Reporting
 *     description: Provides a way to report any user for misconduct of the issues .
 *     produces:
 *        - application/json
 *     consumes:
 *        - application/json
 *     parameters:
 *        - name: boom
 *          userId: Please provide the user id
 *        - name: message
 *          description: Please describe your issue
 *        - name: timestamp
 *          description: Please provide the timestamp of the reporting
 *     responses:
 *       200:
 *         description: . Provides a way to report any user for misconduct of the issues
 */
router.post("/api/v1/reporting/user", requireAuth,
    async (req: Request, res: Response) => {
        let {userId, message, timestamp} = req.body;
        timestamp = new Date(timestamp);
        const report = await new Report({message, timestamp, reported_user: userId, reporter: req.currentUser?.id!})

        res.status(200).json({
            status: "success",
            report,
            message: `Thank you. Successfully reported user`
        })

    });

export {router as ReportingUserRoutes}