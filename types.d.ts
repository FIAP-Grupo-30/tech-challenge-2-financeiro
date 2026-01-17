/// <reference types="react" />

declare module "@bytebank/base/bytebank-base" {
	import type { ComponentType } from "react";
	const BaseApp: ComponentType;
	export default BaseApp;
}

declare module "@bytebank/dashboard/bytebank-dashboard" {
	import type { ComponentType } from "react";
	const DashboardApp: ComponentType;
	export default DashboardApp;
}

declare module "@bytebank/root/bytebank-store" {
	import type { StoreApi, UseBoundStore } from "zustand";
	export type Store = {
		count: number;
		inc: () => void;
	};
	const store: UseBoundStore<StoreApi<Store>>;
	export default store;
}
