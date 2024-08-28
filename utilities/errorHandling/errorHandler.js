const sendErrorDev = (err) => {
  // Log error
  console.error("ERROR 💥", err);

  // Send detailed error response in development
  return {
    success: false,
    message: "An error occurred. Please try again later.",
    error: err, // Include full error object for debugging in development
  };
};

const sendErrorProduction = (err) => {
  // Send generic error response in production
  return {
    success: false,
    message: "An error occurred. Please try again later.",
  };
};

const sendError = (err, isProduction) => {
  if (isProduction) {
    return sendErrorProduction(err);
  } else {
    return sendErrorDev(err);
  }
};

// ------- THE MAIN ERROR HANDLER FOR ALL ERRORS ------- //
const handleError = (err, log) => {
  if (process.env.NODE_ENV === "production") {
    // Handle error in production
    console.error("An error occurred:", err.message);
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    };
  } else {
    // Handle error in development
    console.error("An error occurred:", err);
    return {
      success: false,
      message: "An error occurred. Please try again later.",
      error: err,
    };
  }
};

export default handleError;
