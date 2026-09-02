import { BrowserModule } from "@angular/platform-browser";
import { APP_INITIALIZER, ErrorHandler, NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./home/home.component";
import { environment } from "../environments/environment";
import { HeaderComponent } from "./header/header.component";
import { SideBarComponent } from "./side-bar/side-bar.component";
import { SideBarButtonComponent } from "./side-bar/side-bar-button/side-bar-button.component";
import {
	FaIconLibrary,
	FontAwesomeModule,
} from "@fortawesome/angular-fontawesome";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { InvoiceModule } from "./invoice/invoice.module";
import { BranchStoreService } from "./branch/branch-store.service";
import { BranchModule } from "./branch/branch.module";
import { BranchGuardService } from "./branch/branch-guard.service";
import { StorageService } from "./storage/storage.service";
import { CustomerModule } from "./customer/customer.module";
import { MessengerModule } from "./messenger/messenger.module";
import { ScannerModule } from "./scanner/scanner.module";
import { addIconsToLibrary } from "./font-awesome-icons";
import { BlCommonModule } from "./bl-common/bl-common.module";
import { ItemModule } from "./item/item.module";
import {
	BlConnectConfigService,
	BlConnectModule,
	TokenService,
} from "@boklisten/bl-connect";
import { CartModule } from "./cart/cart.module";
import { CartService } from "./cart/cart.service";
import { DateService } from "./date/date.service";
import { CustomerOrderService } from "./order/customer-order/customer-order.service";
import { CustomerService } from "./customer/customer.service";
import { UserService } from "./user/user.service";
import { DatabaseModule } from "./database/database.module";
import { BranchItemStoreService } from "./branch/branch-item-store/branch-item-store.service";
import { PriceModule } from "./price/price.module";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { BlcScannerService } from "./bl-common/blc-scanner/blc-scanner.service";
import { MessagesComponent } from "./messages/messages.component";
import { HeaderCustomerSearchComponent } from "./header/header-customer-search/header-customer-search.component";
import { ToasterModule } from "./toaster/toaster.module";
import { OrderManagerModule } from "./order-manager/order-manager.module";
import * as Sentry from "@sentry/angular";
import { Router } from "@angular/router";
import { BlNextLinkerModule } from "./bl-next-linker/bl-next-linker.module";
import { BlNextLinkerService } from "./bl-next-linker/bl-next-linker.service";
import { AuthGatewayComponent } from "./auth-gateway/auth-gateway.component";

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		HeaderComponent,
		SideBarComponent,
		SideBarButtonComponent,
		MessagesComponent,
		HeaderCustomerSearchComponent,
		AuthGatewayComponent,
	],
	imports: [
		BrowserModule,
		BlConnectModule,
		AppRoutingModule,
		AuthModule,
		BlNextLinkerModule,
		UserModule,
		BranchModule,
		FontAwesomeModule,
		CustomerModule,
		BlCommonModule,
		ItemModule,
		CartModule,
		DatabaseModule,
		PriceModule,
		NgbDropdownModule,
		InvoiceModule,
		MessengerModule,
		ScannerModule,
		ToasterModule,
		OrderManagerModule,
	],
	providers: [
		BlNextLinkerService,
		BranchStoreService,
		BranchItemStoreService,
		BranchGuardService,
		StorageService,
		CartService,
		DateService,
		CustomerOrderService,
		CustomerService,
		UserService,
		BlcScannerService,
		TokenService,
		{
			provide: ErrorHandler,
			useValue: Sentry.createErrorHandler({
				showDialog: false,
			}),
		},
		{
			provide: Sentry.TraceService,
			deps: [Router],
		},
		{
			provide: APP_INITIALIZER,
			useFactory: () => () => {},
			deps: [Sentry.TraceService],
			multi: true,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {
	constructor(
		private _blConnectConfig: BlConnectConfigService,
		library: FaIconLibrary
	) {
		addIconsToLibrary(library);

		_blConnectConfig.setConfig({ basePath: environment.apiPath });
	}
}
