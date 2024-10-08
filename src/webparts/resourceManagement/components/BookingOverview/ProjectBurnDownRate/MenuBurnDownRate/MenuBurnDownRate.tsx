import { ComboBox } from "@fluentui/react";
import styles from "./MenuBurnDownRate.module.scss";
import * as React from "react";
import { GaugeChart } from "@fluentui/react-charting";

interface IMenuBurnDownRateProps {}

const MenuBurnDownRate: React.FC<IMenuBurnDownRateProps> = ({}) => {
  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <ComboBox options={[]}></ComboBox>
      </div>
      <div className={styles.burnDownContent}>
        <GaugeChart
          chartValue={0}
          segments={[]}
          chartTitle="Burndown rate"
        ></GaugeChart>
      </div>
    </div>
  );
};

export default MenuBurnDownRate;
