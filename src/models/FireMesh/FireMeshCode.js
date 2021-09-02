export class FireMeshCode {
  static isBurned (code) { return code > 0 } // code could be the ignition time
  static isBurnable (code) { return code >= 0 }
  static isUnburnable (code) { return code < 0 } // code could indicate a specific type of unburnable
  static isUnburned (code) { return code === 0 } // burnable but unburned

  static unburnable () { return -1 }
  static unburned () { return 0 }
  static burned () { return 1 }
}
