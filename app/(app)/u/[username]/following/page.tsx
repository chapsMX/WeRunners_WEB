import { FollowListPage, followListMetadata } from "../follow-page"

export const generateMetadata = followListMetadata("following")

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <FollowListPage username={username} kind="following" />
}
