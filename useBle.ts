/* eslint-disable no-bitwise */

import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";


interface BlueToothLowEnergy {
	requestPermissions(): Promise<boolean>;
	startScan(): Promise<void>;
	alldevices: Device[];
	connectToDevice(device: Device): Promise<boolean>;
	connectedDevice: Device | null;

}

function useBle(): BlueToothLowEnergy {
	const bleManager = useMemo(() => new BleManager(), []);

	const [alldevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

	const requenstAndriodPermission31 = async () => {
		const bleScanPermission = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
			{
				title: "Bluetooth Scan Permission",
				message: "This app needs access to bluetooth scan " + "so you can connect to esp32",
				buttonNeutral: "Ask Me Later",
				buttonNegative: "Cancel",
				buttonPositive: "OK",
			}
		);
		//now create one for bluetooth connection
		const bleConnectPermission = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
			{
				title: "Bluetooth Connect Permission",
				message: "This app needs access to bluetooth connect " + "so you can connect to esp32",
				buttonNeutral: "Ask Me Later",
				buttonNegative: "Cancel",
				buttonPositive: "OK",
			}
		);
		//now for fine location
		const fineLocationPermission = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			{
				title: "Fine Location Permission",
				message: "This app needs access to fine location " + "so you can connect to esp32",
				buttonNeutral: "Ask Me Later",
				buttonNegative: "Cancel",
				buttonPositive: "OK",
			}
		);
		const backgroundLocationPermission = await PermissionsAndroid.request(
		  PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
		  {
			title: "Background Location Permission",
			message: "This app needs access to background location for continuous BLE operations",
			buttonNeutral: "Ask Me Later",
			buttonNegative: "Cancel",
			buttonPositive: "OK",
		  }
		);
		return (
			bleScanPermission === PermissionsAndroid.RESULTS.GRANTED &&
			bleConnectPermission === PermissionsAndroid.RESULTS.GRANTED &&
			fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED 
		);
	}

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requenstAndriodPermission31();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

const connectToDevice = async (device: Device) => {
		try {
			const connectedDevice = await bleManager.connectToDevice(device.id);
			setConnectedDevice(connectedDevice);
			if (connectedDevice) {
				console.log("Connected to device", connectedDevice.name);
				return true;
			}
			return false
		} catch (error) {
			console.error(error);
		}
		return false;
	}


  const startScan =  () =>
	bleManager.startDeviceScan(null, null, (error, device) => {
	  if (error) {
		console.error(error);
		return;
	  }
			if (device) {
				// if we dont have a name for the device, return next device
				if (!device.name) {
					return;
				}

				setAllDevices((prev) => {
					if (prev.find((d) => d.id === device.id)) {
						return prev;
					}
					return [...prev, device];
				});
			}
	});
  
  return {
	requestPermissions,
	startScan,
	alldevices,
	connectToDevice,
	connectedDevice,
  };
}

export default useBle;
