export const DB_NAME = "ecommerce";

export const UserRolesEnum = {
    ADMIN: "ADMIN",
    USER: "USER",
} ;

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const OrderStatusEnum = {
    PENDING: "PENDING",
    CANCELLED: "CANCELLED",
    DELIVERED: "DELIVERED"
};

export const AvailableOrderStatuses = Object.values(OrderStatusEnum);

export const PaymentProviderEnum = {
    UNKNOWN: "UNKNOWN",
    RAZORPAY: "RAZORPAY",
    PAYPAL: "PAYPAL",
};

export const AvailablePaymentProviders = Object.values(PaymentProviderEnum);


export const UserLoginType = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
} ;

export const AvailableSocialLogins = Object.values(UserLoginType);

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000;

export const MAXIMUM_SUB_IMAGE_COUNT = 5;

export const CouponTypesEnum = {
    FLAT: "FLAT",
};

export const AvailableCouponTypes = Object.values(CouponTypesEnum);
