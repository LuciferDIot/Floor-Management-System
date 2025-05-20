import { cn } from "@/lib/utils";
import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", value, onChange, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [startValue, setStartValue] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
      if (type !== "number" || !(e.altKey || e.ctrlKey)) return;

      setIsDragging(true);
      setStartX(e.clientX);
      setStartValue(parseFloat(value as string) || 0);
      document.body.style.cursor = "ew-resize";
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const sensitivity = 0.5;
      const newValue = startValue + deltaX * sensitivity;

      if (onChange && inputRef.current) {
        const syntheticEvent = {
          target: {
            value: String(Math.round(newValue * 100) / 100),
            name: inputRef.current.name || "",
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      document.body.style.cursor = "";
    };

    React.useEffect(() => {
      const handleKeyUp = (e: KeyboardEvent) => {
        if (isDragging && (e.key === "Alt" || e.key === "Control")) {
          handleMouseUp();
        }
      };

      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("keyup", handleKeyUp);
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, [isDragging, startX, startValue]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={inputRef}
        value={value}
        onChange={onChange}
        onMouseDown={handleMouseDown}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
