import { UnstuckLadder } from "./unstuck-ladder";

export default async function Page(props: PageProps<"/ladder">) {
  const { task } = await props.searchParams;
  return <UnstuckLadder task={typeof task === "string" ? task : undefined} />;
}
