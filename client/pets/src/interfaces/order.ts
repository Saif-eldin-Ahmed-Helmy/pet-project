import {OrderItem} from "./orderItem.ts";

interface OrderTrace {
    type: 'placed' | 'preparing' | 'prepared' | 'delivering' | 'delivered' | 'cancelled';
    date: string;
    executor: string;
    active: boolean;
}

interface CouponCode {
    code: string;
    expiryDate: string;
    discount: number;
    discountType: 'percentage' | 'amount';
    couponType: 'order' | 'item';
    itemId?: string;
    maximumAmount?: number;
}

export interface Order {
    orderId: string;
    date: string;
    trace: OrderTrace[];
    items: OrderItem[];
    couponCodes: CouponCode[];
    location: Location;
    tip: number;
    amount: number;
    cashAmount: number;
    finalAmount: number;
    rating: number;
    comment: string;
    userRating: number;
    userComment: string;
    driverRating: number;
    driverComment: string;
    userEmail: string;
    status: 'placed' | 'preparing' | 'prepared' | 'delivering' | 'delivered' | 'cancelled';
}