import * as React from "react";
import styles from "./Card.module.scss";
export interface ICardProps extends React.HTMLProps<HTMLDivElement> {}

const Card: React.FC<React.PropsWithChildren<ICardProps>> = (props) => {
  return (
    <div className={styles.card} style={props.style}>
      {props.children}
    </div>
  );
};

export default Card;
