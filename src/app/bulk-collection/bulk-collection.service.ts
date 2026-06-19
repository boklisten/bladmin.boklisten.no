import { Injectable } from "@angular/core";
import {
	BranchService,
	CustomerItemService,
	OrderService,
	UserDetailService,
} from "@boklisten/bl-connect";
import { CustomerItem, OrderItem } from "@boklisten/bl-model";
import { ScannedBook } from "@boklisten/bl-model/bulk-collection/bulk-collection";
import { OrderGeneratorService } from "../order/order-generator/order-generator.service";
import { PriceService } from "../price/price.service";
import { ToasterService } from "../toaster/toaster.service";
import { UniqueItemStoreService } from "../unique-item/unique-item-store.service";
import { BranchStoreService } from "../branch/branch-store.service";

@Injectable({
	providedIn: "root",
})
export class BulkCollectionService {
	constructor(
		private _orderService: OrderService,
		private _priceService: PriceService,
		private _orderGeneratorService: OrderGeneratorService,
		private _uniqueItemStoreService: UniqueItemStoreService,
		private _customerItemService: CustomerItemService,
		private _branchService: BranchService,
		private _branchStoreService: BranchStoreService,
		private _toasterService: ToasterService,
		private _userDetailService: UserDetailService
	) {}

	public async collectOrders(separatedCustomerBooks: ScannedBook[][]) {
		const addOrderRequests = separatedCustomerBooks.map((customerItems) =>
			this._orderService.add(this.createOrder(customerItems))
		);
		const completedOrders = await Promise.all(addOrderRequests);

		const placeOrderRequests = completedOrders.map((order) =>
			this._orderService.updateWithOperation(order.id, {}, "place")
		);
		return await Promise.all(placeOrderRequests);
	}

	public separateBooksByCustomer(
		scannedBooks: ScannedBook[]
	): ScannedBook[][] {
		const separatedBooks: ScannedBook[][] = [];
		for (const book of scannedBooks) {
			const index = separatedBooks.findIndex(
				(customerBooks) =>
					customerBooks[0].customerId === book.customerId
			);
			if (index === -1) {
				separatedBooks.push([book]);
			} else {
				separatedBooks[index].push(book);
			}
		}

		return separatedBooks;
	}

	public async createBookFromBlid(
		blid: string,
		initialCustomerItem?: string
	): Promise<ScannedBook> {
		try {
			const result = await Promise.all([
				this._uniqueItemStoreService.get(blid),
				this.getCustomerItem(blid, initialCustomerItem),
			]);
			const uniqueItem = result[0];
			const customerItem = result[1];
			const buybackInfo = customerItem.buybackInfo as {
				order: string;
				time: Date;
			};
			const collectionTime =
				customerItem.type === "partly-payment"
					? buybackInfo?.time
					: customerItem.returnInfo?.time;

			let handoutBranch = this._branchStoreService.getCurrentBranch();
			if (handoutBranch.id !== customerItem.handoutInfo.handoutById) {
				handoutBranch = await this._branchService.getById(
					customerItem.handoutInfo.handoutById
				);
			}

			return {
				id: customerItem.id,
				customerId: customerItem.customer as string,
				item: customerItem.item as string,
				blid: customerItem.blid,
				deadline: this.prettyDate(customerItem.deadline),
				title: uniqueItem.title,
				customerName: customerItem.customerInfo.name,
				handoutBranchName: handoutBranch.name,
				collectedAt: this.prettyTime(collectionTime),
				type: customerItem.type,
			};
		} catch (error) {
			const errorMessage = error.message || error.name || error.msg;
			switch (errorMessage) {
				case "could not connect":
					this.displayWarning(
						"Tilkoblingen ble brutt! Vennligst prøv igjen."
					);
					break;
				case "BlApiNotFoundError":
					this.displayWarning("BL-ID er ikke aktiv.");
					break;
				case "book not active":
					this.displayWarning("Boken er ikke aktiv.");
					break;
				default:
					console.log(errorMessage);
					this.displayWarning("Scanning av BL-ID feilet!");
					throw error;
			}
		}
	}

	public async getCustomerItem(
		blid: string,
		customerItemId: string
	): Promise<CustomerItem> {
		try {
			const query = customerItemId
				? "/" + customerItemId
				: // Check both the blid and its inverted sibling to detected blids that have been inverted
				  `?blid=${blid}&blid=${this.invertBlid(
						blid
				  )}&returned=false&buyout=false`;
			const customerItems = await this._customerItemService.get({
				query: query,
			});
			const customerItem = customerItems[0];
			if (!customerItem.customerInfo) {
				customerItem.customerInfo = await this._userDetailService.getById(
					customerItem.customer
				);
			}
			return customerItem;
		} catch (error) {
			throw new Error("book not active");
		}
	}

	private invertBlid(blid: string) {
		return blid
			.split("")
			.map((char) =>
				char === char.toUpperCase()
					? char.toLowerCase()
					: char.toUpperCase()
			)
			.join("");
	}

	private displayWarning(text: string) {
		this._toasterService.add(
			"WARNING",
			{
				text: text,
			},
			15000
		);
	}

	public prettyTime(inputDate: Date = new Date()) {
		const date = new Date(inputDate);
		const hours = this.addZeroToNum(date.getHours());
		const minutes = this.addZeroToNum(date.getMinutes());
		const seconds = this.addZeroToNum(date.getSeconds());
		return `${hours}:${minutes}:${seconds}`;
	}

	private prettyDate(inputDate: Date) {
		const date = new Date(inputDate);
		const day = this.addZeroToNum(date.getDate());
		const month = this.addZeroToNum(date.getMonth() + 1);
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	private addZeroToNum(number: number) {
		return number < 10 ? "0" + number : String(number);
	}

	private createOrder(items: ScannedBook[]) {
		const orderItems = items.map((item) => this.createOrderItem(item));

		return this._orderGeneratorService.generateOrder(
			orderItems,
			items[0].customerId,
			true
		);
	}

	private createOrderItem(scannedBook: ScannedBook): OrderItem {
		const priceInformation = this._priceService.getEmptyPriceInformation();

		return {
			type: scannedBook.type === "partly-payment" ? "buyback" : "return",
			item: scannedBook.item,
			title: scannedBook.title,
			blid: scannedBook.blid,
			age: "used",
			amount: priceInformation.amount,
			unitPrice: priceInformation.unitPrice,
			taxRate: priceInformation.taxRate,
			taxAmount: priceInformation.taxAmount,
			handout: true,
			info: {
				buybackAmount: priceInformation.amount,
				customerItem: scannedBook.id,
			},
			discount: null,
			delivered: true,
			customerItem: scannedBook.id,
			match: null,
			movedToOrder: null,
			movedFromOrder: null,
		};
	}
}
