import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middlewares.js";
import { validate } from "../validators/validate.js";
import { applyCouponCodeValidator, couponActivityStatusValidator, createCouponValidator, updateCouponValidator } from "../validators/coupon.validators.js";
import { applyCoupon, createCoupon, deleteCoupon, getAllCoupons, getCouponById, getValidCouponsForCustomers, removeCouponFromCart, updateCoupon, updateCouponActivityStatus } from "../controllers/coupon.controllers.js";
import { UserRolesEnum } from "../constants.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";


const router = Router();

router.use(verifyJWT);

router.route("/c/apply").post(applyCouponCodeValidator(), validate, applyCoupon);

router.route("/c/remove").post(removeCouponFromCart);

router.route("/customer/available").get(getValidCouponsForCustomers);

router.use(verifyPermission([UserRolesEnum.ADMIN]));

router.route("/").get(getAllCoupons)
.post(createCouponValidator(), validate, createCoupon);

router.route("/:couponId").get(mongoIdPathVariableValidator("couponId"), validate, getCouponById)
.patch(
    mongoIdPathVariableValidator("couponId"),
    updateCouponValidator(),
    validate,
    updateCoupon
)
.delete(mongoIdPathVariableValidator("couponId"), validate, deleteCoupon);

router.route("/status/:couponId")
.patch(
    mongoIdPathVariableValidator("couponId"),
    couponActivityStatusValidator(),
    validate,
    updateCouponActivityStatus
)

export default router;