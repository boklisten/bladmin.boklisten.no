import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UserDetail } from "@boklisten/bl-model";
import { CustomerDetailService } from "./customer-detail.service";
import { AuthService } from "../../auth/auth.service";
import { CustomerService } from "../customer.service";
import { Subscription } from "rxjs";

@Component({
	selector: "app-customer-detail",
	templateUrl: "./customer-detail.component.html",
	styleUrls: ["./customer-detail.component.scss"],
})
export class CustomerDetailComponent implements OnInit {
	public customerDetail: UserDetail;
	public showUserDetail: boolean;
	public _currentId: string;
	public customerDetailUpdated: boolean;
	public wait: boolean;
	public warningText: string;
	private customer$: Subscription;
	private customerWait$: Subscription;

	constructor(
		private _route: ActivatedRoute,
		private _authService: AuthService,
		private _customerService: CustomerService,
		private _customerDetailService: CustomerDetailService
	) {
		this.customerDetailUpdated = false;
		this.warningText = null;
		try {
			this._currentId = _customerDetailService.getId();
		} catch (error) {}
		this._route.queryParams.subscribe((params) => {
			if (params.customerId) {
				this._customerService.set(params.customerId);
			}
		});
	}

	ngOnInit() {
		this.onCustomerChange();
		this.onCustomerWaitChange();
	}

	ngOnDestroy() {
		this.customer$.unsubscribe();
		this.customerWait$.unsubscribe();
	}

	public onUserDetailEmailChange() {
		this._customerService.reload();
	}

	public onUserDetailUpdated() {
		this.customerDetailUpdated = true;
	}

	public isAdmin() {
		return this._authService.isAdmin();
	}

	public isManager() {
		return this._authService.isManager();
	}

	private onCustomerChange() {
		this.customer$ = this._customerService.subscribe(
			(customerDetail: UserDetail) => {
				this.customerDetail = customerDetail;
			}
		);
	}

	private onCustomerWaitChange() {
		this.customerWait$ = this._customerService.onWait((wait) => {
			this.wait = wait;
		});
	}
}
