import { GuidedChat } from "./guided-chat";

export default async function Page(props: PageProps<"/chat">) {
  const { checkedIn, q, mode } = await props.searchParams;
  return <GuidedChat checkedIn={checkedIn === "1"} q={typeof q === "string" ? q : undefined} venting={mode === "venting"} />;
}
