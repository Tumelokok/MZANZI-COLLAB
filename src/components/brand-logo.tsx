import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ priority = false }: { priority?: boolean }) {
  return <Link href="/" className="brand-lockup" aria-label="Mzansi Collab home">
    <span className="brand-logo-mark"><Image src="/branding/mzansi-c-transparent.png" alt="" width={1240} height={1268} sizes="96px" priority={priority} /></span>
    <span className="brand-wordmark" aria-hidden="true"><strong>MZANSI</strong><span>COLLAB</span></span>
  </Link>;
}
