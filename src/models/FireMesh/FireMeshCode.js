export class FireMeshCode {
  static isBurned (code) { return code > 0 }
  static isUnburnable (code) { return code < 0 }
  static isUnburned (code) { return code === 0 }

  static unburnable () { return -1 }
  static unburned () { return 0 }
  static burned () { return 1 }
}
