import { RecoilRoot } from "recoil";

import { Slot } from "expo-router";
const Layout = () => {
	return (
		<RecoilRoot>
			<Slot />
		</RecoilRoot>
	);
};

export default Layout;
