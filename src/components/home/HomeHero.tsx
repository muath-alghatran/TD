import Image from "next/image";
import Link from "next/link";
import { Shield, Wordmark } from "@/components/brand/Brand";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Icon } from "@/components/ui/Icon";
import { CENTER, FACADE_FOCUS, FACADE_PHOTO } from "@/lib/center-info";

/** الواجهة (1c): صورة المركز الحقيقية بصبغة فولاذية، وزوايا عدسة، وتعريف المركز */
export function HomeHero() {
  return (
    <section className="hero steel" aria-label={CENTER.nameAr}>
      <div className="hero-media duotone">
        <Image
          src={FACADE_PHOTO}
          alt="واجهة مركز ترست درايف في حائل"
          fill
          sizes="(max-width: 720px) 100vw, 720px"
          loading="eager"
          fetchPriority="high"
          style={{ objectFit: "cover", objectPosition: FACADE_FOCUS }}
        />
      </div>
      <div className="hero-shade" />
      <i className="lens tl" aria-hidden="true" />
      <i className="lens tr" aria-hidden="true" />
      <i className="lens bl" aria-hidden="true" />
      <i className="lens br" aria-hidden="true" />
      <i className="lens-cross" aria-hidden="true" />
      <span className="lens-label t-code" style={{ color: "var(--fg)" }} aria-hidden="true">
        HAIL · KSA
      </span>

      <div className="hero-top">
        <div className="page hero-top-in">
          <Shield size={30} alt="TD" />
          <Wordmark tone="light" height={13} />
          <span style={{ marginInlineStart: "auto" }} />
          <ThemeToggle />
        </div>
      </div>

      <div className="hero-body">
        <div className="page">
          <div className="t-code">TRUST DRIVE · {CENTER.city}</div>
          <h1 className="hero-title">{CENTER.headline}</h1>
          <Link href="/about" className="sec-link" style={{ marginTop: 10 }}>
            هوية ترست درايف
            <Icon name="chevronLeft" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
