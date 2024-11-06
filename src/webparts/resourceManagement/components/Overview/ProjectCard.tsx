import * as React from "react";
import useGlobal from "../../hooks/useGlobal";
import { ProjectDTO } from "../interfaces";
import { calculateBurndownRate } from "../../utilities";
import { GaugeChart } from "@fluentui/react-charting";
import { Text } from "@fluentui/react";
import styles from "./BurnDownRate.module.scss"

export interface IProjectCardProps {
  project: ProjectDTO;
}

const ProjectCard: React.FC<IProjectCardProps> = ({
  project,
}: IProjectCardProps) => {
  const [burndownRate, setBurndownRate] = React.useState<number>(0);
  const { registrations } = useGlobal();
  React.useEffect(() => {
    const rate = calculateBurndownRate(registrations);
    setBurndownRate(rate);
  }, [project.id]);

  // Get CSS custom property value for themePrimary color
  const getComputedColor = (colorVar: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(colorVar)
      .trim();
  };

  const primaryColor = getComputedColor("--gauge-primary-color");

  return (
    <div className={styles.projectCard}>
      <Text variant="large" className={styles.projectName}>
        {project.name}
      </Text>
      <GaugeChart
        segments={[
          {
            size: 30, //placerholder indtil der kan hentes faktisk data
            legend: "Opnåede timer",
            color: primaryColor,
          },
        ]}
        chartValue={burndownRate}
        chartTitle="Burndownrate"
        sublabel="Timer opnået"
        minValue={0}
        maxValue={100}
        width={300}
        height={200}
      />
    </div>
  );
};

export default ProjectCard;
