import fs from "fs";
import express, { Response, Request, NextFunction } from "express";
import sharp from "sharp";
import multer from "multer";
import { v1 as uuid1 } from "uuid";
import { BadRequestError } from "./../../errors";
import { config } from "src/config";

const router = express.Router();

// UUID options for settings the name of the image
const uuidOptions = {
  node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
  clockseq: 0x1234,
  msecs: new Date(Date.now()).getTime(),
  nsecs: 5678,
};

const fileName = uuid1(uuidOptions);

const FOLDER_NAME = config.FOLDER_NAME;

// create custom folder
const createOrReturnFolder = async (folderName: string) => {
  let folder = `${__dirname}/../../public/${folderName}`;
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  return folder;
};

/**Upload image preparations */

const multerStorage = multer.memoryStorage();
/**
 * Filter that files uploaded are images not something else
 */
const multerFilter = (_req: Request, file: any, cb: any) => {
  cb(null, true);
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Not An image. Please  upload only images`), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const UploadPhoto = upload.single("img");

const resizePhoto = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `${FOLDER_NAME}-${fileName}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .toFormat("png")
    .jpeg({
      quality: 90,
    })
    .toFile(`${await createOrReturnFolder(FOLDER_NAME)}/${req.file.filename}`)
    // .toFile(`${__dirname}/../../public/photos/${req.file.filename}`)
    .catch((e) => {
      console.log(e);
    });
  next();
};

const docStorage = multer.diskStorage({
  destination: async function (_req, _file, cb) {
    cb(null, `${await createOrReturnFolder(FOLDER_NAME)}`);
  },
  filename: function (_req, file, cb) {
    const ext = file.mimetype.split("/")[1].toLowerCase();
    // const requireExt = ["png", "jpg", "pdf", "jpeg", "mp4", "mov", "jif", "mpg", "webm","ogg","m4p",];
    // if (!requireExt.includes(ext)) {
    //   throw new BadRequestError(
    //     "You can only upload documents with the following extension. .pdf, .png, .jpeg, and jpg"
    //   );
    // }
    const name = `${FOLDER_NAME}-${fileName}-${Date.now()}.${ext}`;
    cb(null, name);
  },
});

const docMulterFilter = (_req: Request, file: any, cb: any) => {
  if (file) {
    cb(null, true);
  } else {
    throw new BadRequestError(`No upload document`);
  }
};

const uploadDoc = multer({ storage: docStorage, fileFilter: docMulterFilter });

export const uploadDocument = uploadDoc.single("doc");

// /**
//  * @openapi
//  * /api/v1/helpers/photos-uploads:
//  *   post:
//  *     tags:
//  *        - Helpers
//  *     description: Enables  users to upload photos only.
//  *     produces:
//  *        - application/x-www-form-urlencoded
//  *     consumes:
//  *        - application/json
//  *     responses:
//  *       200:
//  *         description: . Successfully uploaded your file
//  */
router.post(
  "/api/v1/helpers/photos-uploads",
  UploadPhoto,
  resizePhoto,
  async (req: Request, res: Response) => {
    const full_url = req.protocol + "://" + req.get("host");

    if (!FOLDER_NAME) {
      throw new BadRequestError(
        "You must provide the holding dirctory name field: dirName"
      );
    }
    const file_name = `${full_url}/${FOLDER_NAME}/${req?.file!.filename}`;

    res.status(201).json({
      status: "success",
      url: file_name,
      message: "Successfully submited a photo",
    });
  }
);

/**
 * @openapi
 * /api/v1/helpers/docs-uploads:
 *   post:
 *     tags:
 *        - Helpers
 *     description: Enables  users to upload any other documents other than photos.
 *     produces:
 *        - application/x-www-form-urlencoded
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: . Successfully uploaded your file
 */
router.post(
  "/api/v1/helpers/docs-uploads",
  uploadDocument,
  async (req: Request, res: Response) => {
    const full_url = req.protocol + "://" + req.get("host");
    if (!FOLDER_NAME) {
      throw new BadRequestError(
        "You must provide the holding dirctory name field: dirName"
      );
    }
    const file_name = `${full_url}/${FOLDER_NAME}/${req?.file!.filename}`;

    res.status(201).json({
      status: "success",
      url: file_name,
      message: "Successfully submited a doccument",
    });
  }
);

export { router as HelperRoutes };
