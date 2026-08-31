import { Component, OnInit, OnDestroy } from "@angular/core";
import { UserDetail, UserPermission } from "@boklisten/bl-model";
import { Router, RouterEvent, ActivatedRoute } from "@angular/router";
import { CustomerService } from "../customer/customer.service";
import { UserService } from "../user/user.service";
import { CartService } from "../cart/cart.service";
import { AuthService } from "../auth/auth.service";
import { Subscription } from "rxjs";
import { BlcHotkeyService } from "../bl-common/blc-hotkey/blc-hotkey.service";
import { environment } from "../../environments/environment";
import { BranchStoreService } from "../branch/branch-store.service";

@Component({
	selector: "app-side-bar",
	templateUrl: "./side-bar.component.html",
	styleUrls: ["./side-bar.component.scss"],
})
export class SideBarComponent implements OnInit, OnDestroy {
	public customerDetail: UserDetail;
	public bladminVersion: string;
	public bladminVersionName: string;
	public isDevEnvironment: boolean;
	public sidebarLinks: {
		name: string;
		link: string;
		notification?: boolean;
		icon: string;
		selected: boolean;
		permission: UserPermission;
		hide?: boolean;
		color?: string;
		customerId?: string;
	}[];

	private customer$: Subscription;
	private customerClear$: Subscription;
	private router$: Subscription;
	private currentSidebarLinkIndex = 0;

	constructor(
		private _customerService: CustomerService,
		private _router: Router,
		private _userService: UserService,
		private _authService: AuthService,
		private _branchStoreService: BranchStoreService,
		private _blcHotkeyService: BlcHotkeyService
	) {
		this.isDevEnvironment = !environment.production;
		this.bladminVersion = environment.version;
		this.bladminVersionName = environment.versionName;
		this.sidebarLinks = [
			{
				name: "blid",
				link: "blid",
				icon: "search",
				permission: "employee",
				selected: false,
			},
			{
				name: "cart",
				link: "cart",
				icon: "shopping-cart",
				permission: "employee",
				selected: false,
			},
			{
				name: "bulk",
				link: "bulk",
				icon: "qrcode",
				permission: "employee",
				selected: false,
			},
			{
				name: "customer-search",
				link: "admin/kundesok",
				icon: "clipboard-list",
				permission: "employee",
				selected: false,
			},
			{
				name: "orders",
				link: "orders",
				icon: "receipt",
				permission: "employee",
				selected: false,
			},
			{
				name: "waitingList",
				link: "admin/venteliste",
				icon: "hourglass-end",
				permission: "employee",
				selected: false,
			},
			{
				name: "scanner",
				link: "scanner",
				icon: "barcode",
				permission: "employee",
				selected: false,
			},
			{
				name: "invoices",
				link: "invoices",
				icon: "file-invoice-dollar",
				permission: "admin",
				selected: false,
			},
			{
				name: "messenger",
				link: "admin/kommunikasjon/paminnelser",
				icon: "envelope",
				permission: "admin",
				selected: false,
			},
			{
				name: "database",
				link: "database",
				icon: "database",
				permission: "admin",
				selected: false,
			},
			{
				name: "user",
				link: "admin/user-settings",
				icon: this.getUserIcon(),
				permission: "employee",
				selected: false,
				color: "info",
			},
		];
	}

	ngOnInit() {
		this.hideNoPermissionLinks();
		this.handleCustomerChange();
		this.handleCustomerClearChange();
		this.handleRouterChange();
		this.handleUpShortcut();
		this.handleDownShortcut();
	}

	ngOnDestroy() {
		this.customer$.unsubscribe();
		this.customerClear$.unsubscribe();
		this.router$.unsubscribe();
	}

	get getHasSelectedBranch() {
		return this._branchStoreService.haveBranch();
	}

