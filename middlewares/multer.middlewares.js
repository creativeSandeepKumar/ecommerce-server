import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/images");
    },

    filename: function (req, file, cb) {
        let fileExtension = "";
        if(file.originalname.split(".").length > 1){
            fileExtension = file.originalname.substring(file.originalname.lastIndexOf("."));
        }
        
        const filenameWithoutExtension = file.originalname.toLowerCase().split(" ").join("-")?.split(".")[0];
        cb(null, filenameWithoutExtension + Date.now() + Math.ceil(Math.random() + 1e5) + fileExtension);

    }
});

// Multer configuration for handling main image upload
const mainImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images'); // Destination directory for storing main images
    },
    filename: function (req, file, cb) {
      let fileExtension = '';
      if (file.originalname.split('.').length > 1) {
        fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
      }
      const filenameWithoutExtension = file.originalname.toLowerCase().split(' ').join('-')?.split('.')[0];
      cb(null, filenameWithoutExtension + Date.now() + Math.ceil(Math.random() + 1e5) + fileExtension);
    }
  });
  
  export const uploadMainImage = multer({ storage: mainImageStorage }).single('mainImage');
  
  // Multer configuration for handling sub-images upload
  const subImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images'); // Destination directory for storing sub-images
    },
    filename: function (req, file, cb) {
      let fileExtension = '';
      if (file.originalname.split('.').length > 1) {
        fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
      }
      const filenameWithoutExtension = file.originalname.toLowerCase().split(' ').join('-')?.split('.')[0];
      cb(null, filenameWithoutExtension + Date.now() + Math.ceil(Math.random() + 1e5) + fileExtension);
    }
  });
  
  export const uploadSubImages = multer({ storage: subImagesStorage }).array('subImages');

export const upload = multer({
    storage,
})
