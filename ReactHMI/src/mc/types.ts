export type StatusCode = { code: number; string: string };

export class Status {
  #code = 0;
  #string = '';
  constructor(params: StatusCode) {
    this.#code ||= params.code;
    this.#string ||= params.string;
  }
  get code() { return this.#code; }
  get string() { return this.#string; }
  isBad() { return ((this.#code & 0x80000000) !== 0); }
  isGood() { return ((this.#code & 0xC0000000) === 0x00000000); }
}

export type MachineHmiData = {
  Conveyor: {
    Running: boolean;
    Fault: boolean;
    Speed: number;
    Load: number;
    PartsCount: number;
    Mode: string;
  };
  Heater: {
    Heating: boolean;
    Fault: boolean;
    Temperature: number;
    Setpoint: number;
    PowerPercent: number;
  };
  Robot: {
    Auto: boolean;
    Fault: boolean;
    X: number; Y: number; Z: number;
    State: string;
  };
  LineRunning: boolean;
  AnyFault: boolean;
  RunRequest: boolean;
  State: string;
  Substate: string;
  Commands: { Start: boolean; Stop: boolean };
  Temperature: number;
};
