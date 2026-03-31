export interface InputConfig {
  preventDefaultKeys: string[];
}

export const INPUT_CONFIG: InputConfig = {
  preventDefaultKeys: [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'],
};
