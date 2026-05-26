import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/db';

async function main() {
  console.log('🌱 Starting database seeding...');

  // ==========================================
  // 1. Seed Admin User
  // ==========================================
  const adminEmail = 'admin@jivanjor.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    await prisma.user.create({
      data: {
        name: 'Jivanjor Admin',
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Admin user seeded: ${adminEmail} (password: Admin123!)`);
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // ==========================================
  // 2. Seed Product Categories (Hierarchical)
  // ==========================================
  console.log('Category seeding...');
  
  // Clean up
  await prisma.productCategory.deleteMany();

  // Root categories
  const adhesives = await prisma.productCategory.create({
    data: {
      name: 'Adhesives',
      slug: 'adhesives',
      description: 'Superior bonding adhesives for woodwork and laminates.',
    },
  });

  const waterproofing = await prisma.productCategory.create({
    data: {
      name: 'Waterproofing',
      slug: 'waterproofing',
      description: 'Advanced waterproofing solutions to shield structures from water damage.',
    },
  });

  const sealants = await prisma.productCategory.create({
    data: {
      name: 'Sealants & Silicones',
      slug: 'sealants-silicones',
      description: 'Highly elastic sealants for cracks and joints.',
    },
  });

  // Subcategories
  const woodAdhesives = await prisma.productCategory.create({
    data: {
      name: 'Wood Adhesives',
      slug: 'wood-adhesives',
      parentId: adhesives.id,
      description: 'Premium white adhesives for carpenters and furniture makers.',
    },
  });

  await prisma.productCategory.create({
    data: {
      name: 'PVC & Pipe Cements',
      slug: 'pvc-pipe-cements',
      parentId: adhesives.id,
      description: 'Adhesives for plumbing and rigid PVC bonding.',
    },
  });

  const roofWaterproofing = await prisma.productCategory.create({
    data: {
      name: 'Roof Waterproofing',
      slug: 'roof-waterproofing',
      parentId: waterproofing.id,
      description: 'Coating systems for terrace and roof waterproofing.',
    },
  });

  console.log('✅ Product categories seeded.');

  // ==========================================
  // 3. Seed Materials
  // ==========================================
  console.log('Material seeding...');
  await prisma.material.deleteMany();

  const pva = await prisma.material.create({
    data: {
      materialName: 'Polyvinyl Acetate (PVA)',
      description: 'Water-based emulsion polymer used in wood crafting.',
    },
  });

  const polyurethane = await prisma.material.create({
    data: {
      materialName: 'Polyurethane',
      description: 'Tough, flexible material with high durability and elastic joint capabilities.',
    },
  });

  const acrylic = await prisma.material.create({
    data: {
      materialName: 'Acrylic Polymer',
      description: 'Excellent UV-resistant polymer for waterproofing coatings.',
    },
  });

  console.log('✅ Materials seeded.');

  // ==========================================
  // 4. Seed Products
  // ==========================================
  console.log('Product seeding...');
  await prisma.product.deleteMany();

  const prod1 = await prisma.product.create({
    data: {
      name: 'Jivanjor AllRounder',
      slug: 'jivanjor-allrounder',
      description: 'Premium water-resistant white wood adhesive ideal for bonding wood, plywood, laminate, and veneers.',
      categoryId: woodAdhesives.id,
      materialId: pva.id,
      metadata: {
        dryingTime: '4-6 hours',
        coverage: 'approx 10-12 sq.ft per kg',
        packaging: ['1kg', '5kg', '10kg', '20kg', '50kg'],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Jivanjor WaterShield 2K',
      slug: 'jivanjor-watershield-2k',
      description: 'Two-component acrylic-modified cementitious liquid applied waterproofing coating.',
      categoryId: roofWaterproofing.id,
      materialId: acrylic.id,
      metadata: {
        mixingRatio: '1:2 (liquid to powder)',
        potLife: '45 mins',
        elongation: '150%',
      },
    },
  });

  await prisma.product.create({
    data: {
      name: 'Jivanjor PolySeal Max',
      slug: 'jivanjor-polyseal-max',
      description: 'Single-component high-performance polyurethane joint sealant.',
      categoryId: sealants.id,
      materialId: polyurethane.id,
      metadata: {
        shoreAHardness: '25',
        tackFreeTime: '60 mins',
      },
    },
  });

  console.log('✅ Products seeded.');

  // ==========================================
  // 5. Seed Use Cases
  // ==========================================
  console.log('Use Case seeding...');
  await prisma.useCase.deleteMany();

  await prisma.useCase.create({
    data: {
      title: 'Modular Kitchen Assembly',
      slug: 'modular-kitchen-assembly',
      description: 'Strong, heat-resistant, and anti-termite wood bonding solutions suitable for assemble cabinets and laminate liners in modern kitchens.',
    },
  });

  await prisma.useCase.create({
    data: {
      title: 'Terrace Waterproofing Shield',
      slug: 'terrace-waterproofing-shield',
      description: 'Applying elastomeric liquid membranes to prevent water seepage through concrete roof slabs during severe monsoons.',
    },
  });

  console.log('✅ Use Cases seeded.');

  // ==========================================
  // 6. Seed Issues
  // ==========================================
  console.log('Issue page seeding...');
  await prisma.issue.deleteMany();

  await prisma.issue.create({
    data: {
      issueTitle: 'Dampness in Terrace Ceilings',
      slug: 'dampness-in-terrace-ceilings',
      problem: 'Rainwater seepage through micro-cracks on concrete roofs damages paint, causes mold, and weakens structural rebars.',
      solution: 'Clean the roof surface thoroughly. Apply Jivanjor WaterShield 2K with glass fibre mesh reinforcement, followed by a UV-resistant acrylic topcoat.',
    },
  });

  await prisma.issue.create({
    data: {
      issueTitle: 'Wood Laminate Bubbling',
      slug: 'wood-laminate-bubbling',
      problem: 'Moisture ingress or using sub-standard adhesive causes laminates to peel away or bubble at the edges of wooden furniture.',
      solution: 'Ensure the wood substrate has <12% moisture. Use Jivanjor AllRounder with uniform spread, clamping securely for at least 4 hours for a lifelong bond.',
    },
  });

  console.log('✅ Issue pages seeded.');

  // ==========================================
  // 7. Seed Blogs
  // ==========================================
  console.log('Blog seeding...');
  await prisma.blogPost.deleteMany();

  await prisma.blogPost.create({
    data: {
      title: 'Ultimate Waterproofing Guide for Homeowners',
      slug: 'ultimate-waterproofing-guide-for-homeowners',
      content: 'Water leaks are a nightmare for any house owner. In this guide, we walk you through the key areas prone to leaks—including bathroom floors, balconies, and outer walls—and explain how to pick the right compound sealants and acrylic coatings to prevent expensive concrete damage.',
      category: 'Waterproofing Care',
      tags: ['waterproofing', 'home maintenance', 'coatings'],
      author: 'Aarav Mehta, Technical Expert',
      publishDate: new Date(),
    },
  });

  await prisma.blogPost.create({
    data: {
      title: 'Choosing the Right Adhesive for Carpentry',
      slug: 'choosing-the-right-adhesive-for-carpentry',
      content: 'Not all white glues are made equal. From standard PVAs to advanced D3/D4 water-resistant formulations, this technical article outlines performance metrics—like green strength, setting time, and moisture immunity—to help carpenters choose the ultimate glue for solid wood and modular fittings.',
      category: 'Carpentry Tech',
      tags: ['adhesives', 'woodwork', 'carpentry'],
      author: 'Rajesh Sharma, Chief Chemist',
      publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2), // 2 days ago
    },
  });

  console.log('✅ Blogs seeded.');

  // ==========================================
  // 8. Seed SEO Metadata
  // ==========================================
  console.log('SEO Metadata seeding...');
  await prisma.sEOMetadata.deleteMany();

  // Static pages
  await prisma.sEOMetadata.create({
    data: {
      pageType: 'STATIC',
      pageId: 'STATIC_PAGE', // Home
      metaTitle: 'Jivanjor - Superior Bonding Adhesives & Waterproofing',
      metaDescription: 'Discover Jivanjor wide range of premium wood white adhesives, high-grade silicones, and advanced waterproofing solutions for long-lasting construction.',
      canonicalUrl: 'https://jivanjor.com',
    },
  });

  await prisma.sEOMetadata.create({
    data: {
      pageType: 'STATIC',
      pageId: 'ABOUT_PAGE',
      metaTitle: 'About Jivanjor - Leading Construction Chemical Brands',
      metaDescription: 'Learn about Jivanjor historical commitment to quality, research, and crafting state-of-the-art polymer formulations for builders and carpenters worldwide.',
      canonicalUrl: 'https://jivanjor.com/about',
    },
  });

  // Product specific SEO
  await prisma.sEOMetadata.create({
    data: {
      pageType: 'PRODUCT',
      pageId: prod1.id,
      metaTitle: 'Jivanjor AllRounder | Premium Plywood Laminate White Glue',
      metaDescription: 'Buy Jivanjor AllRounder white wood adhesive. Highly water-resistant, fast dry formulation engineered for modular cabinets, laminates and veneer pasting.',
      canonicalUrl: `https://jivanjor.com/products/${prod1.slug}`,
    },
  });

  console.log('✅ SEO Metadata seeded.');

  // ==========================================
  // 9. Seed Page Templates
  // ==========================================
  console.log('Page Template seeding...');
  await prisma.pageTemplate.deleteMany();

  await prisma.pageTemplate.create({
    data: {
      name: 'Default Woodworking Landing Page',
      slug: 'home-default-woodworking',
      pageType: 'HOME',
      isActive: true,
      sections: {
        hero: {
          title: 'Dependable Bonds for Indian Homes',
          subtitle: 'Superior strength adhesives crafted with state-of-the-art polymer chemistry to safeguard your woodworking and furniture creations for a lifetime.',
          badgeText: 'JJ QUALITY LABS',
          backgroundImage: '/images/hero-bg.jpg',
          ctaText: 'Explore Products',
          ctaLink: '/products',
          videoText: 'Watch Laboratory Test',
          videoUrl: 'https://www.youtube.com/watch?v=mock-lab-test',
          videoThumbnail: '/images/hero-video-thumb.jpg'
        },
        adhesiveRange: {
          title: 'A Complete Adhesive Range for Modern Woodworking',
          subtitle: 'From premium wood glues to water-resistant formulations, explore adhesives trusted by master carpenters across India.',
          items: [
            {
              id: 'champ-super',
              name: 'Champion Super',
              description: 'Premium white carpentry adhesive providing superior initial grab and high bonding strength.',
              imageUrl: '/images/products/champion-super.jpg',
              tag: 'Best Seller',
              features: ['4-hour drying time', 'Termite resistant', 'High coverage']
            },
            {
              id: 'fast-bond',
              name: 'FastBond',
              description: 'Fast-drying polymer glue designed to reduce assembly times for fast-track modular fittings.',
              imageUrl: '/images/products/fastbond.jpg',
              tag: 'Quick Setting',
              features: ['2-hour setting', 'High initial green strength', 'Heat resistant']
            },
            {
              id: 'water-shield',
              name: 'WaterShield 2K',
              description: 'Acrylic-modified waterproofing glue that acts as a reliable moisture barrier for wet areas.',
              imageUrl: '/images/products/watershield.jpg',
              tag: 'Water Resistant',
              features: ['D3 moisture grade', 'Excellent adhesion', 'Flexibility']
            }
          ]
        },
        findAdhesive: {
          title: 'Find The Right Adhesive',
          subtitle: 'Select your application category to discover matched adhesives engineered for maximum hold.',
          items: [
            { name: 'Furniture & Woodwork', iconName: 'sofa', link: '/categories/wood-adhesives' },
            { name: 'Waterproofing & Coatings', iconName: 'droplet', link: '/categories/roof-waterproofing' },
            { name: 'Sealants & Silicones', iconName: 'paint-brush', link: '/categories/sealants-silicones' },
            { name: 'PVC & Pipe Cements', iconName: 'wrench', link: '/categories/pvc-pipe-cements' },
            { name: 'Tape & Bonding Roll', iconName: 'tape', link: '/products?tag=tapes' },
            { name: 'Grout & Repair Fillers', iconName: 'shield', link: '/products?tag=repair' }
          ]
        },
        whyTrustUs: {
          title: 'Why Professionals Trust Jivanjor',
          subtitle: 'Over decades, builders and contractors have endorsed Jivanjor for quality, innovation, and support.',
          items: [
            { title: 'Consistent Quality', description: 'Every batch is rigorously tested in our labs to ensure matching bonding performance.', iconName: 'award' },
            { title: 'Ease of Application', description: 'Engineered viscosity allows smooth, even spreading with minimal effort.', iconName: 'check-circle' },
            { title: 'Range of Products', description: 'A tailored product for every surface—from solid wood to rigid PVC and terrace concrete.', iconName: 'layers' },
            { title: 'Preferred by Experts', description: 'Loved by leading interior designers, architects, and professional carpentry guilds.', iconName: 'users' }
          ]
        },
        showcaseGrid: {
          title: "Built Around India's Woodworking Professionals",
          subtitle: 'Empowering woodworking communities with tools, training, and resources to scale their craftsmanship.',
          items: [
            {
              title: 'Technical Resources',
              description: 'Step-by-step tutorials, safety datasheets, and best practices for modern carpenter guilds.',
              imageUrl: '/images/showcase/technical-resources.jpg',
              link: '/resources'
            },
            {
              title: 'Our Market Presence',
              description: 'Available at 15,000+ retail outlets across India, backed by robust distribution networks.',
              imageUrl: '/images/showcase/market-presence.jpg',
              link: '/outlets'
            },
            {
              title: 'Industry Endorsed',
              description: 'Recognized by woodworking associations for superior chemical safety and durability.',
              imageUrl: '/images/showcase/industry-endorsed.jpg',
              link: '/certifications'
            }
          ]
        },
        ctaPromo: {
          title: 'Grow Your Business With a Trusted Adhesive',
          subtitle: 'Connect with a Jivanjor representative today to get bulk pricing, specialized product trainings, and contractor loyalty rewards.',
          backgroundImage: '/images/cta-promo-bg.jpg',
          ctaText: 'Join Partner Network',
          ctaLink: '/contact'
        },
        testimonials: {
          title: 'Trusted by People Who Know the Work',
          subtitle: 'Hear from professional contractors and carpenters who build their reputation on Jivanjor daily.',
          videos: [
            {
              author: 'Aarav Mehta',
              role: 'Master Carpenter, Mumbai',
              videoUrl: 'https://www.youtube.com/watch?v=testimonial-1',
              thumbnailUrl: '/images/testimonials/aarav-mehta.jpg'
            },
            {
              author: 'Rajesh Sharma',
              role: 'Contractor, Delhi NCR',
              videoUrl: 'https://www.youtube.com/watch?v=testimonial-2',
              thumbnailUrl: '/images/testimonials/rajesh-sharma.jpg'
            },
            {
              author: 'Amit Verma',
              role: 'Modular Kitchen Specialist, Bangalore',
              videoUrl: 'https://www.youtube.com/watch?v=testimonial-3',
              thumbnailUrl: '/images/testimonials/amit-verma.jpg'
            }
          ]
        },
        knowledgeBase: {
          title: 'Knowledge Base & Guides',
          subtitle: 'Explore insights, tips, and chemistry guides from our experts to optimize your bonding applications.',
          items: [
            {
              title: 'Choosing the Right Adhesive',
              summary: 'A masterclass on selecting between standard PVA, quick-drying fast bonds, and high-performance polyurethanes.',
              imageUrl: '/images/guides/choose-adhesive.jpg',
              link: '/blogs/choosing-the-right-adhesive-for-carpentry'
            },
            {
              title: 'Application Tips',
              summary: 'Pro tips for surface preparation, wood moisture content checks, clamping times, and curing environment controls.',
              imageUrl: '/images/guides/application-tips.jpg',
              link: '/blogs/ultimate-waterproofing-guide-for-homeowners'
            },
            {
              title: 'Fix Common Issues',
              summary: 'Learn how to easily prevent wood laminate bubbling, edge peeling, and joint cracking in high-humidity climates.',
              imageUrl: '/images/guides/fix-issues.jpg',
              link: '/issues'
            }
          ]
        }
      }
    }
  });

  console.log('✅ Page Templates seeded.');

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
