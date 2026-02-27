import { slider } from "./Slider";

const Volume = slider({
  title: 'Volume',
  type: 'volume',
  onChange: (value) => {
    console.log("Volume changed to", value);
  }
});