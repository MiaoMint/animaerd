import { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Create / Artwork Artwork",
};

export default function CreateLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
