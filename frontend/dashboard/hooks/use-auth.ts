import { userAtom } from "@/atoms/auth-atoms";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/utils/token";
import { useQueryCurrentUser } from "./use-queries";

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();

  const { refetch: refetchUser } = useQueryCurrentUser({ enabled: false });

  const handleLogin = async (token: string) => {
    try {
      if (!token) {
        console.error("Token is not provided");
      }

      tokenStorage.set(token);
      await refetchUser();
      router.push("/");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const logout = () => {
    setUser(null);
    tokenStorage.remove();
    window.location.href = process.env.NEXT_PUBLIC_HOME_PAGE_URL!;
  };

  return {
    user,
    handleLogin,
    handleCallback: handleLogin,
    refetchUser,
    logout,
  };
}
