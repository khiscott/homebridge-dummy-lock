

var Service, Characteristic

module.exports = (homebridge) => {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-dummy-lock', 'DummyLock', DummyLock)
}

class DummyLock {
  constructor (log, config) {
    // get config values
    this.log = log;
    this.name = config['name'];
    this.lockService = new Service.LockMechanism(this.name);
    this.lockState = Characteristic.LockCurrentState.SECURED;
  }

  getServices () {
    const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Acme')
        .setCharacteristic(Characteristic.Model, 'Dummy Lock 1.0')
        .setCharacteristic(Characteristic.SerialNumber, '1234');

    this.lockService.getCharacteristic(Characteristic.LockCurrentState)
      .onGet(this.getLockState.bind(this));

    this.lockService.getCharacteristic(Characteristic.LockTargetState)
      .onGet(this.getLockState.bind(this))
      .onSet(this.setLockState.bind(this));

    return [informationService, this.lockService]
  }

  getLockState () {
    return this.lockState;
  }

  setLockState (targetState) {
    if (targetState == Characteristic.LockCurrentState.SECURED) {
      this.log(`locking ` + this.name, targetState)
    } else {
      this.log(`unlocking ` + this.name, targetState)
    }
    this.lockState = targetState;
    this.updateCurrentState(this.lockState);
    this.log(this.lockState + ' ' + this.name);
  }

  updateCurrentState (toState) {
    this.lockService
      .getCharacteristic(Characteristic.LockCurrentState)
      .updateValue(toState);
  }
}
