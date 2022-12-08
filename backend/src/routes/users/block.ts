import {Request, Response, Router}  from  "express"
import {requireAuth} from "../../middlewares";
import {body} from "express-validator";


const router  =  Router();

router.post("/api/users/block",
    [
        body("userId").notEmpty().withMessage("please provide the userId")
    ],
    requireAuth,
    async(_req: Request, res: Response) => {
/*    const {userId}  = req.body;*/
    res.status(200).json({
        status:"success",
        message: `Successfully block`
    })
});