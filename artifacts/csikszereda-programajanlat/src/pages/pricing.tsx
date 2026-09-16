import { ArrowRight, Check, HelpCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import "@/components/organizer-portal.css";

const plans = [
  { name: "Kezdő", note: "Egyéni szervezőknek", price: "0", suffix: "RON", featured: false, features: ["1 esemény beküldése", "Program megjelenése a naptárban", "Alap szervezői adatlap", "Forrás és frissítés jelzése"] },
  { name: "Szervező", note: "Aktív programgazdáknak", price: "39", suffix: "RON / hó", featured: true, features: ["Korlátlan esemény beküldése", "Saját szervezői profil", "Profiloldal az összes programmal", "Kiemelt megjelenési lehetőségek"] },
  { name: "Kiemelt partner", note: "Intézményeknek és helyszíneknek", price: "Egyedi", suffix: "ajánlat", featured: false, features: ["Kiemelt esemény a főoldalon", "Saját helyszín- és szervezőoldal", "Közös havi programválogatás", "Közvetlen kapcsolattartás"] },
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <header className="pricing-header"><div className="pricing-kicker"><Sparkles size={14} /> SZERVEZŐKNEK</div><h1>Legyen minden programod<br /><em>egy helyen.</em></h1><p>Válaszd ki azt a csomagot, amelyik a legjobban illik a programjaidhoz. A kezdés egyszerű, a profilod pedig később bővíthető.</p></header>
      <main className="pricing-main">
        <div className="pricing-grid">{plans.map((plan) => <article key={plan.name} className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}>
          {plan.featured && <div className="pricing-popular">LEGNÉPSZERŰBB</div>}
          <div className="pricing-card-title"><div><h2>{plan.name}</h2><p>{plan.note}</p></div>{plan.featured && <Sparkles size={21} />}</div>
          <div className="pricing-price"><strong>{plan.price}</strong><span>{plan.suffix}</span></div>
          <Link href="/szervezoi-felulet" className={plan.featured ? "pricing-cta pricing-cta-dark" : "pricing-cta"}>{plan.price === "0" ? "Kezdés ingyen" : "Szervezői profil indítása"}<ArrowRight size={16} /></Link>
          <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
        </article>)}</div>
        <section className="pricing-note"><HelpCircle size={19} /><div><strong>Nem kell azonnal választanod.</strong><p>Az alap eseménybeküldés továbbra is ingyenes. A csomagok a profilkezelést és a több eseményes megjelenést teszik kényelmesebbé.</p></div><Link href="/bekuldese">Egy esemény beküldése <ArrowRight size={15} /></Link></section>
      </main>
    </div>
  );
}

