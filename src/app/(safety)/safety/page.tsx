import { SafetyMoment } from "./safety-moment";

export default async function Page(props: PageProps<"/safety">) {
  const { m } = await props.searchParams;
  return <SafetyMoment message={typeof m === "string" ? m : "honestly i don’t see the point of anything anymore"} />;
}
