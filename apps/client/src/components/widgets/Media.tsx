import { widget } from "../layout/Widget";
import { Button, ButtonGroup } from "flowbite-react";
import { CiPlay1, CiPause1 } from "react-icons/ci";

export const MediaWidget = widget(() => {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-4">
			<div className="h-16 w-16 rounded-full bg-neutral-700 flex items-center justify-center">
				<Button><CiPlay1 className="text-xl" /></Button>
			</div>
			<div className="flex gap-6 text-xl">
				<ButtonGroup>
					<Button>⏮</Button>
					<Button><CiPause1 className="text-xl" /></Button>
					<Button>⏭</Button>
				</ButtonGroup>
			</div>
		</div>
	);
}, 'media');