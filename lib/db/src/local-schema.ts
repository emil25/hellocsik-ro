import type { PGlite } from "@electric-sql/pglite";

// Local bootstrap only. Production PostgreSQL keeps its Drizzle schema workflow.
export async function initializeLocalDatabase(client: PGlite) {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id SERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at TIMESTAMP NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      image_url TEXT NOT NULL, start_date TIMESTAMP NOT NULL, end_date TIMESTAMP,
      location TEXT NOT NULL, location_address TEXT, category_id INTEGER REFERENCES categories(id),
      featured BOOLEAN NOT NULL DEFAULT false, month_highlight BOOLEAN NOT NULL DEFAULT false,
      ticket_url TEXT, price TEXT, tags TEXT[] NOT NULL DEFAULT '{}', news_links TEXT[] NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'published', submitter_name TEXT, submitter_email TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(), updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY, title TEXT NOT NULL, image_url TEXT NOT NULL, link_url TEXT,
      display_type TEXT NOT NULL DEFAULT 'full', active BOOLEAN NOT NULL DEFAULT true,
      position INTEGER NOT NULL DEFAULT 6, created_at TIMESTAMP NOT NULL DEFAULT now()
    );
    INSERT INTO categories (name, slug, color) VALUES
      ('Koncert', 'koncert', '#24543b'), ('Színház', 'szinhaz', '#804b75'),
      ('Fesztivál', 'fesztival', '#956018'), ('Kiállítás', 'kiallitas', '#326880'),
      ('Családi program', 'csaladi-program', '#9a4b3c'), ('Sport', 'sport', '#376541'),
      ('Mozi', 'mozi', '#525184'), ('Közösség', 'kozosseg', '#675d38')
    ON CONFLICT (slug) DO NOTHING;

    ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT now();
  `);
}
