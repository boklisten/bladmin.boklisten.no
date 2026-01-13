import { Injectable } from "@angular/core";
import { CustomerItem, Item } from "@boklisten/bl-model";
import { Period } from "@boklisten/bl-model/period/period";
import { BranchStoreService } from "../../branch/branch-store.service";
import { PriceService } from "../price.service";
import { BranchService, OrderService } from "@boklisten/bl-connect";
import { OrderHelperService } from "../../order/order-helper/order-helper.service";
import { PriceInformation } from "../price-information";

export interface OrderItemAmounts {
	unitPrice: number;
	amount: number;
	taxAmount: number;
}

@Injectable()
export class CustomerItemPriceService {
	constructor(
		private _branchStoreService: BranchStoreService,
		private _orderService: OrderService,
		private _orderHelperService: OrderHelperService,
		private _priceService: PriceService,
		private _branchService: BranchService
	) {}

	public async getPartlyPaymentBuyoutPriceInformation(
		customerItem: CustomerItem,
		item: Item
	): Promise<PriceInformation> {
		const customerItemBranch = customerItem.handoutInfo.handoutById;
		const currentBranch = this._branchStoreService.getCurrentBranch();
		const branch =
			customerItemBranch === currentBranch.id
				? currentBranch
				: await this._branchService.getById(customerItemBranch);

		const order = await this._orderService.getById(
			customerItem.orders?.[(customerItem.orders?.length ?? 1) - 1]
		);
		const orderItem = order?.orderItems.find(
			(oi) => oi.customerItem === customerItem.id
		);
		const buyoutPercentage =
			branch?.paymentInfo?.partlyPaymentPeriods?.find(
				(period) => period.type === orderItem?.info?.periodType
			)?.percentageBuyout ?? branch?.paymentInfo?.buyout?.percentage;

		const amount =
			customerItem.amountLeftToPay ||
			Math.floor((item.price * buyoutPercentage) / 10) * 10;
		return this._priceService.calculatePriceInformation(
			amount,
			item.taxRate
		);
	}

	public async getRentBuyoutPriceInformation(
		customerItem: CustomerItem,
		item: Item
	): Promise<PriceInformation> {
		const customerItemBranch = customerItem.handoutInfo.handoutById;
		const currentBranch = this._branchStoreService.getCurrentBranch();
		const branch =
			customerItemBranch === currentBranch.id
				? currentBranch
				: await this._branchService.getById(customerItemBranch);
		const amount = item.price * branch.paymentInfo.buyout.percentage;
		return this._priceService.calculatePriceInformation(
			amount,
			item.taxRate
		);
	}

	public getRentReturnPriceInformation(
		customerItem: CustomerItem,
		item: Item
	): PriceInformation {
		let amount = 0;

		if (customerItem.totalAmount && customerItem.handout) {
			amount = 0 - customerItem.totalAmount;
		}

		return this._priceService.calculatePriceInformation(
			amount,
			item.taxRate
		);
	}

	public getExtendPriceInformation(
		customerItem: CustomerItem,
		item: Item,
		period: Period
	): PriceInformation {
		const amount = this.amountExtend(period);
		return this._priceService.calculatePriceInformation(
			amount,
			item.taxRate
		);
	}

	public getBuybackPriceInformation(
		customerItem: CustomerItem
	): PriceInformation {
		return this._priceService.getEmptyPriceInformation();
	}

	public async getCancelPriceInformation(
		customerItem: CustomerItem,
		item: Item
	): Promise<PriceInformation> {
		let amount = 0;

		try {
			amount = await this.amountCancel(customerItem);
		} catch (e) {
			throw new Error("could not calculate amount for cancel");
		}

		return this._priceService.calculatePriceInformation(
			amount,
			item.taxRate
		);
	}

	private amountExtend(period: Period, item?: Item): number {
		const branch = this._branchStoreService.getCurrentBranch();
		for (const extendPeriod of branch.paymentInfo.extendPeriods) {
			if (extendPeriod.type === period) {
				if (extendPeriod.percentage && item) {
					return item.price * extendPeriod.percentage;
				} else {
					return extendPeriod.price;
				}
			}
		}
	}

	private async amountCancel(customerItem: CustomerItem): Promise<number> {
		if (customerItem.handout && customerItem.handoutInfo) {
			const orders = customerItem.orders as string[];
			const itemCancelAmounts = await Promise.all(
				orders.map((orderId) =>
					this.calculateOrderItemCancelAmount(
						orderId as string,
						customerItem.item as string
					)
				)
			);

			const totalCancelAmount = itemCancelAmounts.reduce(
				(sum, amount) => sum + amount,
				0
			);

			return 0 - totalCancelAmount;
		}

		throw new Error("could not calculate total cancel amount");
	}

	private async calculateOrderItemCancelAmount(
		orderId: string,
		itemId: string
	): Promise<number> {
		const order = await this._orderService.getById(orderId);
		const orderItem = this._orderHelperService.getOrderItemFromOrder(
			itemId,
			order
		);

		if (orderItem.movedFromOrder) {
			return await this.calculateOrderItemCancelAmount(
				orderItem.movedFromOrder as string,
				itemId
			);
		}
		return orderItem.amount;
	}
}
