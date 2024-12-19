import { artworkApi } from "@/api/artwork";
import { userAtom } from "@/atoms/auth-atoms";
import { User } from "@/types/auth";
import { BaseResponse } from "@/types/base";
import { http } from "@/utils/request";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";

export function useQueryCurrentUser({ enabled }: { enabled?: boolean }) {
  const [user, setUser] = useAtom(userAtom);
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await http.get<BaseResponse<User>>("/user");
      if (res.code === 200) {
        setUser(res.data);
      }
      return res.data;
    },
    enabled: enabled,
  });
}

export function useQueryUserProfile({ id }: { id: string }) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await http.get<BaseResponse<User>>(`/user/${id}`);
      return res.data;
    },
  });
}
