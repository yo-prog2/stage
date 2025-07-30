import { Button, useDisclosure } from "@chakra-ui/react";
import { FaCalendar } from "react-icons/fa";
import DatePickerModal from "./DatePickerModal";

export default function DateProcessButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRun = async (date) => {
    const res = await fetch("http://localhost:5000/run-process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: date }),
    });
    // Optionally handle response
  };

  return (
    <>

      <Button  onClick={onOpen}
                    me='100%'
                    mb='50px'
                    w='140px'
                    minW='140px'
                    mt={{ base: "20px", "2xl": "auto" }}
                    variant='brand'
                    fontWeight='500'>
                    Scan Inbox
                  </Button>
      <DatePickerModal isOpen={isOpen} onClose={onClose} onRun={handleRun} />
    </>
  );
}
