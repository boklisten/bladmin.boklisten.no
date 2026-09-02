import { Component, OnInit } from "@angular/core";
import { BlNextLinkerService } from "./bl-next-linker.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
	selector: "app-bl-next-linker",
	templateUrl: "./bl-next-linker.component.html",
})
export class BlNextLinkerComponent implements OnInit {
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private blNextLinkerService: BlNextLinkerService
	) {}

	ngOnInit(): void {
		this.blNextLinkerService.redirectToBlNext(this.resolveNextPath());
	}

	/**
	 * By default the bl-next path mirrors this app's URL. A route may instead declare
	 * `data.nextPath`, a template where `:param` tokens are filled from the route params.
	 */
	private resolveNextPath(): string {
		const template = this.route.snapshot.data["nextPath"] as string | undefined;
		if (!template) {
			return this.router.url;
		}
		const params = this.route.snapshot.params;
		return template.replace(/:([A-Za-z]+)/g, (_, name) =>
			encodeURIComponent(params[name] ?? "")
		);
	}
}
