import { FollowListPage, followListMetadata } from "../follow-page"

export const generateMetadata = followListMetadata("followers")

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <FollowListPage username={username} kind="followers" />
}
