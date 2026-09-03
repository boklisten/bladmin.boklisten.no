import { Component, OnInit } from "@angular/core";
import { BlNextLinkerService } from "./bl-next-linker.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomerService } from "../customer/customer.service";

@Component({
	selector: "app-bl-next-linker",
	templateUrl: "./bl-next-linker.component.html",
})
export class BlNextLinkerComponent implements OnInit {
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private blNextLinkerService: BlNextLinkerService,
		private customerService: CustomerService
	) {}

	ngOnInit(): void {
		this.blNextLinkerService.redirectToBlNext(this.resolveNextPath());
	}

	/**
	 * By default the bl-next path mirrors this app's URL. A route may instead declare
	 * `data.nextPath`, a template where `:param` tokens are filled from the route params, then
	 * the query params. `:customerId` additionally falls back to the customer currently selected
	 * in this app, which the old customer pages carried in memory rather than in the URL.
	 */
	private resolveNextPath(): string {
		const template = this.route.snapshot.data["nextPath"] as
			| string
			| undefined;
		if (!template) {
			return this.router.url;
		}
		const { params, queryParams } = this.route.snapshot;
		return template.replace(/:([A-Za-z]+)/g, (_, name) =>
			encodeURIComponent(
				params[name] ??
					queryParams[name] ??
					(name === "customerId"
						? this.customerService.getCustomerDetailId()
						: undefined) ??
					""
			)
		);
	}
}
