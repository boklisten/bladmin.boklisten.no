import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CustomerSearchComponent } from "./customer-search/customer-search.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CustomerSearchResultComponent } from "./customer-search/customer-search-result/customer-search-result.component";
import { CustomerSearchService } from "./customer-search/customer-search.service";
import { CustomerDetailModalComponent } from "./customer-detail/customer-detail-modal/customer-detail-modal.component";
import { NgbModalModule, NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { CustomerDetailModalContentComponent } from "./customer-detail/customer-detail-modal/customer-detail-modal-content/customer-detail-modal-content.component";

import { CustomerDetailService } from "./customer-detail/customer-detail.service";
import { BlCommonModule } from "../bl-common/bl-common.module";
import { CustomerCurrentComponent } from "./customer-current/customer-current.component";
import { CustomerDetailPopoverComponent } from "./customer-detail/customer-detail-popover/customer-detail-popover.component";
import { OrderModule } from "../order/order.module";
import { CustomerDetailSmallComponent } from "./customer-detail/customer-detail-small/customer-detail-small.component";
import { CustomerItemModule } from "../customer-item/customer-item.module";
import { MessengerModule } from "../messenger/messenger.module";
import { CustomerInformationComponent } from "./customer-information/customer-information.component";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		FontAwesomeModule,
		NgbModalModule,
		BlCommonModule,
		NgbPopoverModule,
		OrderModule,
		CustomerItemModule,
		MessengerModule,
	],
	providers: [CustomerSearchService, CustomerDetailService],
	declarations: [
		CustomerSearchComponent,
		CustomerSearchResultComponent,
		CustomerDetailModalComponent,
		CustomerDetailModalComponent,
		CustomerDetailModalContentComponent,
		CustomerCurrentComponent,
		CustomerDetailPopoverComponent,
		CustomerDetailSmallComponent,
		CustomerInformationComponent,
	],
	exports: [
		CustomerCurrentComponent,
		CustomerDetailPopoverComponent,
		CustomerSearchComponent,
		CustomerDetailSmallComponent,
		CustomerSearchResultComponent,
		CustomerInformationComponent,
	],
	entryComponents: [CustomerDetailModalContentComponent],
})
export class CustomerModule {}
