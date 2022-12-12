import {Request, Response, Router}  from  "express"
import {requireAuth} from "../../middlewares";
import {body} from "express-validator";
import {BadRequestError} from "../../errors";
import {User}  from  "../../models"


const router  =  Router();

router.post("/api/users/block",
    [
        body("userId").notEmpty().withMessage("please provide the userId")
    ],
    requireAuth,
    async(req: Request, res: Response) => {
    const {userId}  = req.body;

    const existUser  =  await User.findById(userId);

    if(!existUser) {
        throw new BadRequestError("The account user not available");
    }

    let user :  any;
    let action = "blocked";

    const myAccount  = await User.findById(req.currentUser?.id);
    if(!myAccount) {
        throw new BadRequestError("Your account was not found");
    }

    const isUserInlistOfBlockedUser  =  myAccount?.blocked_users?.includes(userId);

    if(!isUserInlistOfBlockedUser) {
        // add user to a list of your blocked users
       user  =  await User.findByIdAndUpdate(req.currentUser?.id, {$push: {blocked_users: userId}}, {new:  true});
       action = "blocked"
    }
    else  {
        //remove user from bocked users
        user  =  await User.findByIdAndUpdate(req.currentUser?.id, {$pull: {blocked_users: userId}}, {new:  true});
        action="un-blocked"
    }

    res.status(200).json({
        status:"success",
        user,
        message: `Successfully ${action} ${existUser.username}`
    })
});