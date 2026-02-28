import { slider } from "./Slider";

slider({
  title: 'Volume',
  type: 'volume',
  onChange: (value) => {
    console.log("Volume changed to", value);
  }
});