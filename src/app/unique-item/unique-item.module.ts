import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UniqueItemRegisterComponent } from "./unique-item-register/unique-item-register.component";
import { BlCommonModule } from "../bl-common/bl-common.module";
import { ScannerModule } from "../scanner/scanner.module";
import { ItemModule } from "../item/item.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { UniqueItemScanToCartComponent } from "./unique-item-scan-to-cart/unique-item-scan-to-cart.component";
import { UniqueItemRegisterFromCartComponent } from "./unique-item-register-from-cart/unique-item-register-from-cart.component";
import { UniqueItemScanOrderToCartComponent } from "./unique-item-scan-order-to-cart/unique-item-scan-order-to-cart.component";
import { CustomerItemModule } from "../customer-item/customer-item.module";
import { CustomerModule } from "../customer/customer.module";
import { FormsModule } from "@angular/forms";

@NgModule({
	declarations: [
		UniqueItemRegisterComponent,
		UniqueItemScanToCartComponent,
		UniqueItemRegisterFromCartComponent,
		UniqueItemScanOrderToCartComponent,
	],
	imports: [
		CommonModule,
		BlCommonModule,
		ScannerModule,
		ItemModule,
		FontAwesomeModule,
		CustomerItemModule,
		CustomerModule,
		FormsModule,
	],
	exports: [
		UniqueItemRegisterComponent,
		UniqueItemScanToCartComponent,
		UniqueItemRegisterFromCartComponent,
		UniqueItemScanOrderToCartComponent,
	],
})
export class UniqueItemModule {}
