import React, { useState, useEffect } from "react";
import { SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
} from "react-native";
import {  Device} from "react-native-ble-plx";

import useBLE from "./useBle"; // Ensure this custom hook is correctly defined


const App = () => {
  const {
    requestPermissions,
    startScan,
    alldevices,
	connectToDevice,
	connectedDevice,

  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [rssi, setRssi] = useState<number | null>(null);

  useEffect(() => {
  let interval = setInterval(() => {
			console.log("Checking RSSI");
	if (isConnected && connectedDevice) {
			connectedDevice.readRSSI().then((rssiResponse) => {
				setRssi(rssiResponse.rssi);
			}
		);
	}
  }, 1000);

  return () => clearInterval(interval);
  }, [isConnected,rssi]);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      startScan();
    }
  };

	const connect = async (device: Device) => {
		const connected = await connectToDevice(device);
		if (connected) {
			setIsConnected(true);
		}
	}

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    await scanForDevices();
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        <Text style={styles.heartRateText}>This is an app</Text>
					{isConnected ? (
					<>
						<Text>Connected</Text>
						<Text>RSSI: {rssi}</Text>
					</>
					) : (
					<Text style={styles.ctaButtonText}>Not Connected</Text>
					)}
        <TouchableOpacity style={styles.ctaButton} onPress={openModal}>
          <Text style={styles.ctaButtonText}>Scan for Devices</Text>
        </TouchableOpacity>
        <Modal
          visible={isModalVisible}
          onRequestClose={hideModal}
          animationType="fade"
        >
          <View style={styles.modalContent}>
            <FlatList
			style={{marginTop: 20}}
              data={alldevices}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>
				<TouchableOpacity
				  style={styles.item}
				  onPress={() => connect(item)}
				>
				  <Text>{item.name || "Unnamed"}</Text>
				</TouchableOpacity>
			  }
            />
            <TouchableOpacity style={styles.ctaButton} onPress={hideModal}>
              <Text style={styles.ctaButtonText}>Close</Text> 
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
	padding: 10,
  },
  modalContent: {
	flex: 1,
    justifyContent: "center",
	paddingBottom: 30,
    alignItems: "center",
    backgroundColor: "#f2f2f2",

  },
item: {
	padding: 5,
	//create a border around the items
	borderWidth: 1,
	fontSize: 12,
  },
});

export default App;
