import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middlewares.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";
import { validate } from "../validators/validate.js";
import { generatePaypalOrder, generateRazorPayOrder, getOrderById, getOrderListAdmin, updateOrderStatus, verifyPaypalPayment, verifyRazorPayPayment } from "../controllers/order.controllers.js";
import { orderUpdateStatusValidator, verifyPaypalPaymentValidator, verifyRazorpayPaymentValidator } from "../validators/order.validators.js";
import { UserRolesEnum } from "../constants.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/provider/razorpay")
  .post(
    mongoIdPathVariableValidator("addressId"),
    validate,
    generateRazorPayOrder
  );

router
  .route("/provider/paypal")
  .post(
    mongoIdPathVariableValidator("addressId"),
    validate,
    generatePaypalOrder
  );

router
  .route("/provider/razorpay/verify-payment")
  .post(
    verifyRazorpayPaymentValidator(),
    validate,
    verifyRazorPayPayment
  );

router
  .route("/provider/paypal/verify-payment")
  .post(
    verifyPaypalPaymentValidator(),
    validate,
    verifyPaypalPayment
  );

router
  .route("/:orderId")
  .post(
    mongoIdPathVariableValidator("orderId"),
    validate,
    getOrderById
  );

  router.route("/list/admin").get(verifyPermission([UserRolesEnum.ADMIN]), getOrderListAdmin
  );
  router.route("/list/admin")
  .patch(
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("orderId"),
    orderUpdateStatusValidator(),
    validate,
    updateOrderStatus
  )

export default router;
