export function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden my-8 not-prose">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
}
