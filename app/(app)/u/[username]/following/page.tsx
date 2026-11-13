import { FollowListPage, followListMetadata } from "../follow-page"

export const metadata = followListMetadata

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return <FollowListPage username={username} kind="following" />
}
