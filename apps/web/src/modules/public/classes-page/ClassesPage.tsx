import { classPageHref, formatPeso } from "@balanse/domain";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ClassesPageProps } from "./ClassesPage.schema";
import "./classes.css";

export function ClassesPage({ classes }: ClassesPageProps) {
  return (
    <div className="class-directory marketing-container">
      <header className="class-directory-heading">
        <p className="class-eyebrow">The Balansé practice</p>
        <h1>
          Find your way
          <br />
          to move.
        </h1>
        <p>
          Quiet focus. A little more strength. Room to let go. Explore the classes that make
          movement yours.
        </p>
      </header>
      {classes.length ? (
        <div className="class-directory-grid">
          {classes.map((item, index) => (
            <Link key={item.id} href={classPageHref(item)} className="class-directory-card">
              <div className="class-card-image">
                {item.heroImage && (
                  <Image
                    src={item.heroImage}
                    alt={`${item.name} movement practice`}
                    fill
                    sizes="(max-width: 700px) 100vw, 50vw"
                    priority={index < 2}
                    unoptimized={item.heroImage.startsWith("https:")}
                  />
                )}
              </div>
              <div className="class-card-heading">
                <h2>{item.name}</h2>
                <ArrowUpRight aria-hidden="true" />
              </div>
              <p>{item.shortDescription}</p>
              <div className="class-card-meta">
                <span>
                  <Clock3 size={15} aria-hidden="true" />
                  {item.defaultDurationMinutes
                    ? `${item.defaultDurationMinutes} min`
                    : "See schedule"}
                </span>
                <span>
                  {item.defaultPricePhp === null
                    ? "See session pricing"
                    : `${formatPeso(item.defaultPricePhp)} / session`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-16">Our class collection is being updated. Please check back soon.</p>
      )}
      <footer className="class-directory-footer">
        <p>Not sure where to start?</p>
        <Link href="/contact">
          Let’s find your class <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
