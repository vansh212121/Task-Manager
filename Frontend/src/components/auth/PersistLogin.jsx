import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { selectAccessToken } from "@/features/authSlice";
// ## FIX: Import the refresh token mutation ##
import { useRefreshTokenMutation } from "@/features/api/authApi";

const PersistLogin = () => {
  const accessToken = useSelector(selectAccessToken);
  const [isLoading, setIsLoading] = useState(true);

  // ## FIX: Use the refresh token mutation ##
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        // Trigger the refresh token mutation
        await refreshToken().unwrap();
        // If it succeeds, the auth state will be updated by the mutation's
        // onQueryStarted logic, and the user will be logged in.
      } catch (err) {
        console.error("Session expired or invalid. Please log in again.", err);
        // If it fails, the user remains logged out.
      } finally {
        // No matter the outcome, we stop loading once the check is done.
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // We only need to run this check if we DON'T have an access token in Redux.
    if (!accessToken) {
      verifyRefreshToken();
    } else {
      // If we already have a token, the session is valid.
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []); // The empty array ensures this runs only once on app load.

  if (isLoading) {
    return <p>Loading session...</p>;
  }

  // Once the check is complete, render the rest of the app.
  return <Outlet />;
};

export default PersistLogin;
