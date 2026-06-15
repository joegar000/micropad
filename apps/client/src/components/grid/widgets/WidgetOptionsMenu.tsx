import { useState, type ReactNode } from "react";
import clsx from "clsx";
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from "@mui/material";
import type { WidgetMenuItem } from "micropad-widgets";

export type WidgetExtraOption = {
  icon: ReactNode;
  onClick: () => void;
  title?: string;
};

export function WidgetOptionsMenu(props: {
  hidden: boolean;
  menuItems?: WidgetMenuItem[];
  extraOptions?: WidgetExtraOption[];
  onSelectMenuItem: (item: WidgetMenuItem) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(value => !value);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  return (
    <div className={clsx("flex-grow-1 flex justify-end", { hidden: props.hidden })}>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        {props.menuItems?.map(item => (
          <MenuItem
            key={item.id}
            onClick={() => {
              handleClose();
              props.onSelectMenuItem(item);
            }}
          >
            {item.title}
          </MenuItem>
        ))}
        {props.extraOptions?.map(opt => (
          <MenuItem
            key={opt.title}
            title={opt.title}
            onClick={() => {
              handleClose();
              opt.onClick();
            }}
          >
            {opt.icon}
          </MenuItem>
        ))}
        <MenuItem
          title="Delete"
          onClick={() => {
            handleClose();
            props.onDelete();
          }}
        >
          <DeleteIcon />
        </MenuItem>
      </Menu>
    </div>
  );
}
