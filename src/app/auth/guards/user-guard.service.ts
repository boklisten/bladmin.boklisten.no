import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { TokenService } from "@boklisten/bl-connect";

@Injectable()
export class UserGuardService {
	constructor(
		private _authService: AuthService,
		private _router: Router,
		private _tokenService: TokenService
	) {}

	public redirectToPermissionDenied(url: string) {
		this._authService.redirectUrl = url;
		this._authService.applicationLogout();
		this._router.navigate(["/auth/permission/denied"]);
	}

	public redirectToLogin(url: string) {
		this._authService.redirectUrl = url;
		this._authService.applicationLogout();
		this._tokenService.removeTokens();
		this._router.navigate(["/auth/login"]);
	}
}
