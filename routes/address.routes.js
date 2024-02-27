import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createAddressValidator, updateAddressValidator } from "../validators/address.validators.js";
import { validate } from "../validators/validate.js";
import { createAddress, deleteAddress, getAddressById, getAllAddresses, updateAddress } from "../controllers/address.controllers.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";


const router = Router();

router.use(verifyJWT);

router.route("/").post(createAddressValidator(), validate, createAddress).get(getAllAddresses);

router.route("/:addressId").get(mongoIdPathVariableValidator(addressId), validate, getAddressById)
.delete(mongoIdPathVariableValidator("addressId"), validate, deleteAddress)
.patch(updateAddressValidator(), mongoIdPathVariableValidator("addressId"), validate, updateAddress)

export default router;