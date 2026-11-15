import Image from "next/image";
import Link from "next/link";

const stories = [
  { image: "solo-food", alt: "Illustrative solo food creator photographing a dish", label: "A voice of your own", title: "Your craft deserves to be seen.", text: "Food, fashion, music or the things only you can bring to life. Make your work the starting point for your next opportunity.", href: "/creators", link: "Explore the creator experience" },
  { image: "creator-duo", alt: "Illustrative pair of creators setting up a camera and light", label: "Community · planned", title: "Find your creative circle.", text: "Exchange ideas, find a collaborator and learn from someone who sees things differently. There is room to grow together.", href: "/community", link: "Explore the community vision" },
  { image: "brand-meeting-duo", alt: "Illustrative creator and brand representative discussing a concept", label: "Brands & agencies", title: "One career. Many collaborations.", text: "Help businesses understand your point of view and the work you could make together. Build relationships around a shared creative idea.", href: "/business", link: "Explore the brand experience" },
];

export function CreatorCommunity() {
  return (
    <section className="people-section detail-shell" id="talent">
      <div className="people-heading">
        <p className="eyebrow eyebrow-dark">Different voices. Shared ambition.</p>
        <h2>A place for your people.<br /><em>And your next collab.</em></h2>
        <p>For independent voices, creative duos and the connections that turn an idea into something worth sharing.</p>
      </div>
      <div className="people-grid">
        {stories.map((story) => (
          <article className="people-card" key={story.image}>
            <div className="people-photo"><Image src={`/images/${story.image}.png`} alt={story.alt} fill sizes="(max-width: 800px) 90vw, 33vw" /></div>
            <div className="people-card-copy">
              <span>{story.label}</span><h3>{story.title}</h3><p>{story.text}</p>
              <Link href={story.href}>{story.link} →</Link>
            </div>
          </article>
        ))}
      </div>
      <p className="image-caption">Original AI-generated scenes illustrating creative life, not member profiles.</p>
    </section>
  );
}
