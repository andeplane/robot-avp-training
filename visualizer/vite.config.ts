import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
	base: "/robot-avp-training/",
	plugins: [basicSsl()],
	server: {
		https: {},
		host: true,
	},
});
