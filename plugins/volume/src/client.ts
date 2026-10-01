import { ClientPlugin, Widget } from "micropad-sdk/client";
import { autorun, runInAction } from "mobx";

class Slider extends Widget {
  displayName = 'Slider';
  get dom() {
    const div = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';

    autorun(() => {
      input.value = this.context.runtimeState.volume;
    });

    input.addEventListener('change', () => {
      runInAction(() => {
        this.context.runtimeState.volume = Number(input.value);
      });
    });
    div.appendChild(input);
    return div;
  }
}

export default class VolumePlugin extends ClientPlugin {
  displayName = "Volume";
  widgets = {
    'slider': Slider
  };
}
