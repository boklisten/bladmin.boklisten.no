const { version } = require("../../package.json");
export const environment = {
	production: false,
	apiPath: "http://localhost:3333/",
	nextPath: "http://localhost:3000/",
	hmr: true,
	version: version,
	versionName: "LOCAL",
};
