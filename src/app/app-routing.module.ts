import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BlNextLinkerComponent } from "./bl-next-linker/bl-next-linker.component";
import { AuthGatewayComponent } from "./auth-gateway/auth-gateway.component";

const routes: Routes = [
	// The landing page lives on bl-next now. "home" stays because the header logo, the ALT+UP
	// sidebar shortcut and old bookmarks still point there.
	{
		path: "",
		component: BlNextLinkerComponent,
		pathMatch: "full",
		data: { nextPath: "/admin" },
	},
	{
		path: "home",
		component: BlNextLinkerComponent,
		data: { nextPath: "/admin" },
	},
	{
		path: "auth",
		children: [
			{
				path: "gateway",
				component: AuthGatewayComponent,
			},
			{
				path: "token",
				component: BlNextLinkerComponent,
			},
			{
				path: "menu",
				component: BlNextLinkerComponent,
			},
			{
				path: "register",
				component: BlNextLinkerComponent,
			},
			{
				path: "login",
				component: BlNextLinkerComponent,
			},
			{
				path: "login/forgot",
				component: BlNextLinkerComponent,
			},
			{
				path: "reset/:id",
				component: BlNextLinkerComponent,
			},
			{
				path: "logout",
				component: BlNextLinkerComponent,
			},
			{
				path: "success",
				component: BlNextLinkerComponent,
			},
			{
				path: "register/detail",
				component: BlNextLinkerComponent,
			},
			{
				path: "social/failure",
				component: BlNextLinkerComponent,
			},
			{
				path: "email/confirm/:id",
				component: BlNextLinkerComponent,
			},
			{
				path: "permission/denied",
				component: BlNextLinkerComponent,
			},
		],
	},
	{
		path: "admin/kasse",
		component: BlNextLinkerComponent,
	},
	// Boksøk, Kundesøk and Hurtiginnsamling all live on bl-next's Kasse page now. The old bl-admin
	// paths are still linked from inside this app (blid chips) and from bookmarks.
	{
		path: "blid",
		component: BlNextLinkerComponent,
		data: { nextPath: "/admin/kasse" },
	},
	{
		path: "blid/:blid",
		component: BlNextLinkerComponent,
		data: { nextPath: "/admin/kasse?blid=:blid" },
	},
	{
		path: "bulk",
		component: BlNextLinkerComponent,
		data: { nextPath: "/admin/kasse?modus=innsamling" },
	},
	// The customer page and its message log live on bl-next's Kasse page now. Both are still
	// linked from inside this app (sidebar, order, invoice and customer-item pages) and bookmarks.
	// The old detail page was mostly an order list, so it lands on the order history tab.
	{
		path: "customer",
		redirectTo: "customer/detail",
		pathMatch: "full",
	},
	{
		path: "customer/detail",
		component: BlNextLinkerComponent,
		data: {
			nextPath: "/admin/kasse?kunde=:customerId&visning=ordrehistorikk",
		},
	},
	{
		path: "customer/messages",
		component: BlNextLinkerComponent,
		data: { nextPath: "/admin/kasse?kunde=:customerId&visning=meldinger" },
	},
	{
		path: "admin/kundesok",
		component: BlNextLinkerComponent,
	},
	{
		path: "admin/venteliste",
		component: BlNextLinkerComponent,
	},
	{
		path: "admin/kommunikasjon/paminnelser",
		component: BlNextLinkerComponent,
	},
	{
		path: "admin/user-settings",
		component: BlNextLinkerComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
