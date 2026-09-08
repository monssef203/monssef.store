import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Create categories
  console.log("Creating categories...");

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "watches" },
      update: {},
      create: {
        name: "Watches",
        slug: "watches",
        description: "Montres premium pour homme et femme — automatiques, quartz, sport, élégance.",
        image: "/images/products/classic-black-steel.jpg",
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "perfumes" },
      update: {},
      create: {
        name: "Perfumes",
        slug: "perfumes",
        description: "Parfums hommes et femmes de griffe — eaux de parfum, eaux de toilette.",
        image: "/images/products/rose-gold-mesh.jpg",
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "clothes" },
      update: {},
      create: {
        name: "Clothes",
        slug: "clothes",
        description: "Vêtements élégants et intemporels — chemises, polos, vestes.",
        image: "/images/products/matte-black-rubber.jpg",
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "others" },
      update: {},
      create: {
        name: "Others",
        slug: "others",
        description: "Accessoires, cadeaux, et autres articles de notre sélection.",
        image: "/images/products/diver-blue-steel.jpg",
        sortOrder: 4,
        isActive: true,
      },
    }),
  ]);

  console.log(`  Created ${categories.length} categories\n`);

  // ─────────────────────────────────────────────
  // Sample products (16 watches from existing data)
  // ─────────────────────────────────────────────

  console.log("Creating sample products...");

  const imageMap: Record<string, string> = {
    "Aurus Automatique Noir": "classic-black-steel",
    "Aurus Édition Classique": "classic-black-steel",
    "Aurea Rose Nacré": "rose-gold-mesh",
    "Aurea Signature": "rose-gold-mesh",
    "Essential Blanc Argent": "minimalist-white-steel",
    "Essential Minimal Line": "minimalist-white-steel",
    "Rival Chrono Noir": "black-chronograph",
    "Rival Chrono Sport": "black-chronograph",
    "Heritage Vintage Cognac": "vintage-brown-leather",
    "Heritage Vintage Gold": "vintage-brown-leather",
    "Abyss Plongée Bleu": "diver-blue-steel",
    "Abyss Plongée Pro": "diver-blue-steel",
    "Onyx Mat Total Black": "matte-black-rubber",
    "Onyx Mat Street": "matte-black-rubber",
    "Amara Élégance Cuir": "elegant-rose-leather",
    "Amara Soirée": "elegant-rose-leather",
  };

  const watches = [
    {
      name: "Aurus Automatique Noir",
      description: "L'Aurus Automatique Noir incarne l'élégance intemporelle. Son cadran soleillé noir et son bracelet en cuir véritable en font une pièce maîtresse pour tout homme raffiné, à la ville comme au bureau.",
      price: 1290,
      discountPrice: 1690,
      categorySlug: "watches",
      brand: "Aurus",
      stock: 12,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 124,
      warranty: "2 ans",
    },
    {
      name: "Aurus Édition Classique",
      description: "Une variante raffinée de notre best-seller Aurus, pensée pour les amateurs de sobriété et de finitions soignées.",
      price: 1390,
      categorySlug: "watches",
      brand: "Aurus",
      stock: 8,
      rating: 4.6,
      reviewCount: 58,
      warranty: "2 ans",
    },
    {
      name: "Aurea Rose Nacré",
      description: "Aurea Rose Nacré associe un boîtier plaqué or rose à un cadran en nacre véritable, sublimé par un bracelet milanais souple et confortable.",
      price: 1590,
      discountPrice: 1990,
      categorySlug: "watches",
      brand: "Aurea",
      stock: 10,
      isNew: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 87,
      warranty: "2 ans",
    },
    {
      name: "Aurea Signature",
      description: "Une déclinaison plus contemporaine de la ligne Aurea, avec un jeu de reflets subtils sur cadran nacré.",
      price: 1690,
      categorySlug: "watches",
      brand: "Aurea",
      stock: 7,
      rating: 4.7,
      reviewCount: 41,
      warranty: "2 ans",
    },
    {
      name: "Essential Blanc Argent",
      description: "Design épuré, cadran blanc immaculé et bracelet acier poli : l'Essential Blanc Argent est pensée pour un usage quotidien élégant et discret.",
      price: 990,
      categorySlug: "watches",
      brand: "Essential",
      stock: 15,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 96,
      warranty: "2 ans",
    },
    {
      name: "Essential Minimal Line",
      description: "Une lecture encore plus minimaliste de la collection Essential, sans index superflus.",
      price: 1090,
      discountPrice: 1290,
      categorySlug: "watches",
      brand: "Essential",
      stock: 9,
      rating: 4.5,
      reviewCount: 33,
      warranty: "2 ans",
    },
    {
      name: "Rival Chrono Noir",
      description: "Chronographe sportif au tempérament affirmé, boîtier acier noirci et bracelet articulé pour un confort optimal en toute circonstance.",
      price: 1790,
      categorySlug: "watches",
      brand: "Rival",
      stock: 6,
      isNew: true,
      rating: 4.6,
      reviewCount: 52,
      warranty: "2 ans",
    },
    {
      name: "Rival Chrono Sport",
      description: "Version renforcée du Rival Chrono, avec lunette graduée pour les passionnés de performance.",
      price: 1890,
      categorySlug: "watches",
      brand: "Rival",
      stock: 3,
      rating: 4.4,
      reviewCount: 21,
      warranty: "2 ans",
    },
    {
      name: "Heritage Vintage Cognac",
      description: "Inspirée des montres de collection des années 60, la Heritage Vintage Cognac séduit par son cadran crème patiné et son bracelet cuir cognac.",
      price: 1450,
      categorySlug: "watches",
      brand: "Heritage",
      stock: 8,
      rating: 4.8,
      reviewCount: 64,
      warranty: "2 ans",
    },
    {
      name: "Heritage Vintage Gold",
      description: "Une finition dorée plus riche pour cette pièce à l'allure rétro assumée.",
      price: 1550,
      discountPrice: 1850,
      categorySlug: "watches",
      brand: "Heritage",
      stock: 5,
      rating: 4.7,
      reviewCount: 29,
      warranty: "2 ans",
    },
    {
      name: "Abyss Plongée Bleu",
      description: "Conçue pour l'aventure, l'Abyss Plongée Bleu affiche un cadran soleillé bleu profond, une lunette tournante et une étanchéité renforcée.",
      price: 1990,
      categorySlug: "watches",
      brand: "Abyss",
      stock: 11,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 143,
      warranty: "2 ans",
    },
    {
      name: "Abyss Plongée Pro",
      description: "La version Pro de l'Abyss, avec fond vissé renforcé et bracelet à triple fermoir de sécurité.",
      price: 2090,
      categorySlug: "watches",
      brand: "Abyss",
      stock: 4,
      rating: 4.6,
      reviewCount: 37,
      warranty: "2 ans",
    },
    {
      name: "Onyx Mat Total Black",
      description: "Silhouette furtive et matériaux modernes : la Onyx Mat Total Black joue la carte du minimalisme urbain avec son bracelet caoutchouc.",
      price: 1350,
      categorySlug: "watches",
      brand: "Onyx",
      stock: 7,
      isNew: true,
      rating: 4.5,
      reviewCount: 46,
      warranty: "2 ans",
    },
    {
      name: "Onyx Mat Street",
      description: "Une version plus légère de l'Onyx, taillée pour un usage quotidien actif.",
      price: 1250,
      discountPrice: 1450,
      categorySlug: "watches",
      brand: "Onyx",
      stock: 10,
      rating: 4.3,
      reviewCount: 19,
      warranty: "2 ans",
    },
    {
      name: "Amara Élégance Cuir",
      description: "Amara Élégance Cuir marie un boîtier or rose délicat à un bracelet cuir souple, pour une allure chic en toutes occasions.",
      price: 1190,
      categorySlug: "watches",
      brand: "Amara",
      stock: 9,
      rating: 4.8,
      reviewCount: 71,
      warranty: "2 ans",
    },
    {
      name: "Amara Soirée",
      description: "Pensée pour les grandes occasions, cette édition Soirée sublime le poignet avec discrétion.",
      price: 1290,
      discountPrice: 1490,
      categorySlug: "watches",
      brand: "Amara",
      stock: 6,
      isNew: true,
      rating: 4.9,
      reviewCount: 38,
      warranty: "2 ans",
    },
  ];

  const perfumeData = [
    {
      name: "Bleu de Chanel Eau de Parfum",
      description: "Une fragrance boisée et citronnée, élégante et sophistiquée. Idéale pour une utilisation quotidienne.",
      price: 320,
      discountPrice: 400,
      categorySlug: "perfumes",
      brand: "Chanel",
      stock: 20,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 89,
    },
    {
      name: "Dior Sauvage Eau de Toilette",
      description: "Un parfum audacieux et mystérieux, avec des notes de piment d'Espagne et d'amande de Chine.",
      price: 280,
      categorySlug: "perfumes",
      brand: "Dior",
      stock: 15,
      rating: 4.5,
      reviewCount: 124,
    },
    {
      name: "Yves Saint Laurent Libre",
      description: "Un parfum féminin enivrant, entre iris et vanille, pour une femme confiante et indépendante.",
      price: 340,
      discountPrice: 420,
      categorySlug: "perfumes",
      brand: "YSL",
      stock: 12,
      isNew: true,
      rating: 4.8,
      reviewCount: 67,
    },
    {
      name: "Jean Paul Gaultier Le Male",
      description: "Un classique intemporel, avec des notes de bergamote, de lavande et de vanille. Un parfum masculin iconique.",
      price: 250,
      categorySlug: "perfumes",
      brand: "JPG",
      stock: 18,
      rating: 4.4,
      reviewCount: 95,
    },
    {
      name: "Tom Ford Oud Wood",
      description: "Un parfum luxury exquis, avec des notes d'oud, de bois de santal et de vétiver. Pour les occasions spéciales.",
      price: 450,
      discountPrice: 580,
      categorySlug: "perfumes",
      brand: "Tom Ford",
      stock: 8,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 42,
    },
  ];

  const clothesData = [
    {
      name: "Chemise Oxford Blanche",
      description: "Chemise Oxford en coton biologique, coupe classique, parfaite pour le bureau comme pour les occasions informelles.",
      price: 180,
      categorySlug: "clothes",
      brand: "MONSTORE Apparel",
      stock: 25,
      isBestSeller: true,
      rating: 4.6,
      reviewCount: 34,
    },
    {
      name: "Polo Côtelé Gris",
      description: "Polo côtelé de qualité, confortable et élégant. Conçu pour durer et garder son style après de nombreux lavages.",
      price: 150,
      categorySlug: "clothes",
      brand: "MONSTORE Apparel",
      stock: 20,
      rating: 4.5,
      reviewCount: 28,
    },
    {
      name: "Veste en Denim Vintage",
      description: "Veste en denim vintage authentique, coupe classique avec petits détails usés pour un look unique et caractéristique.",
      price: 380,
      discountPrice: 450,
      categorySlug: "clothes",
      brand: "MONSTORE Apparel",
      stock: 8,
      isNew: true,
      rating: 4.7,
      reviewCount: 19,
    },
    {
      name: "Pull en Cachemire Bleu",
      description: "Pull en cachemire souple et chaud, parfait pour les jours froids. Design minimaliste et finition soignée.",
      price: 280,
      categorySlug: "clothes",
      brand: "MONSTORE Apparel",
      stock: 12,
      rating: 4.8,
      reviewCount: 23,
    },
  ];

  const othersData = [
    {
      name: "Coffret Cadeau Montre + Souris",
      description: "Coffret cadeau élégant comprenant une montre MONSTORE et une souris d'ordinateur design. Parfait pour offrir.",
      price: 1450,
      discountPrice: 1750,
      categorySlug: "others",
      brand: "MONSTORE",
      stock: 5,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 15,
      warranty: "2 ans",
    },
    {
      name: "Stylos MONSTORE Premium",
      description: "Stylo montre design en aluminium anodisé, avec encre noire de haute qualité. Un cadeau d'affaire parfait.",
      price: 85,
      categorySlug: "others",
      brand: "MONSTORE",
      stock: 40,
      rating: 4.3,
      reviewCount: 27,
    },
    {
      name: "Cahier de Notes Haut de Gamme",
      description: "Cahier de notes en cuir synthétique avec filigrane doré. 200 pages de papier de haute qualité.",
      price: 120,
      categorySlug: "others",
      brand: "MONSTORE",
      stock: 30,
      rating: 4.6,
      reviewCount: 31,
    },
  ];

  let productCount = 0;

  for (const watch of watches) {
    const slug = slugify(watch.name, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const category = categories.find((c) => c.slug === watch.categorySlug);
    if (!category) continue;

    const imageKey = imageMap[watch.name] || "classic-black-steel";

    await prisma.product.create({
      data: {
        name: watch.name,
        slug,
        description: watch.description,
        price: watch.price,
        discountPrice: watch.discountPrice || null,
        categoryId: category.id,
        brand: watch.brand || null,
        sku: `WATCH-${slug.toUpperCase().replace(/-/g, "_")}-${Date.now() % 10000}`,
        stock: watch.stock,
        status: ProductStatus.ACTIVE,
        isFeatured: watch.isFeatured || false,
        isNew: watch.isNew || false,
        isBestSeller: watch.isBestSeller || false,
        rating: watch.rating,
        reviewCount: watch.reviewCount,
        warranty: watch.warranty || null,
        images: {
          create: [
            {
              url: `/images/products/${imageKey}.jpg`,
              alt: watch.name,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    productCount++;
  }

  for (const perfume of perfumeData) {
    const slug = slugify(perfume.name, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const category = categories.find((c) => c.slug === perfume.categorySlug);
    if (!category) continue;

    await prisma.product.create({
      data: {
        name: perfume.name,
        slug,
        description: perfume.description,
        price: perfume.price,
        discountPrice: perfume.discountPrice || null,
        categoryId: category.id,
        brand: perfume.brand || null,
        sku: `PERF-${slug.toUpperCase().replace(/-/g, "_")}-${Date.now() % 10000}`,
        stock: perfume.stock,
        status: ProductStatus.ACTIVE,
        isFeatured: perfume.isFeatured || false,
        isNew: perfume.isNew || false,
        isBestSeller: perfume.isBestSeller || false,
        rating: perfume.rating,
        reviewCount: perfume.reviewCount,
        warranty: null,
        images: {
          create: [
            {
              url: "/images/products/rose-gold-mesh.jpg",
              alt: perfume.name,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    productCount++;
  }

  for (const cloth of clothesData) {
    const slug = slugify(cloth.name, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const category = categories.find((c) => c.slug === cloth.categorySlug);
    if (!category) continue;

    await prisma.product.create({
      data: {
        name: cloth.name,
        slug,
        description: cloth.description,
        price: cloth.price,
        discountPrice: cloth.discountPrice || null,
        categoryId: category.id,
        brand: cloth.brand || null,
        sku: `CLOTH-${slug.toUpperCase().replace(/-/g, "_")}-${Date.now() % 10000}`,
        stock: cloth.stock,
        status: ProductStatus.ACTIVE,
        isFeatured: cloth.isFeatured || false,
        isNew: cloth.isNew || false,
        isBestSeller: cloth.isBestSeller || false,
        rating: cloth.rating,
        reviewCount: cloth.reviewCount,
        warranty: null,
        images: {
          create: [
            {
              url: "/images/products/matte-black-rubber.jpg",
              alt: cloth.name,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    productCount++;
  }

  for (const other of othersData) {
    const slug = slugify(other.name, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const category = categories.find((c) => c.slug === other.categorySlug);
    if (!category) continue;

    await prisma.product.create({
      data: {
        name: other.name,
        slug,
        description: other.description,
        price: other.price,
        discountPrice: other.discountPrice || null,
        categoryId: category.id,
        brand: other.brand || null,
        sku: `OTHER-${slug.toUpperCase().replace(/-/g, "_")}-${Date.now() % 10000}`,
        stock: other.stock,
        status: ProductStatus.ACTIVE,
        isFeatured: other.isFeatured || false,
        isNew: other.isNew || false,
        isBestSeller: other.isBestSeller || false,
        rating: other.rating,
        reviewCount: other.reviewCount,
        warranty: other.warranty || null,
        images: {
          create: [
            {
              url: "/images/products/diver-blue-steel.jpg",
              alt: other.name,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    productCount++;
  }

  console.log(`  Created ${productCount} products\n`);

  // ─────────────────────────────────────────────
  // Create admin user if configured
  // ─────────────────────────────────────────────

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log("Creating admin user...");

    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const passwordHash = require("bcryptjs").hashSync(adminPassword, 12);

      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: "Admin",
          lastName: "Monstore",
          phone: "+212 6 00 00 00 00",
          role: Role.ADMIN,
          isActive: true,
          emailVerified: true,
        },
      });

      console.log(`  Admin user created: ${adminEmail}\n`);
    } else {
      console.log(`  Admin user already exists: ${adminEmail}\n`);
    }
  }

  console.log("✅ Seed completed successfully!");
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${productCount}`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
