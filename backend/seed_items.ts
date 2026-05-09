import pool from './lib/db';

const caseItemPools = {
  1: [ // Electric Starter
    { name: 'Thunder Stone', rarity: 'Common', price: 75 },
    { name: 'Volt Badge', rarity: 'Common', price: 100 },
    { name: 'Electric Crystal', rarity: 'Rare', price: 200 },
    { name: 'Plasma Orb', rarity: 'Rare', price: 250 },
    { name: 'Lightning Shard', rarity: 'Epic', price: 425 },
    { name: 'Thunderbolt Medal', rarity: 'Legendary', price: 700 },
  ],
  2: [ // Fire Legend
    { name: 'Flame Ember', rarity: 'Common', price: 200 },
    { name: 'Fire Stone', rarity: 'Rare', price: 375 },
    { name: 'Volcanic Rock', rarity: 'Rare', price: 475 },
    { name: 'Inferno Crystal', rarity: 'Epic', price: 800 },
    { name: 'Phoenix Feather', rarity: 'Legendary', price: 1400 },
    { name: 'Eternal Flame', rarity: 'Mythic', price: 2250 },
  ],
  3: [ // Water Champion
    { name: 'Water Drop', rarity: 'Common', price: 400 },
    { name: 'Ocean Pearl', rarity: 'Rare', price: 725 },
    { name: 'Tidal Wave Charm', rarity: 'Epic', price: 1400 },
    { name: 'Deep Sea Crystal', rarity: 'Epic', price: 1600 },
    { name: 'Blastoise Card', rarity: 'Legendary', price: 2500 },
    { name: 'Neptune\'s Trident', rarity: 'Mythic', price: 4000 },
  ],
  4: [ // Psychic Master
    { name: 'Mind Shard', rarity: 'Rare', price: 1000 },
    { name: 'Teleport Stone', rarity: 'Rare', price: 1100 },
    { name: 'Psychic Orb', rarity: 'Epic', price: 1900 },
    { name: 'Third Eye Crystal', rarity: 'Legendary', price: 3150 },
    { name: 'Cosmic Brain', rarity: 'Mythic', price: 5250 },
  ],
  5: [ // Dragon Elite
    { name: 'Dragon Scale', rarity: 'Epic', price: 3000 },
    { name: 'Wyrm Claw', rarity: 'Epic', price: 3500 },
    { name: 'Dragon Fang', rarity: 'Legendary', price: 5750 },
    { name: 'Elder Dragon Egg', rarity: 'Legendary', price: 7000 },
    { name: 'Dragon Soul Stone', rarity: 'Mythic', price: 12500 },
  ],
  6: [ // Grass Bundle
    { name: 'Leaf Stone', rarity: 'Common', price: 150 },
    { name: 'Miracle Seed', rarity: 'Rare', price: 325 },
    { name: 'Nature Crystal', rarity: 'Epic', price: 625 },
    { name: 'Forest Crown', rarity: 'Legendary', price: 1100 },
  ],
  7: [ // Ice Collection
    { name: 'Ice Shard', rarity: 'Common', price: 375 },
    { name: 'Frost Crystal', rarity: 'Rare', price: 750 },
    { name: 'Glacier Stone', rarity: 'Epic', price: 1300 },
    { name: 'Eternal Ice', rarity: 'Legendary', price: 2100 },
  ],
  8: [ // Fighting Spirit
    { name: 'Power Band', rarity: 'Rare', price: 650 },
    { name: 'Fighting Gloves', rarity: 'Rare', price: 850 },
    { name: 'Champion Belt', rarity: 'Epic', price: 1750 },
    { name: 'Warrior\'s Spirit', rarity: 'Legendary', price: 3000 },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log('--- Seeding Pokemon Items ---');
    await client.query('BEGIN');

    // Limpiar catálogo previo
    await client.query('DELETE FROM public.case_contents');
    await client.query('DELETE FROM public.pokemon_items');
    await client.query('DELETE FROM public.cases');

    // Insertar Cajas y Items
    for (const [caseId, items] of Object.entries(caseItemPools)) {
      const caseName = getCaseName(parseInt(caseId));
      
      // Insertar Caja
      const caseRes = await client.query(
        'INSERT INTO public.cases (id, name, slug, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [caseId, caseName, caseName.toLowerCase().replace(/ /g, '-'), getCasePrice(parseInt(caseId)), 'official']
      );

      for (const item of items) {
        // Insertar Item
        const itemRes = await client.query(
          'INSERT INTO public.pokemon_items (name, rarity, price) VALUES ($1, $2, $3) RETURNING id',
          [item.name, item.rarity, item.price]
        );
        const newItemId = itemRes.rows[0].id;

        // Vincular Item con Caja
        await client.query(
          'INSERT INTO public.case_contents (case_id, item_id, weight) VALUES ($1, $2, $3)',
          [caseId, newItemId, 100]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Seed successful!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
  } finally {
    client.release();
    process.exit();
  }
}

function getCaseName(id: number) {
  const names: any = {
    1: 'Electric Starter', 2: 'Fire Legend', 3: 'Water Champion', 
    4: 'Psychic Master', 5: 'Dragon Elite', 6: 'Grass Bundle', 
    7: 'Ice Collection', 8: 'Fighting Spirit'
  };
  return names[id];
}

function getCasePrice(id: number) {
  const prices: any = {
    1: 199, 2: 499, 3: 999, 4: 1999, 5: 4999, 6: 299, 7: 799, 8: 1299
  };
  return prices[id];
}

seed();
