import { Dashboard } from "./components/layout/Dashboard";
import { useLayoutStore } from "./store/layout";
import { Widgets } from "./components/layout/Widget";
import "./components/widgets";

export default function App() {
	const widgets = useLayoutStore((state) => state.widgets);
	return (
		<Dashboard>
			{widgets.map((w) => {
				const Widget = Widgets[w.type];
				return (
					<Widget
						key={w.id}
						id={w.id}
						x={w.x}
						y={w.y}
						w={w.w}
						h={w.h}
					/>
				);
			})}
		</Dashboard>
	);
}