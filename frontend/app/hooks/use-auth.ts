import { userAtom } from "@/atoms/auth-atoms";
import { Provider } from "@/types/auth";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/utils/token";
import { useQueryCurrentUser } from "./use-queries";
import { http } from "@/utils/request";
import { BaseResponse } from "@/types/base";

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();

  const { refetch: refetchUser } = useQueryCurrentUser({ enabled: false });

  const handleLogin = async (provider: Provider) => {
    const res = await http.get<BaseResponse<string>>(`/auth/${provider}`);
    if (res.code === 200) {
      window.location.href = res.data;
    }
  };

  const handleCallback = async (provider: Provider, code: string) => {
    try {
      const res = await http.get<BaseResponse<string>>(
        `/auth/${provider}/callback`,
        { code }
      );
      if (res.code === 200) {
        const token = res.data;
        tokenStorage.set(token);
        await refetchUser();
        router.push("/");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const logout = () => {
    setUser(null);
    tokenStorage.remove();
    router.push("/auth");
  };

  return {
    user,
    handleLogin,
    handleCallback,
    refetchUser,
    logout,
  };
}
