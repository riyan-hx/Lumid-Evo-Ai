import { CheckIn } from "./check-in";

export default async function Page(props: PageProps<"/check-in">) {
  const { onboarding } = await props.searchParams;
  return <CheckIn onboarding={onboarding === "1"} />;
}
