import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { OrderRoutingModule } from "./order-routing.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { BlCommonModule } from "../bl-common/bl-common.module";
import { OrderDetailComponent } from "./order-detail/order-detail.component";
import { OrderPaymentDetailComponent } from "./order-detail/order-payment-detail/order-payment-detail.component";
import { OrderDetailCardComponent } from "./order-detail/order-detail-card/order-detail-card.component";
import { OrderDeliveryDetailComponent } from "./order-detail/order-delivery-detail/order-delivery-detail.component";
import { OrderItemListComponent } from "./order-detail/order-item-list/order-item-list.component";
import { OrderItemDetailListComponent } from "./order-detail/order-item-detail-list/order-item-detail-list.component";
import { CustomerOrderItemListComponent } from "./customer-order/customer-order-item-list/customer-order-item-list.component";
import { OrderHandlerService } from "./order-handler/order-handler.service";
import { AddOrderToCartComponent } from "./add-order-to-cart/add-order-to-cart.component";
import { CustomerOrderItemListItemComponent } from "./customer-order/customer-order-item-list/customer-order-item-list-item/customer-order-item-list-item.component";
import { OrderPaymentInformationComponent } from "./order-payment-information/order-payment-information.component";
import { OrderDeleteComponent } from "./order-delete/order-delete.component";
import { OrderItemEditComponent } from "./order-detail/order-item-edit/order-item-edit.component";
import { OrderItemDetailListItemComponent } from "./order-detail/order-item-detail-list-item/order-item-detail-list-item.component";
import { OrderConfirmComponent } from "./order-confirm/order-confirm.component";

@NgModule({
	imports: [
		CommonModule,
		OrderRoutingModule,
		FontAwesomeModule,
		BlCommonModule,
		FormsModule,
	],
	declarations: [
		OrderDetailComponent,
		OrderPaymentDetailComponent,
		OrderDetailCardComponent,
		OrderDeliveryDetailComponent,
		OrderItemListComponent,
		OrderItemDetailListComponent,
		CustomerOrderItemListComponent,
		AddOrderToCartComponent,
		CustomerOrderItemListItemComponent,
		OrderPaymentInformationComponent,
		OrderDeleteComponent,
		OrderItemEditComponent,
		OrderItemDetailListItemComponent,
		OrderConfirmComponent,
	],
	exports: [
		CustomerOrderItemListComponent,
		OrderItemListComponent,
		OrderItemDetailListComponent,
		OrderPaymentInformationComponent,
		OrderDetailCardComponent,
		OrderDeliveryDetailComponent,
		OrderPaymentDetailComponent,
		AddOrderToCartComponent,
		OrderDeleteComponent,
	],
	providers: [OrderHandlerService],
})
export class OrderModule {}
