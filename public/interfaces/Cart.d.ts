import { ObjectId } from "mongodb";
export interface ICart {
    _id: ObjectId;
    email: string;
    cartItems: ICartItem[];
}
export interface ICartItem {
    id?: string;
    src: string;
    description: string;
    title: string;
    price: number;
    quantity: number;
}
