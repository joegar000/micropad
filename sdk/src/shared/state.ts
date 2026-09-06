/**
 * State that lives in memory for a plugin.
 * It will be lost when the application stops running.
 * Store whatever you want in here!
 */
export interface IRuntimeState {
  [key: string]: any;
}


/**
 * State that lives in the database for a plugin.
 * It will persist across application runs.
 * Store whatever you want in here!
 */
export interface IPreservedState {
  enabled: boolean;
  [key: string]: any;
}
