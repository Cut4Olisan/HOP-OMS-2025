import { ComboBox, PrimaryButton, Text } from "@fluentui/react";
import styles from "./BurnDownRate.module.scss";
import * as React from "react";
import { GaugeChart } from "@fluentui/react-charting";

interface IBurnDownRateProps {}

//***       BurnDownRate Card       ***//
const BurnDownRate: React.FC<IBurnDownRateProps> = ({}) => {
  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <ComboBox multiSelect options={[]}></ComboBox>
        <PrimaryButton>Nustil filter</PrimaryButton>
      </div>
      <div className={styles.header}>
        <Text>
          <strong>Burndown rate på projekter</strong>
        </Text>
      </div>
      <div className={styles.burnDownContent}>
        <div className={styles.burnDownInfo}>
          <Text>
            <strong>* Project *</strong>
          </Text>
        </div>

        <div className={styles.Chart}>
          <GaugeChart
            segments={[]}
            chartValue={25}
            chartTitle="Burndown rate"
            sublabel="opnået"
          ></GaugeChart>
        </div>
      </div>
    </div>
  );
};

export default BurnDownRate;
