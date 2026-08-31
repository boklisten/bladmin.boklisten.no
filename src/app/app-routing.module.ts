import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { EmployeeGuardService } from "./auth/guards/employee-guard.service";
import { BranchGuardService } from "./branch/branch-guard.service";
import { BlNextLinkerComponent } from "./bl-next-linker/bl-next-linker.component";
import { AuthGatewayComponent } from "./auth-gateway/auth-gateway.component";

const routes: Routes = [
	{
		path: "",
		redirectTo: "/home",
		pathMatch: "full",
	},
	{
		path: "home",
		canActivate: [EmployeeGuardService, BranchGuardService],
		component: HomeComponent,
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
