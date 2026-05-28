import { useCallback, useState } from "react";

const useInt = (initialValue: number) => {
  const [value, setValue] = useState(initialValue);

  const setIntValue = useCallback((newValue: number) => {
    setValue(currentValue => {
      if (newValue < currentValue)
        return Math.floor(newValue);
      return Math.ceil(newValue);
    });
  }, []);

  return [value, setIntValue] as const;
}

export default useInt;
