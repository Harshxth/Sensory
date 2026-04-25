import { ComponentProps } from "react";

type Props = ComponentProps<"span"> & {
  name: string;
  filled?: boolean;
  size?: number;
};

export function Icon({ name, filled, size = 24, className = "", style, ...rest }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: filled
          ? `"FILL" 1, "wght" 500, "opsz" ${size}`
          : `"FILL" 0, "wght" 400, "opsz" ${size}`,
        ...style,
      }}
      {...rest}
    >
      {name}
    </span>
  );
}
