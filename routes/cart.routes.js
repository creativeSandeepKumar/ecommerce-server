import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { addItemOrUpdateItemQuantity, clearCart, getUserCart, removeItemFromCart } from '../controllers/cart.controllers.js';
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js"
import { addItemOrUpdateItemQuantityValidator } from "../validators/cart.validators.js";
import { validate } from "../validators/validate.js"

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserCart);
router.route("/clear").delete(clearCart);

router.route("/item/:productId").post(mongoIdPathVariableValidator("productId"),
addItemOrUpdateItemQuantityValidator(),
validate,
addItemOrUpdateItemQuantity
)
.delete(mongoIdPathVariableValidator("productId"),
validate,
removeItemFromCart
)

export default router;