	private handleUpShortcut() {
		this._blcHotkeyService
			.addShortcut({ keys: "alt.arrowup" })
			.subscribe(() => {
				if (this.currentSidebarLinkIndex > -1) {
					this.currentSidebarLinkIndex--;
					if (this.currentSidebarLinkIndex == -1) {
						this.deselectAllSideBarLinks();
						this._router.navigate(["/home"]);
					}

					this.selectSidebarLinkBasedOnIndex(
						this.currentSidebarLinkIndex
					);
				}
			});
	}

	private handleDownShortcut() {
		this._blcHotkeyService
			.addShortcut({ keys: "alt.arrowdown" })
			.subscribe(() => {
				if (
					this.currentSidebarLinkIndex <
					this.sidebarLinks.length - 1
				) {
					this.currentSidebarLinkIndex++;
					this.selectSidebarLinkBasedOnIndex(
						this.currentSidebarLinkIndex
					);
				}
			});
	}

	private selectSidebarLinkBasedOnIndex(index: number) {
		if (this.sidebarLinks[index]) {
			this.deselectAllSideBarLinks();
			this.sidebarLinks[index].selected = true;
			this.currentSidebarLinkIndex = index;
			this._router.navigate([this.sidebarLinks[index].link]);
		}
	}

	private handleRouterChange() {
		this.router$ = this._router.events.subscribe((event: RouterEvent) => {
			if (event.url) {
				this.selectSidebarLinkBasedOnRoute(
					this.getFirstSegment(event.url)
				);
			}
		});
	}

	private getUserIcon(): string {
		let permission = this._authService.getPermission();
		switch (permission) {
			case "employee":
				return "user";
			case "manager":
				return "user-tie";
			case "admin":
				return "user-astronaut";
			case "super":
				return "user-secret";
		}
	}

	private getFirstSegment(url: string) {
		if (url) {
			let a = url.split("/");
			if (a[1]) {
				let b = a[1].split("?")[0];
				return b;
			}
			return "";
		}
	}

	private handleCustomerChange() {
		this.customer$ = this._customerService.subscribe(
			(customerDetail: UserDetail) => {
				this.addCustomerSidebarLinks(customerDetail.id);
			}
		);
	}

	private handleCustomerClearChange() {
		this.customerClear$ = this._customerService.onClear(() => {
			this.removeCustomerSidebarLinks();
		});
	}

	private selectSidebarLinkBasedOnRoute(url: string) {
		for (let i = 0; i < this.sidebarLinks.length; i++) {
			if (url.indexOf(this.sidebarLinks[i].name) >= 0) {
				this.deselectAllSideBarLinks();
				this.sidebarLinks[i].selected = true;
				this.currentSidebarLinkIndex = i;
				return;
			}
		}
	}

	private removeCustomerSidebarLinks() {
		this.sidebarLinks = this.sidebarLinks.filter((sl) => {
			if (sl.name === "customer") {
				return false;
			}
			return true;
		});
	}

	private addCustomerSidebarLinks(customerDetailId: string) {
		if (
			this.currentSidebarLinkIndex < this.sidebarLinks.length - 1 &&
			!this.haveCustomerSidebarLink()
		) {
			this.currentSidebarLinkIndex++;
		}
		this.removeCustomerSidebarLinks();
		this.sidebarLinks.unshift({
			name: "customer",
			link: "/customer/detail",
			icon: "address-card",
			selected: this._router.url.includes("customer/detail"),
			permission: "employee",
			hide: false,
			customerId: customerDetailId,
		});
	}

	private haveCustomerSidebarLink(): boolean {
		for (let sidebarLink of this.sidebarLinks) {
			if (sidebarLink.name === "customer") {
				return true;
			}
		}
		return false;
	}

	private hideNoPermissionLinks() {
		for (const sidebarLink of this.sidebarLinks) {
			if (!this._userService.havePermission(sidebarLink.permission)) {
				sidebarLink.hide = true;
			}
		}
	}

	private deselectAllSideBarLinks() {
		for (const sidebarLink of this.sidebarLinks) {
			sidebarLink.selected = false;
		}
	}
}
