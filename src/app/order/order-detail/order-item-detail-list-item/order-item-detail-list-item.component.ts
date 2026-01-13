import {
	Component,
	OnInit,
	Input,
	ViewChild,
	Output,
	EventEmitter,
} from "@angular/core";
import { OrderItem } from "@boklisten/bl-model";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { BranchService, ItemService } from "@boklisten/bl-connect";

@Component({
	selector: "app-order-item-detail-list-item",
	templateUrl: "./order-item-detail-list-item.component.html",
	styleUrls: ["./order-item-detail-list-item.component.scss"],
})
export class OrderItemDetailListItemComponent implements OnInit {
	@Input() orderBranchId: string;
	@Input() orderItem: OrderItem;
	@Input() index: number;
	@ViewChild("orderItemEditModal") private orderItemEditModal: NgbModalRef;
	@Output() shouldDelete: EventEmitter<boolean>;
	public amountLeftToPayBuyout: number;

	constructor(
		private _modalService: NgbModal,
		private branchService: BranchService,
		private itemService: ItemService
	) {
		this.shouldDelete = new EventEmitter();
	}

	async ngOnInit() {
		try {
			const branch = await this.branchService.getById(this.orderBranchId);
			const buyoutPercentage =
				branch?.paymentInfo?.partlyPaymentPeriods?.find(
					(period) => period.type === this.orderItem.info?.periodType
				)?.percentageBuyout ?? branch?.paymentInfo?.buyout?.percentage;
			const item = await this.itemService.getById(this.orderItem.item);
			if (this.orderItem.type !== "partly-payment") {
				return;
			}
			this.amountLeftToPayBuyout =
				// @ts-ignore bad types
				this.orderItem.info.amountLeftToPay ||
				Math.floor((item.price * buyoutPercentage) / 10) * 10;
		} catch (error) {
			console.log(
				"failed to get branch info for buyout price calculation"
			);
		}
	}

	public onClick() {
		this._modalService.open(this.orderItemEditModal);
	}

	public onShouldDelete() {
		this._modalService.dismissAll();
		this.shouldDelete.emit(true);
	}
}
