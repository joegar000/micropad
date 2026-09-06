import { createAtom, type IAtom } from "mobx";
import { Socket } from "socket.io";

export class SocketValue<V> {
  protected socket: Socket;
  protected key: string;
  protected atom: IAtom;
  protected _value: V | undefined;

  constructor(socket: Socket, prefix: string, valueName: string, defaultValue?: V) {
    this.socket = socket;
    this.key = `${prefix}:${valueName}`;
    this._value = defaultValue;

    const callback = (v: V) => (this.value = v);
    this.atom = createAtom(
      "SocketValue",
      () => this.socket.on(this.key, callback),
      () => this.socket.off(this.key, callback),
    );
  }

  get value(): V | undefined {
    this.atom.reportObserved();
    return this._value;
  }

  set value(value: V) {
    if (this.value !== value) {
      this._value = value;
      this.socket.emit(this.key, value);
      this.atom.reportChanged();
    }
  }

  toJSON() {
    return this.value;
  }
}
