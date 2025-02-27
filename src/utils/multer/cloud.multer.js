import multer from "multer";
export const fileValidationTypes = {
  image: [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
  ],
  document: ["application/json", "application/pdf", "application/msword"],
};
export const uploadCloudFile = ({ fileValidation = [] }) => {
  function fileFilter(req, file, cb) {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb("Invalid File Extension", false);
    }
  }
  return multer({
    dest: "dest",
    fileFilter,
  });
};
