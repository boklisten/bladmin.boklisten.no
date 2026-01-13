import { Component, Input, OnInit } from "@angular/core";
import { CustomerItem, Item } from "@boklisten/bl-model";
import { DateService } from "../../../date/date.service";
import { AuthService } from "../../../auth/auth.service";
import { CustomerItemListService } from "../customer-item-list.service";
import {
	BranchService,
	ItemService,
	OrderService,
} from "@boklisten/bl-connect";

@Component({
	selector: "app-customer-item-list-item",
	templateUrl: "./customer-item-list-item.component.html",
	styleUrls: ["./customer-item-list-item.component.scss"],
})
export class CustomerItemListItemComponent implements OnInit {
	@Input() customerItem: CustomerItem;
	public item: Item;
	public deadlineExpired: boolean;
	public showAddButton: boolean;
	public amountLeftToPayBuyout: number;

	constructor(
		private _dateService: DateService,
		private _authService: AuthService,
		private _customerItemListService: CustomerItemListService,
		private branchService: BranchService,
		private itemService: ItemService,
		private orderService: OrderService
	) {}

	async ngOnInit() {
		this.deadlineExpired = this._dateService.isDeadlineExpired(
			this.customerItem.deadline
		);

		this.showAddButton = this.shouldShowAddButton();

		const customerItemWithItem = this._customerItemListService.getByCustomerItemId(
			this.customerItem.id
		);
		this.item = customerItemWithItem.item;

		try {
			if (this.customerItem.type !== "partly-payment") {
				return;
			}
			const branch = await this.branchService.getById(
				this.customerItem.handoutInfo.handoutById
			);
			const order = await this.orderService.getById(
				this.customerItem.orders?.[
					(this.customerItem.orders?.length ?? 1) - 1
				]
			);
			const orderItem = order?.orderItems.find(
				(oi) => oi.customerItem === this.customerItem.id
			);
			const buyoutPercentage =
				branch?.paymentInfo?.partlyPaymentPeriods?.find(
					(period) => period.type === orderItem.info?.periodType
				)?.percentageBuyout ?? branch?.paymentInfo?.buyout?.percentage;
			const item = await this.itemService.getById(orderItem.item);
			this.amountLeftToPayBuyout =
				this.customerItem.amountLeftToPay ||
				Math.floor((item.price * buyoutPercentage) / 10) * 10;
		} catch (error) {
			console.log(
				"failed to get branch info for buyout price calculation"
			);
		}
	}

	private shouldShowAddButton() {
		if (this.deadlineExpired) {
			return this._authService.isAdmin();
		}
		return true;
	}
}
