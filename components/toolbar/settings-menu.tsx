import { useMode } from "@/hooks/useMode";
import { UseType } from "@/lib/types";
import { Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type Props = {};

function SettingsMenu({}: Props) {
  const { mode, toggleMode } = useMode();

  const [openSettings, setOpenSettings] = useState(false);

  return (
    <DropdownMenu open={openSettings} onOpenChange={setOpenSettings}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          title="Ungroup Selected Elements"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms2"
                checked={mode === UseType.ADVANCED}
                onCheckedChange={toggleMode}
              />
              <label
                htmlFor="terms2"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Advanced Mode
              </label>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SettingsMenu;
