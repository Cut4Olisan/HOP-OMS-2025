import * as React from "react";

export interface ICardProps extends React.HTMLProps<HTMLDivElement> {}

const styles: React.CSSProperties = {
  backgroundColor: "white",
  border: "1px solid #edebe9",
  borderRadius: 4,
  padding: "8px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  overflowY: "auto",
  boxSizing: "border-box",
};

const Card: React.FC<React.PropsWithChildren<ICardProps>> = ({
  style,
  children,
  ref,
}) => {
  React.useEffect(() => {
    console.log(ref);
  }, []);

  return (
    <div ref={ref} style={{ ...style, ...styles }}>
      {children}
    </div>
  );
};

export default Card;
