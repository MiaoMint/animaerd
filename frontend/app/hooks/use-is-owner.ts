import { useAuth } from "./use-auth";

export function useIsOwner(id?: number) {
  const { user } = useAuth();
  if (!id) return false;
  return user?.id === id;
}
