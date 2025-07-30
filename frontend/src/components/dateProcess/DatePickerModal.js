import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useToast,
} from "@chakra-ui/react";
import MiniCalendar from "components/calendar/MiniCalendar";
import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "authConfig";
import { useNotification } from "../../contexts/NotificationContext";

export default function DatePickerModal({ isOpen, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const toast = useToast();
  const { instance } = useMsal();
  const { addNotification } = useNotification();
  const handleRun = async () => {
  try {
    const accounts = instance.getAllAccounts();

    if (accounts.length === 0) {
      // No signed-in user — prompt login once
      await instance.loginPopup(loginRequest);
    }

    const account = instance.getAllAccounts()[0]; // get the account after login

    // Try to get token silently
    let result;
    try {
      result = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
    } catch (silentError) {
      // Silent failed, fallback to popup once
      result = await instance.acquireTokenPopup(loginRequest);
    }

    const token = result.accessToken;
    console.log("Access Token:", selectedDate);
    
    const response = await fetch("http://localhost:4000/mail/process", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate: selectedDate.toISOString() }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    data.approvedAssets.forEach(asset => {
      addNotification({
        title: "New Entrie",
        description: `${asset.person} - ${asset.asset_reference} - ${asset.action} on ${asset.date}`,
      });
    });

    console.log("Response from backend:", data);

    toast({
      title: "Process ran successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

  } catch (err) {
    console.error("Error in handleRun", err);
    toast({
      title: "Error running process",
      description: err.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Start Date</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <MiniCalendar
            selectRange={false}
            defaultValue={selectedDate}
            onChange={setSelectedDate}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleRun}>
            Scan Inbox
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
