import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import {
  createCompany,
  deleteCompany,
  deleteCompanyCoverPic,
  deleteCompanyLogo,
  getCompanyData,
  getRelatedJobs,
  updateCompanyData,
  uploadCompanyCoverPic,
  uploadCompanyLogo,
} from "./services/company.service.js";
import {
  createCompanySchema,
  deleteCompanySchema,
  getCompanySchema,
  updateCompanySchema,
} from "./company.validation.js";
import { authentication } from "../../middleware/auth.middleware.js";
import {
  fileValidationTypes,
  uploadCloudFile,
} from "../../utils/multer/cloud.multer.js";
import JobRouter from "../job/job.controller.js";
const router = Router();
router.get("/", validation(getCompanySchema), getCompanyData);
router.post(
  "/",
  authentication(),
  validation(createCompanySchema),
  createCompany
);
router.put(
  "/:companyId",
  authentication(),
  validation(updateCompanySchema),
  updateCompanyData
);
router.delete(
  "/:companyId",
  authentication(),
  validation(deleteCompanySchema),
  deleteCompany
);
router.delete(
  "/:companyId/logo",
  authentication(),
  validation(deleteCompanySchema),
  deleteCompanyLogo
);
router.delete(
  "/:companyId/cover-pic",
  authentication(),
  validation(deleteCompanySchema),
  deleteCompanyCoverPic
);
router.put(
  "/:companyId/logo",
  authentication(),
  validation(deleteCompanySchema),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).single("logo"),
  uploadCompanyLogo
);
router.put(
  "/:companyId/cover-pic",
  authentication(),
  validation(deleteCompanySchema),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).single("cover-pic"),
  uploadCompanyCoverPic
);
router.get(
  "/:companyId/related-jobs",
  validation(deleteCompanySchema),
  authentication(),
  getRelatedJobs
);
router.use("/:companyId?/job", JobRouter);
export default router;
