"use client";
import Link from "next/link";
export default function ErrorPage({reset}:{reset:()=>void}) {return <main className="detail-shell error-page"><h1>We couldn’t load that page.</h1><p>Please try again. If this keeps happening, the account service may still be completing setup.</p><button className="button button-dark" onClick={reset}>Try again</button> <Link href="/">Return home</Link></main>;}
