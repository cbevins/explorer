/**
 * Burn status enums: anything > 0 is an ignition time
 * All points belong to exactly one burn status category:
 *  - Burnable, which have a non-negative value
 *    - Unburned, whose value is an ignition time of 0
 *    - Burned, whose value is an ignition time > 0
 *  - Unburnable, which has a negative value indicating its type (water, rock, fireline, etc)
 */
const Unburned = -1
const Unburnable = -100
const OutOfBounds = -200
const ControlLine = -300 // -301 HandLine, -302 DozerLine, -303 WetLine, -304 Retardant Line
const Water = -400 // -401 Standing water, -402 Swamp, -450 River, -451 Stream -452 Ditch, -490 Snow, -491 Ice
const Rock = -500 // -501 Talus
const Road = -600 // -601 paved road, -602 unpaved road, -603 double track
const Trail = -700

export class FireStatus {
  // --------------------------------------------------------------------------------------------
  // The following are used by clients to determine the FireStatus of their point data.
  // --------------------------------------------------------------------------------------------

  // Returns TRUE if status is Burnable or burned at any time
  static isBurnable (status) { return status >= Unburned }

  // Return TRUE if status is not Unburned or Unburnable, AND ignition time is at or before *atTime*
  static isBurnedAt (ignited, atTime) { return ignited > Unburned && ignited <= atTime }

  // Returns TRUE if the status is OutOfBounds
  static isOutOfBounds (status) { return status === OutOfBounds }

  // Returns TRUE if the status is Unburnable regardless of time
  static isUnburnable (status) { return status < Unburned }

  // Returns TRUE if EITHER Unburned OR ignition time is after *atTime*
  static isUnburnedAt (ignited, atTime) { return ignited === Unburned || ignited > atTime }

  // --------------------------------------------------------------------------------------------
  // The following sre used by clients only when setting their point data to some FireStatus code
  // --------------------------------------------------------------------------------------------

  // Used by clients to set data to a ControlLine (Unburnable) state
  static get ControlLine () { return ControlLine }

  // Used by clients to set data to a Rock (Unburnable) state
  static get Rock () { return Rock }

  // Used by clients to set data to a Road (Unburnable) state
  static get Road () { return Road }

  // Used by clients to set data to a Trail (Unburnable) state
  static get Trail () { return Trail }

  // Used by clients to set data to a generic Unburnable state
  static get Unburnable () { return Unburnable }

  // Used by clients to set data to an Unburned (and Burnable) state
  static get Unburned () { return Unburned }

  // Used by clients to set data to a Water (Unburnable) state
  static get Water () { return Water }
}
