import React, { useState } from "react";
import axios from "axios";

// Component for deleting the database
const DeleteDatabase = ({ isOpen, onClose }) => {
  // State variables for password, confirmation, validity checks, success popup, and step tracking
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmationValid, setIsConfirmationValid] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [step, setStep] = useState("password");

  // Event handler for password input change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Event handler for confirmation password input change
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Event handler for checking password validity
  const handleCheckPassword = (e) => {
    e.preventDefault();
    if (password === "1234") {
      setIsPasswordValid(true);
      setStep("confirmation");
    } else {
      setIsPasswordValid(false);
    }
  };

  // Event handler for confirming database deletion
  const handleConfirmDelete = (e) => {
    e.preventDefault();
    if (confirmPassword === "1234") {
      setIsConfirmationValid(true);
      // Perform the database deletion here
      handleDeleteDatabase();
    } else {
      setIsConfirmationValid(false);
    }
  };

  // Function to delete the database
  const handleDeleteDatabase = async () => {
    try {
      await axios.post("http://localhost:5000/deleteDatabase");
      // Notify the user that the database has been deleted
      setShowSuccessPopup(true);
      // Close the modal after a certain duration
      setTimeout(() => {
        setShowSuccessPopup(false);
        onClose();
        setPassword("");
        setConfirmPassword("");
        setStep("password");
      }, 1000); // Adjust duration as needed
    } catch (error) {
      console.error("Error deleting database:", error);
      // Optional: Handle error and display error message to user
    }
  };

  // Render the component
  return (
    <div className={`modal ${isOpen ? "block" : "hidden"}`}>
      <div className="modal-container bg-white w-96 mx-auto mt-10 p-6 rounded-md shadow-lg z-10">
        {step === "password" && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-black">Please enter your passcode to proceed</h2>
            <form onSubmit={handleCheckPassword}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Passcode:
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full border p-2 text-black"
                  value={password}
                  onChange={handlePasswordChange}
                />
                {!isPasswordValid && <p className="text-red-500">Incorrect passcode. Please try again.</p>}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Next
                </button>
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
        {step === "confirmation" && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-black">Are you sure you want to proceed?</h2>
            <form onSubmit={handleConfirmDelete}>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Passcode:
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full border p-2 text-black"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                {!isConfirmationValid && <p className="text-red-500">Confirmation passcode does not match. Please try again.</p>}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  onClick={() => setStep("password")}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}
        {/* Success popup */}
        {showSuccessPopup && (
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded-md shadow-md">
              <p className="text-green-500">Successfully deleted database!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteDatabase;
