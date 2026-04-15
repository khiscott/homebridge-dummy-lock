

const { version } = require('./package.json')

var Service, Characteristic

module.exports = (homebridge) => {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-dummy-lock', 'DummyLock', DummyLock)
}

class DummyLock {
  constructor (log, config) {
    this.log = log;
    this.name = config.name;
    this.manufacturer = config.manufacturer || 'Acme';
    this.model = config.model || 'Dummy Lock';
    this.serialNumber = config.serialNumber || '1234';
    this.lockService = new Service.LockMechanism(this.name);
    this.lockState = config.initialState === 'unsecured'
      ? Characteristic.LockCurrentState.UNSECURED
      : Characteristic.LockCurrentState.SECURED;
  }

  getServices () {
    const informationService = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(Characteristic.Model, this.model)
        .setCharacteristic(Characteristic.SerialNumber, this.serialNumber)
        .setCharacteristic(Characteristic.FirmwareRevision, version);

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
