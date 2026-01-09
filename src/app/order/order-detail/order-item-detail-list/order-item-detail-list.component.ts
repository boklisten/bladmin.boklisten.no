import { Component, Input, OnInit, EventEmitter, Output } from "@angular/core";
import { Order, OrderItem } from "@boklisten/bl-model";

@Component({
	selector: "app-order-item-detail-list",
	templateUrl: "./order-item-detail-list.component.html",
	styleUrls: ["./order-item-detail-list.component.scss"],
})
export class OrderItemDetailListComponent implements OnInit {
	@Input() orderBranchId: string;
	@Input() orderItems: OrderItem[];
	@Output() shouldDelete: EventEmitter<number>;

	constructor() {
		this.shouldDelete = new EventEmitter();
	}

	ngOnInit() {}

	public onShouldDelete(index: number) {
		this.shouldDelete.emit(index);
	}
}
