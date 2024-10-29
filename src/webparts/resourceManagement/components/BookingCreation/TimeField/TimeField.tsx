import * as React from "react";
import { Label, List, IconButton } from "@fluentui/react";
import styles from "./TimeField.module.scss";
import { useState, useEffect, useRef } from "react";
import {
  findClosestInterval,
  formatInputValue,
  generateTimeIntervals,
} from "./TimeFieldFunctions";

interface TimeFieldProps {
  label: string;
  name: string; // Changed to string type
  selectedName: (name: string) => void; // Updated to string type
  isMobile: boolean;
}

interface IDropDownValues {
  key: number;
  text: string;
}

const TimeFieldComponent: React.FC<TimeFieldProps> = (
  props: TimeFieldProps
) => {
  const [inputValue, setInputValue] = useState<string>(props.name ?? "08:00");
  const [allValues, setAllValues] = useState<IDropDownValues[]>([]);
  const [filteredValues, setFilteredValues] = useState<IDropDownValues[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]); // Array of refs for items

  const toggleDropdown = (): void => {
    setDropdownVisible(!isDropdownVisible);
  };

  const filterValues = (value: string): void => {
    const searchValue = value.replace(":", "");
    const filtered = allValues.filter((item) =>
      item.text.replace(":", "").includes(searchValue)
    );

    if (filtered.length > 0) {
      let startIndex = allValues.findIndex(
        (item) => item.text === filtered[0].text
      );
      switch (searchValue.length) {
        case 1: {
          const sv = searchValue + ":00";
          startIndex = allValues.findIndex((item) => item.text.includes(sv));
          break;
        }
        case 2: {
          let sv = searchValue + "0";
          if (searchValue.startsWith("1") || searchValue.startsWith("2"))
            sv += "0";
          startIndex = allValues.findIndex((item) =>
            item.text.replace(":", "").includes(sv)
          );
          break;
        }
      }
      const rotatedValues = [
        ...allValues.slice(startIndex),
        ...allValues.slice(0, startIndex),
      ];
      setFilteredValues(rotatedValues);
      setHighlightedIndex(-1);
    } else {
      const closestInterval = findClosestInterval(value, allValues);
      // setFilteredValues([
      //   closestInterval,
      //   ...allValues.filter((item) => item !== closestInterval),
      // ]);
      setInputValue(closestInterval.text);
      props.selectedName(closestInterval.text);
      setHighlightedIndex(0);
    }
  };

  useEffect(() => {
    if (props.name !== inputValue) {
      filterValues(props.name);
      return setInputValue(props.name);
    }
  }, [props.name]);

  useEffect(() => {
    const intervals = generateTimeIntervals();
    setAllValues(intervals);
  }, []);
  useEffect(() => {
    if (allValues.length > 0)
      if (props.name) filterValues(props.name);
      else setFilteredValues(allValues);
  }, [allValues]);

  const handleSelect = (item: IDropDownValues): void => {
    if (item) {
      setInputValue(item.text);
      props.selectedName(item.text);
      filterValues(item.text);
      setDropdownVisible(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    const formattedValue = formatInputValue(value);
    setInputValue(formattedValue);
    filterValues(formattedValue);
  };

  const scrollToHighlightedItem = (index: number): void => {
    const highlightedItem = itemRefs.current[index]; // Get the highlighted item ref
    if (highlightedItem) {
      highlightedItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  };

  const setValuesBasedOnHighligtedIndex = (): void => {
    if (highlightedIndex >= 0) {
      handleSelect(filteredValues[highlightedIndex]);
    } else {
      handleSelect(filteredValues[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    switch (e.key) {
      case "Enter":
      case "Tab":
        setValuesBasedOnHighligtedIndex();
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => {
          const newIndex =
            prevIndex < filteredValues.length - 1 ? prevIndex + 1 : 0;
          setInputValue(filteredValues[newIndex].text);
          scrollToHighlightedItem(newIndex);
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => {
          const newIndex =
            prevIndex > 0 ? prevIndex - 1 : filteredValues.length - 1;
          setInputValue(filteredValues[newIndex].text);
          scrollToHighlightedItem(newIndex);
          return newIndex;
        });
        break;
    }
  };

  const onRenderCell = (
    item: IDropDownValues,
    index: number | undefined
  ): JSX.Element => {
    return (
      <div
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ref={(el) => (itemRefs.current[index!] = el)} // Assign the ref to the item
        className={`${styles.suggestionItem} ${
          index === highlightedIndex ? styles.highlightedItem : ""
        }`}
        key={item.key}
        onClick={() => handleSelect(item)}
      >
        {item.text}
      </div>
    );
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setValuesBasedOnHighligtedIndex();
    }
  };

  const handleFocus = (): void => {
    // Do something on entering the div element
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.relatedTarget as Node)
    ) {
      setValuesBasedOnHighligtedIndex();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`${styles.container} ${
        props.isMobile && styles.mobileContainer
      }`}
      ref={containerRef}
      onBlur={handleBlur}
      onFocus={handleFocus}
      tabIndex={-1} // To ensure the div can receive focus
    >
      <Label required>{props.label}</Label>
      <div className={styles.searchBoxContainer}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={styles.searchBox}
          ref={inputRef}
        />
        <IconButton
          iconProps={{ iconName: "ChevronDown" }}
          onClick={toggleDropdown}
          className={styles.iconButton}
          tabIndex={-1}
        />
      </div>
      {isDropdownVisible && filteredValues.length > 0 && (
        <div className={styles.suggestionList}>
          <List
            key={highlightedIndex}
            items={filteredValues}
            onShouldVirtualize={() => false}
            onRenderCell={onRenderCell}
          />
        </div>
      )}
    </div>
  );
};

export default TimeFieldComponent;
