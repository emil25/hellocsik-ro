import { ArrowRight, Check, HelpCircle, Megaphone, Sparkles, Star } from "lucide-react";
import { Link } from "wouter";
import "@/components/organizer-portal.css";

const plans = [
  {
    name: "Alap megjelenés",
    note: "Minden szervezőnek",
    price: "0",
    suffix: "RON / esemény",
    featured: false,
    features: ["Esemény beküldése és ellenőrzése", "Megjelenés a programlistában és a naptárban", "Saját szervezői profil", "Forrás és frissítés jelzése"],
    cta: "Esemény beküldése",
  },
  {
    name: "Kiemelt",
    note: "Ha szeretnéd, hogy előbb megtalálják",
    price: "49",
    suffix: "RON / esemény · egyszeri",
    featured: true,
    features: ["Kiemelt kártya a programlistában", "Kiemelés a városi nézetben", "Színes kiemelő jelvény és nagyobb kép", "Megosztásra kész eseményoldal"],
    cta: "Kiemelést kérek",
  },
  {
    name: "Főoldal +",
    note: "A legfontosabb programoknak",
    price: "99",
    suffix: "RON / esemény · egyszeri",
    featured: false,
    features: ["Kiemelt hely a főoldalon", "Megjelenés a kiemelt programok között", "Városi és környékbeli extra láthatóság", "Kiemelt megosztási csomag"],
    cta: "Főoldali kiemelést kérek",
  },
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <header className="pricing-header">
        <div className="pricing-kicker"><Sparkles size={14} /> SZERVEZŐKNEK</div>
        <h1>Egy esemény.<br /><em>Egy kis plusz figyelem.</em></h1>
        <p>Az alap beküldés mindig ingyenes. Ha egy programod fontosabb láthatóságot kapjon, egyszeri kiemelést kérhetsz – nincs havidíj és nincs előfizetés.</p>
      </header>
      <main className="pricing-main">
        <div className="pricing-grid">
          {plans.map((plan) => <article key={plan.name} className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}>
            {plan.featured && <div className="pricing-popular">AJÁNLOTT</div>}
            <div className="pricing-card-title"><div><h2>{plan.name}</h2><p>{plan.note}</p></div>{plan.featured ? <Star size={21} fill="currentColor" /> : <Megaphone size={20} />}</div>
            <div className="pricing-price"><strong>{plan.price}</strong><span>{plan.suffix}</span></div>
            <Link href={plan.price === "0" ? "/bekuldese" : "/szervezoi-felulet?kiemeles=1"} className={plan.featured ? "pricing-cta pricing-cta-dark" : "pricing-cta"}>{plan.cta}<ArrowRight size={16} /></Link>
            <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
          </article>)}
        </div>
        <section className="pricing-note"><HelpCircle size={19} /><div><strong>Hogyan működik?</strong><p>Beküldöd az eseményt, kiválasztod a kívánt kiemelést, mi pedig egyeztetünk és jóváhagyás után elhelyezzük a kiemelt felületen. A kiemelés az esemény végéig él.</p></div><Link href="/szervezoi-felulet">Szervezői felület <ArrowRight size={15} /></Link></section>
      </main>
    </div>
  );
}
