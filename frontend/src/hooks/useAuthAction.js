import { useUser } from "../context/userContext";
import { message } from "antd";

/**
 * Hook to handle authentication-required actions
 * If user is not logged in, shows message and returns false
 * If user is logged in, executes the action
 */
export const useAuthAction = () => {
  const { user } = useUser();

  const requireAuth = (action, actionName = "complete this action", onAuthRequired = null) => {
    if (!user || !user.id) {
      // User not logged in
      if (onAuthRequired && typeof onAuthRequired === 'function') {
        // Use custom auth handler (e.g., open login modal)
        onAuthRequired();
      } else {
        // Fallback to message
        message.warning(`Please login to ${actionName}`);
      }
      return false;
    }
    // User is logged in, execute action
    action();
    return true;
  };

  return { requireAuth, isLoggedIn: !!user?.id };
};

export default useAuthAction;
