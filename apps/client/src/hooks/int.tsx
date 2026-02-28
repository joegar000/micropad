import { useCallback, useState } from "react";

const useInt = (initialValue: number) => {
  const [value, setValue] = useState(initialValue);

  const setIntValue = useCallback((newValue: number) => {
    if (newValue < value)
      setValue(Math.floor(newValue));
    else
      setValue(Math.ceil(newValue));
  }, []);

  return [value, setIntValue] as const;
}

export default useInt;